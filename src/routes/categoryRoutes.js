

const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryDetails,
  addSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
  addChildSubcategory,
  getChildSubcategories,
  updateChildSubcategory,
  deleteChildSubcategory,
  getCategoriesWithProducts,
  getCategoryProducts,
  getCategoryBySlug,
  getLightweightCategories
} = require('../controllers/categoryController');

// Public routes (no authentication needed)
router.get('/', getCategories);
router.get('/light', getLightweightCategories);
router.get('/with-products', getCategoriesWithProducts); // NEW: Get categories with products
router.get('/slug/:slug', getCategoryBySlug); // NEW: Get category by slug
router.get('/:id', getCategoryById);
router.get('/:id/details', getCategoryDetails);
router.get('/:categoryId/products', getCategoryProducts); // NEW: Get products by category

// Subcategory public routes
router.get('/:categoryId/subcategories', getSubcategories);
router.get('/:categoryId/subcategories/:subcategoryId', getSubcategoryById);
router.get('/:categoryId/subcategories/:subcategoryId/children', getChildSubcategories);

// Protected routes - All routes below require authentication
router.use(protect);

// Category CRUD
router.post('/', isModeratorOrAdmin, upload.single('image'), createCategory);
router.put('/:id', isModeratorOrAdmin, upload.single('image'), updateCategory);
router.delete('/:id', isModeratorOrAdmin, deleteCategory);

// Subcategory CRUD
router.post('/:categoryId/subcategories', isModeratorOrAdmin, addSubcategory);
router.put('/:categoryId/subcategories/:subcategoryId', isModeratorOrAdmin, updateSubcategory);
router.delete('/:categoryId/subcategories/:subcategoryId', isModeratorOrAdmin, deleteSubcategory);

// Child Subcategory CRUD
router.post('/:categoryId/subcategories/:subcategoryId/children', isModeratorOrAdmin, addChildSubcategory);
router.put('/:categoryId/subcategories/:subcategoryId/children/:childId', isModeratorOrAdmin, updateChildSubcategory);
router.delete('/:categoryId/subcategories/:subcategoryId/children/:childId', isModeratorOrAdmin, deleteChildSubcategory);

module.exports = router;