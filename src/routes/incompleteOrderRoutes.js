const express = require('express');
const router = express.Router();
const { protect, optionalProtect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  saveIncompleteOrder,
  getIncompleteOrders,
  getIncompleteOrderStats,
  markAsCompleted,
  deleteIncompleteOrder,
  markIncompleteOrderAsCompleted,  // ADD THIS
  deleteIncompleteOrderOnPlace     // ADD THIS
} = require('../controllers/incompleteOrderController');

// ============= PUBLIC ROUTES (with optional auth) =============
router.post('/save', optionalProtect, saveIncompleteOrder);

// ============= NEW: Mark as completed when order is placed =============
router.post('/mark-completed', optionalProtect, markIncompleteOrderAsCompleted);
router.post('/delete-on-place', optionalProtect, deleteIncompleteOrderOnPlace);

// ============= ADMIN ROUTES =============
router.get('/admin/all', protect, isModeratorOrAdmin, getIncompleteOrders);
router.get('/admin/stats', protect, isModeratorOrAdmin, getIncompleteOrderStats);
router.put('/admin/:id/complete', protect, isModeratorOrAdmin, markAsCompleted);
router.delete('/admin/:id', protect, isModeratorOrAdmin, deleteIncompleteOrder);

module.exports = router;