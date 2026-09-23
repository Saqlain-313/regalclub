const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

const {
  uploadBanner,
  getBanners,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");

const { protect, adminProtect } = require("../middleware/authMiddleware.js");

router.post(
  "/",
  protect,
  adminProtect,
  upload.single("image"),
  uploadBanner
);

// Get All
router.get("/", getBanners);

// Update
router.put(
  "/:id",
  protect,
  adminProtect,
  upload.single("image"),
  updateBanner
);




// Delete
router.delete("/:id", protect, adminProtect, deleteBanner);

// Active / Inactive

module.exports = router;