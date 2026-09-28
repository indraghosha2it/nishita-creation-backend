// utils/orderSyncService.js
const CourierScore = require('../models/CourierScore');
const Order = require('../models/Order');

class OrderSyncService {
  
  static async syncOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return await CourierScore.updateFromOrder(order);
  }
  
  static async syncAllOrdersForPhone(phoneNumber) {
    const orders = await Order.find({
      'customerInfo.phone': phoneNumber
    });
    
    let score = await CourierScore.findOne({ phoneNumber });
    if (!score) {
      score = new CourierScore({
        phoneNumber,
        courierStats: [],
        overallStats: {
          totalOrders: 0,
          totalSpent: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          returnedOrders: 0,
          lastOrderDate: null,
          firstOrderDate: null
        },
        orderHistory: []
      });
    }
    
    score.courierStats = [];
    score.overallStats = {
      totalOrders: 0,
      totalSpent: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      returnedOrders: 0,
      lastOrderDate: null,
      firstOrderDate: null
    };
    score.orderHistory = [];
    
    for (const order of orders) {
      await CourierScore.updateFromOrder(order);
    }
    
    return await CourierScore.findOne({ phoneNumber });
  }
  
  static async syncAllOrders(batchSize = 100) {
    let processed = 0;
    let lastId = null;
    
    while (true) {
      const query = lastId 
        ? { _id: { $gt: lastId } }
        : {};
      
      const orders = await Order.find(query)
        .sort({ _id: 1 })
        .limit(batchSize);
      
      if (orders.length === 0) break;
      
      for (const order of orders) {
        try {
          await CourierScore.updateFromOrder(order);
          processed++;
        } catch (error) {
          console.error(`Failed to sync order ${order._id}:`, error.message);
        }
        lastId = order._id;
      }
      
      console.log(`Processed ${processed} orders...`);
    }
    
    return processed;
  }
}

module.exports = OrderSyncService;