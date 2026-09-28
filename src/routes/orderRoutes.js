

// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { protect, optionalProtect, isAdmin, isModeratorOrAdmin, isAgent,  authorize,  } = require('../middleware/authMiddleware'); // ✅ ADD isAgent here
const ipMiddleware = require('../middleware/ipMiddleware');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getAllOrders,
  getOrderStats,
  prepareOrder,
  deleteOrder,
  updateOrder,
  createDeliveryOrder,
  getOrderTracking,
  trackOrderByPhone,
  getPublicOrder,
  getAgentOrders,           // ✅ ADD THIS
  updateAgentOrderStatus ,
  getAgentDashboard,
  updateDeliveryStatus,
  getFilteredOrderStats,
  addProductToOrder,
  removeProductFromOrder,
  updateOrderDiscount,
  searchProductsForOrder,
  bulkUpdateOrder,
  getBulkTrackingStatuses,
    updatePartialDelivery,
  getPartialDeliveryItems,
    getReturnedItemsOrders,
  getReturnedItemsForOrder,
  processReturnedItem,
  updateReturnStatus,
  searchDuplicateCustomers,
  getDuplicateCustomerOrderDetails,
  getPlatformSaleDetails,
  createShowroomOrder,
  getPlatformSalesTrend
} = require('../controllers/orderController');
const { getProfitMarginData, getProductProfitMargin } = require('../controllers/profitMarginController');

// Apply IP middleware to all order routes
router.use(ipMiddleware);

// ============= PUBLIC ROUTES =============
router.post('/', optionalProtect, createOrder);
router.get('/', optionalProtect, getUserOrders);
router.get('/search-products', protect, isModeratorOrAdmin, searchProductsForOrder);

router.get('/:id', optionalProtect, getOrderById);
router.put('/:id/cancel', optionalProtect, cancelOrder);
router.post('/prepare', optionalProtect, prepareOrder);

// ============= ADMIN ROUTES =============
router.get('/admin/all', protect, isModeratorOrAdmin, getAllOrders);
router.get('/admin/stats', protect, isModeratorOrAdmin, getOrderStats);
router.put('/:id/status', protect, isModeratorOrAdmin, updateOrderStatus);
router.put('/:id/payment', protect, isModeratorOrAdmin, updatePaymentStatus);
router.put('/:id', protect, isModeratorOrAdmin, updateOrder);
router.post('/admin/tracking-statuses', protect, isModeratorOrAdmin, getBulkTrackingStatuses);

// Delivery routes
router.post('/:id/delivery', protect, isModeratorOrAdmin, createDeliveryOrder);
router.get('/:id/tracking', protect, isModeratorOrAdmin, getOrderTracking);

// ============= PARTIAL DELIVERY ROUTES =============
router.get('/:id/partial-delivery-items', protect, isModeratorOrAdmin, getPartialDeliveryItems);
router.put('/:id/partial-delivery', protect, isModeratorOrAdmin, updatePartialDelivery);

router.get('/returned-items/all', protect, isModeratorOrAdmin, getReturnedItemsOrders);
router.get('/:id/returned-items', protect, isModeratorOrAdmin, getReturnedItemsForOrder);
router.put('/:id/returned-items/process', protect, isModeratorOrAdmin, processReturnedItem);
router.put('/:id/return-status', protect, isModeratorOrAdmin, updateReturnStatus);

// ============= PROFIT MARGIN ROUTES =============
router.get('/admin/profit-margin', protect, isModeratorOrAdmin, getProfitMarginData);
router.get('/admin/product-profit/:productId', protect, isModeratorOrAdmin, getProductProfitMargin);

// ============= AGENT ROUTES (Call Center Agent) =============
router.get('/agent/orders', protect, isAgent, getAgentOrders);
router.put('/agent/:id/status', protect, isAgent, updateAgentOrderStatus);
router.get('/agent/dashboard', protect, isAgent, getAgentDashboard);

// Public tracking
router.get('/track/:phone', trackOrderByPhone);
router.get('/public/:id', getPublicOrder);

// Delete (Admin only)
router.delete('/:id', protect, isAdmin, deleteOrder);

// Add this with other routes
router.put('/:id/delivery-status', protect, updateDeliveryStatus);
router.get('/admin/stats/filtered', protect, isModeratorOrAdmin, getFilteredOrderStats);

// backend/src/routes/orderRoutes.js - Add these routes

// ... existing routes ...

// ============= ORDER EDITING ROUTES =============
// Search products for adding to order
// router.get('/search-products', protect, isModeratorOrAdmin, searchProductsForOrder);

// Add product to order
router.post('/:id/add-product', protect, isModeratorOrAdmin, addProductToOrder);

// Remove product from order
router.delete('/:id/remove-product/:itemId', protect, isModeratorOrAdmin, removeProductFromOrder);
// ============= BULK ORDER UPDATE =============
// This replaces the entire order in one atomic operation
router.put('/:id/bulk-update', protect, isModeratorOrAdmin, bulkUpdateOrder);

// Update order discount
router.put('/:id/discount', protect, isModeratorOrAdmin, updateOrderDiscount);

// ============= DUPLICATE CUSTOMER ROUTES =============
router.get('/duplicate-customers/search', protect, isModeratorOrAdmin, searchDuplicateCustomers);
router.get('/duplicate-customers/order/:id', protect, isModeratorOrAdmin, getDuplicateCustomerOrderDetails);
// ============= PLATFORM SALE DETAILS =============
router.get('/admin/platform-sales', protect, isModeratorOrAdmin, getPlatformSaleDetails);
router.get('/admin/platform-sales-trend', protect, authorize('super_admin', 'admin'), getPlatformSalesTrend);

// ============= SHOWROOM POS =============
router.post('/showroom/pos', protect, isModeratorOrAdmin, createShowroomOrder);




module.exports = router;