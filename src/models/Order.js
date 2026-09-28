
// module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
const mongoose = require('mongoose');

// ========== SUB-VARIANT SCHEMA ==========
const subVariantSchema = new mongoose.Schema({
  subVariantId: {
    type: String,
    default: null
  },
  subVariantName: {
    type: String,
    default: null
  },
  subVariantRegularPrice: {
    type: Number,
    default: 0
  },
  subVariantDiscountPrice: {
    type: Number,
    default: 0
  },
  selectedColor: {
    type: String,
    default: null
  },
  quantity: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: null
  }
}, { _id: true });

// ========== VARIANT SCHEMA ==========
const variantDetailSchema = new mongoose.Schema({
  variantId: {
    type: String,
    default: null
  },
  variantName: {
    type: String,
    default: null
  },
  variantType: {
    type: String,
    default: null
  },
  variantRegularPrice: {
    type: Number,
    default: 0
  },
  variantDiscountPrice: {
    type: Number,
    default: 0
  },
  selectedColor: {
    type: String,
    default: null
  },
  quantity: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: null
  },
  subVariants: [subVariantSchema]
}, { _id: true });

// ========== ORDER ITEM SCHEMA - CLEAN VERSION ==========
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productSlug: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  regularPrice: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  costPerItem: {
    type: Number,
    default: 0
  },
  buyingPrice: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'pcs'
  },
  selectedColor: {
    type: String,
    default: null
  },
  colors: [{
    color: String,
    quantity: Number,
    price: Number
  }],

  // ============================================================
  // ✅ NESTED STRUCTURE FOR VARIANTS AND SUB-VARIANTS
  // ============================================================
  variantDetails: [variantDetailSchema]
});

// ========== CUSTOMER INFO SCHEMA ==========
const customerInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  zone: {
    type: String,
    required: true
  },
  area: {
    type: String,
    default: ''
  },
  zipCode: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'Bangladesh'
  },
  note: {
    type: String,
    default: ''
  }
});

// ========== ORDER STATUS HISTORY SCHEMA ==========
const orderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['placed', 'follow_up', 'accepted', 'approved', 'ready_to_ship', 'courier_assigned', 'rejected', 'cancelled', 'reminder', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'refunded', 'failed', 'returned', 'partial_delivery', 'hold'],
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedByRole: {
    type: String,
    enum: ['user', 'super_admin', 'admin', 'moderator', 'system', 'courier', 'call_center'],
    default: 'system'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// ========== DELIVERY STATUS HISTORY SCHEMA ==========
const deliveryStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// ========== DELIVERY SERVICE SCHEMA ==========
const deliveryServiceSchema = new mongoose.Schema({
  courierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courier'
  },
  courierName: {
    type: String,
    default: ''
  },
  courierSlug: {
    type: String,
    default: ''
  },
  trackingNumber: {
    type: String,
    default: null
  },
  trackingUrl: {
    type: String,
    default: ''
  },
  courierOrderId: {
    type: String,
    default: ''
  },
  labelUrl: {
    type: String,
    default: ''
  },
  invoiceUrl: {
    type: String,
    default: ''
  },
  deliveryStatus: {
    type: String,
    default: 'pending'
  },
  deliveryStatusHistory: [deliveryStatusHistorySchema],
  deliveryCharge: {
    type: Number,
    default: 0
  },
  codCharge: {
    type: Number,
    default: 0
  },
  totalDeliveryCharge: {
    type: Number,
    default: 0
  },
  deliveryNote: {
    type: String,
    default: ''
  },
  weight: {
    type: Number,
    default: 0
  },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  estimatedDeliveryDate: {
    type: Date,
    default: null
  },
  actualDeliveryDate: {
    type: Date,
    default: null
  },
  pickedUpDate: {
    type: Date,
    default: null
  },
  courierResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  webhookData: [{
    courier: String,
    timestamp: Date,
    rawData: mongoose.Schema.Types.Mixed,
    rawStatus: String,
    status: String,
    message: String
  }]
}, { _id: false });

