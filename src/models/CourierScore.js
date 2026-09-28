// models/CourierScore.js
const mongoose = require('mongoose');

const courierScoreSchema = new mongoose.Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    index: true,
    trim: true
  },
  customerName: { 
    type: String, 
    default: '' 
  },
  email: { 
    type: String, 
    default: '' 
  },
  courierStats: [{
    courierService: { 
      type: String, 
      enum: ['pathao', 'steadfast', 'redx'], 
      required: true 
    },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    returnedOrders: { type: Number, default: 0 },
    pendingDeliveries: { type: Number, default: 0 },
    inTransit: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null },
    firstOrderDate: { type: Date, default: null }
  }],
  overallStats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    returnedOrders: { type: Number, default: 0 },
    lastOrderDate: { type: Date, default: null },
    firstOrderDate: { type: Date, default: null }
  },
  orderHistory: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: { type: String },
    courierService: { type: String, enum: ['pathao', 'steadfast', 'redx'] },
    courierOrderId: { type: String },
    trackingNumber: { type: String },
    orderStatus: { type: String },
    deliveryStatus: { type: String },
    totalAmount: { type: Number, default: 0 },
    orderDate: { type: Date, default: Date.now },
    deliveredDate: { type: Date, default: null },
    paymentStatus: { type: String },
    paymentMethod: { type: String },
    items: [{
      productName: String,
      quantity: Number,
      price: Number
    }]
  }],
  lastTrackingUpdate: { type: Date, default: Date.now },
  score: { type: Number, default: 0, min: 0, max: 100 },
  trustLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'very_high'],
    default: 'medium'
  }
}, { timestamps: true });

// Virtuals
courierScoreSchema.virtual('successRate').get(function() {
  if (this.overallStats.totalOrders === 0) return 0;
  return Math.round((this.overallStats.successfulDeliveries / this.overallStats.totalOrders) * 100);
});

// Methods
courierScoreSchema.methods.calculateScore = function() {
  const stats = this.overallStats;
  let score = 0;
  
  // Order Volume (max 30 points)
  const orderVolume = stats.totalOrders;
  if (orderVolume >= 100) score += 30;
  else if (orderVolume >= 50) score += 25;
  else if (orderVolume >= 20) score += 20;
  else if (orderVolume >= 10) score += 15;
  else if (orderVolume >= 5) score += 10;
  else if (orderVolume >= 1) score += 5;
  
  // Success Rate (max 30 points)
  const successRate = this.successRate;
  if (successRate >= 95) score += 30;
  else if (successRate >= 85) score += 25;
  else if (successRate >= 75) score += 20;
  else if (successRate >= 60) score += 15;
  else if (successRate >= 50) score += 10;
  else if (successRate >= 40) score += 5;
  
  // Total Spent (max 20 points)
  const totalSpent = stats.totalSpent;
  if (totalSpent >= 50000) score += 20;
  else if (totalSpent >= 25000) score += 15;
  else if (totalSpent >= 10000) score += 10;
  else if (totalSpent >= 5000) score += 5;
  
  // Recent Activity (max 10 points)
  const lastOrderDate = stats.lastOrderDate;
  if (lastOrderDate) {
    const daysSinceLastOrder = Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastOrder <= 7) score += 10;
    else if (daysSinceLastOrder <= 30) score += 7;
    else if (daysSinceLastOrder <= 90) score += 5;
    else if (daysSinceLastOrder <= 180) score += 2;
  }
  
  // Return/Failed Penalty (max -10 points)
  const returnRate = stats.totalOrders > 0 ? (stats.returnedOrders / stats.totalOrders) * 100 : 0;
  const failedRate = stats.totalOrders > 0 ? (stats.failedDeliveries / stats.totalOrders) * 100 : 0;
  
  if (returnRate > 30 || failedRate > 30) score -= 10;
  else if (returnRate > 20 || failedRate > 20) score -= 5;
  else if (returnRate > 10 || failedRate > 10) score -= 2;
  
  this.score = Math.max(0, Math.min(100, score));
  
  if (this.score >= 80) this.trustLevel = 'very_high';
  else if (this.score >= 60) this.trustLevel = 'high';
  else if (this.score >= 40) this.trustLevel = 'medium';
  else this.trustLevel = 'low';
  
  return this.score;
};

