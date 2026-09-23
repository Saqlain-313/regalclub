const express = require("express");
const {
  launchGame,
  transfercredit,
  getgamedetails,
  gameHistory,
} = require("../../controllers/allgamecontroller/allGameController");

const router = express.Router();
const { protect, adminProtect } = require("../../middleware/authMiddleware");

router.post("/game/get/game", protect, launchGame);
router.get("/game/credit/transfer", protect, transfercredit);
router.post("/game/get/all-game", protect, getgamedetails);
router.post("/game/history", protect, gameHistory);

// Export the router
module.exports = router;
