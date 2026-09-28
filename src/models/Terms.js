

// // module.exports = mongoose.model('Terms', termsSchema);
// // backend/src/models/Terms.js
// const mongoose = require('mongoose');

// // Terms Section Schema
// const termsSectionSchema = new mongoose.Schema({
//   id: {
//     type: Number,
//     required: true
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   icon: {
//     type: String,
//     enum: ['FaFileContract', 'FaShoppingBag', 'FaCreditCard', 'FaTruck', 'FaHands', 'FaUserShield', 'FaLock', 'FaBalanceScale', 'FaExclamationTriangle'],
//     default: 'FaFileContract'
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   details: [{
//     type: String,
//     trim: true
//   }],
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   }
// });

// // Main Terms Schema - ✅ Added image fields
// const termsSchema = new mongoose.Schema({
//   heroTitle: {
//     type: String,
//     default: 'Terms & Conditions'
//   },
//   heroDescription: {
//     type: String,
//     default: 'Please read these terms carefully before using our website and services. By accessing our platform, you agree to be bound by these terms.'
//   },
//   introText: {
//     type: String,
//     default: 'Welcome to Smart Gadget. These Terms & Conditions ("Terms") govern your use of the Smart Gadget website, mobile application, and all related services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.'
//   },
//   // ✅ NEW: Hero Banner Image
//   heroImage: {
//     type: String,
//     default: 'https://i.ibb.co.com/XkF8TGQZ/jn.png'
//   },
//   // ✅ NEW: CTA Background Image
//   ctaImage: {
//     type: String,
//     default: 'https://i.ibb.co.com/0RHQ0thP/jh.png'
//   },
//   sections: [termsSectionSchema],
//   lastUpdated: {
//     type: String,
//     default: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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
// termsSchema.index({ isActive: 1 });
// termsSchema.index({ updatedAt: -1 });

// module.exports = mongoose.model('Terms', termsSchema);


const mongoose = require('mongoose');

// ============================================================
// TERMS SECTION SUB-SCHEMA
// ============================================================

const termsSectionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  icon: {
    type: String,
    enum: [
      'FaFileContract', 'FaShoppingBag', 'FaCreditCard', 'FaTruck',
      'FaHands', 'FaUserShield', 'FaLock', 'FaBalanceScale',
      'FaExclamationTriangle',
    ],
    default: 'FaFileContract',
  },
  description: { type: String, required: true, trim: true },
  details: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
});

// ============================================================
// MAIN TERMS SCHEMA — Nishita's Collection defaults
// ============================================================

const termsSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      default: 'Terms & Conditions',
    },
    heroDescription: {
      type: String,
      default:
        'Please read these terms carefully before using our website and services. By accessing our platform, you agree to be bound by these terms.',
    },
    introText: {
      type: String,
      default:
        "Welcome to Nishita's Collection. These Terms & Conditions (\"Terms\") govern your use of Nishita's Collection website, mobile application, and all related services (collectively, the \"Platform\"). By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.",
    },
    heroImage: {
      type: String,
      default: '/images/contact-hero.jpg',
    },
    ctaImage: {
      type: String,
      default: '/images/cta-bg.jpg',
    },
    sections: [termsSectionSchema],
    lastUpdated: {
      type: String,
      default: new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      }),
    },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

termsSchema.index({ isActive: 1 });
termsSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Terms', termsSchema);