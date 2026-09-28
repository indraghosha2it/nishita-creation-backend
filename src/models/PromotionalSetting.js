

// const mongoose = require('mongoose');

// const promotionalSettingSchema = new mongoose.Schema({
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   tag: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   intervals: {
//     type: [{
//       delay: {
//         type: Number,
//         required: true,
//         min: 0
//       }
//     }],
//     default: [{ delay: 5 }, { delay: 15 }, { delay: 15 }]
//   },
//   maxShows: {
//     type: Number,
//     default: 3,
//     min: 1,
//     max: 10
//   },
//   order: {
//     type: Number,
//     default: 0
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Add index for better query performance
// promotionalSettingSchema.index({ isActive: 1 });
// promotionalSettingSchema.index({ order: 1 });

// module.exports = mongoose.model('PromotionalSetting', promotionalSettingSchema);


// models/PromotionalSetting.js
const mongoose = require('mongoose');

// Available pages list for reference
const availablePages = [
  '/',
  '/products',
  '/productDetails',
  '/about',
  '/contact',
  '/blog',
  '/blog/blogDetailsPage',
  '/shipping',
  '/privacy',
  '/terms',
  '/login',
  '/register'
];

const promotionalSettingSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  tag: {
    type: String,
    required: true,
    trim: true
  },
  intervals: {
    type: [{
      delay: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    default: [{ delay: 5 }, { delay: 15 }, { delay: 15 }]
  },
  maxShows: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  // NEW: Pages where this popup should show
  showOnPages: {
    type: [{
      type: String,
      enum: availablePages
    }],
    default: availablePages // By default, show on all pages
  },
  order: {
    type: Number,
    default: 0
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for better query performance
promotionalSettingSchema.index({ isActive: 1 });
promotionalSettingSchema.index({ order: 1 });
promotionalSettingSchema.index({ categoryId: 1 });

module.exports = mongoose.model('PromotionalSetting', promotionalSettingSchema);