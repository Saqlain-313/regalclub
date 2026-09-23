const mongoose = require("mongoose");

const minesGameSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    gridSize: {
      type: Number,
      default: 6,
    },

    totalCells: {
      type: Number,
      default: 36,
    },

    minesCount: {
      type: Number,
      required: true,
    },

    minePositions: {
      type: [Number],
      required: true,
      select: false,
    },

    openedCells: {
      type: [Number],
      default: [],
    },

    safeCells: {
      type: Number,
      default: 0,
    },

    multiplier: {
      type: Number,
      default: 1,
    },

    virtualStake: {
      type: Number,
      default: 0,
    },

    virtualWin: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["playing", "lost", "won", "cashout"],
      default: "playing",
      index: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    finishedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MinesGame", minesGameSchema);