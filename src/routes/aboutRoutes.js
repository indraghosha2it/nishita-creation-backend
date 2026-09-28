
// // backend/src/routes/aboutRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const {
//   getPublicAbout,
//   getAdminAbout,
//   updateAbout,
//   resetAbout
// } = require('../controllers/aboutController');

// // ============================================================
// // PUBLIC ROUTES
// // ============================================================

// // @route   GET /api/about/page
// // @access  Public
// router.get('/page', getPublicAbout);

// // ============================================================
// // ADMIN ROUTES (Protected)
// // ============================================================

// // @route   GET /api/admin/about
// // @access  Private (Admin/Moderator)
// router.get('/', protect, isModeratorOrAdmin, getAdminAbout);

// // @route   PUT /api/admin/about
// // @access  Private (Admin/Moderator)
// router.put('/', protect, isModeratorOrAdmin, updateAbout);

// // @route   POST /api/admin/about/reset
// // @access  Private (Admin/Moderator)
// router.post('/reset', protect, isModeratorOrAdmin, resetAbout);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicAbout, getAdminAbout, updateAbout, resetAbout,
} = require('../controllers/aboutController');

// Public
router.get('/page', getPublicAbout);

// Admin
router.get('/',       protect, isModeratorOrAdmin, getAdminAbout);
router.put('/',       protect, isModeratorOrAdmin, updateAbout);
router.post('/reset', protect, isModeratorOrAdmin, resetAbout);

module.exports = router;