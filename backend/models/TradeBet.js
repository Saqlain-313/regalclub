const mongoose = require("mongoose");

const TradebetSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    userId: {
      type: Number,
      required: true,
      index: true,
    },

    period: {
      type: Number,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    bet: {
      type: String,
      required: true,
      trim: true,
    },

    tradeType: {
      type: String,
      required: true,
      trim: true,
    },

    getAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    result: {
      type: String,
      default: "",
      trim: true,
    },

    // 0 = pending
    // 1 = win
    // 2 = lose
    // 3 = cancelled
    status: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Fast queries for user's bets
TradebetSchema.index({ userId: 1, createdAt: -1 });

// Fast queries for period/round bets
TradebetSchema.index({ period: 1, status: 1 });

// Prevent model overwrite during hot reload
module.exports =
  mongoose.models.TradeBet || mongoose.model("TradeBet", TradebetSchema);