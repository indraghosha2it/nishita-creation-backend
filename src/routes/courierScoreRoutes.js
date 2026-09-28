// // routes/courierScoreRoutes.js
// const express = require('express');
// const router = express.Router();
// const CourierScoreService = require('../utils/courierScoreService');
// // ✅ FIX: Use the correct filename - authMiddleware.js
// const { protect, isAdmin, isModeratorOrAdmin } = require('../middleware/authMiddleware');

// // ========== PUBLIC ROUTES (No authentication required) ==========

// // GET courier score by phone number
// router.get('/:phoneNumber', async (req, res) => {
//   try {
//     const { phoneNumber } = req.params;
    
//     if (!phoneNumber) {
//       return res.status(400).json({
//         success: false,
//         error: 'Phone number is required'
//       });
//     }
    
//     const score = await CourierScoreService.getCourierScore(phoneNumber);
    
//     if (!score) {
//       return res.status(404).json({
//         success: false,
//         error: 'No data found for this phone number'
//       });
//     }
    
//     const courierStats = await CourierScoreService.getCourierWiseStats(phoneNumber);
    
//     const { page = 1, limit = 20 } = req.query;
//     const orderHistory = await CourierScoreService.getOrderHistory(phoneNumber, {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       sort: '-orderDate'
//     });
    
//     const response = {
//       success: true,
//       phoneNumber: score.phoneNumber,
//       customerInfo: {
//         name: score.customerName,
//         email: score.email
//       },
//       overallStats: {
//         totalOrders: score.overallStats.totalOrders,
//         totalSpent: score.overallStats.totalSpent,
//         successfulDeliveries: score.overallStats.successfulDeliveries,
//         failedDeliveries: score.overallStats.failedDeliveries,
//         returnedOrders: score.overallStats.returnedOrders,
//         successRate: score.successRate,
//         firstOrderDate: score.overallStats.firstOrderDate,
//         lastOrderDate: score.overallStats.lastOrderDate
//       },
//       courierStats,
//       score: {
//         value: score.score,
//         trustLevel: score.trustLevel,
//         lastUpdated: score.updatedAt
//       },
//       orderHistory: {
//         orders: orderHistory.orders,
//         pagination: orderHistory.pagination
//       }
//     };
    
//     res.json(response);
    
//   } catch (error) {
//     console.error('Get courier score error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to get courier score'
//     });
//   }
// });

// // GET order history for a phone number
// router.get('/:phoneNumber/history', async (req, res) => {
//   try {
//     const { phoneNumber } = req.params;
//     const { page = 1, limit = 20, sort = '-orderDate' } = req.query;
    
//     if (!phoneNumber) {
//       return res.status(400).json({
//         success: false,
//         error: 'Phone number is required'
//       });
//     }
    
//     const orderHistory = await CourierScoreService.getOrderHistory(phoneNumber, {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       sort
//     });
    
//     res.json({
//       success: true,
//       phoneNumber,
//       ...orderHistory
//     });
    
//   } catch (error) {
//     console.error('Get order history error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to get order history'
//     });
//   }
// });

// // GET courier wise statistics
// router.get('/:phoneNumber/stats', async (req, res) => {
//   try {
//     const { phoneNumber } = req.params;
    
//     if (!phoneNumber) {
//       return res.status(400).json({
//         success: false,
//         error: 'Phone number is required'
//       });
//     }
    
//     const stats = await CourierScoreService.getCourierWiseStats(phoneNumber);
    
//     res.json({
//       success: true,
//       phoneNumber,
//       stats
//     });
    
//   } catch (error) {
//     console.error('Get courier stats error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to get courier statistics'
//     });
//   }
// });

// // ========== ADMIN ROUTES (Authentication required) ==========

// // POST: Recalculate all scores (Admin only)
// router.post('/admin/recalculate', protect, isAdmin, async (req, res) => {
//   try {
//     const updatedCount = await CourierScoreService.recalculateAllScores();
    
//     res.json({
//       success: true,
//       message: `Recalculated scores for ${updatedCount} customers`,
//       updatedCount
//     });
    
//   } catch (error) {
//     console.error('Recalculate scores error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to recalculate scores'
//     });
//   }
// });

// // GET: Dashboard summary (Admin/Moderator only)
// router.get('/admin/dashboard', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     const summary = await CourierScoreService.getDashboardSummary();
    
//     res.json({
//       success: true,
//       data: summary
//     });
    
//   } catch (error) {
//     console.error('Get dashboard summary error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to get dashboard summary'
//     });
//   }
// });

// // POST: Sync a specific order (Admin only)
// router.post('/admin/sync-order/:orderId', protect, isAdmin, async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const OrderSyncService = require('../utils/orderSyncService');
    
//     const result = await OrderSyncService.syncOrder(orderId);
    
//     res.json({
//       success: true,
//       message: `Order ${orderId} synced successfully`,
//       data: result
//     });
    
//   } catch (error) {
//     console.error('Sync order error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to sync order'
//     });
//   }
// });

// // POST: Sync all orders for a phone number (Admin only)
// router.post('/admin/sync-phone/:phoneNumber', protect, isAdmin, async (req, res) => {
//   try {
//     const { phoneNumber } = req.params;
//     const OrderSyncService = require('../utils/orderSyncService');
    
//     const result = await OrderSyncService.syncAllOrdersForPhone(phoneNumber);
    
//     res.json({
//       success: true,
//       message: `All orders for ${phoneNumber} synced successfully`,
//       data: result
//     });
    
//   } catch (error) {
//     console.error('Sync phone orders error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to sync orders'
//     });
//   }
// });

// // POST: Sync all orders in batches (Admin only)
// router.post('/admin/sync-all', protect, isAdmin, async (req, res) => {
//   try {
//     const { batchSize = 100 } = req.body;
//     const OrderSyncService = require('../utils/orderSyncService');
    
//     const processed = await OrderSyncService.syncAllOrders(batchSize);
    
//     res.json({
//       success: true,
//       message: `Synced ${processed} orders successfully`,
//       processed
//     });
    
//   } catch (error) {
//     console.error('Sync all orders error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to sync orders'
//     });
//   }
// });

// // GET: Search customers by name or phone (Admin/Moderator only)
// router.get('/admin/search', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     const { query, limit = 20 } = req.query;
    
//     if (!query) {
//       return res.status(400).json({
//         success: false,
//         error: 'Search query is required'
//       });
//     }
    
//     const CourierScore = require('../models/CourierScore');
    
//     const results = await CourierScore.find({
//       $or: [
//         { phoneNumber: { $regex: query, $options: 'i' } },
//         { customerName: { $regex: query, $options: 'i' } },
//         { email: { $regex: query, $options: 'i' } }
//       ]
//     })
//     .sort({ score: -1 })
//     .limit(parseInt(limit))
//     .select('phoneNumber customerName email score trustLevel overallStats.totalOrders overallStats.totalSpent');
    
//     res.json({
//       success: true,
//       results,
//       count: results.length
//     });
    
//   } catch (error) {
//     console.error('Search customers error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to search customers'
//     });
//   }
// });

// module.exports = router;


// D:\power-bank\power-bank-backend\src\routes\courierScoreRoutes.js
// OR add directly to server.js

const express = require('express');
const router = express.Router();
const courierFraudService = require('../utils/courierFraudService');

// GET /api/courier-history
router.get('/courier-history', async (req, res) => {
  try {
    const phoneNumber = req.query.phone;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    const history = await courierFraudService.getLifetimeHistory(phoneNumber);
    
    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch courier history'
    });
  }
});

module.exports = router;