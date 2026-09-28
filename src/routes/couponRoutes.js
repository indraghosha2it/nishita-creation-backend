const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin, optionalProtect } = require('../middleware/authMiddleware');
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getHomepageCoupons,
  checkCouponCode,
  recordCouponUsage,
  getAvailableCoupons
} = require('../controllers/couponController');

// ============= PUBLIC ROUTES =============
router.get('/homepage', getHomepageCoupons);
router.post('/validate', validateCoupon);
router.post('/available', optionalProtect, getAvailableCoupons);

// ============= PROTECTED ROUTES (Admin/Moderator) =============
router.get('/check-code', protect, isModeratorOrAdmin, checkCouponCode);
router.get('/', protect, isModeratorOrAdmin, getCoupons);
router.get('/:id', protect, isModeratorOrAdmin, getCouponById);
router.post('/', protect, isModeratorOrAdmin, createCoupon);
router.put('/:id', protect, isModeratorOrAdmin, updateCoupon);

// ============= ADMIN ONLY ROUTES =============
router.delete('/:id', protect, isAdmin, deleteCoupon);

// ============= USER PROTECTED ROUTES =============
router.post('/:id/record-usage', protect, recordCouponUsage);

module.exports = router;