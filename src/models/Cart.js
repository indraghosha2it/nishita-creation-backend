

// // // Remove pre-save middleware entirely, update totals manually in controller
// // module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
// const mongoose = require('mongoose');

// const cartItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   productName: {
//     type: String,
//     required: true
//   },
//   productSlug: {
//     type: String,
//     required: true
//   },
//   image: {
//     type: String,
//     required: true
//   },
//   regularPrice: {
//     type: Number,
//     required: true
//   },
//   discountPrice: {
//     type: Number,
//     default: 0
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1,
//     default: 1
//   },
//   stockQuantity: {
//     type: Number,
//     default: 0
//   },
//   unit: {
//     type: String,
//     default: 'pcs'
//   },
//   selectedColor: {
//     type: String,
//     default: null
//   },
//   productHasColors: {
//     type: Boolean,
//     default: false
//   },
//   addedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const cartSchema = new mongoose.Schema({
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
//   items: [cartItemSchema],
//   totalItems: {
//     type: Number,
//     default: 0
//   },
//   subtotal: {
//     type: Number,
//     default: 0
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // ============================================
// // FIXED: totalItems counts unique products (by productId)
// // NOT color variants
// // ============================================
// cartSchema.methods.updateTotals = function() {
//   // Count unique products by productId (not color variants)
//   const uniqueProductIds = new Set();
//   this.items.forEach(item => {
//     uniqueProductIds.add(item.productId.toString());
//   });
//   this.totalItems = uniqueProductIds.size;
  
//   // subtotal is sum of price * quantity for each item
//   this.subtotal = this.items.reduce((sum, item) => {
//     const price = (item.discountPrice && item.discountPrice > 0) ? item.discountPrice : (item.regularPrice || 0);
//     return sum + (price * (item.quantity || 0));
//   }, 0);
//   this.updatedAt = new Date();
//   return this;
// };
// cartSchema.index({ userId: 1 });
// cartSchema.index({ sessionId: 1 });
// cartSchema.index({ userId: 1, updatedAt: -1 });
// cartSchema.index({ sessionId: 1, updatedAt: -1 });

// // Compound index for common queries
// cartSchema.index({ userId: 1, 'items.productId': 1 });
// cartSchema.index({ sessionId: 1, 'items.productId': 1 });

// module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

// models/Cart.js - Updated
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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
  quantity: {
    type: Number,
    required: true,
    min: 1,
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
  // ========== VARIANT FIELDS ==========
  selectedColor: {
    type: String,
    default: null
  },
  productHasColors: {
    type: Boolean,
    default: false
  },
  // Variant information
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
  // Sub-variant information
  subVariantId: {
    type: String,
    default: null
  },
  subVariantName: {
    type: String,
    default: null
  },
  // Prices for variant/sub-variant
  variantRegularPrice: {
    type: Number,
    default: 0
  },
  variantDiscountPrice: {
    type: Number,
    default: 0
  },
  // ✅ NEW: Variant/Sub-variant specific image
  variantImage: {
    type: String,
    default: null
  },
  // Track if this item has variants
  hasVariants: {
    type: Boolean,
    default: false
  },
  // For grouping variants together
  variantGroupId: {
    type: String,
    default: null
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
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
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ============================================================
// ✅ FIXED: updateTotals - Proper priority for sub-variants
// ============================================================
cartSchema.methods.updateTotals = function() {
  // Count unique products by productId
  const uniqueProductIds = new Set();
  this.items.forEach(item => {
    uniqueProductIds.add(item.productId.toString());
  });
  this.totalItems = uniqueProductIds.size;
  
  // subtotal is sum of price * quantity for each item
  this.subtotal = this.items.reduce((sum, item) => {
    let price = 0;
    
    // ============================================================
    // CHECK: Is this a sub-variant? (has subVariantId)
    // ============================================================
    const isSubVariant = !!(item.subVariantId && item.subVariantId !== 'null' && item.subVariantId !== '');
    const isVariant = !!(item.variantId && item.variantId !== 'null' && item.variantId !== '');
    
    // ============================================================
    // PRIORITY 1: SUB-VARIANT DISCOUNT PRICE (if sub-variant exists)
    // ============================================================
    if (isSubVariant && item.variantDiscountPrice && item.variantDiscountPrice > 0) {
      price = item.variantDiscountPrice;
    } 
    // ============================================================
    // PRIORITY 2: SUB-VARIANT REGULAR PRICE (if sub-variant exists)
    // ============================================================
    else if (isSubVariant && item.variantRegularPrice && item.variantRegularPrice > 0) {
      price = item.variantRegularPrice;
    } 
    // ============================================================
    // PRIORITY 3: VARIANT DISCOUNT PRICE (if variant exists, no sub-variant)
    // ============================================================
    else if (isVariant && !isSubVariant && item.variantDiscountPrice && item.variantDiscountPrice > 0) {
      price = item.variantDiscountPrice;
    } 
    // ============================================================
    // PRIORITY 4: VARIANT REGULAR PRICE (if variant exists, no sub-variant)
    // ============================================================
    else if (isVariant && !isSubVariant && item.variantRegularPrice && item.variantRegularPrice > 0) {
      price = item.variantRegularPrice;
    } 
    // ============================================================
    // PRIORITY 5: PRODUCT DISCOUNT PRICE (fallback)
    // ============================================================
    else if (item.discountPrice && item.discountPrice > 0) {
      price = item.discountPrice;
    } 
    // ============================================================
    // PRIORITY 6: PRODUCT REGULAR PRICE (final fallback)
    // ============================================================
    else {
      price = item.regularPrice || 0;
    }
    
    return sum + (price * (item.quantity || 0));
  }, 0);
  
  this.updatedAt = new Date();
  return this;
};

cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ userId: 1, updatedAt: -1 });
cartSchema.index({ sessionId: 1, updatedAt: -1 });
cartSchema.index({ userId: 1, 'items.productId': 1 });
cartSchema.index({ sessionId: 1, 'items.productId': 1 });

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);