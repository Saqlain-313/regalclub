const mongoose = require("mongoose");

const multiplierItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const winMultiplierSchema = new mongoose.Schema(
  {
    multipliers: {
      type: Map,
      of: multiplierItemSchema,
      default: {
        // 2-Digit Games
        single: {
          name: "Single",
          value: 9,
        },
        jodi: {
          name: "Jodi",
          value: 90,
        },
        "last-digit": {
          name: "Last Digit",
          value: 9,
        },
        "first-digit": {
          name: "First Digit",
          value: 9,
        },

        // 3-Digit Games
        panna: {
          name: "Panna",
          value: 90,
        },
        "single-Patti": {
          name: "Single Patti",
          value: 90,
        },
        "double-Patti": {
          name: "Double Patti",
          value: 90,
        },
        "triple-Patti": {
          name: "Triple Patti",
          value: 90,
        },
        "half-sangam": {
          name: "Half Sangam",
          value: 450,
        },
        "full-sangam": {
          name: "Full Sangam",
          value: 900,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WinMultiplier", winMultiplierSchema);