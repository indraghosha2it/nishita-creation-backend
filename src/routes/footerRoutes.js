
// // backend/src/routes/footerRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const { upload } = require('../config/cloudinary');
// const {
//   getPublicFooter,
//   getAdminFooter,
//   createFooter,
//   updateFooter,
//   deleteFooter,
//   toggleFooterStatus,
//   resetFooter,
//   uploadBackground,
//   uploadLogo
// } = require('../controllers/footerController');

// // ============================================================
// // PUBLIC ROUTES
// // ============================================================

// // @route   GET /api/footer
// // @desc    Get public footer data
// // @access  Public
// router.get('/', getPublicFooter);

// // ============================================================
// // ADMIN/MODERATOR ROUTES
// // ============================================================

// router.use(protect, (req, res, next) => {
//   console.log('🔍 User role from token:', req.user?.role);
//   console.log('🔍 User ID:', req.user?._id);
//   console.log('🔍 User email:', req.user?.email);
//   next();
// });

// router.use(protect, isModeratorOrAdmin);

// // @route   GET /api/admin/footer
// // @desc    Get footer data for admin
// router.get('/', getAdminFooter);

// // @route   POST /api/admin/footer
// // @desc    Create footer
// router.post('/', createFooter);

// // @route   PUT /api/admin/footer
// // @desc    Update footer
// router.put('/', updateFooter);

// // @route   DELETE /api/admin/footer
// // @desc    Delete footer (deactivate)
// router.delete('/', deleteFooter);

// // @route   PUT /api/admin/footer/toggle
// // @desc    Toggle footer status
// router.put('/toggle', toggleFooterStatus);

// // @route   POST /api/admin/footer/reset
// // @desc    Reset footer to default
// router.post('/reset', resetFooter);

// // @route   POST /api/admin/footer/upload-background
// // @desc    Upload footer background image
// router.post('/upload-background', upload.single('background'), uploadBackground);
// backend/src/routes/footerRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPublicFooter,
  getAdminFooter,
  getFooterOptions,
  createFooter,
  updateFooter,
  deleteFooter,
  toggleFooterStatus,
  resetFooter,
  uploadBackground,
  uploadLogo
} = require('../controllers/footerController');
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// ============================================================
// SINGLE ROUTER — mounted at TWO prefixes in server.js:
//   app.use('/api/footer',       footerRoutes);   → public read
//   app.use('/api/admin/footer', footerRoutes);   → admin CRUD
//
// Resulting URLs:
//   GET    /api/footer                     → getPublicFooter  (no auth)
//   GET    /api/admin/footer               → getAdminFooter   (auth required)
//   GET    /api/admin/footer/options       → getFooterOptions (auth required)
//   POST   /api/admin/footer               → createFooter
//   PUT    /api/admin/footer               → updateFooter
//   DELETE /api/admin/footer               → deleteFooter
//   PATCH  /api/admin/footer/toggle        → toggleFooterStatus
//   POST   /api/admin/footer/reset         → resetFooter
//   POST   /api/admin/footer/upload-background → uploadBackground
//   POST   /api/admin/footer/upload-logo   → uploadLogo
// ============================================================

// ------------------------------------------------------------
// PUBLIC / ADMIN READ (same path)
// - No Bearer token → public payload
// - With Bearer token → fall through to protected admin handler
// ------------------------------------------------------------
router.get(
  '/',
  (req, res, next) => {
    const hasAuth =
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer');
    if (!hasAuth) return getPublicFooter(req, res, next);
    next();
  },
  protect,
  isModeratorOrAdmin,
  getAdminFooter
);

// ------------------------------------------------------------
// ADMIN — Options (category list for the picker dropdown)
// Full URL: GET /api/admin/footer/options
// ------------------------------------------------------------
router.get('/options', protect, isModeratorOrAdmin, getFooterOptions);

// ------------------------------------------------------------
// ADMIN — CRUD
// ------------------------------------------------------------
router.post('/',   protect, isModeratorOrAdmin, createFooter);
router.put('/',    protect, isModeratorOrAdmin, updateFooter);
router.delete('/', protect, isModeratorOrAdmin, deleteFooter);

// ------------------------------------------------------------
// ADMIN — Utilities
// ------------------------------------------------------------
router.patch('/toggle', protect, isModeratorOrAdmin, toggleFooterStatus);
router.post('/reset',   protect, isModeratorOrAdmin, resetFooter);

// ------------------------------------------------------------
// ADMIN — Uploads
// ------------------------------------------------------------
router.post(
  '/upload-background',
  protect,
  isModeratorOrAdmin,
  upload.single('image'),
  uploadBackground
);
router.post(
  '/upload-logo',
  protect,
  isModeratorOrAdmin,
  upload.single('image'),
  uploadLogo
);

module.exports = router;