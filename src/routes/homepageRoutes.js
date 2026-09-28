

// backend/src/routes/homepageRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicHomepage,
  getAdminHomepage,
  updateHomepage,
  resetHomepage,
  debugHomepage,
  getRawData,
  getAdminHomepageAll
} = require('../controllers/homepageController');

// ============================================================
// PUBLIC ROUTES
// ============================================================
router.get('/', getPublicHomepage);
router.get('/debug', debugHomepage);

// ============================================================
// ADMIN ROUTES - ✅ FIX: All admin routes must use isModeratorOrAdmin
// ============================================================

// ✅ IMPORTANT: Define ALL admin routes with explicit middleware
router.get('/admin/all', protect, isModeratorOrAdmin, getAdminHomepageAll);
router.get('/admin', protect, isModeratorOrAdmin, getAdminHomepage);
router.get('/admin/raw-data', protect, isModeratorOrAdmin, getRawData);
router.put('/admin', protect, isModeratorOrAdmin, updateHomepage);
router.post('/admin/reset', protect, isModeratorOrAdmin, resetHomepage);

module.exports = router;