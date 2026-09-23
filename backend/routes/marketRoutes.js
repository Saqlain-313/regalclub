const express = require("express");

const router = express.Router();

const marketController = require("../controllers/marketController");

const {
  protect,
  adminProtect,
} = require("../middleware/authMiddleware.js");

// ======================================================
// MULTER
// ======================================================

const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

// ======================================================
// USER ROUTES
// ======================================================

// Get active markets
router.get(
  "/active",
  protect,
  marketController.getActiveMarkets
);

// Get all markets
router.get(
  "/",
  protect,
  marketController.getAllMarkets
);

// Get single market
router.get(
  "/:marketId",
  protect,
  marketController.getMarketById
);

// ======================================================
// ADMIN ROUTES
// ======================================================

// Create market + image
router.post(
  "/create",
  protect,
  upload.single("image"),
  marketController.createMarket
);

// Update market + optional new image
router.put(
  "/:marketId",
  protect,
  adminProtect,
  upload.single("image"),
  marketController.updateMarket
);

// Toggle market status
router.patch(
  "/:marketId/toggle",
  protect,
  adminProtect,
  marketController.toggleMarketStatus
);

// Delete market
router.delete(
  "/:marketId",
  protect,
  adminProtect,
  marketController.deleteMarket
);

module.exports = router;