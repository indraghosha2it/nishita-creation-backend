
// // backend/src/routes/privacyRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const {
//   getPublicPrivacy,
//   getAdminPrivacy,
//   updatePrivacy,
//   resetPrivacy,
//   getRawData,
//   getAdminPrivacyAll
// } = require('../controllers/privacyController');

// // ============================================================
// // PUBLIC ROUTES
// // ============================================================

// // @route   GET /api/privacy
// // @desc    Get public privacy policy data (only active sections)
// // @access  Public
// router.get('/', getPublicPrivacy);

// // ============================================================
// // ADMIN ROUTES
// // ============================================================

// // ✅ IMPORTANT: /all MUST come before root / route
// router.get('/admin/all', protect, isModeratorOrAdmin, getAdminPrivacyAll);
// router.get('/admin', protect, isModeratorOrAdmin, getAdminPrivacy);
// router.get('/admin/raw-data', protect, isModeratorOrAdmin, getRawData);
// router.put('/admin', protect, isModeratorOrAdmin, updatePrivacy);
// router.post('/admin/reset', protect, isModeratorOrAdmin, resetPrivacy);

// module.exports = router;


// backend/src/routes/privacyRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicPrivacy,
  getAdminPrivacy,
  updatePrivacy,
  resetPrivacy,
  getRawData,
  getAdminPrivacyAll
} = require('../controllers/privacyController');

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @route   GET /api/privacy
// @desc    Get public privacy policy data (only active sections)
// @access  Public
router.get('/', getPublicPrivacy);

// ============================================================
// ADMIN ROUTES
// ============================================================

// ✅ IMPORTANT: /all MUST come before root / route
router.get('/admin/all', protect, isModeratorOrAdmin, getAdminPrivacyAll);
router.get('/admin', protect, isModeratorOrAdmin, getAdminPrivacy);
router.get('/admin/raw-data', protect, isModeratorOrAdmin, getRawData);
router.put('/admin', protect, isModeratorOrAdmin, updatePrivacy);
router.post('/admin/reset', protect, isModeratorOrAdmin, resetPrivacy);

module.exports = router;