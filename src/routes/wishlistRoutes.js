const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  mergeWishlist,
  checkWishlistStatus,
  checkWishlistItem
} = require('../controllers/wishlistController');

// Use optionalProtect for all routes - allows both guests and logged-in users
router.get('/', optionalProtect, getWishlist);
router.post('/', optionalProtect, addToWishlist);
router.delete('/:itemId', optionalProtect, removeFromWishlist);
router.delete('/', optionalProtect, clearWishlist);
router.post('/merge', protect, mergeWishlist);
router.post('/check-status', optionalProtect, checkWishlistStatus);
router.get('/check/:productId', optionalProtect, checkWishlistItem);


module.exports = router;