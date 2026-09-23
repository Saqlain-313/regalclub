const express = require("express");
const router = express.Router();

const {
  createCurrency,
  getCurrencies,
  getCurrency,
  updateCurrency,
  deleteCurrency,
  getCurrencyByCountry,
} = require("../controllers/currencyRateController");

const { protect, adminProtect } = require("../middleware/authMiddleware");

// Admin Only
router.post("/", protect,adminProtect, createCurrency);
router.put("/:id", protect,adminProtect, updateCurrency);
router.delete("/:id", protect,adminProtect, deleteCurrency);

// User (Logged In)
router.get("/", protect, getCurrencies);
router.get("/:id", protect, getCurrency);
router.get("/country/:countryCode", protect, getCurrencyByCountry);

module.exports = router;