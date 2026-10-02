const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

const {
  getActivityContent,
  getAllActivityContent,
  uploadActivityBanner,
  updateActivityBanner,
  deleteActivityBanner,
  uploadReferralShareImage,
} = require("../controllers/activityBannerController");

const { protect, adminProtect } = require("../middleware/authMiddleware.js");

// PUBLIC — for /activity and /promo (active content only)
router.get("/", getActivityContent);

// ADMIN — poora doc (inactive banners bhi)
router.get("/admin/all", protect, adminProtect, getAllActivityContent);

// ADMIN — activity banner CRUD
router.post(
  "/",
  protect,
  adminProtect,
  upload.single("image"),
  uploadActivityBanner,
);

router.put(
  "/:id",
  protect,
  adminProtect,
  upload.single("image"),
  updateActivityBanner,
);

router.delete("/:id", protect, adminProtect, deleteActivityBanner);

// ADMIN — referral share image (Your Referral Link wali image)
router.put(
  "/referral-image",
  protect,
  adminProtect,
  upload.single("image"),
  uploadReferralShareImage,
);

module.exports = router;
