

// routes/cartRoutes.js - Update the merge route

const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const {
  getCartItems,
  getUserCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  removeProductFromCart,
  clearCart,
  mergeCart,
  checkCartStatus,
  checkCartItem,
} = require('../controllers/cartController');

// Public routes with optional auth
router.get('/', optionalProtect, getCartItems);
router.get('/user', protect, getUserCart); 
router.post('/', optionalProtect, addToCart);
router.put('/:itemId', optionalProtect, updateCartItem);
router.delete('/:itemId', optionalProtect, removeFromCart);
router.delete('/product/:productId', optionalProtect, removeProductFromCart);
router.delete('/', optionalProtect, clearCart);

// IMPORTANT: Change this to optionalProtect so it works with both guest and logged-in users
router.post('/merge', optionalProtect, mergeCart);  // Changed from 'protect' to 'optionalProtect'

router.post('/check-status', optionalProtect, checkCartStatus);
router.get('/check/:productId', checkCartItem);

module.exports = router;