// // backend/src/routes/brandRoutes.js
// const express = require('express');
// const router = express.Router();
// const {
//   createBrand,
//   getBrands,
//   getBrandById,
//   updateBrand,
//   deleteBrand
// } = require('../controllers/brandController');
// const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');

// // Public routes
// router.get('/', getBrands);
// router.get('/:id', getBrandById);

// // Protected routes (Admin/Moderator only)
// router.post('/', protect, isModeratorOrAdmin, createBrand);
// router.put('/:id', protect, isModeratorOrAdmin, updateBrand);
// router.delete('/:id', protect, isAdmin, deleteBrand);

// module.exports = router;


// backend/src/routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrandById);

// Protected routes (Admin/Moderator only)
router.post('/', protect, isModeratorOrAdmin, createBrand);
router.put('/:id', protect, isModeratorOrAdmin, updateBrand);
router.delete('/:id', protect, isAdmin, deleteBrand);

module.exports = router;