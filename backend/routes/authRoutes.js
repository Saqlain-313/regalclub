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

module.exports = router;
