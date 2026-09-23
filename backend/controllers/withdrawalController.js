// controllers/withdrawalController.js
const Withdrawal = require('../models/Withdrawal');
const WithdrawalSettings = require('../models/WithdrawalSettings');
const User = require('../models/authmodel');
const mongoose = require('mongoose');

// @desc    Request a withdrawal
// @route   POST /api/withdrawals
// @access  Private
const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      amount,
      paymentMethod,
      bankDetails,
      upiDetails,
      paypalDetails,
      cryptoDetails,
    } = req.body;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account is blocked. Please contact support.',
      });
    }

    // Get country-specific settings
    const settings = await WithdrawalSettings.findOne({ 
      country: user.country || 'IN' 
    });

    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal settings not configured for your country',
      });
    }

    if (!settings.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawals are currently disabled for your country',
      });
    }

    // Validate withdrawal
    const validation = settings.validateWithdrawal(amount, user);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    console.log(user)

    // Check user credit
    if (user.credit < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credit',
        availablecredit: user.credit,
      });
    }

    // Check payment method availability
    if (!settings.paymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `${paymentMethod} is not available in your country`,
        availableMethods: settings.paymentMethods,
      });
    }

    // Validate payment details based on method
    const paymentDetails = {
      bankDetails,
      upiDetails,
      paypalDetails,
      cryptoDetails,
    };

    const requiredFields = settings.requirements[paymentMethod]?.required || [];
    const methodDetails = paymentDetails[paymentMethod + 'Details'] || {};

    const missingFields = requiredFields.filter(field => !methodDetails[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Check daily/weekly/monthly limits
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyTotal, weeklyTotal, monthlyTotal, pendingCount] = await Promise.all([
      Withdrawal.aggregate([
        {
          $match: {
            user: user._id,
            status: { $nin: ['rejected', 'cancelled'] },
            requestedAt: { $gte: today },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Withdrawal.aggregate([
        {
          $match: {
            user: user._id,
            status: { $nin: ['rejected', 'cancelled'] },
            requestedAt: { $gte: weekStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Withdrawal.aggregate([
        {
          $match: {
            user: user._id,
            status: { $nin: ['rejected', 'cancelled'] },
            requestedAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Withdrawal.countDocuments({
        user: user._id,
        status: 'pending',
      }),
    ]);

    const dailyTotalAmount = dailyTotal[0]?.total || 0;
    const weeklyTotalAmount = weeklyTotal[0]?.total || 0;
    const monthlyTotalAmount = monthlyTotal[0]?.total || 0;

    if (settings.dailyLimit && dailyTotalAmount + amount > settings.dailyLimit) {
      return res.status(400).json({
        success: false,
        message: `Daily withdrawal limit of ${settings.currencySymbol}${settings.dailyLimit} exceeded`,
        dailyUsed: dailyTotalAmount,
        dailyLimit: settings.dailyLimit,
      });
    }

    if (settings.weeklyLimit && weeklyTotalAmount + amount > settings.weeklyLimit) {
      return res.status(400).json({
        success: false,
        message: `Weekly withdrawal limit of ${settings.currencySymbol}${settings.weeklyLimit} exceeded`,
        weeklyUsed: weeklyTotalAmount,
        weeklyLimit: settings.weeklyLimit,
      });
    }

    if (settings.monthlyLimit && monthlyTotalAmount + amount > settings.monthlyLimit) {
      return res.status(400).json({
        success: false,
        message: `Monthly withdrawal limit of ${settings.currencySymbol}${settings.monthlyLimit} exceeded`,
        monthlyUsed: monthlyTotalAmount,
        monthlyLimit: settings.monthlyLimit,
      });
    }

    if (settings.maxWithdrawalsPerDay && pendingCount >= settings.maxWithdrawalsPerDay) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${settings.maxWithdrawalsPerDay} pending withdrawals allowed`,
      });
    }

    // Calculate fee
    const fee = settings.calculateFee(amount);
    const netAmount = amount - fee;

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      user: user._id,
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      userMobile: user.mobile,
      country: user.country || 'IN',
      amount: amount,
      currency: settings.currency,
      paymentMethod,
      bankDetails: bankDetails || undefined,
      upiDetails: upiDetails || undefined,
      paypalDetails: paypalDetails || undefined,
      cryptoDetails: cryptoDetails || undefined,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      status: settings.autoApprove?.enabled && amount <= settings.autoApprove.maxAmount 
        ? 'completed' 
        : 'pending',
    });

    // Deduct amount from user credit
    user.credit -= amount;
    await user.save();

    await withdrawal.save();

    // If auto-approved, add to completed
    if (withdrawal.status === 'completed') {
      withdrawal.completedAt = new Date();
      withdrawal.transactionId = `WTH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await withdrawal.save();
    }

    // Populate user details for response
    await withdrawal.populate('user', 'name email mobile credit');

    return res.status(201).json({
      success: true,
      message: withdrawal.status === 'completed' 
        ? 'Withdrawal completed successfully' 
        : 'Withdrawal request submitted successfully',
      data: {
        withdrawal,
        fee,
        netAmount,
        processingTime: settings.processingTime,
        status: withdrawal.status,
      },
    });

  } catch (error) {
    console.error('Withdrawal request error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Get user's withdrawal history
// @route   GET /api/withdrawals/history
// @access  Private
const getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Withdrawal.countDocuments(query),
    ]);

    // Get summary
    const summary = await Withdrawal.getSummary(userId);

    return res.status(200).json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        summary,
      },
    });

  } catch (error) {
    console.error('Get withdrawal history error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Get withdrawal details
// @route   GET /api/withdrawals/:id
// @access  Private
const getWithdrawalDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const withdrawal = await Withdrawal.findOne({
      _id: id,
      user: userId,
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: withdrawal,
    });

  } catch (error) {
    console.error('Get withdrawal details error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Cancel withdrawal (only pending)
// @route   PUT /api/withdrawals/:id/cancel
// @access  Private
const cancelWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const withdrawal = await Withdrawal.findOne({
      _id: id,
      user: userId,
      status: 'pending',
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Pending withdrawal not found',
      });
    }

    // Refund amount to user
    const user = await User.findById(userId);
    user.credit += withdrawal.amount;
    await user.save();

    withdrawal.status = 'cancelled';
    await withdrawal.save();

    return res.status(200).json({
      success: true,
      message: 'Withdrawal cancelled successfully',
      data: {
        withdrawal,
        refundedAmount: withdrawal.amount,
      },
    });

  } catch (error) {
    console.error('Cancel withdrawal error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Get withdrawal settings by country
// @route   GET /api/withdrawals/settings
// @access  Private
const getWithdrawalSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const settings = await WithdrawalSettings.findOne({
      country: user.country || 'IN',
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found for your country',
      });
    }

    // Get user's withdrawal summary
    const summary = await Withdrawal.getSummary(userId);

    return res.status(200).json({
      success: true,
      data: {
        settings: {
          country: settings.country,
          countryName: settings.countryName,
          currency: settings.currency,
          currencySymbol: settings.currencySymbol,
          minWithdrawal: settings.minWithdrawal,
          maxWithdrawal: settings.maxWithdrawal,
          paymentMethods: settings.paymentMethods,
          processingTime: settings.processingTime,
          processingFee: settings.processingFee,
          processingFeeType: settings.processingFeeType,
          dailyLimit: settings.dailyLimit,
          weeklyLimit: settings.weeklyLimit,
          monthlyLimit: settings.monthlyLimit,
          requirements: settings.requirements,
        },
        summary,
      },
    });

  } catch (error) {
    console.error('Get withdrawal settings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// ============ ADMIN CONTROLLERS ============

// @desc    Get all withdrawals (admin)
// @route   GET /api/admin/withdrawals
// @access  Admin
const getAllWithdrawals = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      country,
      fromDate,
      toDate,
      search 
    } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (country) {
      query.country = country;
    }
    
    if (fromDate || toDate) {
      query.requestedAt = {};
      if (fromDate) {
        query.requestedAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        query.requestedAt.$lte = new Date(toDate);
      }
    }
    
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userMobile: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .populate('user', 'name email mobile credit')
        .populate('processedBy', 'name email')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Withdrawal.countDocuments(query),
    ]);

    // Get statistics
    const stats = await Withdrawal.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        withdrawals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        stats,
      },
    });

  } catch (error) {
    console.error('Get all withdrawals error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Update withdrawal status (admin)
// @route   PUT /api/admin/withdrawals/:id
// @access  Admin
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      rejectionReason, 
      adminNotes, 
      transactionId 
    } = req.body;

    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found',
      });
    }

    // Prevent changes to completed/cancelled withdrawals
    if (['completed', 'cancelled'].includes(withdrawal.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${withdrawal.status} withdrawal`,
      });
    }

    const oldStatus = withdrawal.status;
    withdrawal.status = status;
    withdrawal.processedBy = req.user.id;
    withdrawal.processedAt = new Date();
    withdrawal.adminNotes = adminNotes || withdrawal.adminNotes;

    if (status === 'rejected') {
      withdrawal.rejectionReason = rejectionReason || 'No reason provided';
      // Refund amount
      const user = await User.findById(withdrawal.user);
      if (user) {
        user.credit += withdrawal.amount;
        await user.save();
      }
    }

    if (status === 'completed') {
      withdrawal.completedAt = new Date();
      if (transactionId) {
        withdrawal.transactionId = transactionId;
      } else {
        withdrawal.transactionId = `WTH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }
    }

    if (status === 'processing') {
      withdrawal.processedAt = new Date();
    }

    await withdrawal.save();

    // Send notification (implement your notification service)
    // await sendWithdrawalNotification(withdrawal, oldStatus);

    return res.status(200).json({
      success: true,
      message: 'Withdrawal status updated successfully',
      data: withdrawal,
    });

  } catch (error) {
    console.error('Update withdrawal status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Create/Update withdrawal settings (admin)
// @route   POST /api/admin/withdrawal-settings
// @access  Admin
const createOrUpdateWithdrawalSettings = async (req, res) => {
  try {
    const { country, ...settingsData } = req.body;

    if (!country) {
      return res.status(400).json({
        success: false,
        message: 'Country is required',
      });
    }

    const settings = await WithdrawalSettings.findOneAndUpdate(
      { country: country.toUpperCase() },
      { ...settingsData, country: country.toUpperCase() },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Withdrawal settings updated successfully',
      data: settings,
    });

  } catch (error) {
    console.error('Create/Update withdrawal settings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Get all withdrawal settings (admin)
// @route   GET /api/admin/withdrawal-settings
// @access  Admin
const getAllWithdrawalSettings = async (req, res) => {
  try {
    const settings = await WithdrawalSettings.find().sort({ country: 1 });

    return res.status(200).json({
      success: true,
      data: settings,
    });

  } catch (error) {
    console.error('Get all withdrawal settings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

// @desc    Get withdrawal statistics (admin)
// @route   GET /api/admin/withdrawals/stats
// @access  Admin
const getWithdrawalStats = async (req, res) => {
  try {
    const { country, period = '30d' } = req.query;

    const matchQuery = {};
    if (country) {
      matchQuery.country = country;
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    matchQuery.requestedAt = { $gte: startDate };

    // Get stats
    const stats = await Withdrawal.aggregate([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: {
            status: '$status',
            country: '$country',
            method: '$paymentMethod',
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
        },
      },
    ]);

    // Get daily trends
    const dailyTrends = await Withdrawal.aggregate([
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$requestedAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats,
        dailyTrends,
        period,
        startDate,
      },
    });

  } catch (error) {
    console.error('Get withdrawal stats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

module.exports = {
  requestWithdrawal,
  getWithdrawalHistory,
  getWithdrawalDetails,
  cancelWithdrawal,
  getWithdrawalSettings,
  getAllWithdrawals,
  updateWithdrawalStatus,
  createOrUpdateWithdrawalSettings,
  getAllWithdrawalSettings,
  getWithdrawalStats,
};