// models/paymentMethodModel.js
//
// ============================================================
// SAVED WITHDRAWAL PAYMENT METHODS (per user)
//
// Users save their withdrawal accounts once (bank card / UPI /
// USDT) and pick a saved account on /withdrawal instead of
// typing the details every time. Accounts can be edited or
// deleted from the same pages.
// ============================================================

const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    // "bank" | "upi" | "usdt"
    type: {
      type: String,
      enum: ["bank", "upi", "usdt"],
      required: true,
    },
    // BANK fields
    bankName: { type: String, default: "" },
    accountHolderName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    phone: { type: String, default: "" },
    // UPI fields
    upiId: { type: String, default: "" },
    upiName: { type: String, default: "" },
    // USDT fields
    network: { type: String, default: "" },
    walletAddress: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// A user cannot save the same account twice for one type
paymentMethodSchema.index(
  {
    user: 1,
    type: 1,
    accountNumber: 1,
    upiId: 1,
    walletAddress: 1,
  },
  { name: "user_type_account" },
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
