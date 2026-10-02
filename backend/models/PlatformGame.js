const mongoose = require("mongoose");

// ============================================================
// PLATFORM GAME
// Home page "Platform recommendation" section ke games.
// - isTop6 = true  -> home par top section me dikhta hai
// - isTop6 = false -> sirf "All" games page par dikhta hai
// Admin panel se add/update/delete/toggle hota hai.
// ============================================================

const platformGameSchema = new mongoose.Schema(
  {
    game_name: {
      type: String,
      required: true,
      trim: true,
    },

    // Provider game id (launch ke liye)
    game_uid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "instant",
      trim: true,
      lowercase: true,
    },

    game_type: {
      type: String,
      default: "Instant",
      trim: true,
    },

    provider: {
      type: String,
      default: "",
      trim: true,
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },

    players: {
      type: String,
      default: "",
      trim: true,
    },

    volatility: {
      type: String,
      default: "Medium",
      enum: ["Low", "Medium", "High"],
    },

    // Home par top games me dikhana hai? (max 6 recommend)
    isTop6: {
      type: Boolean,
      default: false,
      index: true,
    },

    isNew: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports =
  mongoose.models.PlatformGame ||
  mongoose.model("PlatformGame", platformGameSchema);
