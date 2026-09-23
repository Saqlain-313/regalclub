const express = require("express");
const router = express.Router({ mergeParams: true });
const { protect, adminProtect } = require("../../middleware/authMiddleware");
const controller = require("../../controllers/admin/powerballDivisionController");

router.use(protect, adminProtect);
router.post("/", controller.createDivision);
router.get("/", controller.getAllDivisions);
router.get("/active", controller.getActiveDivisions);
router.get("/:id", controller.getDivisionById);
router.put("/:id", controller.updateDivision);
router.delete("/:id", controller.deleteDivision);
router.patch("/:id/toggle", controller.toggleDivisionStatus);

module.exports = router;
