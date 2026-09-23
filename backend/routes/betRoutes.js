const express = require("express");
const router = express.Router();

const betController = require("../controllers/betController");
const { protect ,adminProtect} = require("../middleware/authMiddleware");

// Agar admin middleware available hai:
// const { adminProtect } = require("../middleware/adminMiddleware");


// =====================================================
// BET PAGES
// =====================================================

router.get("/wingo", betController.winGoPage);
router.get("/wingo3", betController.winGoPage3);
router.get("/wingo5", betController.winGoPage5);
router.get("/wingo10", betController.winGoPage10);



// =====================================================
// USER BET APIs
// =====================================================

// Place Bet
router.post(
  "/bet",
  protect,
  betController.betWinGo
);

// Order / Game History
router.post(
  "/order-list",
  protect,
  betController.listOrderOld
);

// My Bet History
router.post(
  "/my-bets",
  protect,
  betController.GetMyEmerdList
);


// =====================================================
// ADMIN COMMISSION APIs
// =====================================================

// IMPORTANT:
// In dono par adminProtect lagao.
// Normal protect enough nahi hai.

router.post(
  "/commission-admin",
  protect,
  adminProtect,
  betController.tradeCommissionadmin
);

router.get(
  "/commission-get",
  protect,
  adminProtect,
  betController.tradeCommissionGet
);

router.get(
  "/bets-admin",
  protect,
  adminProtect,
  betController.getAdminBets
);


module.exports = router;