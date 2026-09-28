// const mongoose = require('mongoose');

// const incompleteOrderSchema = new mongoose.Schema({
//   // User information
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     sparse: true,
//     index: true
//   },
//   sessionId: {
//     type: String,
//     sparse: true,
//     index: true
//   },

//   // Customer information (partial or complete)
//   customerInfo: {
//     fullName: { type: String, default: '' },
//     email: { type: String, default: '' },
//     phone: { type: String, default: '' },
//     division: { type: String, default: '' },
//     address: { type: String, default: '' },
//     city: { type: String, default: '' },
//     zone: { type: String, default: '' },
//     area: { type: String, default: '' },
//     zipCode: { type: String, default: '' },
//     country: { type: String, default: 'Bangladesh' },
//     note: { type: String, default: '' }
//   },

//   // Cart items
//   items: [{
//     productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//     productName: String,
//     productSlug: String,
//     image: String,
//     regularPrice: Number,
//     discountPrice: Number,
//     quantity: Number,
//     unit: String,
//     selectedColor: String,
//     colors: [{
//       color: String,
//       quantity: Number,
//       price: Number
//     }]
//   }],

//   // Pricing
//   subtotal: { type: Number, default: 0 },
//   shippingCost: { type: Number, default: 0 },
//   discount: { type: Number, default: 0 },
//   total: { type: Number, default: 0 },

//   // Payment method selected
//   paymentMethod: { 
//     type: String, 
//     enum: ['cod', 'online', 'bkash', 'nagad', 'rocket'],
//     default: 'cod' 
//   },

//   // Device info
//   deviceInfo: {
//     ipAddress: String,
//     userAgent: String,
//     deviceType: String,
//     browser: String,
//     os: String,
//     platform: String,
//     screenResolution: String,
//     timezone: String,
//     language: String,
//     referrer: String,
//     connectionType: String
//   },

//   // Abandoned checkout data
//   checkoutStep: {
//     type: String,
//     enum: ['cart', 'information', 'shipping', 'payment', 'placed'],
//     default: 'information'
//   },

//   // When user started checkout
//   startedAt: {
//     type: Date,
//     default: Date.now
//   },

//   // When user last interacted
//   lastInteractionAt: {
//     type: Date,
//     default: Date.now
//   },

//   // If user completed the order (reference to actual order)
//   completedOrderId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Order',
//     default: null
//   },

//   // If order was completed
//   isCompleted: {
//     type: Boolean,
//     default: false
//   },

//   // Recovery attempts
//   recoveryAttempts: [{
//     type: {
//       type: String,
//       enum: ['email', 'sms', 'whatsapp', 'manual']
//     },
//     sentAt: { type: Date, default: Date.now },
//     note: { type: String, default: '' }
//   }],

//   // Metadata
//   metadata: {
//     type: mongoose.Schema.Types.Mixed,
//     default: {}
//   }

// }, {
//   timestamps: true
// });

// // Indexes for better query performance
// incompleteOrderSchema.index({ userId: 1, createdAt: -1 });
// incompleteOrderSchema.index({ sessionId: 1, createdAt: -1 });
// incompleteOrderSchema.index({ 'customerInfo.phone': 1 });
// incompleteOrderSchema.index({ isCompleted: 1 });
// incompleteOrderSchema.index({ lastInteractionAt: -1 });
// incompleteOrderSchema.index({ startedAt: -1 });

// module.exports = mongoose.models.IncompleteOrder || mongoose.model('IncompleteOrder', incompleteOrderSchema);


const mongoose = require('mongoose');

const incompleteOrderSchema = new mongoose.Schema({
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    index: true
  },
  sessionId: {
    type: String,
    sparse: true,
    index: true
  },

  // Customer information (partial or complete)
  customerInfo: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    division: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    zone: { type: String, default: '' },
    area: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'Bangladesh' },
    note: { type: String, default: '' }
  },

  // Cart items
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    productSlug: String,
    image: String,
    regularPrice: Number,
    discountPrice: Number,
    quantity: Number,
    unit: String,
    selectedColor: String,
    colors: [{
      color: String,
      quantity: Number,
      price: Number
    }],

    // ========== VARIANT / SUB-VARIANT FIELDS ==========
    variantId: { type: String, default: null },
    variantName: { type: String, default: null },
    variantType: { type: String, default: null },
    subVariantId: { type: String, default: null },
    subVariantName: { type: String, default: null },
    variantRegularPrice: { type: Number, default: 0 },
    variantDiscountPrice: { type: Number, default: 0 },
    variantImage: { type: String, default: '' },
    isVariant: { type: Boolean, default: false },
    isSubVariant: { type: Boolean, default: false },
    isBaseProduct: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 }
    // ===================================================
  }],

  // Pricing
  subtotal: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  // Payment method selected
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'bkash', 'nagad', 'rocket'],
    default: 'cod'
  },

  // Device info
  deviceInfo: {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    browser: String,
    os: String,
    platform: String,
    screenResolution: String,
    timezone: String,
    language: String,
    referrer: String,
    connectionType: String
  },

  // Abandoned checkout data
  checkoutStep: {
    type: String,
    enum: ['cart', 'information', 'shipping', 'payment', 'placed'],
    default: 'information'
  },

  // When user started checkout
  startedAt: {
    type: Date,
    default: Date.now
  },

  // When user last interacted
  lastInteractionAt: {
    type: Date,
    default: Date.now
  },

  // If user completed the order (reference to actual order)
  completedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },

  // If order was completed
  isCompleted: {
    type: Boolean,
    default: false
  },

  // Recovery attempts
  recoveryAttempts: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'manual']
    },
    sentAt: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],

  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }

}, {
  timestamps: true
});

// Indexes for better query performance
incompleteOrderSchema.index({ userId: 1, createdAt: -1 });
incompleteOrderSchema.index({ sessionId: 1, createdAt: -1 });
incompleteOrderSchema.index({ 'customerInfo.phone': 1 });
incompleteOrderSchema.index({ isCompleted: 1 });
incompleteOrderSchema.index({ lastInteractionAt: -1 });
incompleteOrderSchema.index({ startedAt: -1 });

module.exports = mongoose.models.IncompleteOrder || mongoose.model('IncompleteOrder', incompleteOrderSchema);