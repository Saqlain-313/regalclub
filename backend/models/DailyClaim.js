const mongoose = require("mongoose");

const dailyClaimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },

    currentDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 7,
    },

    lastClaimDate: {
      type: Date,
      default: null,
    },

    // New field for IST time tracking
    lastClaimIST: {
      type: Date,
      default: null,
    },

    totalClaims: {
      type: Number,
      default: 0,
    },

    // Optional: Track claim history for better debugging
    claimHistory: [
      {
        day: {
          type: Number,
          required: true,
        },
        reward: {
          type: Number,
          required: true,
        },
        claimedAt: {
          type: Date,
          default: Date.now,
        },
        claimedAtIST: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DailyClaim", dailyClaimSchema);