// ========== DEVICE INFO SCHEMA ==========
const deviceInfoSchema = new mongoose.Schema({
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
  deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
  browser: { type: String, default: null },
  browserVersion: { type: String, default: null },
  os: { type: String, default: null },
  osVersion: { type: String, default: null },
  platform: { type: String, default: null },
  screenResolution: { type: String, default: null },
  viewportSize: { type: String, default: null },
  colorDepth: { type: Number, default: null },
  pixelRatio: { type: Number, default: null },
  timezone: { type: String, default: null },
  language: { type: String, default: null },
  referrer: { type: String, default: null },
  connectionType: { type: String, default: null },
  connectionSpeed: { type: String, default: null },
  doNotTrack: { type: String, default: null },
  vendor: { type: String, default: null }
}, { _id: false });

// ============================================================
// ✅ RETURN PROCESSING SUB-SCHEMA (per delivery item)
// ============================================================
const returnProcessingSchema = new mongoose.Schema({
  // Total returned quantity (mirrors deliveryItem.returnedQuantity for convenience)
  returnedQuantity: { type: Number, default: 0, min: 0 },

  // How many units have been marked as damaged
  damagedQuantity: { type: Number, default: 0, min: 0 },

  // How many units have been restocked (added back to product/variant stock)
  restockedQuantity: { type: Number, default: 0, min: 0 },

  // How many units are still pending processing
  // (auto-computed as returnedQuantity - damagedQuantity - restockedQuantity)
  pendingQuantity: { type: Number, default: 0, min: 0 },

  // Optional note from the person processing returns
  note: { type: String, default: '' },

  // Whether this whole line is fully processed
  isFullyProcessed: { type: Boolean, default: false },

  // Who processed & when
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  }
}, { _id: false });

// ========== ITEM DELIVERY TRACKING SCHEMA ==========
const itemDeliverySchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  variantId: {
    type: String,
    default: null
  },
  variantName: {
    type: String,
    default: null
  },
  subVariantId: {
    type: String,
    default: null
  },
  subVariantName: {
    type: String,
    default: null
  },
  selectedColor: {
    type: String,
    default: null
  },
  deliveredQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  returnedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  orderedQuantity: {
    type: Number,
    default: 0
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  // Unit price at time of order (used to compute returned amount)
  unitPrice: {
    type: Number,
    default: 0
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered', 'returned', 'partial'],
    default: 'pending'
  },
  note: {
    type: String,
    default: ''
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  markedAt: {
    type: Date,
    default: null
  },

  // ✅ NEW: Return processing tracking
  returnProcessing: {
    type: returnProcessingSchema,
    default: () => ({})
  }
}, { _id: true });

