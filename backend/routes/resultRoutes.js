const express = require("express");
const router = express.Router();
const resultController = require("../controllers/resultController");
const { protect } = require("../middleware/authMiddleware.js");

// ==================== User Routes ====================
router.get("/", protect, resultController.getResults);
router.get("/today", protect, resultController.getTodayResults);
router.get("/results", resultController.getAllPublicResults);

router.get("/:resultId", protect, resultController.getResultById);
router.get("/stats/overview", protect, resultController.getResultStats);

// ==================== Admin Routes ====================
router.post("/declare", protect, resultController.declareResult);

module.exports = router;
