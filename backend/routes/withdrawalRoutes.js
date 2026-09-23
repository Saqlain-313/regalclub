// routes/withdrawalRoutes.js
const express = require('express');
const router = express.Router();
const {
  requestWithdrawal,
  getWithdrawalHistory,
  getWithdrawalDetails,
  cancelWithdrawal,
  getWithdrawalSettings,
} = require('../controllers/withdrawalController');
const {protect} = require('../middleware/authMiddleware');

// All routes are protected (user must be authenticated)
router.use(protect);

// User routes
router.post('/', requestWithdrawal);
router.get('/history', getWithdrawalHistory);
router.get('/settings', getWithdrawalSettings);
router.get('/:id', getWithdrawalDetails);
router.put('/:id/cancel', cancelWithdrawal);

module.exports = router;