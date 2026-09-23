const express = require("express");

const {
  createGamePool,
  getMyGameEntries,
  getSingleGameEntry,
  deleteGameEntry,
  cancelGameEntry,
} = require("../../controllers/user/gameEntryController");

const { protect } = require("../../middleware/authMiddleware");

// ==========================================
// IMPORTANT:
// This router is mounted in server.js as:
//   app.use("/api/:country/game-entry", userGameEntryRoutes);
// Express calls this module's export directly as middleware
// (req, res, next), so it MUST be an actual express.Router()
// instance — not a factory function that returns one.
// (That was the bug: the old factory function was never
// invoked, so requests to /api/:country/game-entry just hung
// with no response, unlike /api/:country/game-counts which
// already exported a real router.)
//
// "mergeParams: true" lets this router read the ":country"
// param captured by the parent app.use() pattern.
// ==========================================
const router = express.Router({ mergeParams: true });

// ==========================================
// SET COUNTRY
// ==========================================
router.use((req, res, next) => {
  req.country = String(req.params?.country || "").trim().toLowerCase();

  if (!req.country) {
    return res.status(400).json({
      success: false,
      message: "Country is required",
    });
  }

  next();
});

// ==========================================
// CREATE GAME ENTRY
// POST /api/:country/game-entry
// ==========================================
router.post("/", protect, createGamePool);

// ==========================================
// GET MY GAME ENTRIES
// GET /api/:country/game-entry
// ==========================================
router.get("/", protect, getMyGameEntries);

// ==========================================
// GET SINGLE GAME ENTRY
// GET /api/:country/game-entry/:id
// ==========================================
router.get("/:id", protect, getSingleGameEntry);

// ==========================================
// DELETE GAME ENTRY
// DELETE /api/:country/game-entry/:id
// ==========================================
router.delete("/:id", protect, deleteGameEntry);

// ==========================================
// CANCEL GAME ENTRY
// PUT /api/:country/game-entry/:id/cancel
// ==========================================
router.put("/:id/cancel", protect, cancelGameEntry);

module.exports = router;