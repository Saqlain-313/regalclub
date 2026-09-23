const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    // Parent/master market
    marketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Market",
      required: true,
      index: true,
    },

    // Exact marketArray subdocument for which this bid was placed.
    marketDayId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Snapshot/reference of the selected market day.
    marketDate: {
      type: Date,
      required: true,
      index: true,
    },

    gameType: {
      type: String,
      required: true,
      enum: [
        "single",
        "jodi",
        "panna",
        "single-Patti",
        "double-Patti",
        "triple-Patti",
        "half-sangam",
        "full-sangam",
        "last-digit",
        "first-digit",
      ],
    },

    number: {
      type: String,
      required: true,
      trim: true,
    },

    bidAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    possibleWinAmount: {
      type: Number,
      default: 0,
    },

    winAmount: {
      type: Number,
      default: 0,
    },

    transactionId: {
      type: String,
      unique: true,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "won", "lost", "cancelled"],
      default: "pending",
    },

    resultNumber: {
      type: String,
      default: null,
    },

    bidTime: {
      type: Date,
      default: Date.now,
    },

    wonAt: {
      type: Date,
      default: null,
    },

    lostAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

bidSchema.index({ userId: 1, createdAt: -1 });
bidSchema.index({ marketId: 1, marketDayId: 1, status: 1 });
bidSchema.index({ marketDayId: 1, status: 1 });
bidSchema.index({ marketDate: 1, status: 1 });
bidSchema.index({ transactionId: 1 }, { unique: true });
bidSchema.index({ gameType: 1 });
bidSchema.index({ status: 1 });

module.exports = mongoose.model("Bid", bidSchema);
