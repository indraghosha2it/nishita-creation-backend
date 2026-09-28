const Order = require('../models/Order');

// ========== GET COURIER SCORES FOR A PHONE NUMBER ==========
const getCourierScoresForPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Clean phone number (remove non-digit characters)
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 11) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number. Please enter a valid Bangladeshi number (01XXXXXXXXX)'
      });
    }

    // Define couriers to check
    const courierSlugs = ['pathao', 'steadfast', 'redx'];
    
    const couriers = {};
    let anyConfigured = false;
    let totalParcels = 0;
    let totalDelivered = 0;
    let totalCancelled = 0;

    // Query each courier
    for (const slug of courierSlugs) {
      // Get all orders for this phone with this courier
      const orders = await Order.find({
        'customerInfo.phone': { $regex: cleanPhone, $options: 'i' },
        'deliveryService.courierSlug': slug
      });

      const total = orders.length;
      const delivered = orders.filter(o => o.orderStatus === 'delivered').length;
      const cancelled = orders.filter(o => o.orderStatus === 'cancelled').length;
      const processing = orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'shipped').length;
      
      // Calculate success rate
      const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;

      // Get unique addresses
      const uniqueAddresses = new Set();
      orders.forEach(o => {
        if (o.customerInfo?.address) {
          uniqueAddresses.add(o.customerInfo.address);
        }
      });

      // Determine customer rating based on success rate
      let rating = 'new_customer';
      let ratingLabel = 'New Customer';
      
      if (total === 0) {
        rating = 'new_customer';
        ratingLabel = 'New Customer';
      } else if (successRate >= 90 && delivered >= 5) {
        rating = 'good_customer';
        ratingLabel = '⭐ Good Customer';
      } else if (successRate >= 70 && delivered >= 3) {
        rating = 'regular_customer';
        ratingLabel = '🔄 Regular Customer';
      } else if (successRate < 50 && cancelled > delivered) {
        rating = 'bad_customer';
        ratingLabel = '⚠️ Bad Customer';
      } else if (cancelled > 10) {
        rating = 'blocked';
        ratingLabel = '🚫 Blocked';
      }

      // Check if courier is configured (has credentials)
      const isConfigured = total > 0; // Or check if courier credentials exist

      couriers[slug] = {
        configured: isConfigured,
        total,
        delivered,
        cancelled,
        processing,
        successRate,
        rating,
        ratingLabel,
        addressCount: uniqueAddresses.size,
        ratingBased: true,
        error: null
      };

      if (isConfigured) {
        anyConfigured = true;
        totalParcels += total;
        totalDelivered += delivered;
        totalCancelled += cancelled;
      }
    }

    const deliverySuccessRate = totalParcels > 0 
      ? Math.round((totalDelivered / totalParcels) * 100) 
      : 0;

    // Get customer name from first order
    const firstOrder = await Order.findOne({
      'customerInfo.phone': { $regex: cleanPhone, $options: 'i' }
    });
    const customerName = firstOrder?.customerInfo?.fullName || 'Unknown';

    res.json({
      success: true,
      data: {
        phone: cleanPhone,
        customerName,
        couriers,
        anyConfigured,
        summary: {
          totalParcels,
          totalDelivered,
          totalCancelled,
          deliverySuccessRate
        },
        fetchedAt: new Date().toISOString(),
        cached: false
      }
    });
  } catch (error) {
    console.error('Error fetching courier scores:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========== GET COURIER SCORES FOR AN ORDER ==========
const getCourierScoresForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const phone = order.customerInfo?.phone;
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Order has no phone number'
      });
    }

    // Reuse the same function
    const result = await getCourierScoresForPhone({ params: { phone } }, res);
    return result;
  } catch (error) {
    console.error('Error fetching courier scores for order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getCourierScoresForPhone,
  getCourierScoresForOrder
};