
// // backend/src/routes/bannerRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
// const {
//   createBanner,
//   getBanners,
//   getBannerForHomepage,
//   getBannerById,
//   updateBanner,
//   deleteBanner,
//   toggleBannerStatus,
//   toggleBannerPublish,
//   reorderBanners,
//   getBannerStats,
//   incrementBannerClicks
// } = require('../controllers/bannerController');

// // ============================================
// // PUBLIC ROUTES (No authentication required)
// // ============================================
// router.get('/homepage', getBannerForHomepage);

// // ============================================
// // SINGLE BANNER ROUTES - PUBLIC
// // ============================================
// router.get('/:id', getBannerById);
// router.post('/:id/click', incrementBannerClicks);

// // ============================================
// // PROTECTED ROUTES (Authentication required)
// // ============================================
// router.use(protect);

// // ============================================
// // MODERATOR & ADMIN ROUTES (Both can access)
// // ============================================
// router.get('/admin/all', isModeratorOrAdmin, getBanners);
// router.get('/admin/stats', isModeratorOrAdmin, getBannerStats);
// router.post('/', isModeratorOrAdmin, createBanner);
// router.put('/reorder', isModeratorOrAdmin, reorderBanners);
// router.put('/:id', isModeratorOrAdmin, updateBanner);
// router.put('/:id/toggle-status', isModeratorOrAdmin, toggleBannerStatus);
// router.put('/:id/toggle-publish', isModeratorOrAdmin, toggleBannerPublish);


// // ============================================
// // ADMIN ONLY ROUTES (Only admins can delete)
// // ============================================
// router.delete('/:id', isAdmin, deleteBanner);

// console.log('✅ Banner routes loaded successfully');

// module.exports = router;


const express = require('express');
const router = express.Router();
const {
  protect,
  isModeratorOrAdmin
} = require('../middleware/authMiddleware');
const {
  getBannerForHomepage,
  getAdminBanner,
  updateBanner,
  resetBanner,
  getBannerStats
} = require('../controllers/bannerController');

// ============================================================
// PUBLIC
// ============================================================
router.get('/homepage', getBannerForHomepage);

// ============================================================
// PROTECTED — ADMIN
// ============================================================
router.use(protect);

router.get('/admin', isModeratorOrAdmin, getAdminBanner);
router.put('/admin', isModeratorOrAdmin, updateBanner);
router.post('/admin/reset', isModeratorOrAdmin, resetBanner);
router.get('/admin/stats', isModeratorOrAdmin, getBannerStats);

module.exports = router;