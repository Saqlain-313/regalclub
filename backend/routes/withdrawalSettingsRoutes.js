// routes/withdrawalSettingsRoutes.js
const express = require('express');
const router = express.Router();
const withdrawalSettingsController = require('../controllers/withdrawalSettingsController');

// Public routes
router.get('/country/:country', withdrawalSettingsController.getWithdrawalSettingsByCountry);

const {protect, adminProtect} = require("../middleware/authMiddleware.js");


// Admin only routes
router.use(protect,adminProtect);

// CRUD operations
router.post('/', withdrawalSettingsController.createWithdrawalSettings);
router.get('/', withdrawalSettingsController.getAllWithdrawalSettings);
router.get('/:id', withdrawalSettingsController.getWithdrawalSettingsById);
router.put('/:id', withdrawalSettingsController.updateWithdrawalSettings);
router.patch('/:id', withdrawalSettingsController.partialUpdateWithdrawalSettings);
router.delete('/:id', withdrawalSettingsController.deleteWithdrawalSettings);

// Additional operations
router.patch('/:id/toggle-status', withdrawalSettingsController.toggleWithdrawalSettingsStatus);
router.post('/:id/calculate-fee', withdrawalSettingsController.calculateFee);
router.post('/:id/validate', withdrawalSettingsController.validateWithdrawal);
router.post('/bulk', withdrawalSettingsController.bulkCreateWithdrawalSettings);

module.exports = router;