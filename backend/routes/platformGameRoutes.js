const express = require("express");
const router = express.Router();
const controller = require("../controllers/platformGameController");
const {
  protect,
  adminProtect,
} = require("../middleware/authMiddleware.js");

// PUBLIC — client home + all-games page
router.get("/", controller.getPlatformGames);

// ADMIN
router.get("/admin/all", protect, adminProtect, controller.adminGetAllGames);
router.post("/admin", protect, adminProtect, controller.adminCreateGame);
router.put("/admin/:id", protect, adminProtect, controller.adminUpdateGame);
router.delete("/admin/:id", protect, adminProtect, controller.adminDeleteGame);

module.exports = router;
