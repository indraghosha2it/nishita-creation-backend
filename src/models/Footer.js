
// // backend/src/models/Footer.js
// const mongoose = require('mongoose');

// // Column Item Schema
// const columnItemSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['address', 'phone', 'email', 'hours', 'link'],
//     default: 'link'
//   },
//   label: {
//     type: String,
//     trim: true
//   },
//   value: {
//     type: String,
//     trim: true
//   },
//   url: {
//     type: String,
//     trim: true
//   }
// });

// // Social Link Schema
// const socialLinkSchema = new mongoose.Schema({
//   platform: {
//     type: String,
//     enum: ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'whatsapp', 'pinterest', 'tiktok'],
//     required: true
//   },
//   url: {
//     type: String,
//     trim: true,
//     default: ''
//   },
//   active: {
//     type: Boolean,
//     default: true
//   }
// });

// // Column Schema
// const columnSchema = new mongoose.Schema({
//   id: {
//     type: String,
//     required: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   type: {
//     type: String,
//     enum: ['links', 'support', 'contact', 'social', 'custom'],
//     default: 'links'
//   },
//   items: [columnItemSchema],
//   socialLinks: [socialLinkSchema],
//   customContent: {
//     type: String,
//     default: ''
//   }
// });

// // Trust Badge Schema
// const trustBadgeSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: ['authentic', 'warranty', 'delivery', 'secure', 'trusted', 'return', 'support'],
//     required: true
//   },
//   label: {
//     type: String,
//     required: true
//   },
//   active: {
//     type: Boolean,
//     default: true
//   }
// });

// // Payment Method Schema
// const paymentMethodSchema = new mongoose.Schema({
//   method: {
//     type: String,
//     enum: ['visa', 'mastercard', 'paypal', 'applepay', 'googlepay', 'amex', 'bkash', 'nagad', 'rocket'],
//     required: true
//   },
//   active: {
//     type: Boolean,
//     default: true
//   }
// });

// // Main Footer Schema
// const footerSchema = new mongoose.Schema({
//   // Background Image
//   backgroundImage: {
//     type: String,
//     default: ''
//   },
//   backgroundPublicId: {
//     type: String,
//     default: ''
//   },
  
//   company: {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       default: 'Beauty Bucket'
//     },
//     tagline: {
//       type: String,
//       trim: true,
//       default: 'Premium Beauty Essentials'
//     },
//     description: {
//       type: String,
//       trim: true,
//       default: 'Discover premium beauty products with expert care, fast delivery, and a touch of luxury across Bangladesh.'
//     },
//     address: {
//       type: String,
//       trim: true,
//       default: 'Dhaka, Bangladesh'
//     },
//     phone: {
//       type: String,
//       trim: true,
//       default: '+880 1XXXXXXXXX'
//     },
//     email: {
//       type: String,
//       trim: true,
//       default: 'support@beautybucket.com'
//     },
//     hours: {
//       type: String,
//       trim: true,
//       default: 'Always Open • 24/7 Online Ordering • Quick Response'
//     },
//     logoUrl: {
//       type: String,
//       default: '/images/logo3.png'
//     },
//     logoPublicId: {
//       type: String,
//       default: ''
//     }
//   },
//   columns: [columnSchema],
//   trustBadges: [trustBadgeSchema],
//   paymentMethods: [paymentMethodSchema],
//   footerText: {
//     type: String,
//     default: 'All rights reserved.'
//   },
//   showCopyright: {
//     type: Boolean,
//     default: true
//   },
//   showTrustBadges: {
//     type: Boolean,
//     default: true
//   },
//   showPaymentMethods: {
//     type: Boolean,
//     default: true
//   },
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
// footerSchema.index({ isActive: 1 });
// footerSchema.index({ updatedAt: -1 });

// module.exports = mongoose.model('Footer', footerSchema);


// backend/src/models/Footer.js
const mongoose = require('mongoose');

// ============================================================
// COLUMN ITEM — can be a normal link OR a category reference
// ============================================================
const columnItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  // 'link'  = plain link (label + url)
  // 'category' = category reference (label + categoryId, url auto-built)
  // legacy contact types kept for backward compat:
  type: {
    type: String,
    enum: ['link', 'category', 'address', 'phone', 'email', 'hours'],
    default: 'link'
  },
  label: { type: String, trim: true },
  value: { type: String, trim: true },     // used by contact types
  url: { type: String, trim: true },       // used by link type
  categoryId: {                            // used by category type
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  }
});

// Social Link Schema
const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'whatsapp', 'pinterest', 'tiktok'],
    required: true
  },
  url: { type: String, trim: true, default: '' },
  active: { type: Boolean, default: true }
});

// Column Schema
const columnSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['links', 'support', 'contact', 'social', 'custom'],
    default: 'links'
  },
  items: [columnItemSchema],
  socialLinks: [socialLinkSchema],
  customContent: { type: String, default: '' }
});

// Trust Badge Schema
const trustBadgeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['authentic', 'warranty', 'delivery', 'secure', 'trusted', 'return', 'support'],
    required: true
  },
  label: { type: String, required: true },
  active: { type: Boolean, default: true }
});

// Payment Method Schema
const paymentMethodSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['visa', 'mastercard', 'paypal', 'applepay', 'googlepay', 'amex', 'bkash', 'nagad', 'rocket'],
    required: true
  },
  active: { type: Boolean, default: true }
});

// Main Footer Schema
const footerSchema = new mongoose.Schema({
  backgroundImage: { type: String, default: '' },
  backgroundPublicId: { type: String, default: '' },

  company: {
    name: { type: String, required: true, trim: true, default: 'Beauty Bucket' },
    tagline: { type: String, trim: true, default: 'Premium Beauty Essentials' },
    description: {
      type: String,
      trim: true,
      default: 'Discover premium beauty products with expert care, fast delivery, and a touch of luxury across Bangladesh.'
    },
    address: { type: String, trim: true, default: 'Dhaka, Bangladesh' },
    phone: { type: String, trim: true, default: '+880 1XXXXXXXXX' },
    email: { type: String, trim: true, default: 'support@beautybucket.com' },
    hours: { type: String, trim: true, default: 'Always Open • 24/7 Online Ordering • Quick Response' },
    logoUrl: { type: String, default: '/images/logo3.png' },
    logoPublicId: { type: String, default: '' }
  },

  columns: [columnSchema],
  trustBadges: [trustBadgeSchema],
  paymentMethods: [paymentMethodSchema],
  footerText: { type: String, default: 'All rights reserved.' },
  showCopyright: { type: Boolean, default: true },
  showTrustBadges: { type: Boolean, default: true },
  showPaymentMethods: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

footerSchema.index({ isActive: 1 });
footerSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Footer', footerSchema);