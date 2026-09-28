// routes/courierWebhook.js
const express = require('express');
const router = express.Router();
const CourierScore = require('../models/CourierScore');
const Order = require('../models/Order');

// ========== COURIER STATUS WEBHOOK ==========
// @desc    Handle courier status update webhook
// @route   POST /api/webhook/courier-status
// @access  Public (with signature verification)
router.post('/courier-status', async (req, res) => {
  try {
    const { 
      courierService, 
      trackingNumber, 
      status, 
      orderId,
      customerPhone,
      message,
      location
    } = req.body;

    // Verify webhook signature (implement your own verification)
    // const isValid = verifyWebhookSignature(req);
    // if (!isValid) {
    //   return res.status(401).json({ success: false, error: 'Invalid signature' });
    // }

    if (!trackingNumber && !orderId && !customerPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'trackingNumber, orderId, or customerPhone is required' 
      });
    }

    // Find the order
    let order = null;
    let phoneNumber = customerPhone;

    if (orderId) {
      order = await Order.findById(orderId);
    } else if (trackingNumber) {
      order = await Order.findOne({ 
        'deliveryService.trackingNumber': trackingNumber 
      });
    } else if (customerPhone) {
      order = await Order.findOne({ 
        'customerInfo.phone': customerPhone 
      }).sort({ createdAt: -1 });
    }

    if (order) {
      phoneNumber = order.customerInfo?.phone;
      
      // Update delivery status
      if (order.deliveryService) {
        order.deliveryService.deliveryStatus = status;
        order.deliveryService.deliveryStatusHistory = 
          order.deliveryService.deliveryStatusHistory || [];
        order.deliveryService.deliveryStatusHistory.push({
          status,
          message: message || `Status updated to ${status}`,
          location: location || '',
          timestamp: new Date()
        });
        
        // If delivered, update payment status for COD
        if (status === 'delivered' && order.paymentMethod === 'cod') {
          order.paymentStatus = 'paid';
          order.deliveredAt = new Date();
          order.orderStatus = 'delivered';
        }
        
        await order.save();
      }
    }

    // Update courier score
    if (phoneNumber) {
      const score = await CourierScore.findOne({ phoneNumber });
      if (score) {
        // Find and update the specific courier stat
        const courierStat = score.courierStats.find(
          s => s.courierService === courierService
        );
        if (courierStat) {
          // Update status counts
          if (status === 'delivered') {
            courierStat.successfulDeliveries += 1;
            score.overallStats.successfulDeliveries += 1;
          } else if (status === 'cancelled' || status === 'failed') {
            courierStat.failedDeliveries += 1;
            score.overallStats.failedDeliveries += 1;
          } else if (status === 'returned') {
            courierStat.returnedOrders += 1;
            score.overallStats.returnedOrders += 1;
          }
          
          // Recalculate score
          score.calculateScore();
          await score.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Webhook processing failed'
    });
  }
});

module.exports = router;