// ========== MAIN ORDER SCHEMA ==========
const orderSchema = new mongoose.Schema({
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
  items: [orderItemSchema],
  customerInfo: customerInfoSchema,
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'bkash', 'nagad', 'rocket', 'bank_transfer'],
    required: true,
    default: 'cod'
  },
  orderPlatform: {
    type: String,
    enum: ['website', 'facebook', 'instagram', 'showroom'],
    default: 'website'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundableAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  returnedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  transactionId: {
    type: String,
    default: null,
    index: true
  },
  paymentSession: {
    sessionKey: String,
    gatewayUrl: String,
    initiatedAt: Date
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'follow_up', 'accepted', 'approved', 'ready_to_ship', 'courier_assigned', 'rejected', 'cancelled', 'reminder', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'refunded', 'returned', 'failed', 'partial_delivery', 'hold'],
    default: 'placed'
  },
  statusHistory: [orderStatusHistorySchema],
  deliveryService: deliveryServiceSchema,
  deliveryItems: [itemDeliverySchema],
  trackingNumber: {
    type: String,
    default: null
  },
  deliveryNote: {
    type: String,
    default: ''
  },
  deviceInfo: deviceInfoSchema,
  orderNumber: {
    type: String,
    unique: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  placedAt: {
    type: Date,
    default: Date.now
  },
  followUpAt: {
    type: Date,
    default: null
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  processingAt: {
    type: Date,
    default: null
  },
  shippedAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  reminderAt: {
    type: Date,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  returnedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  restrictionViolation: {
    type: String,
    enum: ['ip_blocked', 'phone_blocked', 'email_blocked', 'ip_time_interval', 'phone_time_interval', 'none'],
    default: 'none'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========== INDEXES ==========
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderPlatform: 1 });
orderSchema.index({ 'deliveryService.trackingNumber': 1 });
orderSchema.index({ 'deliveryService.courierOrderId': 1 });
orderSchema.index({ 'customerInfo.phone': 1 });
orderSchema.index({ placedAt: -1 });
// ✅ NEW: index for quick querying of returnable orders
orderSchema.index({ orderStatus: 1, updatedAt: -1 });

// ========== PRE-SAVE HOOK ==========
orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    try {
      const Order = mongoose.model('Order');
      const lastOrder = await Order.findOne({
        orderNumber: { $regex: /^NC\d{4,}$/ }
      })
        .sort({ orderNumber: -1 })
        .lean();

      let nextSequence = 1001;

      if (lastOrder && lastOrder.orderNumber) {
        const match = lastOrder.orderNumber.match(/^NC(\d+)$/);
        if (match) {
          const lastSeq = parseInt(match[1], 10);
          if (lastSeq >= 1001 && lastSeq < 100000) {
            nextSequence = lastSeq + 1;
          }
        }
      }

      let newOrderNumber = `NC${nextSequence}`;
      let attempts = 0;
      while (attempts < 5) {
        const existing = await Order.findOne({ orderNumber: newOrderNumber }).lean();
        if (!existing) break;
        nextSequence += 1;
        newOrderNumber = `NC${nextSequence}`;
        attempts += 1;
      }
      this.orderNumber = newOrderNumber;
      console.log(`✅ Generated Order Number: ${this.orderNumber}`);
    } catch (error) {
      console.error('Error generating order number:', error);
      const timestamp = Date.now().toString().slice(-6);
      this.orderNumber = `NC${timestamp}`;
    }
  }

  if (this.isNew && this.orderStatus === 'placed') {
    this.placedAt = new Date();
  }

  if (this.isNew && this.orderStatus) {
    this.addStatusHistory(
      this.orderStatus,
      'Order placed successfully',
      this.userId || null,
      'system'
    );
  }

  if (this.isModified('orderStatus')) {
    const previousStatus = this._originalStatus || this.orderStatus;
    if (previousStatus !== this.orderStatus) {
      this.addStatusHistory(
        this.orderStatus,
        `Status changed from ${previousStatus} to ${this.orderStatus}`,
        this.userId || null,
        'system'
      );
    }
  }

  this._originalStatus = this.orderStatus;
});

// ========== METHODS ==========

orderSchema.methods.addStatusHistory = function (status, note = '', updatedBy = null, updatedByRole = 'system') {
  if (!this.statusHistory) this.statusHistory = [];

  const lastEntry = this.statusHistory[this.statusHistory.length - 1];
  if (lastEntry && lastEntry.status === status && lastEntry.note === note) return this;

  let validRole = updatedByRole || 'system';
  if (validRole === 'call_center_agent') validRole = 'call_center';

  const validRoles = ['user', 'admin', 'moderator', 'super_admin', 'system', 'courier', 'call_center'];
  if (!validRoles.includes(validRole)) validRole = 'system';

  this.statusHistory.push({
    status,
    note: note || `Status: ${status}`,
    updatedBy,
    updatedByRole: validRole,
    timestamp: new Date()
  });

  return this;
};

orderSchema.methods.updateOrderStatus = function (newStatus, note = '', updatedBy = null, updatedByRole = 'system') {
  const oldStatus = this.orderStatus;
  if (oldStatus === newStatus) return this;

  this.orderStatus = newStatus;

  const timestampMap = {
    'placed': 'placedAt',
    'follow_up': 'followUpAt',
    'accepted': 'acceptedAt',
    'approved': 'approvedAt',
    'ready_to_ship': 'shippedAt',
    'courier_assigned': 'shippedAt',
    'rejected': 'cancelledAt',
    'cancelled': 'cancelledAt',
    'reminder': 'reminderAt',
    'delivered': 'deliveredAt',
    'returned': 'returnedAt'
  };

  if (timestampMap[newStatus]) {
    this[timestampMap[newStatus]] = new Date();
  }

  this.addStatusHistory(newStatus, note || `Status changed from ${oldStatus} to ${newStatus}`, updatedBy, updatedByRole);
  return this;
};

