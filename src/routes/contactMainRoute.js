

// // module.exports = router;
// // backend/src/routes/contactMainRoute.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const {
//   getPublicContact,
//   getAdminContact,
//   updateContact,
//   resetContact,
//   getRawData,
//   submitContactForm
// } = require('../controllers/contactController');

// // ============================================================
// // PUBLIC ROUTES
// // ============================================================

// // @route   GET /api/contact
// // @desc    Get public contact page data
// // @access  Public
// router.get('/', getPublicContact);

// // @route   GET /api/contact/page
// // @desc    Get public contact page data (alias)
// // @access  Public
// router.get('/page', getPublicContact);

// // @route   POST /api/contact
// // @desc    Submit contact form
// // @access  Public
// router.post('/', submitContactForm);

// // ============================================================
// // ADMIN ROUTES (Protected)
// // ============================================================

// // @route   GET /api/contact/admin
// // @desc    Get contact data for admin
// // @access  Private (Admin/Moderator)
// router.get('/admin', protect, isModeratorOrAdmin, getAdminContact);

// // @route   GET /api/contact/admin/raw-data
// // @desc    Get raw contact data
// // @access  Private (Admin/Moderator)
// router.get('/admin/raw-data', protect, isModeratorOrAdmin, getRawData);

// // @route   PUT /api/contact/admin
// // @desc    Update contact page
// // @access  Private (Admin/Moderator)
// router.put('/admin', protect, isModeratorOrAdmin, updateContact);

// // @route   POST /api/contact/admin/reset
// // @desc    Reset contact page to default
// // @access  Private (Admin/Moderator)
// router.post('/admin/reset', protect, isModeratorOrAdmin, resetContact);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicContact, getAdminContact, updateContact,
  resetContact, getRawData, submitContactForm,
} = require('../controllers/contactController');

// Public
router.get('/', getPublicContact);
router.get('/page', getPublicContact);
router.post('/', submitContactForm);

// Admin
router.get('/admin', protect, isModeratorOrAdmin, getAdminContact);
router.get('/admin/raw-data', protect, isModeratorOrAdmin, getRawData);
router.put('/admin', protect, isModeratorOrAdmin, updateContact);
router.post('/admin/reset', protect, isModeratorOrAdmin, resetContact);

module.exports = router;