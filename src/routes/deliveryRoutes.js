

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getDeliverySettings,
  updateDeliverySettings,
  calculateDeliveryCharge
} = require('../controllers/deliveryController');

// Public route - get delivery settings
router.get('/settings', getDeliverySettings);

router.post('/calculate', calculateDeliveryCharge);

// Updated: Allow both admin and moderator to update
router.put('/settings', protect, isModeratorOrAdmin, updateDeliverySettings);

module.exports = router;