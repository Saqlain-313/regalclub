const express = require("express");

const router = express.Router();

const {
  protect,
  adminProtect,
} = require("../middleware/authMiddleware.js");

const {
  getAllMineGames,
  getActiveMineGames,
  getMineGameById,
  createMineGame,
  updateMineGame,
  deleteMineGame,
  toggleMineGame,
} = require("../controllers/mineGameController.js");

// ============================================================
// PUBLIC / USER
// ============================================================

// Get active mine games
router.get(
  "/active",
  protect,
  getActiveMineGames
);

// Get single mine game
router.get(
  "/:id",
  protect,
  getMineGameById
);

// ============================================================
// ADMIN
// ============================================================

// Get all mine games
router.get(
  "/",
  protect,
  adminProtect,
  getAllMineGames
);

// Create mine game
router.post(
  "/",
  protect,
  adminProtect,
  createMineGame
);

// Update mine game
router.put(
  "/:id",
  protect,
  adminProtect,
  updateMineGame
);

// Delete mine game
router.delete(
  "/:id",
  protect,
  adminProtect,
  deleteMineGame
);

// Toggle active/inactive
router.patch(
  "/:id/toggle",
  protect,
  adminProtect,
  toggleMineGame
);

module.exports = router;