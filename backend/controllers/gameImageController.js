// controllers/gameImageController.js
//
// Admin-changeable images for the client's popular game cards.
// Public GET returns the key → imageUrl map (missing keys fall back to
// the bundled defaults on the client side).

const GameImage = require("../models/gameImageModel");
const uploadToImgBB = require("../utils/uploadToImgBB");

// Must match the keys used by the client (PopularGamesCards) and the
// admin panel (GameImages page).
const ALLOWED_KEYS = [
  "wingo",
  "trading",
  "mines",
  "powerball_india",
  "matka",
  "powerball_australia",
];

// ================= PUBLIC GET =================
exports.getGameImages = async (req, res) => {
  try {
    const docs = await GameImage.find().lean();

    const images = {};
    for (const doc of docs) {
      images[doc.key] = doc.imageUrl;
    }

    res.json({
      success: true,
      data: images,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ================= ADMIN UPDATE =================
// PUT /api/game-images/:key  (multipart field: "image")
exports.updateGameImage = async (req, res) => {
  try {
    const { key } = req.params;

    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(400).json({
        success: false,
        message: `Invalid game key. Allowed: ${ALLOWED_KEYS.join(", ")}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const imageUrl = await uploadToImgBB(req.file);

    const doc = await GameImage.findOneAndUpdate(
      { key },
      { imageUrl },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Game image updated successfully",
      data: doc,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
