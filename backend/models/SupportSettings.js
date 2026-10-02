const mongoose = require("mongoose");

// Singleton collection — support channels enable/disable + contact details
// Admin panel se toggle/edit hota hai, user panel (SupportChat page)
// sirf enabled channels aur admin ke set kiye contact details dikhata hai.
const supportSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "support",
      unique: true,
    },
    // Channel toggles
    tawk: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    telegram: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    // Admin-editable contact details
    whatsappNumber: { type: String, default: "919876543210", trim: true },
    telegramUsername: { type: String, default: "regalclub_support", trim: true },
    supportEmail: {
      type: String,
      default: "support@regalclub.live",
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SupportSettings", supportSettingsSchema);
