const mongoose = require("mongoose");

const marketDaySchema = new mongoose.Schema(
  {
    marketDate: {
      type: Date,
      required: true,
    },

    openTime: {
      type: String,
      required: true,
    },

    closeTime: {
      type: String,
      required: true,
    },

    resultTime: {
      type: String,
      required: true,
    },

    minBid: {
      type: Number,
      default: 10,
    },

    maxBid: {
      type: Number,
      default: 10000,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isResultDeclared: {
      type: Boolean,
      default: false,
    },

    winningNumber: {
      type: String,
      default: null,
    },

    resultDeclaredAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const marketSchema = new mongoose.Schema(
  {
    // ======================================================
    // COMMON MARKET DATA
    // ======================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    marketId: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    digitType: {
      type: String,
      enum: ["2-digit", "3-digit"],
      required: true,
    },

    gameTypes: {
      type: [
        {
          type: String,
          enum: [
            "single",
            "single-Patti",
            "double-Patti",
            "triple-Patti",
            "jodi",
            "panna",
            "half-sangam",
            "full-sangam",
            "last-digit",
            "first-digit",
          ],
        },
      ],
      default: [],
    },

    // ======================================================
    // DAILY MARKET DATA
    // ======================================================

    marketArray: {
      type: [marketDaySchema],
      default: [],
    },

    description: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Market", marketSchema);