// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    userId: {
      type: Number,
      unique: true,
      index: true,
    },

    exposure: {
      type: Number,
      default: 0,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },


    // ================= PROFILE =================
    profilePic: {
      type: String,
      default: null,
    },
    credit: {
      type: Number,
      default: 0,
    },

    exposure: {
      type: Number,
      default: 0,
    },

    country: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },
    plainPassword: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    lastWithdrawalDate: {
      type: String,
      default: null,
    },
    reset_otp: {
      type: String,
      default: null,
    },
    reset_otp_expiry: {
      type: Date,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    veri: {
      type: Number,
      default: 1,
    },
    code: {
      type: String,
      default: null,
    },
    invite: {
      type: String,
      default: null,
    },
    user_level: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 0,
    },
    recharge: {
      type: Number,
      default: 0,
    },
    legal_bet_score: {
      type: Number,
      default: 0,
    },
    rebate: {
      type: Number,
      default: 0,
    },
    pending_commission: {
      type: Number,
      default: 0,
    },
    total_money: {
      type: Number,
      default: 0,
    },
    isdemo: {
      type: Boolean,
      default: false,
    },
    // ================= REFERRAL =================
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    referredBy: {
      type: String,
      default: null,
      uppercase: true,
      trim: true,
    },
    referredByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
    referralEarning: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("users", userSchema);
