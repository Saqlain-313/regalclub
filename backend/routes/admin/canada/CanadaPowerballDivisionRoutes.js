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
  "../../../controllers/admin/canada/CanadaPowerballDivisionController"
);

// ======================================================
// CREATE DIVISION
// POST /api/canada/powerball/divisions
// ======================================================

router.post(
  "/",
  createDivision
);

// ======================================================
// GET ALL DIVISIONS
// GET /api/canada/powerball/divisions
// ======================================================

router.get(
  "/",
  getAllDivisions
);

// ======================================================
// GET ACTIVE DIVISIONS
// GET /api/canada/powerball/divisions/active
// ======================================================

router.get(
  "/active",
  getActiveDivisions
);

// ======================================================
// GET DIVISION BY ID
// GET /api/canada/powerball/divisions/:id
// ======================================================

router.get(
  "/:id",
  getDivisionById
);

// ======================================================
// UPDATE DIVISION
// PUT /api/canada/powerball/divisions/:id
// ======================================================

router.put(
  "/:id",
  updateDivision
);

// ======================================================
// DELETE DIVISION
// DELETE /api/canada/powerball/divisions/:id
// ======================================================

router.delete(
  "/:id",
  deleteDivision
);

// ======================================================
// TOGGLE STATUS
// PATCH /api/canada/powerball/divisions/:id/toggle
// ======================================================

router.patch(
  "/:id/toggle",
  toggleDivisionStatus
);

module.exports = router;