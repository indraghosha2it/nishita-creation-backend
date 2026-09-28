const mongoose = require('mongoose');

const productCostSettingsSchema = new mongoose.Schema({
  // Packaging Cost Settings
  packagingCost: {
    type: Number,
    default: 0,
    min: [0, 'Packaging cost cannot be negative']
  },
  
  // Delivery Cost Settings
  deliveryCost: {
    type: Number,
    default: 0,
    min: [0, 'Delivery cost cannot be negative']
  },
  
  // Optional: Additional fields for future use
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Tracking - Make updatedBy optional with default null
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // ✅ Changed from required to default null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Version tracking
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Singleton pattern - only one settings document should exist
productCostSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    // Create default settings with updatedBy as null
    settings = await this.create({
      packagingCost: 0,
      deliveryCost: 0,
      updatedBy: null, // ✅ Explicitly set to null
      notes: 'Default settings created'
    });
  }
  return settings;
};

const ProductCostSettings = mongoose.models.ProductCostSettings || 
  mongoose.model('ProductCostSettings', productCostSettingsSchema);

module.exports = ProductCostSettings;