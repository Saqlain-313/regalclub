const express = require("express");

const router = express.Router();

const bidController = require("../controllers/bidController");

const {
  protect,
  adminProtect,
} = require("../middleware/authMiddleware.js");

// =====================================================
// USER ROUTES
// =====================================================

router.post("/place", protect, bidController.placeBid);

router.get("/history", protect, bidController.getBiddingHistory);

router.get(
  "/today-summary",
  protect,
  bidController.getTodayBidsSummary
);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Get all bids with filters
router.get(
  "/admin/all",
  protect,
  adminProtect,
  bidController.adminGetAllBids
);

// Get bid stats
router.get(
  "/admin/stats",
  protect,
  adminProtect,
  bidController.adminGetBidStats
);

// Get today's bids
router.get(
  "/admin/today",
  protect,
  adminProtect,
  bidController.adminGetTodayBids
);

// Get all bids by Market ID
router.get(
  "/admin/market/:marketId",
  protect,
  adminProtect,
  bidController.getBidsByMarketId
);

// Get lowest bid number by Market ID
router.get(
  "/admin/lowest/:marketId",
  protect,
  adminProtect,
  bidController.getLowestBidNumber
);

// Get bid by ID (Admin)
router.get(
  "/admin/:bidId",
  protect,
  adminProtect,
  bidController.adminGetBidById
);

// Update bid status
router.put(
  "/admin/:bidId/status",
  protect,
  adminProtect,
  bidController.adminUpdateBidStatus
);

// Delete bid
router.delete(
  "/admin/:bidId",
  protect,
  adminProtect,
  bidController.adminDeleteBid
);

// =====================================================
// USER BID BY ID / CANCEL
// =====================================================

router.get(
  "/:bidId",
  protect,
  bidController.getBidById
);

router.delete(
  "/:bidId/cancel",
  protect,
  bidController.cancelBid
);

module.exports = router;