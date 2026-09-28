// // backend/src/routes/dealRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const {
//   getPublicDeals,
//   getAdminDeals,
//   createDeal,
//   updateDeal,
//   deleteDeal,
//   toggleDealStatus,
//   reorderDeals
// } = require('../controllers/dealController');

// // ============================================================
// // PUBLIC ROUTES
// // ============================================================

// // @route   GET /api/deals
// // @access  Public
// router.get('/', getPublicDeals);

// // ============================================================
// // ADMIN ROUTES (Protected)
// // ============================================================

// // @route   GET /api/admin/deals
// // @access  Private (Admin/Moderator)
// router.get('/admin', protect, isModeratorOrAdmin, getAdminDeals);

// // @route   POST /api/admin/deals
// // @access  Private (Admin/Moderator)
// router.post('/admin', protect, isModeratorOrAdmin, createDeal);

// // @route   PUT /api/admin/deals/:id
// // @access  Private (Admin/Moderator)
// router.put('/admin/:id', protect, isModeratorOrAdmin, updateDeal);

// // @route   DELETE /api/admin/deals/:id
// // @access  Private (Admin/Moderator)
// router.delete('/admin/:id', protect, isModeratorOrAdmin, deleteDeal);

// // @route   PATCH /api/admin/deals/:id/toggle
// // @access  Private (Admin/Moderator)
// router.patch('/admin/:id/toggle', protect, isModeratorOrAdmin, toggleDealStatus);

// // @route   PUT /api/admin/deals/reorder
// // @access  Private (Admin/Moderator)
// router.put('/admin/reorder', protect, isModeratorOrAdmin, reorderDeals);

// module.exports = router;



// backend/src/routes/dealRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicDeals,
  getAdminDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  toggleDealStatus,
  reorderDeals
} = require('../controllers/dealController');

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @route   GET /api/deals
// @access  Public
router.get('/', getPublicDeals);

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================

// @route   GET /api/admin/deals
// @access  Private (Admin/Moderator)
router.get('/admin', protect, isModeratorOrAdmin, getAdminDeals);

// @route   POST /api/admin/deals
// @access  Private (Admin/Moderator)
router.post('/admin', protect, isModeratorOrAdmin, createDeal);

// ============================================================
// ⚠️ STATIC ROUTES MUST COME BEFORE DYNAMIC `:id` ROUTES
// Otherwise /admin/reorder matches /admin/:id with id="reorder"
// ============================================================

// @route   PUT /api/admin/deals/reorder
// @access  Private (Admin/Moderator)
router.put('/admin/reorder', protect, isModeratorOrAdmin, reorderDeals);

// ============================================================
// DYNAMIC `:id` ROUTES — always LAST
// ============================================================

// @route   PUT /api/admin/deals/:id
// @access  Private (Admin/Moderator)
router.put('/admin/:id', protect, isModeratorOrAdmin, updateDeal);

// @route   DELETE /api/admin/deals/:id
// @access  Private (Admin/Moderator)
router.delete('/admin/:id', protect, isModeratorOrAdmin, deleteDeal);

// @route   PATCH /api/admin/deals/:id/toggle
// @access  Private (Admin/Moderator)
router.patch('/admin/:id/toggle', protect, isModeratorOrAdmin, toggleDealStatus);

module.exports = router;