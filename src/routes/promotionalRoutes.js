


// const express = require('express');
// const router = express.Router();
// const {
//   getAllPromotionalSettings,
//   getPromotionalSettingById,
//   createPromotionalSetting,
//   updatePromotionalSetting,
//   deletePromotionalSetting,
//   getPublicPromotionalData
// } = require('../controllers/promotionalController');
// const { protect, isAdmin } = require('../middleware/authMiddleware');

// // Public route - no authentication required
// router.get('/promotional', getPublicPromotionalData);

// // Admin only routes
// router.route('/promotional-settings')
//   .get(protect, isAdmin, getAllPromotionalSettings)
//   .post(protect, isAdmin, createPromotionalSetting);

// router.route('/promotional-settings/:id')
//   .get(protect, isAdmin, getPromotionalSettingById)
//   .put(protect, isAdmin, updatePromotionalSetting)
//   .delete(protect, isAdmin, deletePromotionalSetting);

// module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getAllPromotionalSettings,
  getPromotionalSettingById,
  createPromotionalSetting,
  updatePromotionalSetting,
  deletePromotionalSetting,
  getPublicPromotionalData
} = require('../controllers/promotionalController');
const { protect, isAdmin, isModeratorOrAdmin } = require('../middleware/authMiddleware');

// Public route - no authentication required
router.get('/promotional', getPublicPromotionalData);

// Admin only routes (DELETE - only admin)
router.delete('/promotional-settings/:id', protect, isAdmin, deletePromotionalSetting);

// Moderator and Admin routes (GET, POST, PUT)
router.route('/promotional-settings')
  .get(protect, isModeratorOrAdmin, getAllPromotionalSettings)
  .post(protect, isModeratorOrAdmin, createPromotionalSetting);

router.route('/promotional-settings/:id')
  .get(protect, isModeratorOrAdmin, getPromotionalSettingById)
  .put(protect, isModeratorOrAdmin, updatePromotionalSetting);

module.exports = router;