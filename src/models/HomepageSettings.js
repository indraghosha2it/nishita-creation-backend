// const mongoose = require('mongoose');

// // Section Item Schema
// const sectionItemSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true
//   },
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   }
// });

// // Section Schema
// const sectionSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   type: {
//     type: String,
//     enum: ['hero', 'brands', 'big_sale', 'categories', 'featured', 'custom'],
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   },
//   items: [sectionItemSchema],
//   // For custom sections with product selection
//   customTitle: {
//     type: String,
//     trim: true
//   },
//   customDescription: {
//     type: String,
//     trim: true
//   },
//   layout: {
//     type: String,
//     enum: ['grid', 'carousel', 'list'],
//     default: 'grid'
//   },
//   itemsPerRow: {
//     type: Number,
//     enum: [2, 3, 4, 5],
//     default: 5
//   }
// });

// // Main Homepage Settings Schema
// const homepageSettingsSchema = new mongoose.Schema({
//   sections: [sectionSchema],
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // Indexes
// homepageSettingsSchema.index({ isActive: 1 });
// homepageSettingsSchema.index({ updatedAt: -1 });

// module.exports = mongoose.model('HomepageSettings', homepageSettingsSchema);


// backend/src/models/HomepageSettings.js - Updated

const mongoose = require('mongoose');

// Section Item Schema
const sectionItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
});

// Section Schema - ADDED 'why_choose_us', REMOVED 'brands'
const sectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['hero', 'big_sale', 'categories', 'featured', 'custom', 'deals', 'trust_results', 'achievements', 'videos'], // ✅ REMOVED 'brands', ADDED 'why_choose_us'
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  items: [sectionItemSchema],
  // For custom sections with product selection
  customTitle: {
    type: String,
    trim: true
  },
  customDescription: {
    type: String,
    trim: true
  },
  layout: {
    type: String,
    enum: ['grid', 'carousel', 'list'],
    default: 'grid'
  },
  itemsPerRow: {
    type: Number,
    enum: [2, 3, 4, 5, 6],
    default: 5
  }
});

// Main Homepage Settings Schema
const homepageSettingsSchema = new mongoose.Schema({
  sections: [sectionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
homepageSettingsSchema.index({ isActive: 1 });
homepageSettingsSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('HomepageSettings', homepageSettingsSchema);