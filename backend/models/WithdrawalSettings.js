// models/WithdrawalSettings.js
const mongoose = require('mongoose');

const withdrawalSettingsSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  countryName: {
    type: String,
    required: true,
  },
  
  // Currency Settings
  currency: {
    type: String,
    default: 'INR',
  },
  currencySymbol: {
    type: String,
    default: '₹',
  },
  
  // Withdrawal Limits
  minWithdrawal: {
    type: Number,
    required: true,
    default: 100,
  },
  maxWithdrawal: {
    type: Number,
    required: true,
    default: 100000,
  },
  dailyLimit: {
    type: Number,
    default: 50000,
  },
  weeklyLimit: {
    type: Number,
    default: 200000,
  },
  monthlyLimit: {
    type: Number,
    default: 500000,
  },
  
  // Processing Times
  processingTime: {
    type: String,
    default: '24-48 hours',
  },
  processingFee: {
    type: Number,
    default: 0,
  },
  processingFeeType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed',
  },
  
  // Available Payment Methods
  paymentMethods: {
    type: [String],
    enum: ['bank_transfer', 'upi', 'paypal', 'crypto', 'phonepe', 'googlepay', 'paytm', 'skrill', 'neteller'],
    default: ['bank_transfer', 'upi'],
  },
  
  // Requirements for each payment method
  requirements: {
    bank_transfer: {
      required: {
        type: [String],
        default: ['accountNumber', 'accountHolderName', 'bankName', 'ifscCode'],
      },
      optional: ['branchName'],
    },
    upi: {
      required: {
        type: [String],
        default: ['upiId', 'upiName'],
      },
    },
    paypal: {
      required: {
        type: [String],
        default: ['email'],
      },
    },
    crypto: {
      required: {
        type: [String],
        default: ['walletAddress', 'network'],
      },
    },
    phonepe: {
      required: {
        type: [String],
        default: ['upiId', 'upiName'],
      },
    },
    googlepay: {
      required: {
        type: [String],
        default: ['upiId', 'upiName'],
      },
    },
    paytm: {
      required: {
        type: [String],
        default: ['upiId', 'upiName'],
      },
    },
    skrill: {
      required: {
        type: [String],
        default: ['email'],
      },
    },
    neteller: {
      required: {
        type: [String],
        default: ['email'],
      },
    },
  },
  
  // Verification Requirements
  verificationRequired: {
    type: Boolean,
    default: true,
  },
  minAccountAge: {
    type: Number, // in days
    default: 1,
  },
  minGamesPlayed: {
    type: Number,
    default: 0,
  },
  
  // Additional Settings
  isActive: {
    type: Boolean,
    default: true,
  },
  supportedCountries: {
    type: [String],
  },
  restrictedCountries: {
    type: [String],
  },
  
  // Auto-approval settings
  autoApprove: {
    enabled: {
      type: Boolean,
      default: false,
    },
    maxAmount: {
      type: Number,
      default: 500,
    },
    trustedUsers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
    },
  },
  
  // Fraud Prevention
  maxWithdrawalsPerDay: {
    type: Number,
    default: 3,
  },
  maxWithdrawalsPerWeek: {
    type: Number,
    default: 10,
  },
  suspiciousAmountThreshold: {
    type: Number,
    default: 10000,
  },
  
  // Notification Templates
  notificationTemplates: {
    requested: {
      subject: String,
      body: String,
    },
    approved: {
      subject: String,
      body: String,
    },
    completed: {
      subject: String,
      body: String,
    },
    rejected: {
      subject: String,
      body: String,
    },
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-update middleware
withdrawalSettingsSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Method to calculate fees
withdrawalSettingsSchema.methods.calculateFee = function(amount) {
  if (this.processingFeeType === 'percentage') {
    return (amount * this.processingFee) / 100;
  }
  return this.processingFee;
};

// Method to validate withdrawal
withdrawalSettingsSchema.methods.validateWithdrawal = function(amount, userData) {
  const errors = [];
  
  if (amount < this.minWithdrawal) {
    errors.push(`Minimum withdrawal amount is ${this.currencySymbol}${this.minWithdrawal}`);
  }
  
  if (amount > this.maxWithdrawal) {
    errors.push(`Maximum withdrawal amount is ${this.currencySymbol}${this.maxWithdrawal}`);
  }
  
  // Check user account age
  if (this.minAccountAge > 0 && userData.createdAt) {
    const accountAge = Math.floor((Date.now() - userData.createdAt) / (1000 * 60 * 60 * 24));
    if (accountAge < this.minAccountAge) {
      errors.push(`Account must be at least ${this.minAccountAge} days old`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = mongoose.model('WithdrawalSettings', withdrawalSettingsSchema);