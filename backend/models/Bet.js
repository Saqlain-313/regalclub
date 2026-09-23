// models/Bet.js
const mongoose = require("mongoose");

const betSchema = new mongoose.Schema(
  {
    // ====================== IDENTIFICATION ======================
    id_product: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mobile: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      default: null,
    },
    invite: {
      type: String,
      default: null,
    },

    // ====================== GAME INFO ======================
    stage: {
      type: String, // period number
      required: true,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    game: {
      type: String,
      required: true,
      enum: [
        "wingo",
        "wingo3",
        "wingo5",
        "wingo10",
        "trx",
        "trx3",
        "trx5",
        "trx10",
      ],
      index: true,
    },
    bet: {
      type: String, // l, n, d, x, t, 0-9
      required: true,
      index: true,
    },

    // ====================== AMOUNT INFO ======================
    money: {
      type: Number, // total bet amount after fee
      default: 0,
    },
    amount: {
      type: Number, // x value (multiplier / quantity)
      default: 0,
    },
    fee: {
      type: Number,
      default: 0,
    },
    get: {
      type: Number, // winning amount
      default: 0,
    },

    // ====================== STATUS ======================
    status: {
      type: Number,
      default: 0, // 0: pending, 1: won, 2: lost
      index: true,
    },
    result: {
      type: Number,
      default: null,
    },

    // ====================== TIMESTAMP ======================
    today: {
      type: String,
      default: null,
    },
    isdemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// =====================================================
// INDEXES FOR PERFORMANCE
// =====================================================

// Primary indexes
betSchema.index({ phone: 1, game: 1, status: 1 });
betSchema.index({ stage: 1, game: 1, status: 1 });
betSchema.index({ game: 1, status: 1, bet: 1 });
betSchema.index({ phone: 1, createdAt: -1 });

// For daily reports
betSchema.index({ phone: 1, today: 1 });

// For game result processing
betSchema.index({ game: 1, status: 0, bet: 1 });

// For commission calculations
betSchema.index({ game: 1, status: 1, phone: 1 });

// =====================================================
// STATIC METHODS
// =====================================================

/**
 * Get pending bets for a game
 */
betSchema.statics.getPendingBets = async function (gameName) {
  return await this.find({
    game: gameName,
    status: 0,
  });
};

/**
 * Get pending bets by period
 */
betSchema.statics.getPendingBetsByPeriod = async function (gameName, period) {
  return await this.find({
    game: gameName,
    stage: period,
    status: 0,
  });
};

/**
 * Get pending bets by bet type
 */
betSchema.statics.getPendingBetsByType = async function (
  gameName,
  period,
  betType,
) {
  return await this.find({
    game: gameName,
    stage: period,
    bet: betType,
    status: 0,
  });
};

/**
 * Get user bets for a specific game with pagination
 */
betSchema.statics.getUserBets = async function (
  phone,
  gameName,
  page = 1,
  limit = 10,
) {
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    this.find({ phone, game: gameName })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments({ phone, game: gameName }),
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
 * Get all user bets (all games) with pagination
 */
betSchema.statics.getAllUserBets = async function (
  phone,
  page = 1,
  limit = 100,
) {
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    this.find({ phone }).sort({ _id: -1 }).skip(skip).limit(limit),
    this.countDocuments({ phone }),
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
 * Get bets by bet type for a period
 */
betSchema.statics.getBetsByType = async function (gameName, period, betType) {
  return await this.find({
    game: gameName,
    stage: period,
    bet: betType,
    status: 0,
  });
};

/**
 * Update bet results for a period
 */
betSchema.statics.updateBetResult = async function (gameName, period, result) {
  // Mark all as lost first
  await this.updateMany(
    { game: gameName, stage: period, status: 0 },
    { $set: { result } },
  );
  return result;
};

/**
 * Get winning bets by period
 */
betSchema.statics.getWinningBets = async function (gameName, period) {
  return await this.find({
    game: gameName,
    stage: period,
    status: 1,
  });
};

/**
 * Get losing bets by period
 */
betSchema.statics.getLosingBets = async function (gameName, period) {
  return await this.find({
    game: gameName,
    stage: period,
    status: 2,
  });
};

/**
 * Mark bets as won
 */
betSchema.statics.markAsWon = async function (betIds, winAmounts) {
  const bulkOps = betIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: {
        $set: {
          status: 1,
          get: winAmounts[index],
        },
      },
    },
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
};

/**
 * Mark bets as lost
 */
betSchema.statics.markAsLost = async function (betIds) {
  const bulkOps = betIds.map((id) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { status: 2 } },
    },
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
};

/**
 * Get daily betting summary for a user
 */
betSchema.statics.getDailySummary = async function (phone, date) {
  const today = date || new Date().toISOString().split("T")[0];

  const summary = await this.aggregate([
    {
      $match: {
        phone: phone,
        today: today,
      },
    },
    {
      $group: {
        _id: "$game",
        totalBets: { $sum: 1 },
        totalAmount: { $sum: "$money" },
        totalWon: { $sum: "$get" },
        totalFee: { $sum: "$fee" },
      },
    },
  ]);

  return summary;
};

/**
 * Get total money bet by a user today
 */
betSchema.statics.getTodayTotal = async function (phone, date) {
  const today = date || new Date().toISOString().split("T")[0];

  const result = await this.aggregate([
    {
      $match: {
        phone: phone,
        today: today,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$money" },
      },
    },
  ]);

  return result[0]?.total || 0;
};

/**
 * Get bets by status
 */
betSchema.statics.getBetsByStatus = async function (
  gameName,
  status,
  page = 1,
  limit = 50,
) {
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    this.find({ game: gameName, status })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments({ game: gameName, status }),
  ]);

  return {
    data: results,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// =====================================================
// INSTANCE METHODS
// =====================================================

/**
 * Check if bet is won
 */
betSchema.methods.isWon = function () {
  return this.status === 1;
};

/**
 * Check if bet is lost
 */
betSchema.methods.isLost = function () {
  return this.status === 2;
};

/**
 * Check if bet is pending
 */
betSchema.methods.isPending = function () {
  return this.status === 0;
};

/**
 * Calculate win amount based on result
 */
betSchema.methods.calculateWin = function (result) {
  const betType = this.bet;
  const money = this.money;

  // For small/large bets
  if (betType === "l" || betType === "n") {
    return money * 2;
  }

  // For 0 and 5 special cases
  if (result === 0 || result === 5) {
    if (betType === "d" || betType === "x") {
      return money * 1.5;
    }
    if (betType === "t") {
      return money * 4.5;
    }
    if (betType === "0" || betType === "5") {
      return money * 4.5;
    }
  }

  // Check exact number match
  if (betType === String(result)) {
    return money * 9;
  }

  // Check special bets
  const specialMap = {
    1: "x",
    2: "d",
    3: "x",
    4: "d",
    6: "d",
    7: "x",
    8: "d",
    9: "x",
  };

  if (specialMap[result] === betType) {
    return money * 2;
  }

  return 0;
};

/**
 * Get bet type description
 */
betSchema.methods.getBetTypeDescription = function () {
  const descriptions = {
    l: "Big",
    n: "Small",
    d: "Red",
    x: "Green",
    t: "Violet",
    0: "Number 0",
    1: "Number 1",
    2: "Number 2",
    3: "Number 3",
    4: "Number 4",
    5: "Number 5",
    6: "Number 6",
    7: "Number 7",
    8: "Number 8",
    9: "Number 9",
  };

  return descriptions[this.bet] || this.bet;
};

/**
 * Get status text
 */
betSchema.methods.getStatusText = function () {
  const statuses = {
    0: "Pending",
    1: "Won",
    2: "Lost",
  };
  return statuses[this.status] || "Unknown";
};

// =====================================================
// VIRTUAL PROPERTIES
// =====================================================

// Net win/loss
betSchema.virtual("netResult").get(function () {
  if (this.status === 1) {
    return this.get - this.money;
  }
  if (this.status === 2) {
    return -this.money;
  }
  return 0;
});

// Profit percentage
betSchema.virtual("profitPercentage").get(function () {
  if (this.money === 0) return 0;
  return ((this.get - this.money) / this.money) * 100;
});

// =====================================================
// MIDDLEWARE
// =====================================================

// Before saving, ensure today field is set
betSchema.pre("save", function (next) {
  if (!this.today) {
    const now = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-GB", options);
    const parts = formatter.formatToParts(now);

    const getPart = (type) => parts.find((p) => p.type === type).value;
    this.today = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
  }
});

// =====================================================
// MODEL
// =====================================================

module.exports = mongoose.model("bets", betSchema);
