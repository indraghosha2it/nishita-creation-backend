


// backend/src/routes/termsRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicTerms,
  getAdminTerms,
  updateTerms,
  resetTerms,
  getRawData,
  getAdminTermsAll
} = require('../controllers/termsController');

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @route   GET /api/terms
// @desc    Get public terms data (only active sections)
// @access  Public
router.get('/', getPublicTerms);

// ============================================================
// ADMIN ROUTES
// ============================================================

// ✅ IMPORTANT: /all MUST come before root / route
router.get('/admin/all', protect, isModeratorOrAdmin, getAdminTermsAll);
router.get('/admin', protect, isModeratorOrAdmin, getAdminTerms);
router.get('/admin/raw-data', protect, isModeratorOrAdmin, getRawData);
router.put('/admin', protect, isModeratorOrAdmin, updateTerms);
router.post('/admin/reset', protect, isModeratorOrAdmin, resetTerms);

module.exports = router;