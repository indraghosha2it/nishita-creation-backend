const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const {
  createTag,
  getTags,
  getTagById,
  getTagBySlug, 
  updateTag,
  deleteTag,
  toggleTagStatus
} = require('../controllers/tagController');

// Public routes
router.get('/', getTags);
router.get('/slug/:slug', getTagBySlug);
router.get('/:id', getTagById);

// Protected routes - Admin/Moderator only
router.post('/', protect, isModeratorOrAdmin, createTag);
router.put('/:id', protect, isModeratorOrAdmin, updateTag);
router.put('/:id/toggle', protect, isModeratorOrAdmin, toggleTagStatus);

// Admin only
router.delete('/:id', protect, isAdmin, deleteTag);

module.exports = router;