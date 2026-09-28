const mongoose = require('mongoose');

const barcodeSchema = new mongoose.Schema({
  barcodeNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  format: {
    type: String,
    default: 'CODE-128'  // Always CODE-128
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
    index: true
  },
  productSku: {
    type: String,
    default: ''
  },
  productName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'reserved', 'inactive'],
    default: 'available'
  },
  barcodeImageUrl: {
    type: String,
    default: ''
  },
  barcodeImagePublicId: {
    type: String,
    default: ''
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  batchId: {
    type: String,
    index: true
  },
  metadata: {
    prefix: { type: String, default: 'TOY' },
    sequence: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

barcodeSchema.index({ barcodeNumber: 1, status: 1 });
barcodeSchema.index({ productId: 1 });

module.exports = mongoose.model('Barcode', barcodeSchema);