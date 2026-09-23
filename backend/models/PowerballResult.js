const mongoose = require("mongoose");

const powerballResultSchema = new mongoose.Schema(
  {
    gamePoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GamePool",
      required: true,
      unique: true, // One result per game pool
    },
    drawNo: {
      type: Number,
      required: true,
    },
    numbers: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => arr.length === 7,
        message: "Winning result must contain exactly 7 numbers.",
      },
    },
    powerball: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
powerballResultSchema.index({ gamePoolId: 1 });
powerballResultSchema.index({ drawNo: 1 });

module.exports = mongoose.model(
  "PowerballResult",
  powerballResultSchema
);