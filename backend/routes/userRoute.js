const express = require("express");
const router = express.Router();

const c = require("../controllers/registerUser");
const { auth } = require("../middelWare/authMiddelWare");
const { upload } = require("../utils/upload");

// Authentication
router.post("/signup", c.registerUser);
router.post("/login", c.loginUser);
router.get("/getuser", auth, c.getUser);
router.put("/update-user", auth, c.updateUser);
router.get("/logout", c.logout);

// OTP / Password
router.post("/sendotp", c.sendOtp);
router.post("/forgotpassword", c.verifyOtpAndUpdatePassword);

// Recharge
router.post("/recharge", auth, c.recharge);
router.post("/handleRecharge", auth, c.handleRecharge);
router.post(
  "/paynow/verify-sunpay",
  c.verifySunpayPayment
);

// Withdrawal
router.post("/withdrawal", auth, c.withdraw);
router.get(
  "/withdraw-history",
  auth,
  c.getWithdrawlHistory
);

// Transaction
router.post(
  "/transaction",
  auth,
  c.createTransaction
);

// Support
router.post(
  "/support",
  upload.single("image"),
  auth,
  c.support
);

// Promo Code
router.post(
  "/usePromocode",
  c.usePromocode
);

module.exports = router;