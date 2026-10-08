const express = require("express");
const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

const {
  getGameImages,
  updateGameImage,
} = require("../controllers/gameImageController");

const { protect, adminProtect } = require("../middleware/authMiddleware.js");

// Public — client home page reads the key → imageUrl map
router.get("/", getGameImages);

// Admin — upload a new image for one game key
router.put(
  "/:key",
  protect,
  adminProtect,
  upload.single("image"),
  updateGameImage
);

module.exports = router;
