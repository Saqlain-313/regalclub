const mongoose = require("mongoose");

const powerballResultSchema = new mongoose.Schema(
  {
    gamePoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PakistanGamePool",
      required: true,
    },

    drawNo: {
      type: Number,
      required: true,
    },

    numbers: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.length === 7 &&
          arr.every((n) => Number.isInteger(n) && n >= 1 && n <= 69) &&
          new Set(arr).size === arr.length,
        message: "Winning result must contain 7 unique integers between 1 and 69.",
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

powerballResultSchema.index({ gamePoolId: 1 }, { unique: true });
powerballResultSchema.index({ drawNo: 1 });

module.exports = mongoose.model(
  "PakistanPowerballResult",
  powerballResultSchema
);
