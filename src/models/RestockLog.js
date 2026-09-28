// const mongoose = require('mongoose');

// const restockLogSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true,
//     index: true
//   },
//   productName: {
//     type: String,
//     trim: true,
//     default: ''
//   },
//   skuCode: {
//     type: String,
//     trim: true,
//     default: ''
//   },
//   barcode: {
//     type: String,
//     trim: true,
//     default: ''
//   },

//   // Which variant/sub-variant was restocked (null for base product)
//   variantId: { type: String, default: null },
//   subVariantId: { type: String, default: null },
//   variantName: { type: String, default: '' },
//   subVariantName: { type: String, default: '' },

//   // Quantity + stock snapshot
//   addQuantity: {
//     type: Number,
//     required: true,
//     min: [1, 'Restock quantity must be at least 1']
//   },
//   previousStock: {
//     type: Number,
//     default: 0
//   },
//   newStock: {
//     type: Number,
//     default: 0
//   },

//   // Who / when
//   restockedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     index: true
//   },
//   restockedByName: { type: String, default: '' },
//   restockedByEmail: { type: String, default: '' },
//   restockedByRole: { type: String, default: '' },

//   restockedAt: {
//     type: Date,
//     default: Date.now,
//     index: true
//   },

//   // Optional source info
//   source: {
//     type: String,
//     enum: ['scan', 'manual', 'bulk', 'edit'],
//     default: 'manual'
//   },
//   note: { type: String, default: '' }
// }, {
//   timestamps: true
// });

// // Fast lookup per product, newest first
// restockLogSchema.index({ productId: 1, restockedAt: -1 });

// module.exports = mongoose.models.RestockLog
//   || mongoose.model('RestockLog', restockLogSchema);



const mongoose = require('mongoose');

const restockLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  productName: { type: String, trim: true, default: '' },
  skuCode: { type: String, trim: true, default: '' },
  barcode: { type: String, trim: true, default: '' },

  variantId: { type: String, default: null },
  subVariantId: { type: String, default: null },
  variantName: { type: String, default: '' },
  subVariantName: { type: String, default: '' },

  addQuantity: {
    type: Number,
    required: true,
    min: [1, 'Restock quantity must be at least 1'],
  },
  previousStock: { type: Number, default: 0 },
  newStock: { type: Number, default: 0 },

   baseStockBefore: { type: Number, default: null },
  baseStockAfter:  { type: Number, default: null },

  restockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  restockedByName: { type: String, default: '' },
  restockedByEmail: { type: String, default: '' },
  restockedByRole: { type: String, default: '' },

  restockedAt: { type: Date, default: Date.now, index: true },

  source: {
    type: String,
    enum: ['scan', 'manual', 'bulk', 'edit'],
    default: 'manual',
  },
  note: { type: String, default: '' },

  // ✅ idempotency — one per client-generated requestId+index
  idempotencyKey: {
    type: String,
    default: undefined,
  },
}, { timestamps: true });

restockLogSchema.index({ productId: 1, restockedAt: -1 });
restockLogSchema.index(
  { idempotencyKey: 1 },
  {
    name: 'idempotencyKey_unique_string',
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  }
);

module.exports =
  mongoose.models.RestockLog ||
  mongoose.model('RestockLog', restockLogSchema);