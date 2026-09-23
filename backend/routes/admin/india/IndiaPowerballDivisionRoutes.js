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
  "../../../controllers/admin/india/IndiaPowerballDivisionController"
);

// ======================================================
// CREATE DIVISION
// POST /api/india/powerball/divisions
// ======================================================

router.post(
  "/",
  createDivision
);

// ======================================================
// GET ALL DIVISIONS
// GET /api/india/powerball/divisions
// ======================================================

router.get(
  "/",
  getAllDivisions
);

// ======================================================
// GET ACTIVE DIVISIONS
// GET /api/india/powerball/divisions/active
// ======================================================

router.get(
  "/active",
  getActiveDivisions
);

// ======================================================
// GET DIVISION BY ID
// GET /api/india/powerball/divisions/:id
// ======================================================

router.get(
  "/:id",
  getDivisionById
);

// ======================================================
// UPDATE DIVISION
// PUT /api/india/powerball/divisions/:id
// ======================================================

router.put(
  "/:id",
  updateDivision
);

// ======================================================
// DELETE DIVISION
// DELETE /api/india/powerball/divisions/:id
// ======================================================

router.delete(
  "/:id",
  deleteDivision
);

// ======================================================
// TOGGLE ACTIVE / INACTIVE
// PATCH /api/india/powerball/divisions/:id/toggle
// ======================================================

router.patch(
  "/:id/toggle",
  toggleDivisionStatus
);

module.exports = router;