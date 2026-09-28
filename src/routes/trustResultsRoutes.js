// backend/src/routes/trustResultsRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicTrustResults,
  getAdminTrustResults,
  updateTrustResults,
  resetTrustResults
} = require('../controllers/trustResultsController');

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @route   GET /api/trust-results
// @access  Public
router.get('/', getPublicTrustResults);

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================

// @route   GET /api/admin/trust-results
// @access  Private (Admin/Moderator)
router.get('/admin', protect, isModeratorOrAdmin, getAdminTrustResults);

// @route   PUT /api/admin/trust-results
// @access  Private (Admin/Moderator)
router.put('/admin', protect, isModeratorOrAdmin, updateTrustResults);

// @route   POST /api/admin/trust-results/reset
// @access  Private (Admin/Moderator)
router.post('/admin/reset', protect, isModeratorOrAdmin, resetTrustResults);

module.exports = router;