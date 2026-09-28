// utils/courierScoreService.js
const CourierScore = require('../models/CourierScore');
const Order = require('../models/Order');

class CourierScoreService {
  
  static validatePhoneNumber(phone) {
    const cleanPhone = this.cleanPhoneNumber(phone);
    const phoneRegex = /^01[3-9]\d{8}$/;
    return phoneRegex.test(cleanPhone);
  }
  
  static cleanPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+880')) {
      cleaned = cleaned.substring(4);
    } else if (cleaned.startsWith('880')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('1')) {
      cleaned = '0' + cleaned;
    }
    return cleaned;
  }
  
  static async getCourierScore(phoneNumber) {
    if (!this.validatePhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format. Please use a valid Bangladesh phone number.');
    }
    
    const cleanPhone = this.cleanPhoneNumber(phoneNumber);
    let score = await CourierScore.findOne({ phoneNumber: cleanPhone });
    
    if (!score) {
      score = await this.buildFromExistingOrders(cleanPhone);
    }
    
    return score;
  }
  
  static async buildFromExistingOrders(phoneNumber) {
    const orders = await Order.find({ 
      'customerInfo.phone': phoneNumber 
    }).sort({ createdAt: -1 });
    
    if (orders.length === 0) {
      return await CourierScore.findOrCreate(phoneNumber);
    }
    
    let score = await CourierScore.findOne({ phoneNumber });
    if (!score) {
      score = new CourierScore({
        phoneNumber,
        customerName: orders[0]?.customerInfo?.fullName || '',
        email: orders[0]?.customerInfo?.email || '',
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
    
    for (const order of orders) {
      await CourierScore.updateFromOrder(order);
    }
    
    return await CourierScore.findOne({ phoneNumber });
  }
  
  static async getOrderHistory(phoneNumber, options = {}) {
    const cleanPhone = this.cleanPhoneNumber(phoneNumber);
    const { page = 1, limit = 20, sort = '-orderDate' } = options;
    const skip = (page - 1) * limit;
    
    const score = await CourierScore.findOne({ phoneNumber: cleanPhone });
    
    if (!score) {
      return {
        orders: [],
        pagination: { total: 0, page, pages: 0, limit }
      };
    }
    
    let orderHistory = [...score.orderHistory];
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    
    orderHistory.sort((a, b) => {
      const aVal = new Date(a[sortField] || a.orderDate);
      const bVal = new Date(b[sortField] || b.orderDate);
      return sortOrder * (aVal - bVal);
    });
    
    const total = orderHistory.length;
    const pages = Math.ceil(total / limit);
    const paginatedOrders = orderHistory.slice(skip, skip + limit);
    
    return {
      orders: paginatedOrders,
      pagination: { total, page, pages, limit }
    };
  }
  
  static async getCourierWiseStats(phoneNumber) {
    const cleanPhone = this.cleanPhoneNumber(phoneNumber);
    const score = await CourierScore.findOne({ phoneNumber: cleanPhone });
    
    if (!score) return [];
    
    return score.courierStats.map(stat => ({
      courierService: stat.courierService,
      totalOrders: stat.totalOrders,
      totalSpent: stat.totalSpent,
      successfulDeliveries: stat.successfulDeliveries,
      failedDeliveries: stat.failedDeliveries,
      returnedOrders: stat.returnedOrders,
      pendingDeliveries: stat.pendingDeliveries,
      inTransit: stat.inTransit,
      successRate: stat.totalOrders > 0 
        ? Math.round((stat.successfulDeliveries / stat.totalOrders) * 100) 
        : 0,
      lastOrderDate: stat.lastOrderDate,
      firstOrderDate: stat.firstOrderDate
    }));
  }
  
  static async recalculateAllScores() {
    const allScores = await CourierScore.find({});
    let updatedCount = 0;
    
    for (const score of allScores) {
      const orders = await Order.find({
        'customerInfo.phone': score.phoneNumber
      });
      
      if (orders.length > 0) {
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
        updatedCount++;
      }
    }
    
    return updatedCount;
  }
  
  static async getDashboardSummary() {
    const [
      totalCustomers,
      totalOrders,
      totalSpent,
      highTrust,
      mediumTrust,
      lowTrust,
      avgScore
    ] = await Promise.all([
      CourierScore.countDocuments(),
      CourierScore.aggregate([
        { $group: { _id: null, total: { $sum: '$overallStats.totalOrders' } } }
      ]),
      CourierScore.aggregate([
        { $group: { _id: null, total: { $sum: '$overallStats.totalSpent' } } }
      ]),
      CourierScore.countDocuments({ trustLevel: 'very_high' }),
      CourierScore.countDocuments({ trustLevel: 'high' }),
      CourierScore.countDocuments({ trustLevel: 'low' }),
      CourierScore.aggregate([
        { $group: { _id: null, avg: { $avg: '$score' } } }
      ])
    ]);
    
    const courierDistribution = await CourierScore.aggregate([
      { $unwind: '$courierStats' },
      { $group: {
          _id: '$courierStats.courierService',
          totalOrders: { $sum: '$courierStats.totalOrders' },
          totalCustomers: { $sum: 1 },
          avgSpent: { $avg: '$courierStats.totalSpent' }
        }
      }
    ]);
    
    return {
      totalCustomers,
      totalOrders: totalOrders[0]?.total || 0,
      totalSpent: totalSpent[0]?.total || 0,
      trustLevels: {
        veryHigh: highTrust,
        high: mediumTrust,
        low: lowTrust
      },
      averageScore: Math.round(avgScore[0]?.avg || 0),
      courierDistribution
    };
  }
}

module.exports = CourierScoreService;