// controllers/withdrawalSettingsController.js
const WithdrawalSettings = require('../models/WithdrawalSettings');
const mongoose = require('mongoose');

// @desc    Create new withdrawal settings
// @route   POST /api/withdrawal-settings
// @access  Private/Admin
exports.createWithdrawalSettings = async (req, res) => {
  try {
    const {
      country,
      countryName,
      currency,
      currencySymbol,
      minWithdrawal,
      maxWithdrawal,
      dailyLimit,
      weeklyLimit,
      monthlyLimit,
      processingTime,
      processingFee,
      processingFeeType,
      paymentMethods,
      requirements,
      verificationRequired,
      minAccountAge,
      minGamesPlayed,
      isActive,
      supportedCountries,
      restrictedCountries,
      autoApprove,
      maxWithdrawalsPerDay,
      maxWithdrawalsPerWeek,
      suspiciousAmountThreshold,
      notificationTemplates
    } = req.body;

    // Check if settings for this country already exist
    const existingSettings = await WithdrawalSettings.findOne({ country: country.toUpperCase() });
    if (existingSettings) {
      return res.status(400).json({
        success: false,
        message: `Withdrawal settings for ${country} already exist`
      });
    }

    const settings = new WithdrawalSettings({
      country: country.toUpperCase(),
      countryName,
      currency: currency || 'INR',
      currencySymbol: currencySymbol || '₹',
      minWithdrawal: minWithdrawal || 100,
      maxWithdrawal: maxWithdrawal || 100000,
      dailyLimit: dailyLimit || 50000,
      weeklyLimit: weeklyLimit || 200000,
      monthlyLimit: monthlyLimit || 500000,
      processingTime: processingTime || '24-48 hours',
      processingFee: processingFee || 0,
      processingFeeType: processingFeeType || 'fixed',
      paymentMethods: paymentMethods || ['bank_transfer', 'upi'],
      requirements: requirements || {
        bank_transfer: {
          required: ['accountNumber', 'accountHolderName', 'bankName', 'ifscCode']
        },
        upi: {
          required: ['upiId', 'upiName']
        }
      },
      verificationRequired: verificationRequired !== undefined ? verificationRequired : true,
      minAccountAge: minAccountAge || 1,
      minGamesPlayed: minGamesPlayed || 0,
      isActive: isActive !== undefined ? isActive : true,
      supportedCountries: supportedCountries || [],
      restrictedCountries: restrictedCountries || [],
      autoApprove: autoApprove || {
        enabled: false,
        maxAmount: 500,
        trustedUsers: []
      },
      maxWithdrawalsPerDay: maxWithdrawalsPerDay || 3,
      maxWithdrawalsPerWeek: maxWithdrawalsPerWeek || 10,
      suspiciousAmountThreshold: suspiciousAmountThreshold || 10000,
      notificationTemplates: notificationTemplates || {}
    });

    await settings.save();

    res.status(201).json({
      success: true,
      message: 'Withdrawal settings created successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error creating withdrawal settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating withdrawal settings',
      error: error.message
    });
  }
};

// @desc    Get all withdrawal settings
// @route   GET /api/withdrawal-settings
// @access  Private/Admin
exports.getAllWithdrawalSettings = async (req, res) => {
  try {
    const { country, isActive, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (country) query.country = country.toUpperCase();
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { country: 1 }
    };

    const settings = await WithdrawalSettings.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await WithdrawalSettings.countDocuments(query);

    res.status(200).json({
      success: true,
      data: settings,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawal settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching withdrawal settings',
      error: error.message
    });
  }
};

// @desc    Get single withdrawal settings by ID
// @route   GET /api/withdrawal-settings/:id
// @access  Private/Admin
exports.getWithdrawalSettingsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings ID'
      });
    }

    const settings = await WithdrawalSettings.findById(id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found'
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching withdrawal settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching withdrawal settings',
      error: error.message
    });
  }
};

// @desc    Get withdrawal settings by country
// @route   GET /api/withdrawal-settings/country/:country
// @access  Public
exports.getWithdrawalSettingsByCountry = async (req, res) => {
  try {
    const { country } = req.params;

    const settings = await WithdrawalSettings.findOne({ 
      country: country.toUpperCase(),
      isActive: true 
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found for this country'
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching withdrawal settings by country:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching withdrawal settings',
      error: error.message
    });
  }
};

