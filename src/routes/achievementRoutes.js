const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicAchievements,
  getAdminAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  toggleAchievementStatus,
  reorderAchievements
} = require('../controllers/achievementController');

// ============================================================
// PUBLIC
// ============================================================
router.get('/', getPublicAchievements);

// ============================================================
// PROTECTED — ADMIN
// ============================================================
router.get('/admin', protect, isModeratorOrAdmin, getAdminAchievements);
router.post('/admin', protect, isModeratorOrAdmin, createAchievement);
router.put('/admin/reorder', protect, isModeratorOrAdmin, reorderAchievements);
router.put('/admin/:id', protect, isModeratorOrAdmin, updateAchievement);
router.delete('/admin/:id', protect, isModeratorOrAdmin, deleteAchievement);
router.patch('/admin/:id/toggle', protect, isModeratorOrAdmin, toggleAchievementStatus);

module.exports = router;