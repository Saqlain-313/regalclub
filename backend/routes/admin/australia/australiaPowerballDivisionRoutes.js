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
} = require("../../../controllers/admin/australia/australiaPowerballDivisionController");

// Agar adminProtect middleware hai to yahan add kar sakte ho
// const { protect, adminOnly } = require("../../../middleware/authMiddleware");

// ======================================================
// CREATE
// POST /api/australia/powerball/divisions
// ======================================================

router.post(
  "/",
  createDivision
);

// ======================================================
// GET ALL
// GET /api/australia/powerball/divisions
// ======================================================

router.get(
  "/",
  getAllDivisions
);

// ======================================================
// GET ACTIVE
// GET /api/australia/powerball/divisions/active
// ======================================================

router.get(
  "/active",
  getActiveDivisions
);

// ======================================================
// GET BY ID
// GET /api/australia/powerball/divisions/:id
// ======================================================

router.get(
  "/:id",
  getDivisionById
);

// ======================================================
// UPDATE
// PUT /api/australia/powerball/divisions/:id
// ======================================================

router.put(
  "/:id",
  updateDivision
);

// ======================================================
// DELETE
// DELETE /api/australia/powerball/divisions/:id
// ======================================================

router.delete(
  "/:id",
  deleteDivision
);

// ======================================================
// TOGGLE STATUS
// PATCH /api/australia/powerball/divisions/:id/toggle
// ======================================================

router.patch(
  "/:id/toggle",
  toggleDivisionStatus
);

module.exports = router;