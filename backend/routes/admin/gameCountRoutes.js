const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect, adminProtect } = require("../../middleware/authMiddleware");
const controller = require("../../controllers/admin/gameCountController");

router.use(protect, adminProtect);
router.post("/", controller.createGameCount);
router.get("/", controller.getGameCounts);
router.get("/:id", controller.getGameCount);
router.put("/:id", controller.updateGameCount);
router.delete("/:id", controller.deleteGameCount);

module.exports = router;