// @desc    Update withdrawal settings
// @route   PUT /api/withdrawal-settings/:id
// @access  Private/Admin
exports.updateWithdrawalSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings ID'
      });
    }

    // Check if trying to update country to one that already exists
    if (updateData.country) {
      const existingSettings = await WithdrawalSettings.findOne({
        country: updateData.country.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (existingSettings) {
        return res.status(400).json({
          success: false,
          message: `Withdrawal settings for ${updateData.country} already exist`
        });
      }
      updateData.country = updateData.country.toUpperCase();
    }

    const settings = await WithdrawalSettings.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Withdrawal settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating withdrawal settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating withdrawal settings',
      error: error.message
    });
  }
};

// @desc    Partially update withdrawal settings
// @route   PATCH /api/withdrawal-settings/:id
// @access  Private/Admin
exports.partialUpdateWithdrawalSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings ID'
      });
    }

    const settings = await WithdrawalSettings.findById(id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found'
      });
    }

    // Update only the fields that are provided
    Object.keys(updateData).forEach(key => {
      if (key === 'country') {
        settings.country = updateData.country.toUpperCase();
      } else if (key === 'requirements' || key === 'autoApprove' || key === 'notificationTemplates') {
        // Merge nested objects
        settings[key] = { ...settings[key], ...updateData[key] };
      } else {
        settings[key] = updateData[key];
      }
    });
    
    settings.updatedAt = new Date();
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal settings partially updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error partially updating withdrawal settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating withdrawal settings',
      error: error.message
    });
  }
};

// @desc    Delete withdrawal settings
// @route   DELETE /api/withdrawal-settings/:id
// @access  Private/Admin
exports.deleteWithdrawalSettings = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings ID'
      });
    }

    const settings = await WithdrawalSettings.findByIdAndDelete(id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Withdrawal settings deleted successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error deleting withdrawal settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting withdrawal settings',
      error: error.message
    });
  }
};

// @desc    Toggle withdrawal settings active status
// @route   PATCH /api/withdrawal-settings/:id/toggle-status
// @access  Private/Admin
exports.toggleWithdrawalSettingsStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings ID'
      });
    }

    const settings = await WithdrawalSettings.findById(id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found'
      });
    }

    settings.isActive = !settings.isActive;
    settings.updatedAt = new Date();
    await settings.save();

    res.status(200).json({
      success: true,
      message: `Withdrawal settings ${settings.isActive ? 'activated' : 'deactivated'} successfully`,
      data: settings
    });
  } catch (error) {
    console.error('Error toggling withdrawal settings status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling withdrawal settings status',
      error: error.message
    });
  }
};

// @desc    Calculate withdrawal fee
// @route   POST /api/withdrawal-settings/:id/calculate-fee
// @access  Private
exports.calculateFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid withdrawal amount'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings ID'
      });
    }

    const settings = await WithdrawalSettings.findById(id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found'
      });
    }

    const fee = settings.calculateFee(amount);
    const totalAmount = amount + fee;

    res.status(200).json({
      success: true,
      data: {
        withdrawalAmount: amount,
        fee,
        feeType: settings.processingFeeType,
        totalAmount,
        currencySymbol: settings.currencySymbol,
        currency: settings.currency
      }
    });
  } catch (error) {
    console.error('Error calculating fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating fee',
      error: error.message
    });
  }
};

// @desc    Validate withdrawal request
// @route   POST /api/withdrawal-settings/:id/validate
// @access  Private
exports.validateWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, userData } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid withdrawal amount'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings ID'
      });
    }

    const settings = await WithdrawalSettings.findById(id);
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal settings not found'
      });
    }

    const validation = settings.validateWithdrawal(amount, userData || {});

    res.status(200).json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating withdrawal',
      error: error.message
    });
  }
};

// @desc    Bulk create withdrawal settings
// @route   POST /api/withdrawal-settings/bulk
// @access  Private/Admin
exports.bulkCreateWithdrawalSettings = async (req, res) => {
  try {
    const { settingsList } = req.body;

    if (!settingsList || !Array.isArray(settingsList)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of settings'
      });
    }

    const createdSettings = [];
    const errors = [];

    for (const setting of settingsList) {
      try {
        const existing = await WithdrawalSettings.findOne({ 
          country: setting.country.toUpperCase() 
        });
        
        if (!existing) {
          const newSetting = new WithdrawalSettings({
            ...setting,
            country: setting.country.toUpperCase()
          });
          await newSetting.save();
          createdSettings.push(newSetting);
        } else {
          errors.push(`Settings for ${setting.country} already exist`);
        }
      } catch (error) {
        errors.push(`Error creating settings for ${setting.country}: ${error.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdSettings.length} settings, ${errors.length} errors`,
      data: {
        created: createdSettings,
        errors
      }
    });
  } catch (error) {
    console.error('Error bulk creating withdrawal settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk creating withdrawal settings',
      error: error.message
    });
  }
};