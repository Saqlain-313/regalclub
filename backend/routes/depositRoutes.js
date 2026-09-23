const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {
    createDeposit,
    getUserDeposits,
    getDepositDetails,

    getAllDeposits,
    getPendingDeposits,

    approveDeposit,
    rejectDeposit,

    getDepositStats

} = require("../controllers/depositController");

const { protect, adminProtect } = require("../middleware/authMiddleware.js");


// ======================================================
// USER ROUTES
// ======================================================

// Create Deposit
router.post(
    "/create",
    protect,
    upload.single("screenshot"),
    createDeposit
);

// Deposit History
router.get(
    "/my",
    protect,
    getUserDeposits
);

// Single Deposit
router.get(
    "/my/:id",
    protect,
    getDepositDetails
);


// ======================================================
// ADMIN ROUTES
// ======================================================

// Dashboard Stats
router.get(
    "/admin/stats",
    protect,
    adminProtect,
    getDepositStats
);

// Pending Deposits
router.get(
    "/admin/pending",
    protect,
    adminProtect,
    getPendingDeposits
);

// All Deposits
router.get(
    "/admin/all",
    protect,
    adminProtect,
    getAllDeposits
);

// Approve
router.put(
    "/admin/approve/:id",
    protect,
    adminProtect,
    approveDeposit
);

// Reject
router.put(
    "/admin/reject/:id",
    protect,
    adminProtect,
    rejectDeposit
);

module.exports = router;