orderSchema.methods.updateDeliveryStatus = function (status, message = '', location = '') {
  if (!this.deliveryService) this.deliveryService = {};

  const oldStatus = this.deliveryService.deliveryStatus || 'pending';
  this.deliveryService.deliveryStatus = status;

  if (!this.deliveryService.deliveryStatusHistory) {
    this.deliveryService.deliveryStatusHistory = [];
  }

  this.deliveryService.deliveryStatusHistory.push({
    status,
    message: message || `Status updated to ${status}`,
    location: location || '',
    timestamp: new Date()
  });

  if (status === 'delivered') {
    this.orderStatus = 'delivered';
    this.deliveredAt = new Date();
    this.addStatusHistory('delivered', 'Order delivered by courier', null, 'courier');

    if (this.paymentMethod === 'cod' && this.paymentStatus !== 'paid') {
      this.paymentStatus = 'paid';
      this.paidAmount = this.total;
      if (!this.paymentDetails) this.paymentDetails = {};
      this.paymentDetails.paidAt = new Date();
      this.paymentDetails.paidBy = 'System (Auto-updated via webhook)';
    }
  }

  if (status === 'picked_up' && !this.deliveryService.pickedUpDate) {
    this.deliveryService.pickedUpDate = new Date();
  }

  if (status === 'delivered') {
    this.deliveryService.actualDeliveryDate = new Date();
  }

  return this;
};

orderSchema.methods.setDeliveryService = function (courierData) {
  this.deliveryService = {
    courierId: courierData.courierId || null,
    courierName: courierData.courierName || '',
    courierSlug: courierData.courierSlug || '',
    trackingNumber: courierData.trackingNumber || null,
    trackingUrl: courierData.trackingUrl || '',
    courierOrderId: courierData.courierOrderId || '',
    labelUrl: courierData.labelUrl || '',
    invoiceUrl: courierData.invoiceUrl || '',
    deliveryStatus: courierData.deliveryStatus || 'processing',
    deliveryCharge: courierData.deliveryCharge || 0,
    codCharge: courierData.codCharge || 0,
    totalDeliveryCharge: courierData.totalDeliveryCharge || 0,
    weight: courierData.weight || 0,
    dimensions: courierData.dimensions || { length: 0, width: 0, height: 0 },
    estimatedDeliveryDate: courierData.estimatedDeliveryDate || null,
    courierResponse: courierData.courierResponse || {},
    deliveryStatusHistory: [
      {
        status: 'processing',
        message: `Delivery order created with ${courierData.courierName}`,
        timestamp: new Date()
      }
    ]
  };

  this.trackingNumber = courierData.trackingNumber || null;
  return this;
};

