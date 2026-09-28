const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const {
  getSettings,
  updateSettings,
  resetSettings
} = require('../controllers/productCostSettingsController');

// All routes require authentication
router.use(protect);

// Get settings - moderator or admin required
router.get('/settings', isModeratorOrAdmin, getSettings);

// Update settings - moderator or admin required
router.put('/settings', isModeratorOrAdmin, updateSettings);

// Reset settings - super admin only
router.post('/settings/reset', isAdmin, resetSettings);

module.exports = router;