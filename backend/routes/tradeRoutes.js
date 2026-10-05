// routes/tradeRoutes.js
//
// ============================================================
// TRADING (merged from the trading subdomain backend)
//
// Mounted at /api/trade — the merged frontend (/trading) talks
// to the main backend through these paths. Controllers live in
// controllers/trade/ and operate on the same database the
// subdomain backend used, so existing trades/history stay valid.
// ============================================================

const express = require("express");
const router = express.Router();

const tradeUserController = require("../controllers/trade/tradeUserController");
const tradebetController = require("../controllers/trade/tradebetController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../utils/upload");

// ------------------------------------------------------------
// AUTH
// ------------------------------------------------------------
router.post("/signup", tradeUserController.registerUser);
router.post("/login", tradeUserController.loginUser);
router.get("/getuser", protect, tradeUserController.getUser);
router.put("/update-user", protect, tradeUserController.updateUser);
router.get("/logout", tradeUserController.logout);

// OTP / Password
router.post("/forgotpassword", tradeUserController.verifyOtpAndUpdatePassword);

// Recharge
router.post("/recharge", protect, tradeUserController.recharge);
router.post("/handleRecharge", protect, tradeUserController.handleRecharge);
router.post("/paynow/verify-sunpay", tradeUserController.verifySunpayPayment);

// Withdrawal
router.post("/withdrawal", protect, tradeUserController.withdraw);
router.get("/withdraw-history", protect, tradeUserController.getWithdrawlHistory);

// Transaction
router.post("/transaction", protect, tradeUserController.createTransaction);

// Support
router.post("/support", upload.single("image"), protect, tradeUserController.support);

// Promo Code
router.post("/usePromocode", tradeUserController.usePromocode);

// ------------------------------------------------------------
// BETS
// ------------------------------------------------------------
router.post("/placeBet", protect, tradebetController.placeBet);
router.get("/checkwhichUserIsWinner", protect, tradebetController.checkwhichUserIsWinner);
router.get("/get-periodid", tradebetController.getTrade);
router.get("/bets-history", protect, tradebetController.getBetsByUserId);
router.get("/pending-history", protect, tradebetController.getPendingTrades);
router.get("/get-trades", protect, tradebetController.createTrade);

module.exports = router;
