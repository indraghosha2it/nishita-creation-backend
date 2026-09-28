

// // module.exports = router;
// // backend/src/routes/navbarRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const {
//   getPublicNavbar,
//   getAdminNavbar,
//   updateNavbar,
//   resetNavbar
// } = require('../controllers/navbarController');

// // ============================================================
// // PUBLIC ROUTES
// // ============================================================
// router.get('/', getPublicNavbar);

// // ============================================================
// // ADMIN ROUTES (Protected)
// // ============================================================

// // ✅ Apply middleware explicitly for each route
// router.get('/admin', protect, isModeratorOrAdmin, getAdminNavbar);
// router.put('/admin', protect, isModeratorOrAdmin, updateNavbar);
// router.post('/admin/reset', protect, isModeratorOrAdmin, resetNavbar);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicNavbar,
  getAdminNavbar,
  updateNavbar,
  resetNavbar
} = require('../controllers/navbarController');

// ============================================================
// PUBLIC ROUTES
// ============================================================
router.get('/', getPublicNavbar);

// ============================================================
// ADMIN ROUTES (Protected)
// ============================================================
router.get('/admin', protect, isModeratorOrAdmin, getAdminNavbar);
router.put('/admin', protect, isModeratorOrAdmin, updateNavbar);
router.post('/admin/reset', protect, isModeratorOrAdmin, resetNavbar);

module.exports = router;