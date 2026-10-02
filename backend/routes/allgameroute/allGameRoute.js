const express = require("express");
const {
  launchGame,
  transferBalance,
  checkBalance,
  getgamedetails,
  gameHistory,
} = require("../../controllers/allgamecontroller/allGameController");

const router = express.Router();
const { protect, adminProtect } = require("../../middleware/authMiddleware");

router.post("/game/get/game", protect, launchGame);
// Money-moving operation — POST only (a GET here could be triggered by
// browser prefetching and transfer funds unintentionally)
router.post("/game/balance/transfer", protect, transferBalance);
// Read-only provider balance (live wallet display ke liye)
router.post("/game/balance/check", protect, checkBalance);
router.post("/game/get/all-game", protect, getgamedetails);
router.post("/game/history", protect, gameHistory);

// Export the router
module.exports = router;