// ============================================================
// ✅ Initialize delivery items from order items
// ============================================================
orderSchema.methods.initializeDeliveryItems = function () {
  if (this.deliveryItems && this.deliveryItems.length > 0) {
    return this.deliveryItems;
  }

  const deliveryItems = [];

  this.items.forEach((item) => {
    const itemId = item._id;

    const getUnitPrice = (variantReg, variantDisc, baseReg, baseDisc) => {
      if (variantDisc > 0) return variantDisc;
      if (variantReg > 0) return variantReg;
      if (baseDisc > 0) return baseDisc;
      return baseReg || 0;
    };

    // Case 1: Nested variantDetails
    if (item.variantDetails && item.variantDetails.length > 0) {
      item.variantDetails.forEach((variant) => {
        if (variant.subVariants && variant.subVariants.length > 0) {
          variant.subVariants.forEach((sub) => {
            const unitPrice = getUnitPrice(
              sub.subVariantRegularPrice, sub.subVariantDiscountPrice,
              variant.variantRegularPrice, variant.variantDiscountPrice
            ) || getUnitPrice(variant.variantRegularPrice, variant.variantDiscountPrice, item.regularPrice, item.discountPrice);

            deliveryItems.push({
              itemId,
              variantId: variant.variantId,
              variantName: variant.variantName,
              subVariantId: sub.subVariantId,
              subVariantName: sub.subVariantName,
              selectedColor: sub.selectedColor || variant.selectedColor || null,
              orderedQuantity: sub.quantity || 0,
              deliveredQuantity: 0,
              returnedQuantity: 0,
              pendingQuantity: sub.quantity || 0,
              productId: item.productId,
              productName: item.productName,
              image: sub.image || variant.image || item.image || '',
              unitPrice,
              deliveryStatus: 'pending',
              note: '',
              returnProcessing: {
                returnedQuantity: 0,
                damagedQuantity: 0,
                restockedQuantity: 0,
                pendingQuantity: 0,
                note: '',
                isFullyProcessed: true,
                processedBy: null,
                processedAt: null
              }
            });
          });
        } else {
          const unitPrice = getUnitPrice(
            variant.variantRegularPrice, variant.variantDiscountPrice,
            item.regularPrice, item.discountPrice
          );

          deliveryItems.push({
            itemId,
            variantId: variant.variantId,
            variantName: variant.variantName,
            subVariantId: null,
            subVariantName: null,
            selectedColor: variant.selectedColor || null,
            orderedQuantity: variant.quantity || 0,
            deliveredQuantity: 0,
            returnedQuantity: 0,
            pendingQuantity: variant.quantity || 0,
            productId: item.productId,
            productName: item.productName,
            image: variant.image || item.image || '',
            unitPrice,
            deliveryStatus: 'pending',
            note: '',
            returnProcessing: {
              returnedQuantity: 0,
              damagedQuantity: 0,
              restockedQuantity: 0,
              pendingQuantity: 0,
              note: '',
              isFullyProcessed: true,
              processedBy: null,
              processedAt: null
            }
          });
        }
      });
    }
    // Case 2: Flat variant item
    else if (item.variantId) {
      const unitPrice = getUnitPrice(
        item.variantRegularPrice, item.variantDiscountPrice,
        item.regularPrice, item.discountPrice
      );

      deliveryItems.push({
        itemId,
        variantId: item.variantId,
        variantName: item.variantName,
        subVariantId: item.subVariantId || null,
        subVariantName: item.subVariantName || null,
        selectedColor: item.selectedColor || null,
        orderedQuantity: item.quantity || 0,
        deliveredQuantity: 0,
        returnedQuantity: 0,
        pendingQuantity: item.quantity || 0,
        productId: item.productId,
        productName: item.productName,
        image: item.image || '',
        unitPrice,
        deliveryStatus: 'pending',
        note: '',
        returnProcessing: {
          returnedQuantity: 0,
          damagedQuantity: 0,
          restockedQuantity: 0,
          pendingQuantity: 0,
          note: '',
          isFullyProcessed: true,
          processedBy: null,
          processedAt: null
        }
      });
    }
    // Case 3: Color product with multiple colors
    else if (item.colors && item.colors.length > 0) {
      item.colors.forEach((color) => {
        const unitPrice = color.price || (item.discountPrice > 0 ? item.discountPrice : item.regularPrice) || 0;
        deliveryItems.push({
          itemId,
          variantId: null,
          variantName: null,
          subVariantId: null,
          subVariantName: null,
          selectedColor: color.color,
          orderedQuantity: color.quantity || 0,
          deliveredQuantity: 0,
          returnedQuantity: 0,
          pendingQuantity: color.quantity || 0,
          productId: item.productId,
          productName: item.productName,
          image: item.image || '',
          unitPrice,
          deliveryStatus: 'pending',
          note: '',
          returnProcessing: {
            returnedQuantity: 0,
            damagedQuantity: 0,
            restockedQuantity: 0,
            pendingQuantity: 0,
            note: '',
            isFullyProcessed: true,
            processedBy: null,
            processedAt: null
          }
        });
      });
    }
    // Case 4: Plain product
    else {
      const unitPrice = item.discountPrice > 0 ? item.discountPrice : item.regularPrice || 0;
      deliveryItems.push({
        itemId,
        variantId: null,
        variantName: null,
        subVariantId: null,
        subVariantName: null,
        selectedColor: item.selectedColor || null,
        orderedQuantity: item.quantity || 0,
        deliveredQuantity: 0,
        returnedQuantity: 0,
        pendingQuantity: item.quantity || 0,
        productId: item.productId,
        productName: item.productName,
        image: item.image || '',
        unitPrice,
        deliveryStatus: 'pending',
        note: '',
        returnProcessing: {
          returnedQuantity: 0,
          damagedQuantity: 0,
          restockedQuantity: 0,
          pendingQuantity: 0,
          note: '',
          isFullyProcessed: true,
          processedBy: null,
          processedAt: null
        }
      });
    }
  });

  this.deliveryItems = deliveryItems;
  return deliveryItems;
};

