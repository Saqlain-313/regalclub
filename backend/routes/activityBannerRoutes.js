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

// ADMIN — full doc (includes inactive banners)
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
  "/referral-image",
  protect,
  adminProtect,
  upload.single("image"),
  uploadReferralShareImage,
);

router.put(
  "/:id",
  protect,
  adminProtect,
  upload.single("image"),
  updateActivityBanner,
);

router.delete("/:id", protect, adminProtect, deleteActivityBanner);

module.exports = router;
