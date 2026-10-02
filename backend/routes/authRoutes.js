const express = require("express");

const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  forgotPassword,
  verifyOTPAndReset,
  changePassword,
  getAllUsers,
  updateUserStatus,
  adminSetUserWagering,
  adminUpdateUser,
} = require("../controllers/auth");

const { protect, adminProtect } = require("../middleware/authMiddleware");

const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

// ======================================================
// PUBLIC ROUTES
// ======================================================

router.post("/register", register);

router.post("/login", login);

// Password Reset
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", verifyOTPAndReset);

// ======================================================
// PROTECTED ROUTES
// ======================================================

// Get Profile
router.get("/profile", protect, getProfile);

// Dedicated admin profile — /profile blocks admin accounts (a stale admin
// cookie on the client site caused a client <-> login loop), so the admin
// panel uses this endpoint instead.
router.get("/admin/profile", protect, adminProtect, getProfile);

// Update Profile + Profile Picture
router.put("/profile", protect, upload.single("profilePic"), updateProfile);

// Logout
router.post("/logout", protect, logout);

// Change Password
router.put("/change-password", protect, changePassword);

// ======================================================
// ADMIN ROUTES
// ======================================================

router.get("/admin/users", protect, adminProtect, getAllUsers);

router.put(
  "/admin/users/:userId/status",
  protect,
  adminProtect,
  updateUserStatus,
);

// Admin — set wagering requirement (₹) on a user's account.
// 0 = clear. Withdrawal capped until wagering completes.
router.put(
  "/admin/users/:userId/wagering",
  protect,
  adminProtect,
  adminSetUserWagering,
);

// Admin — full user edit (wallet, password, profile, status, role)
router.put("/admin/users/:userId", protect, adminProtect, adminUpdateUser);

module.exports = router;
