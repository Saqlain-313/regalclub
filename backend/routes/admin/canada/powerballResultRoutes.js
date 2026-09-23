const express = require("express");
const router = express.Router();

const {
  createPowerballResult,
  getAllPowerballResults,
  getPowerballResultById,
  deletePowerballResult,
  getAllPendingGames,
  getPendingGameByPlayerId,
  getGamePoolDetails,
} = require("../../../controllers/admin/canada/CanadaPowerballResultController");

const {
  protect,
  adminProtect,
} = require("../../../middleware/authMiddleware");

// Apply authentication and admin protection to all routes
router.use(protect, adminProtect);

// ===============================
// Create Result (Admin)
// ===============================
router.post("/create", createPowerballResult);

// ===============================
// Get All Results
// ===============================
router.get("/", getAllPowerballResults);

// ===============================
// Get Single Result
// ===============================
router.get("/:id", getPowerballResultById);

// ===============================
// Delete Result
// ===============================
router.delete("/:id", deletePowerballResult);

// ===============================
// Get All Pending Games (All Draws)
// ===============================
router.get("/pending-games/all", getAllPendingGames);

// ===============================
// Get Pending Game by Player ID (GameEntry._id)
// ===============================
router.get("/pending-game/:playerId", getPendingGameByPlayerId);

// ===============================
// Get Game Pool Details by Pool ID
// ===============================
router.get("/game-pool/:poolId", getGamePoolDetails);

module.exports = router;
