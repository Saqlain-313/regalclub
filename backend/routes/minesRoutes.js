const express = require("express");

const {
  startGame,
  revealCell,
  cashout,
  getHistory,
} = require("../controllers/minesController");

const router = express.Router();

// Replace with your existing auth middleware
const {
  protect,
  adminProtect,
} = require("../middleware/authMiddleware.js");

router.post("/start",   protect,
   startGame);

router.post(
  "/:gameId/reveal",
    protect,
  
  revealCell
);

router.post(
  "/:gameId/cashout",
    protect,
  
  cashout
);

// Admin   protect,
router.get("/admin/history",   protect,
  adminProtect, getHistory);

module.exports = router;