
const express = require('express');
const router = express.Router();
const { protect, authorize, isModeratorOrAdmin, optionalProtect } = require('../middleware/authMiddleware');
const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  markHelpful,
  replyToReview,
  getMyReviews,
  uploadMedia,
  getReviewStats,
  getFeaturedReviews,
  toggleFeatured
} = require('../controllers/reviewController');

// ============= PUBLIC ROUTES =============
router.get('/featured', getFeaturedReviews);
router.get('/stats', getReviewStats);
router.get('/', optionalProtect, getReviews);

// ============= CREATE REVIEW - PUBLIC =============
router.post('/', optionalProtect, createReview);

// ============= PROTECTED ROUTES =============
router.use(protect);

// Specific static routes MUST come before parameterized routes
router.get('/my-reviews', getMyReviews);

// User routes with parameters
router.put('/:id', updateReview);
router.put('/:id/helpful', markHelpful);
router.post('/:id/reply', replyToReview);

// Public route with parameter
router.get('/:id', optionalProtect, getReviewById);

// ============= ADMIN/MODERATOR ONLY ROUTES =============
router.put('/:id/featured', isModeratorOrAdmin, toggleFeatured);
router.delete('/:id', isModeratorOrAdmin, deleteReview);
router.put('/:id/approve', isModeratorOrAdmin, approveReview);
router.put('/:id/reject', isModeratorOrAdmin, rejectReview);

module.exports = router;
