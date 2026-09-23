const express = require("express");

const {
  getGameCounts,
} = require("../../controllers/user/gameCountController");

const router = express.Router({
  mergeParams: true,
});

// GET /api/:country/game-counts
router.get("/", getGameCounts);

module.exports = router;