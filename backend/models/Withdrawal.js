// models/Withdrawal.js
const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userMobile: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  
  // Withdrawal Details
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'paypal', 'crypto', 'phonepe', 'googlepay', 'paytm', 'skrill', 'neteller'],
    required: true,
  },
  
  // Bank Details (for bank transfers)
  bankDetails: {
    accountNumber: String,
    accountHolderName: String,
    bankName: String,
    ifscCode: String,
    branchName: String,
  },
  
  // UPI Details
  upiDetails: {
    upiId: String,
    upiName: String,
  },
  
  // PayPal Details
  paypalDetails: {
    email: String,
  },
  
  // Crypto Details
  cryptoDetails: {
    walletAddress: String,
    network: String,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'rejected'],
    default: 'pending',
  },
  
  // Admin Actions
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  processedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  adminNotes: {
    type: String,
  },
  
  // Transaction Details
  transactionId: {
    type: String,
  },
  referenceId: {
    type: String,
  },
  
  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  
  // Additional Metadata
  metadata: {
    type: Map,
    of: String,
  },
  
  // Audit Trail
  ipAddress: String,
  userAgent: String,
  
  // Notifications
  notificationSent: {
    type: Boolean,
    default: false,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
});

// Indexes for faster queries
withdrawalSchema.index({ user: 1, status: 1 });
withdrawalSchema.index({ status: 1, requestedAt: -1 });
withdrawalSchema.index({ userId: 1, requestedAt: -1 });
withdrawalSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

// Virtual for formatted amount
withdrawalSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency,
  }).format(this.amount);
});

// Pre-save middleware
withdrawalSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  if (this.isModified('status') && this.status === 'processing') {
    this.processedAt = new Date();
  }
});

// Static method to get withdrawal summary
withdrawalSchema.statics.getSummary = async function(userId) {
  const summary = await this.aggregate([
    {
      $match: { user: userId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      }
    }
  ]);
  return summary;
};

module.exports = mongoose.model('Withdrawal', withdrawalSchema);