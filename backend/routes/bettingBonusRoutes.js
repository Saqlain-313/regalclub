const express = require("express");

const {
  getBettingBonus,
  updateBettingBonus,
} = require("../controllers/bettingBonusController");

const router = express.Router();

// Get betting bonus settings
router.get("/", getBettingBonus);

// Admin update betting bonus
router.put("/", updateBettingBonus);

module.exports = router;