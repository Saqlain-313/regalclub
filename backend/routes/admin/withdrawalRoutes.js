// routes/admin/withdrawalRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllWithdrawals,
  updateWithdrawalStatus,
  createOrUpdateWithdrawalSettings,
  getAllWithdrawalSettings,
  getWithdrawalStats,
} = require('../../controllers/withdrawalController');
const {protect} = require('../../middleware/authMiddleware');

// All routes are protected and admin-only
router.use(protect);

// Withdrawal management
router.get('/', getAllWithdrawals);
router.get('/stats', getWithdrawalStats);
router.put('/:id', updateWithdrawalStatus);

// Withdrawal settings
router.get('/settings', getAllWithdrawalSettings);
router.post('/settings', createOrUpdateWithdrawalSettings);

module.exports = router;