const express = require("express");

const router = express.Router();

const {
  createDivision,
  getAllDivisions,
  getActiveDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision,
  toggleDivisionStatus,
} = require(
  "../../../controllers/admin/uae/UaePowerballDivisionController"
);

router.post("/", createDivision);
router.get("/", getAllDivisions);
router.get("/active", getActiveDivisions);
router.get("/:id", getDivisionById);
router.put("/:id", updateDivision);
router.delete("/:id", deleteDivision);
router.patch("/:id/toggle", toggleDivisionStatus);

module.exports = router;
