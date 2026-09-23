const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    // Country of deposit
    country: {
      type: String,
      required: true,
      uppercase: true,
    },

    currency: {
      type: String,
      default: "USD",
    },

    // Example:
    // UPI
    // BANK
    // PAYPAL
    // CRYPTO
    methodType: {
      type: String,
      required: true,
    },

    // Example:
    // Google Pay
    // PhonePe
    // JazzCash
    methodTitle: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    transactionId: {
      type: String,
      required: true,
      trim: true,
    },

    screenshot: {
      type: String,
      default: "",
    },

    // Pending
    // Approved
    // Rejected

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    remark: {
      type: String,
      default: "",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Deposit", depositSchema);