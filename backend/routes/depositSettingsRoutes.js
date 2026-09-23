const express = require("express");

const router = express.Router();

const {
  saveDepositSettings,
  getAllDepositSettings,
  getDepositSettingsByCountry,
  deleteDepositSettings,
  getUserDepositMethods,
} = require("../controllers/depositSettingsController");

const {protect, adminProtect} = require("../middleware/authMiddleware.js");

// =========================================
// Admin Routes
// =========================================

// Create / Update Country Deposit Settings
router.post("/admin/deposit-settings",protect, adminProtect, saveDepositSettings);

// Get All Countries Deposit Settings
router.get("/admin/deposit-settings",protect, adminProtect, getAllDepositSettings);

// Delete Country
router.delete("/admin/deposit-settings/:id",protect, adminProtect, deleteDepositSettings);

// =========================================
// User Routes
// =========================================

// Logged in user's country payment methods
router.get("/deposit-settings/user/methods", protect, getUserDepositMethods);

// Get Single Country
router.get("/deposit-settings/:country", protect, getDepositSettingsByCountry);

module.exports = router;