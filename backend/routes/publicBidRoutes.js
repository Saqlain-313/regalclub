const express = require('express');
const router = express.Router();
const publicBidController = require('../controllers/publicBidController');

// Single route for public bid results page
router.get('/', publicBidController.getPublicBidResults);

module.exports = router;