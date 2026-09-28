const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getWidgets
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboardData);
router.get('/widgets', protect, getWidgets);

module.exports = router;