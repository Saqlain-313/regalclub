const express = require("express");
const router = express.Router();

const {
  protect,
  adminProtect,
} = require("../../../middleware/authMiddleware");

const {
  createGameCount,
  getGameCounts,
  getGameCount,
  updateGameCount,
  deleteGameCount,
} = require("../../../controllers/admin/nepal/gameCountController");

// Create
router.post("/", protect, adminProtect, createGameCount);

// Get All
router.get("/", protect, adminProtect, getGameCounts);

// Get Single
router.get("/:id", protect, adminProtect, getGameCount);

// Update
router.put("/:id", protect, adminProtect, updateGameCount);

// Delete
router.delete("/:id", protect, adminProtect, deleteGameCount);

module.exports = router;
