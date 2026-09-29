const express = require("express");
const SupportSettings = require("../models/SupportSettings");
const { protect, adminProtect } = require("../middleware/authMiddleware");

const router = express.Router();

// DEFAULTS — naya document banne par yehi values milenge
const DEFAULTS = {
  key: "support",
  tawk: true,
  whatsapp: true,
  telegram: true,
  email: true,
  whatsappNumber: "919876543210",
  telegramUsername: "regalclub_support",
  supportEmail: "support@regalclub.live",
};

const sanitizePhone = (value) =>
  String(value || "").replace(/\D/g, "").slice(0, 15);

const sanitizeUsername = (value) =>
  String(value || "")
    .replace(/^@/, "")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 32);

const sanitizeEmail = (value) =>
  String(value || "").trim().toLowerCase().slice(0, 100);

// Shape for API responses
const shape = (s) => ({
  tawk: s.tawk,
  whatsapp: s.whatsapp,
  telegram: s.telegram,
  email: s.email,
  whatsappNumber: s.whatsappNumber,
  telegramUsername: s.telegramUsername,
  supportEmail: s.supportEmail,
});

// ======================================================
// GET SUPPORT SETTINGS (public — user panel ke liye)
// ======================================================
router.get("/", async (req, res) => {
  try {
    let settings = await SupportSettings.findOne({ key: "support" });

    if (!settings) {
      settings = await SupportSettings.create(DEFAULTS);
    }

    return res.status(200).json({
      success: true,
      settings: shape(settings),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load support settings",
    });
  }
});

// ======================================================
// UPDATE SUPPORT SETTINGS (admin only)
// body: { tawk?, whatsapp?, telegram?, email? } — booleans
//       { whatsappNumber?, telegramUsername?, supportEmail? } — strings
// ======================================================
router.put("/", protect, adminProtect, async (req, res) => {
  try {
    const update = {};

    // Toggles
    for (const field of ["tawk", "whatsapp", "telegram", "email"]) {
      if (typeof req.body[field] === "boolean") {
        update[field] = req.body[field];
      }
    }

    // Contact details
    if (req.body.whatsappNumber !== undefined) {
      const phone = sanitizePhone(req.body.whatsappNumber);
      if (phone.length < 8) {
        return res.status(400).json({
          success: false,
          message: "WhatsApp number invalid (country code ke saath 8-15 digits)",
        });
      }
      update.whatsappNumber = phone;
    }

    if (req.body.telegramUsername !== undefined) {
      const username = sanitizeUsername(req.body.telegramUsername);
      if (username.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Telegram username invalid (min 3 characters)",
        });
      }
      update.telegramUsername = username;
    }

    if (req.body.supportEmail !== undefined) {
      const email = sanitizeEmail(req.body.supportEmail);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Email address invalid",
        });
      }
      update.supportEmail = email;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const settings = await SupportSettings.findOneAndUpdate(
      { key: "support" },
      { $set: update },
      { new: true, upsert: true },
    );

    return res.status(200).json({
      success: true,
      message: "Support settings updated successfully",
      settings: shape(settings),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update support settings",
    });
  }
});

module.exports = router;
