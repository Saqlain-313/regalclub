const express = require("express");
const controller = require("../../controllers/admin/powerballResultController");

const router = express.Router({ mergeParams: true });

// ==========================================
// SET COUNTRY
// ==========================================
router.use((req, res, next) => {
  req.country = String(req.params?.country || "").trim().toLowerCase();

  if (!req.country) {
    return res.status(400).json({
      success: false,
      message: "Country is required",
    });
  }

  next();
});

router.get("/", controller.getAllPowerballResults);


module.exports = router;
