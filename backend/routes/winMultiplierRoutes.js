const express = require("express");

const router = express.Router();

const {
  getWinMultipliers,
  updateWinMultipliers,
  updateSingleMultiplier,
} = require("../controllers/winMultiplierController");

// Get all multipliers
router.get("/", getWinMultipliers);

// Update all multipliers
router.put("/", updateWinMultipliers);

// Update single multiplier
router.put("/:gameType", updateSingleMultiplier);

module.exports = router;