const express = require("express");

const router = express.Router();

const {
    getReferralLevels,
    updateReferralLevel,
    updateAllReferralLevels,
    resetReferralLevels,
} = require("../controllers/referralLevelController");

const {
    protect,
} = require("../middleware/authMiddleware.js");


// ======================================================
// GET ALL LEVELS
// ======================================================

router.get(
    "/",
    protect,
    getReferralLevels
);


// ======================================================
// UPDATE SINGLE LEVEL
// ======================================================

router.put(
    "/:level",
    protect,
    updateReferralLevel
);


// ======================================================
// UPDATE ALL 8 LEVELS
// ======================================================

router.put(
    "/",
    protect,
    updateAllReferralLevels
);


// ======================================================
// RESET DEFAULT LEVELS
// ======================================================

router.post(
    "/reset",
    protect,
    resetReferralLevels
);


module.exports = router;