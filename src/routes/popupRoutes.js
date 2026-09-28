// routes/popupRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPopupSettings,
  updatePopupSettings,
  getPublicPopupConfig
} = require('../controllers/popupSettingsController');
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');

// Public route - for frontend to get configuration
router.get('/popup-config', getPublicPopupConfig);

// Protected routes - Admin/Moderator only
router.route('/popup-settings')
  .get(protect, isModeratorOrAdmin, getPopupSettings)
  .put(protect, isModeratorOrAdmin, updatePopupSettings);

module.exports = router;