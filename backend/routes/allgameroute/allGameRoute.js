const express = require("express");
const {
  launchGame,
  transferBalance,
  getgamedetails,
  gameHistory,
} = require("../../controllers/allgamecontroller/allGameController");

const router = express.Router();
const { protect, adminProtect } = require("../../middleware/authMiddleware");

router.post("/game/get/game", protect, launchGame);
// Money-moving operation — POST only (a GET here could be triggered by
// browser prefetching and transfer funds unintentionally)
router.post("/game/balance/transfer", protect, transferBalance);
router.post("/game/get/all-game", protect, getgamedetails);
router.post("/game/history", protect, gameHistory);

// Export the router
module.exports = router;
