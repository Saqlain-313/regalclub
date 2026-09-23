const express = require("express");
const router = express.Router();

const {
  claimDailyBonus,
  getDailyClaimStatus,
} = require("../controllers/dailyClaimController");

const {protect} = require("../middleware/authMiddleware.js");

// Get current claim status
router.get("/status", protect, getDailyClaimStatus);

// Claim reward
router.post("/claim", protect, claimDailyBonus);

module.exports = router;