// models/Recharge.js
const mongoose = require('mongoose');

const rechargeSchema = new mongoose.Schema(
  {
    // ====================== USER INFO ======================
    phone: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      index: true,
    },
    
    // ====================== RECHARGE INFO ======================
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    money: {
      type: Number,
      default: 0,
    },
    
    // ====================== TRANSACTION INFO ======================
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    orderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    
    // ====================== PAYMENT INFO ======================
    paymentMethod: {
      type: String,
      enum: ['bank', 'upi', 'crypto', 'wallet', 'manual', 'other'],
      default: 'manual',
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    
    // ====================== STATUS ======================
    status: {
      type: Number,
      default: 0, // 0: pending, 1: completed, 2: failed, 3: cancelled
      index: true,
    },
    
    // ====================== ADMIN INFO ======================
    adminApprovedBy: {
      type: String,
      default: null,
    },
    adminApprovedAt: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    
    // ====================== BONUS ======================
    bonus: {
      type: Number,
      default: 0,
    },
    bonusType: {
      type: String,
      enum: ['percentage', 'fixed', 'none'],
      default: 'none',
    },
    
    // ====================== TIMESTAMP ======================
    rechargeDate: {
      type: String,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    
    // ====================== REFERRAL ======================
    referralCode: {
      type: String,
      default: null,
      index: true,
    },
    referredBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// =====================================================
// INDEXES FOR PERFORMANCE
// =====================================================

// Primary indexes
rechargeSchema.index({ phone: 1, status: 1 });
rechargeSchema.index({ phone: 1, createdAt: -1 });
rechargeSchema.index({ status: 1, createdAt: -1 });

// For admin queries
rechargeSchema.index({ status: 1, adminApprovedAt: -1 });
rechargeSchema.index({ status: 0, createdAt: 1 });

// Unique indexes
rechargeSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
rechargeSchema.index({ orderId: 1 }, { unique: true, sparse: true });

// =====================================================
// STATIC METHODS
// =====================================================

/**
 * Create a new recharge request
 */
rechargeSchema.statics.createRecharge = async function(rechargeData) {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat('en-GB', options);
  const parts = formatter.formatToParts(now);
  
  const getPart = (type) => parts.find(p => p.type === type).value;
  const rechargeDate = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  
  // Generate unique IDs if not provided
  if (!rechargeData.transactionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    rechargeData.transactionId = `RECH-${timestamp}-${random}`;
  }
  
  if (!rechargeData.orderId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    rechargeData.orderId = `ORD-${timestamp}-${random}`;
  }
  
  const recharge = new this({
    ...rechargeData,
    rechargeDate,
    status: rechargeData.status || 0,
  });
  
  await recharge.save();
  return recharge;
};

/**
 * Get user's recharge history with pagination
 */
rechargeSchema.statics.getUserRecharges = async function(phone, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    this.find({ phone })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments({ phone })
  ]);
  
  return {
    data: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get user's completed recharges
 */
rechargeSchema.statics.getCompletedRecharges = async function(phone) {
  return await this.find({ 
    phone, 
    status: 1 
  }).sort({ createdAt: -1 });
};

/**
 * Get user's pending recharges
 */
rechargeSchema.statics.getPendingRecharges = async function(phone) {
  return await this.find({ 
    phone, 
    status: 0 
  }).sort({ createdAt: 1 });
};

/**
 * Get all pending recharge requests (admin)
 */
rechargeSchema.statics.getPendingRequests = async function(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    this.find({ status: 0 })
      .populate('userId', 'name email mobile')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments({ status: 0 })
  ]);
  
  return {
    data: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get all completed recharges (admin)
 */
rechargeSchema.statics.getCompletedRequests = async function(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    this.find({ status: 1 })
      .populate('userId', 'name email mobile')
      .sort({ adminApprovedAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments({ status: 1 })
  ]);
  
  return {
    data: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get total recharge amount for a user
 */
rechargeSchema.statics.getTotalRecharged = async function(phone) {
  const result = await this.aggregate([
    {
      $match: {
        phone: phone,
        status: 1,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$money' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return result[0] || { total: 0, count: 0 };
};

/**
 * Get today's recharge total
 */
rechargeSchema.statics.getTodayTotal = async function(date) {
  const today = date || new Date().toISOString().split('T')[0];
  
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = await this.aggregate([
    {
      $match: {
        status: 1,
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$money' },
        count: { $sum: 1 },
      },
    },
  ]);
  
  return result[0] || { total: 0, count: 0 };
};

/**
 * Get recharge statistics (admin)
 */
rechargeSchema.statics.getStatistics = async function() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const [allTime, thisMonth, thisWeek, today] = await Promise.all([
    this.aggregate([
      { $match: { status: 1 } },
      { $group: { _id: null, total: { $sum: '$money' }, count: { $sum: 1 } } },
    ]),
    this.aggregate([
      { $match: { status: 1, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$money' }, count: { $sum: 1 } } },
    ]),
    this.aggregate([
      { $match: { status: 1, createdAt: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$money' }, count: { $sum: 1 } } },
    ]),
    this.aggregate([
      { $match: { 
        status: 1, 
        createdAt: { 
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999))
        } 
      }},
      { $group: { _id: null, total: { $sum: '$money' }, count: { $sum: 1 } } },
    ]),
  ]);
  
  const pending = await this.countDocuments({ status: 0 });
  
  return {
    allTime: allTime[0] || { total: 0, count: 0 },
    thisMonth: thisMonth[0] || { total: 0, count: 0 },
    thisWeek: thisWeek[0] || { total: 0, count: 0 },
    today: today[0] || { total: 0, count: 0 },
    pending: pending,
  };
};

/**
 * Approve a recharge request
 */
rechargeSchema.statics.approveRecharge = async function(rechargeId, adminName) {
  const recharge = await this.findById(rechargeId);
  
  if (!recharge) {
    throw new Error('Recharge not found');
  }
  
  if (recharge.status !== 0) {
    throw new Error('Recharge already processed');
  }
  
  recharge.status = 1;
  recharge.adminApprovedBy = adminName;
  recharge.adminApprovedAt = new Date();
  
  await recharge.save();
  
  // Update user credit
  const User = mongoose.model('users');
  await User.updateOne(
    { phone: recharge.phone },
    { $inc: { money: recharge.money } }
  );
  
  // Create transaction record
  const Transaction = mongoose.model('transactions');
  await Transaction.create({
    phone: recharge.phone,
    detail: 'Recharge',
    credit: recharge.money,
    time: recharge.rechargeDate,
  });
  
  return recharge;
};

/**
 * Reject a recharge request
 */
rechargeSchema.statics.rejectRecharge = async function(rechargeId, adminName, reason) {
  const recharge = await this.findById(rechargeId);
  
  if (!recharge) {
    throw new Error('Recharge not found');
  }
  
  if (recharge.status !== 0) {
    throw new Error('Recharge already processed');
  }
  
  recharge.status = 2;
  recharge.adminApprovedBy = adminName;
  recharge.adminApprovedAt = new Date();
  recharge.adminNotes = reason || 'Rejected by admin';
  
  await recharge.save();
  return recharge;
};

/**
 * Search recharge by transaction ID or order ID
 */
rechargeSchema.statics.searchByTransaction = async function(query) {
  return await this.findOne({
    $or: [
      { transactionId: query },
      { orderId: query },
    ],
  });
};

/**
 * Get recharges by date range
 */
rechargeSchema.statics.getByDateRange = async function(startDate, endDate, status = null) {
  const match = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
  
  if (status !== null && status !== undefined) {
    match.status = status;
  }
  
  return await this.find(match)
    .populate('userId', 'name email mobile')
    .sort({ createdAt: -1 });
};

// =====================================================
// INSTANCE METHODS
// =====================================================

/**
 * Check if recharge is pending
 */
rechargeSchema.methods.isPending = function() {
  return this.status === 0;
};

/**
 * Check if recharge is completed
 */
rechargeSchema.methods.isCompleted = function() {
  return this.status === 1;
};

/**
 * Check if recharge is failed
 */
rechargeSchema.methods.isFailed = function() {
  return this.status === 2;
};

/**
 * Check if recharge is cancelled
 */
rechargeSchema.methods.isCancelled = function() {
  return this.status === 3;
};

/**
 * Get status text
 */
rechargeSchema.methods.getStatusText = function() {
  const statuses = {
    0: 'Pending',
    1: 'Completed',
    2: 'Failed',
    3: 'Cancelled',
  };
  return statuses[this.status] || 'Unknown';
};

/**
 * Apply bonus to recharge
 */
rechargeSchema.methods.applyBonus = function(bonusPercentage) {
  if (bonusPercentage && bonusPercentage > 0) {
    this.bonus = (this.money * bonusPercentage) / 100;
    this.bonusType = 'percentage';
  }
  return this.bonus;
};

/**
 * Get total amount with bonus
 */
rechargeSchema.methods.getTotalWithBonus = function() {
  return this.money + (this.bonus || 0);
};

// =====================================================
// VIRTUAL PROPERTIES
// =====================================================

// Total amount with bonus
rechargeSchema.virtual('totalAmount').get(function() {
  return this.money + (this.bonus || 0);
});

// Is eligible for bonus
rechargeSchema.virtual('isBonusEligible').get(function() {
  return this.bonus > 0;
});

// =====================================================
// MIDDLEWARE
// =====================================================

// Auto-set recharge date before saving
rechargeSchema.pre('save', function(next) {
  if (!this.rechargeDate) {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(now);
    
    const getPart = (type) => parts.find(p => p.type === type).value;
    this.rechargeDate = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  }
  next();
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model('recharge', rechargeSchema);