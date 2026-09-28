const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getRestrictions,
  updateIPRestrictions,
  updatePhoneRestrictions,
  updateEmailRestrictions,
  addBlockedIP,
  removeBlockedIP,
  addBlockedPhone,
  removeBlockedPhone,
  addBlockedEmail,
  removeBlockedEmail,
  checkOrderRestrictions,
  getBlockedLists
} = require('../controllers/orderRestrictionController');

// ============= PUBLIC ROUTES (for checking restrictions during checkout) =============
router.post('/check', checkOrderRestrictions);

// ============= ADMIN ROUTES =============
router.get('/', protect, isModeratorOrAdmin, getRestrictions);
router.get('/blocked-lists', protect, isModeratorOrAdmin, getBlockedLists);

// IP restrictions
router.put('/ip', protect, isModeratorOrAdmin, updateIPRestrictions);
router.post('/ip/block', protect, isModeratorOrAdmin, addBlockedIP);
router.delete('/ip/:ip', protect, isModeratorOrAdmin, removeBlockedIP);

// Phone restrictions
router.put('/phone', protect, isModeratorOrAdmin, updatePhoneRestrictions);
router.post('/phone/block', protect, isModeratorOrAdmin, addBlockedPhone);
router.delete('/phone/:phone', protect, isModeratorOrAdmin, removeBlockedPhone);

// Email restrictions
router.put('/email', protect, isModeratorOrAdmin, updateEmailRestrictions);
router.post('/email/block', protect, isModeratorOrAdmin, addBlockedEmail);
router.delete('/email/:email', protect, isModeratorOrAdmin, removeBlockedEmail);

module.exports = router;