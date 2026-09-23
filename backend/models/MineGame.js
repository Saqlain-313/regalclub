const mongoose = require("mongoose");

const mineGameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Mines",
      trim: true,
    },

    gridSize: {
      type: Number,
      enum: [5, 6, 7, 8, 9, 10],
      default: 5,
    },

    totalCells: {
      type: Number,
      default: 25,
    },

    minesCount: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: function (value) {
          return value < this.totalCells;
        },
        message: "Mines count must be less than total cells",
      },
    },

    betAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },

    minBet: {
      type: Number,
      default: 10,
      min: 0,
    },

    maxBet: {
      type: Number,
      default: 10000,
      min: 0,
    },

    multiplier: {
      type: Number,
      default: 1,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

mineGameSchema.pre("save", function (next) {
  this.totalCells = this.gridSize * this.gridSize;

  if (this.minesCount >= this.totalCells) {
    return next(
      new Error("Mines count must be less than total cells")
    );
  }

  if (this.minBet > this.maxBet) {
    return next(
      new Error("Minimum bet cannot be greater than maximum bet")
    );
  }

  next();
});

module.exports = mongoose.model("MineGame", mineGameSchema);