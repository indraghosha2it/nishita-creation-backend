// backend/src/routes/whyChooseUsRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicWhyChooseUs,
  getAdminWhyChooseUs,
  updateWhyChooseUs,
  resetWhyChooseUs
} = require('../controllers/whyChooseUsController');

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @route   GET /api/why-choose-us/public
// @access  Public
router.get('/public', getPublicWhyChooseUs);

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================

// @route   GET /api/admin/why-choose-us
// @access  Private (Admin/Moderator)
router.get('/', protect, isModeratorOrAdmin, getAdminWhyChooseUs);

// @route   PUT /api/admin/why-choose-us
// @access  Private (Admin/Moderator)
router.put('/', protect, isModeratorOrAdmin, updateWhyChooseUs);

// @route   POST /api/admin/why-choose-us/reset
// @access  Private (Admin/Moderator)
router.post('/reset', protect, isModeratorOrAdmin, resetWhyChooseUs);

module.exports = router;