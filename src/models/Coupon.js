

const mongoose = require('mongoose');

// Color Theme Schema
const colorThemeSchema = new mongoose.Schema({
  primary: { type: String, default: '#4A8A90' },
  secondary: { type: String, default: '#D4EDEE' },
  accent: { type: String, default: '#FFB6C1' },
  text: { type: String, default: '#2D3A5C' },
  bg: { type: String, default: '#FFF9F0' }
});

// Usage Record Schema
const usageRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  usedAt: { type: Date, default: Date.now },
  discountAmount: { type: Number, default: 0 }
});

// Simplified Coupon Schema
const couponSchema = new mongoose.Schema({
  // Display Settings
  title: {
    type: String,
    required: [true, 'Coupon title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  spendThreshold: {
    type: String,
    trim: true,
    default: ''
  },
  highlightText: {
    type: String,
    required: [true, 'Highlight text is required'],
    trim: true
  },
  colorTheme: {
    type: colorThemeSchema,
    default: () => ({})
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },

  // Coupon Settings
  couponCode: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true,
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: [0, 'Discount value cannot be negative']
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxTotalUses: {
    type: Number,
    default: null
  },
  maxUsesPerUser: {
    type: Number,
    default: 1
  },
  expiresAt: {
    type: Date,
    default: null
  },

  // Additional Settings
  isActive: {
    type: Boolean,
    default: true
  },
  showOnHomepage: {
    type: Boolean,
    default: false
  },
  isFirstPurchaseOnly: {
    type: Boolean,
    default: false
  },
  stackable: {
    type: Boolean,
    default: false
  },
  autoApply: {
    type: Boolean,
    default: false
  },

  // Tracking
  totalUsedCount: {
    type: Number,
    default: 0
  },
  usageRecords: [usageRecordSchema],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ couponCode: 1 });
couponSchema.index({ isActive: 1, expiresAt: 1 });
couponSchema.index({ showOnHomepage: 1 });

// Virtual: Check if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual: Check if coupon has reached max total uses
couponSchema.virtual('isMaxUsesReached').get(function() {
  if (!this.maxTotalUses) return false;
  return this.totalUsedCount >= this.maxTotalUses;
});

// Virtual: Check if coupon is usable
couponSchema.virtual('isUsable').get(function() {
  return this.isActive && !this.isExpired;
});

// ✅ ADD THIS METHOD - Check if user can use this coupon
couponSchema.methods.canUserUse = async function(userId) {
  if (!userId) return true; // Guest users can use coupons (but tracking is limited)
  
  // Check first purchase only
  if (this.isFirstPurchaseOnly) {
    try {
      const Order = mongoose.model('Order');
      const userOrders = await Order.countDocuments({ 
        userId: userId,
        paymentStatus: 'paid'
      });
      if (userOrders > 0) return false;
    } catch (err) {
      console.log('Order model not available, skipping first purchase check');
    }
  }
  
  // Check per-user usage limit
  const userUsageCount = this.usageRecords.filter(
    record => record.userId && record.userId.toString() === userId.toString()
  ).length;
  
  if (userUsageCount >= (this.maxUsesPerUser || 1)) return false;
  
  return true;
};

// Method: Calculate discount amount
couponSchema.methods.calculateDiscount = function(cartSubtotal) {
  if (cartSubtotal < this.minimumOrderAmount) {
    return { 
      discount: 0, 
      isValid: false, 
      reason: `Minimum order amount is ৳${this.minimumOrderAmount}` 
    };
  }
  
  if (this.discountType === 'percentage') {
    const discount = (cartSubtotal * this.discountValue) / 100;
    return { discount: Math.min(discount, cartSubtotal), isValid: true };
  } 
  else if (this.discountType === 'fixed') {
    const discount = Math.min(this.discountValue, cartSubtotal);
    return { discount, isValid: true };
  } 
  else if (this.discountType === 'free_shipping') {
    return { discount: 0, isValid: true, freeShipping: true };
  }
  
  return { discount: 0, isValid: false, reason: 'Invalid discount type' };
};

// Pre-save middleware - no parameters
couponSchema.pre('save', function() {
  // No next() needed
});

// Export model (prevent overwrite)
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
