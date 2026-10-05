// controllers/withdrawalController.js
const Withdrawal = require('../models/Withdrawal');
const WithdrawalSettings = require('../models/WithdrawalSettings');
const User = require('../models/authmodel');
const mongoose = require('mongoose');
const { getWageringSummary } = require('../utils/wageringService');

// @desc    Get withdrawal eligibility (wagering-based)
// @route   GET /api/withdrawals/eligibility
// @access  Private
const getWithdrawalEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const summary = await getWageringSummary(user);

    return res.status(200).json({
      success: true,
      eligibility: summary,
    });
  } catch (error) {
    console.error('Get withdrawal eligibility error:', error);
    // Wagering computation failed -> return safe defaults so the
    // page never breaks (instead of a hard 400/500 error)
    return res.status(200).json({
      success: true,
      eligibility: {
        requiredWagering: 0,
        rechargeWagering: 0,
        adminWageringRequired: 0,
        totalWagered: 0,
        totalWinnings: 0,
        wageringCompleted: 0,
        apiGameWagered: 0,
        remainingWagering: 0,
        maxAllowedWithdrawal: Number(req.user?.credit || 0),
        isEligibleForFullWithdrawal: true,
        canWithdraw: true,
      },
    });
  }
};

// @desc    Request a withdrawal
// @route   POST /api/withdrawals
// @access  Private
const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    let {
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

    // ============================================================
    // INDIA-ONLY — settings come from the ADMIN panel
    // (/admin/withdrawal-settings saves a WithdrawalSettings doc
    // for 'IN'). Missing fields fall back to the built-in defaults
    // below, so the flow works even before the admin saves anything.
    // ============================================================
    const BUILTIN_DEFAULT_SETTINGS = {
      isActive: true,
      country: 'IN',
      currency: 'INR',
      currencySymbol: '₹',
      minWithdrawal: 100,
      maxWithdrawal: 100000,
      dailyLimit: 0,
      weeklyLimit: 0,
      monthlyLimit: 0,
      maxWithdrawalsPerDay: 3,
      paymentMethods: ['upi', 'bank_transfer', 'crypto'],
      processingTime: '24-48 hours',
      requirements: {
        upi: { required: ['upiId'] },
        bank_transfer: { required: ['accountNumber', 'ifscCode', 'accountHolderName'] },
        crypto: { required: ['walletAddress', 'network'] },
      },
      autoApprove: { enabled: false, maxAmount: 0 },
    };

    let dbSettings = null;
    try {
      dbSettings = await WithdrawalSettings.findOne({ country: 'IN' }).lean();
    } catch (settingsError) {
      console.warn('Withdrawal settings load failed, using defaults:', settingsError.message);
    }

    const settings = {
      ...BUILTIN_DEFAULT_SETTINGS,
      ...(dbSettings || {}),
      // These two are always admin-controlled but never break the flow
      paymentMethods:
        Array.isArray(dbSettings?.paymentMethods) && dbSettings.paymentMethods.length
          ? dbSettings.paymentMethods
          : BUILTIN_DEFAULT_SETTINGS.paymentMethods,
      requirements:
        dbSettings?.requirements && Object.keys(dbSettings.requirements).length
          ? dbSettings.requirements
          : BUILTIN_DEFAULT_SETTINGS.requirements,
    };

    amount = Number(amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal amount',
      });
    }

    // Admin can pause withdrawals entirely from the settings panel
    if (settings.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Withdrawals are temporarily unavailable. Please try again later.',
      });
    }

    // Per-method limits from admin settings — UPI/Bank and USDT
    // can each have their own min/max. Blank values fall back to
    // the global limits.
    const methodKey =
      paymentMethod === 'crypto'
        ? 'crypto'
        : paymentMethod === 'bank_transfer'
          ? 'bank'
          : 'upi';
    const methodLimits = settings.methodSettings?.[methodKey] || {};
    const effectiveMin =
      Number(methodLimits.minWithdrawal) > 0
        ? Number(methodLimits.minWithdrawal)
        : Number(settings.minWithdrawal);
    const effectiveMax =
      Number(methodLimits.maxWithdrawal) > 0
        ? Number(methodLimits.maxWithdrawal)
        : Number(settings.maxWithdrawal);

    if (amount < effectiveMin) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${methodKey === 'crypto' ? 'USDT' : 'withdrawal'} amount is ${settings.currencySymbol}${effectiveMin}`,
      });
    }

    if (amount > effectiveMax) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${methodKey === 'crypto' ? 'USDT' : 'withdrawal'} amount is ${settings.currencySymbol}${effectiveMax}`,
      });
    }

    // Check user credit
    if (user.credit < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient credit',
        availablecredit: user.credit,
      });
    }

    // ================================================
    // WAGERING-BASED WITHDRAWAL ELIGIBILITY (backend validation)
    // - Wagering pending -> withdraw up to the wagered amount
    // - Wagering complete -> up to the wallet balance
    // ================================================
    const wagering = await getWageringSummary(user);
    if (amount > wagering.maxAllowedWithdrawal) {
      return res.status(403).json({
        success: false,
        message:
          wagering.remainingWagering > 0
            ? `Wagering requirement pending. Complete ₹${wagering.remainingWagering} more wagering to withdraw fully, or withdraw up to ₹${wagering.maxAllowedWithdrawal} (your completed wagering amount).`
            : 'Insufficient credit',
        wagering,
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

    // Crypto withdrawals are USDT-only — validate the network whitelist
    if (paymentMethod === 'crypto') {
      const USDT_NETWORKS = ['TRC20', 'ERC20', 'BEP20'];
      const requestedNetwork = String(cryptoDetails?.network || '').trim().toUpperCase();
      if (!USDT_NETWORKS.includes(requestedNetwork)) {
        return res.status(400).json({
          success: false,
          message: `Invalid USDT network. Allowed networks: ${USDT_NETWORKS.join(', ')}`,
        });
      }
      if (!String(cryptoDetails?.walletAddress || '').trim()) {
        return res.status(400).json({
          success: false,
          message: 'USDT wallet address is required',
        });
      }
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

    // Fee from ADMIN settings (percentage or flat) — previously
    // hardcoded at 2% and the admin's fee setting was ignored
    const settingsFee = Number(settings.processingFee || 0);
    const fee =
      settings.processingFeeType === 'percentage'
        ? Number(((amount * settingsFee) / 100).toFixed(2))
        : Number(settingsFee.toFixed(2));
    const netAmount = Number((amount - fee).toFixed(2));

    // User-facing order number — WD + timestamp + random suffix
    const orderNow = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const orderNumber =
      'REG' +
      orderNow.getFullYear() +
      pad(orderNow.getMonth() + 1) +
      pad(orderNow.getDate()) +
      pad(orderNow.getHours()) +
      pad(orderNow.getMinutes()) +
      pad(orderNow.getSeconds()) +
      String(orderNow.getMilliseconds()).padStart(3, '0') +
      Math.random().toString(36).slice(2, 4);

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      orderNumber,
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

    // ATOMIC FLOW:
    // 1) create the withdrawal record (pending)
    // 2) deduct credit atomically — if the deduction fails, delete
    //    the record + return an error
    //    (previously the credit was deducted first, and when saving
    //     the record failed the money disappeared — no history, no
    //     money)
    await withdrawal.save();

    const deducted = await User.findOneAndUpdate(
      {
        _id: user._id,
        credit: { $gte: amount },
      },
      { $inc: { credit: -amount } },
      { new: true },
    );

    if (!deducted) {
      await Withdrawal.deleteOne({ _id: withdrawal._id });
      return res.status(400).json({
        success: false,
        message: 'Insufficient credit',
        availablecredit: Number(user.credit || 0),
      });
    }

    user.credit = Number(deducted.credit);

    // navbar instant update — live wallet push
    try {
      if (global.io) {
        global.io.to(`user-${user._id}`).emit('wallet-update', {
          credit: Number(deducted.credit) || 0,
        });
      }
    } catch (e) {
      // best-effort
    }

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

// @desc    Get withdrawal settings (India-only platform)
// @route   GET /api/withdrawals/settings
// @access  Private
const getWithdrawalSettings = async (req, res) => {
  // Built-in India defaults — if no settings exist in the DB the
  // page must still work (previously a 404 was returned and every
  // refresh showed a "Settings Error" toast).
  const BUILTIN_DEFAULT_SETTINGS = {
    country: 'IN',
    countryName: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    minWithdrawal: 100,
    maxWithdrawal: 100000,
    processingFee: 2,
    processingFeeType: 'percentage',
    dailyLimit: 0,
    weeklyLimit: 0,
    monthlyLimit: 0,
    maxWithdrawalsPerDay: 3,
    paymentMethods: ['upi', 'bank_transfer', 'crypto'],
    processingTime: '24-48 hours',
    requirements: {
      upi: { required: ['upiId'] },
      bank_transfer: {
        required: ['accountNumber', 'ifscCode', 'accountHolderName'],
      },
      crypto: { required: ['walletAddress', 'network'] },
    },
  };

  try {
    const userId = req.user.id;

    // No DB lookup needed for the country — the platform is
    // India-only, so always resolve settings for 'IN'
    let settings = await WithdrawalSettings.findOne({ country: 'IN' }).lean();

    const effectiveSettings = settings || BUILTIN_DEFAULT_SETTINGS;

    // Get the user's withdrawal summary — if it fails, still send
    // the settings with an empty summary instead of failing the
    // whole request
    let summary = [];
    try {
      summary = await Withdrawal.getSummary(userId);
    } catch (summaryError) {
      console.warn('Withdrawal summary fallback used:', summaryError.message);
      summary = [];
    }

    return res.status(200).json({
      success: true,
      data: {
        settings: {
          country: effectiveSettings.country,
          countryName: effectiveSettings.countryName,
          // Admin pause switch — the user page shows a notice when off
          isActive: effectiveSettings.isActive !== false,
          maxWithdrawalsPerDay: effectiveSettings.maxWithdrawalsPerDay || 0,
          // Per-method limits (upi/bank/crypto) — blank = use global
          methodSettings: effectiveSettings.methodSettings || {},
          currency: effectiveSettings.currency,
          currencySymbol: effectiveSettings.currencySymbol,
          minWithdrawal: effectiveSettings.minWithdrawal,
          maxWithdrawal: effectiveSettings.maxWithdrawal,
          paymentMethods: effectiveSettings.paymentMethods,
          processingTime: effectiveSettings.processingTime,
          processingFee: effectiveSettings.processingFee,
          processingFeeType: effectiveSettings.processingFeeType,
          dailyLimit: effectiveSettings.dailyLimit,
          weeklyLimit: effectiveSettings.weeklyLimit,
          monthlyLimit: effectiveSettings.monthlyLimit,
          requirements: effectiveSettings.requirements,
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
      transactionId,
      remark,
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

    // Short note shown in the user's withdrawal history
    if (remark !== undefined) {
      withdrawal.remark = String(remark).slice(0, 200);
    } else if (status === 'rejected' && rejectionReason && !withdrawal.remark) {
      withdrawal.remark = String(rejectionReason).slice(0, 200);
    }

    if (status === 'rejected') {
      withdrawal.rejectionReason = rejectionReason || 'No reason provided';
      // Refund amount — atomic $inc so a double-click can never
      // credit the user twice
      if (oldStatus !== 'rejected') {
        await User.findByIdAndUpdate(
          withdrawal.user,
          { $inc: { credit: withdrawal.amount } },
        );
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
  getWithdrawalEligibility,
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