const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect, adminProtect } = require("../../middleware/authMiddleware");
const controller = require("../../controllers/admin/gameEntryController");

router.use(protect, adminProtect);

// Specific paths MUST come before /:id.
router.get("/dashboard", controller.getDashboardGameEntries);
router.get("/summary", controller.getGameEntrySummary);
router.get("/statistics", controller.getGameEntryStatistics);
router.get("/search", controller.searchGameEntriesByUser);
router.get("/status/:status", controller.getGameEntriesByStatus);
router.get("/user/:userId", controller.getGameEntriesByUser);
router.get("/:poolId/player/:userId", controller.getPlayerGameDetails);
router.get("/", controller.getGameEntries);
router.get("/:id", controller.getGameEntryById);
router.put("/bulk/status", controller.bulkUpdateGameEntryStatus);
router.put("/:id/status", controller.updateGameEntryStatus);
router.delete("/:id", controller.deleteGameEntry);

module.exports = router;