// Static methods
courierScoreSchema.statics.findOrCreate = async function(phoneNumber, customerInfo = {}) {
  let score = await this.findOne({ phoneNumber });
  if (!score) {
    score = new this({
      phoneNumber,
      customerName: customerInfo.fullName || '',
      email: customerInfo.email || '',
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
    await score.save();
  }
  return score;
};

courierScoreSchema.statics.updateFromOrder = async function(order) {
  const phoneNumber = order.customerInfo?.phone;
  if (!phoneNumber) return null;
  
  let score = await this.findOne({ phoneNumber });
  if (!score) {
    score = new this({
      phoneNumber,
      customerName: order.customerInfo?.fullName || '',
      email: order.customerInfo?.email || '',
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
  
  // Update customer info
  if (order.customerInfo?.fullName) {
    score.customerName = order.customerInfo.fullName;
  }
  if (order.customerInfo?.email) {
    score.email = order.customerInfo.email;
  }
  
  const courierService = order.deliveryService?.courierSlug || order.courierService;
  if (!courierService) return score;
  
  let courierStat = score.courierStats.find(s => s.courierService === courierService);
  if (!courierStat) {
    courierStat = {
      courierService,
      totalOrders: 0,
      totalSpent: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      returnedOrders: 0,
      pendingDeliveries: 0,
      inTransit: 0,
      lastOrderDate: null,
      firstOrderDate: null
    };
    score.courierStats.push(courierStat);
  }
  
  const deliveryStatus = order.deliveryService?.deliveryStatus || 'pending';
  const orderStatus = order.orderStatus;
  
  courierStat.totalOrders += 1;
  courierStat.totalSpent += order.total || 0;
  
  if (orderStatus === 'delivered' || deliveryStatus === 'delivered') {
    courierStat.successfulDeliveries += 1;
  } else if (orderStatus === 'cancelled' || deliveryStatus === 'cancelled') {
    courierStat.failedDeliveries += 1;
  } else if (orderStatus === 'returned' || deliveryStatus === 'returned') {
    courierStat.returnedOrders += 1;
  } else if (['processing', 'picked_up', 'in_transit'].includes(deliveryStatus)) {
    courierStat.inTransit += 1;
  } else if (deliveryStatus === 'pending' || orderStatus === 'placed') {
    courierStat.pendingDeliveries += 1;
  }
  
  const orderDate = order.createdAt || order.orderDate || new Date();
  if (!courierStat.firstOrderDate || new Date(orderDate) < new Date(courierStat.firstOrderDate)) {
    courierStat.firstOrderDate = orderDate;
  }
  if (!courierStat.lastOrderDate || new Date(orderDate) > new Date(courierStat.lastOrderDate)) {
    courierStat.lastOrderDate = orderDate;
  }
  
  score.overallStats.totalOrders += 1;
  score.overallStats.totalSpent += order.total || 0;
  
  if (orderStatus === 'delivered' || deliveryStatus === 'delivered') {
    score.overallStats.successfulDeliveries += 1;
  } else if (orderStatus === 'cancelled' || deliveryStatus === 'cancelled') {
    score.overallStats.failedDeliveries += 1;
  } else if (orderStatus === 'returned' || deliveryStatus === 'returned') {
    score.overallStats.returnedOrders += 1;
  }
  
  if (!score.overallStats.firstOrderDate || new Date(orderDate) < new Date(score.overallStats.firstOrderDate)) {
    score.overallStats.firstOrderDate = orderDate;
  }
  if (!score.overallStats.lastOrderDate || new Date(orderDate) > new Date(score.overallStats.lastOrderDate)) {
    score.overallStats.lastOrderDate = orderDate;
  }
  
  const existingOrderIndex = score.orderHistory.findIndex(
    h => h.orderId && h.orderId.toString() === order._id.toString()
  );
  
  const orderHistoryEntry = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    courierService,
    courierOrderId: order.deliveryService?.courierOrderId || '',
    trackingNumber: order.deliveryService?.trackingNumber || '',
    orderStatus: order.orderStatus,
    deliveryStatus: order.deliveryService?.deliveryStatus || 'pending',
    totalAmount: order.total || 0,
    orderDate: order.orderDate || order.createdAt || new Date(),
    deliveredDate: order.deliveredAt || order.deliveryService?.actualDeliveryDate || null,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    items: order.items.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.discountPrice || item.regularPrice
    }))
  };
  
  if (existingOrderIndex !== -1) {
    score.orderHistory[existingOrderIndex] = orderHistoryEntry;
  } else {
    score.orderHistory.push(orderHistoryEntry);
  }
  
  score.calculateScore();
  score.lastTrackingUpdate = new Date();
  
  await score.save();
  return score;
};

module.exports = mongoose.models.CourierScore || mongoose.model('CourierScore', courierScoreSchema);