// ============================================================
// ✅ Recompute overall order status from deliveryItems
// ============================================================
orderSchema.methods.recomputeStatusFromDeliveryItems = function () {
  if (!this.deliveryItems || this.deliveryItems.length === 0) {
    return this.orderStatus;
  }

  let totalDelivered = 0;
  let totalReturned = 0;
  let totalPending = 0;
  let totalOrdered = 0;

  this.deliveryItems.forEach((di) => {
    totalDelivered += di.deliveredQuantity || 0;
    totalReturned += di.returnedQuantity || 0;
    totalPending += di.pendingQuantity || 0;
    totalOrdered += di.orderedQuantity || 0;
  });

  if (totalOrdered === 0) return this.orderStatus;

  if (totalPending === 0 && totalDelivered === totalOrdered) return 'delivered';
  if (totalPending === 0 && totalReturned === totalOrdered) return 'returned';
  if (totalPending === 0 && totalDelivered > 0 && totalReturned > 0) return 'partial_delivery';
  if (totalDelivered > 0 && totalPending > 0) return 'partial_delivery';
  if (totalReturned > 0 && totalPending > 0) return 'partial_delivery';
  if (totalPending === totalOrdered) return this.orderStatus;

  return 'partial_delivery';
};

// ============================================================
// ✅ Compute returned amount from deliveryItems
// ============================================================
orderSchema.methods.computeReturnedAmount = function () {
  if (!this.deliveryItems || this.deliveryItems.length === 0) return 0;

  let returnedAmount = 0;
  this.deliveryItems.forEach((di) => {
    const returnedQty = di.returnedQuantity || 0;
    const unitPrice = di.unitPrice || 0;
    returnedAmount += returnedQty * unitPrice;
  });

  return Math.round(returnedAmount * 100) / 100;
};

// ============================================================
// ✅ Compute delivered amount from deliveryItems
// ============================================================
orderSchema.methods.computeDeliveredAmount = function () {
  if (!this.deliveryItems || this.deliveryItems.length === 0) return 0;

  let deliveredAmount = 0;
  this.deliveryItems.forEach((di) => {
    const deliveredQty = di.deliveredQuantity || 0;
    const unitPrice = di.unitPrice || 0;
    deliveredAmount += deliveredQty * unitPrice;
  });

  return Math.round(deliveredAmount * 100) / 100;
};

// ============================================================
// ✅ Recompute payment status & amounts based on delivery state
// ============================================================
orderSchema.methods.recomputePaymentFromDelivery = function () {
  if (!this.deliveryItems || this.deliveryItems.length === 0) return;

  const deliveredAmount = this.computeDeliveredAmount();
  const returnedAmount = this.computeReturnedAmount();

  const subtotal = this.subtotal || 0;
  const shipping = this.shippingCost || 0;
  const discount = this.discount || 0;

  const deliveredRatio = subtotal > 0 ? Math.min(1, deliveredAmount / subtotal) : 0;

  const applicableShipping = deliveredAmount > 0 ? shipping : 0;
  const applicableDiscount = Math.round(discount * deliveredRatio * 100) / 100;

  let paidAmount = deliveredAmount + applicableShipping - applicableDiscount;
  if (paidAmount < 0) paidAmount = 0;
  if (paidAmount > this.total) paidAmount = this.total;
  paidAmount = Math.round(paidAmount * 100) / 100;

  this.paidAmount = paidAmount;
  this.returnedAmount = returnedAmount;
  this.refundableAmount = returnedAmount;

  if (this.paymentStatus === 'refunded') {
    return;
  }

  if (paidAmount <= 0) {
    this.paymentStatus = 'pending';
  } else if (paidAmount >= this.total - 0.01) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }

  if (!this.paymentDetails) this.paymentDetails = {};
  this.paymentDetails.partialPayments = this.paymentDetails.partialPayments || [];
  this.paymentDetails.lastCalculatedAt = new Date();
  this.paymentDetails.lastCalculatedPaidAmount = paidAmount;
  this.paymentDetails.lastCalculatedReturnedAmount = returnedAmount;
};

