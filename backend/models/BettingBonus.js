const mongoose = require("mongoose");

const bettingBonusSchema = new mongoose.Schema(
  {
    percentage: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
      max: 100,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BettingBonus", bettingBonusSchema);