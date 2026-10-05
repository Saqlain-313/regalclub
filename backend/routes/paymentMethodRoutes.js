// routes/paymentMethodRoutes.js
//
// Saved withdrawal payment methods (bank / upi / usdt) — user CRUD

const express = require("express");
const router = express.Router();

const {
  getMyPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} = require("../controllers/paymentMethodController");

const { protect } = require("../middleware/authMiddleware.js");

router.get("/", protect, getMyPaymentMethods);
router.post("/", protect, addPaymentMethod);
router.put("/:id", protect, updatePaymentMethod);
router.delete("/:id", protect, deletePaymentMethod);

module.exports = router;