// ============================================================
// ✅ NEW: Return processing summary (for Returned Items page/modal)
// ============================================================
orderSchema.methods.getReturnProcessingSummary = function () {
  if (!this.deliveryItems || this.deliveryItems.length === 0) {
    return {
      totalReturned: 0,
      totalDamaged: 0,
      totalRestocked: 0,
      totalPending: 0,
      isFullyProcessed: true,
      items: []
    };
  }

  let totalReturned = 0;
  let totalDamaged = 0;
  let totalRestocked = 0;
  let totalPending = 0;

  const items = [];

  this.deliveryItems.forEach((di) => {
    const rp = di.returnProcessing || {};
    const returned = di.returnedQuantity || 0;

    if (returned <= 0) return; // skip items with no returns

    // Ensure returnedQuantity inside rp stays in sync
    const rpReturned = rp.returnedQuantity || returned;
    const damaged = rp.damagedQuantity || 0;
    const restocked = rp.restockedQuantity || 0;
    const pending = Math.max(0, rpReturned - damaged - restocked);

    totalReturned += rpReturned;
    totalDamaged += damaged;
    totalRestocked += restocked;
    totalPending += pending;

    items.push({
      deliveryItemId: di._id,
      productId: di.productId,
      productName: di.productName,
      variantId: di.variantId,
      variantName: di.variantName,
      subVariantId: di.subVariantId,
      subVariantName: di.subVariantName,
      selectedColor: di.selectedColor,
      image: di.image,
      unitPrice: di.unitPrice || 0,
      returnedQuantity: rpReturned,
      damagedQuantity: damaged,
      restockedQuantity: restocked,
      pendingQuantity: pending,
      deliveryStatus: di.deliveryStatus,
      note: rp.note || '',
      processedBy: rp.processedBy || null,
      processedAt: rp.processedAt || null,
      isFullyProcessed: pending === 0
    });
  });

  return {
    totalReturned,
    totalDamaged,
    totalRestocked,
    totalPending,
    isFullyProcessed: totalPending === 0,
    items
  };
};

// ========== VIRTUALS ==========
orderSchema.virtual('formattedOrderNumber').get(function () {
  if (this.orderNumber) {
    const match = this.orderNumber.match(/^NC(\d+)$/);
    if (match) return `NC-${match[1].padStart(4, '0')}`;
  }
  return this.orderNumber;
});

orderSchema.virtual('hasDeliveryService').get(function () {
  return !!(this.deliveryService && this.deliveryService.courierOrderId);
});

orderSchema.virtual('isDelivered').get(function () {
  return this.orderStatus === 'delivered';
});

orderSchema.virtual('isCancelled').get(function () {
  return this.orderStatus === 'cancelled';
});

orderSchema.virtual('canCreateDelivery').get(function () {
  const canCreateStatuses = ['accepted', 'approved', 'hold', 'processing', 'ready_to_ship'];
  return canCreateStatuses.includes(this.orderStatus) && !this.deliveryService?.courierOrderId;
});

orderSchema.virtual('hasPartialDeliveryData').get(function () {
  return !!(this.deliveryItems && this.deliveryItems.length > 0);
});

orderSchema.virtual('deliverySummary').get(function () {
  if (!this.deliveryItems || this.deliveryItems.length === 0) return null;

  let totalDelivered = 0;
  let totalReturned = 0;
  let totalPending = 0;
  let totalOrdered = 0;

  this.deliveryItems.forEach((di) => {
    totalDelivered += di.deliveredQuantity || 0;
    totalReturned += di.returnedQuantity || 0;
    totalPending += di.pendingQuantity || 0;
    totalOrdered += di.orderedQuantity || 0;
  });

  return {
    totalOrdered,
    totalDelivered,
    totalReturned,
    totalPending,
    isFullyDelivered: totalDelivered === totalOrdered && totalPending === 0,
    isFullyReturned: totalReturned === totalOrdered && totalPending === 0,
    isPartial: totalPending === 0 && totalDelivered > 0 && totalReturned > 0
  };
});

// ✅ NEW VIRTUAL: Return processing summary
orderSchema.virtual('returnSummary').get(function () {
  return this.getReturnProcessingSummary();
});

orderSchema.virtual('statusLabels').get(function () {
  const statusMap = {
    'placed': 'Order Placed',
    'follow_up': 'Follow Up',
    'accepted': 'Accepted',
    'approved': 'Approved',
    'hold': 'On Hold',
    'ready_to_ship': 'Ready to Ship',
    'courier_assigned': 'Courier Assigned',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
    'reminder': 'Reminder',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'refunded': 'Refunded',
    'failed': 'Failed',
    'returned': 'Returned',
    'partial_delivery': 'Partial Delivery'
  };
  return statusMap[this.orderStatus] || this.orderStatus;
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);