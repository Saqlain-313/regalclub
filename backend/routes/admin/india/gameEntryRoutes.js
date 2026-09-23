const express = require("express");
const router = express.Router();

const gameEntryController = require("../../../controllers/admin/india/gameEntryController");
const { protect, adminProtect } = require("../../../middleware/authMiddleware");

// All routes are protected and require adminProtect access
router.use(protect);
router.use(adminProtect);

// Dashboard and summary routes
router.get("/dashboard", gameEntryController.getDashboardGameEntries);
router.get("/summary", gameEntryController.getGameEntrySummary);
router.get("/statistics", gameEntryController.getGameEntryStatistics);

// Search route
router.get("/search", gameEntryController.searchGameEntriesByUser);

// Status-specific routes
router.get("/status/:status", gameEntryController.getGameEntriesByStatus);

// User-specific routes
router.get("/user/:userId", gameEntryController.getGameEntriesByUser);

// Player game details route
router.get("/:poolId/player/:userId", gameEntryController.getPlayerGameDetails);

// Main routes
router.get("/", gameEntryController.getGameEntries);
router.get("/:id", gameEntryController.getGameEntryById);

// Update and delete routes
router.put("/:id/status", gameEntryController.updateGameEntryStatus);
router.delete("/:id", gameEntryController.deleteGameEntry);

// Bulk operations
router.put("/bulk/status", gameEntryController.bulkUpdateGameEntryStatus);

module.exports = router;
