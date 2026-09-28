

// // backend/src/models/Privacy.js
// const mongoose = require('mongoose');

// // Privacy Section Schema
// const privacySectionSchema = new mongoose.Schema({
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
//     enum: ['FaUsers', 'FaEye', 'FaShieldAlt', 'FaLock', 'FaCookie', 'FaExclamationTriangle', 'FaGlobe', 'FaServer', 'FaClock'],
//     default: 'FaShieldAlt'
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

// // Main Privacy Schema - Beauty Bucket Branding
// const privacySchema = new mongoose.Schema({
//   heroTitle: {
//     type: String,
//     default: 'Your Privacy'
//   },
//   heroSubtitle: {
//     type: String,
//     default: 'Matters to Us'
//   },
//   heroDescription: {
//     type: String,
//     default: 'We are committed to protecting your personal data and being transparent about how we collect, use, and safeguard your information.'
//   },
//   heroImage: {
//     type: String,
//     default: '/images/bg10.jpg'
//   },
//   ctaImage: {
//     type: String,
//     default: '/images/pattern.png'
//   },
//   introText: {
//     type: String,
//     default: 'Welcome to BeautyBucket. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.'
//   },
//   sections: [privacySectionSchema],
//   quickInfo: {
//     email: {
//       type: String,
//       default: 'privacy@beautybucket.com'
//     },
//     phone: {
//       type: String,
//       default: '+880 1XXXXXXXXX'
//     },
//     responseTime: {
//       type: String,
//       default: 'Within 24 hours'
//     }
//   },
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
// privacySchema.index({ isActive: 1 });
// privacySchema.index({ updatedAt: -1 });

// module.exports = mongoose.model('Privacy', privacySchema);


const mongoose = require('mongoose');

// ============================================================
// PRIVACY SECTION SUB-SCHEMA
// ============================================================

const privacySectionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true, trim: true },
  icon: {
    type: String,
    enum: [
      'FaUsers', 'FaEye', 'FaShieldAlt', 'FaLock', 'FaCookie',
      'FaExclamationTriangle', 'FaGlobe', 'FaServer', 'FaClock',
    ],
    default: 'FaShieldAlt',
  },
  description: { type: String, required: true, trim: true },
  details: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
});

// ============================================================
// MAIN PRIVACY SCHEMA — Nishita's Collection defaults
// ============================================================

const privacySchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: 'Your Privacy' },
    heroSubtitle: { type: String, default: 'Matters to Us' },
    heroDescription: {
      type: String,
      default:
        'We are committed to protecting your personal data and being transparent about how we collect, use, and safeguard your information.',
    },
    heroImage: { type: String, default: '/images/contact-hero.jpg' },
    ctaImage: { type: String, default: '/images/cta-bg.jpg' },
    introText: {
      type: String,
      default:
        "Welcome to Nishita's Collection. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.",
    },
    sections: [privacySectionSchema],
    quickInfo: {
      email: { type: String, default: 'privacy@nishitascollection.com' },
      phone: { type: String, default: '+880 1XXXXXXXXX' },
      responseTime: { type: String, default: 'Within 24 hours' },
    },
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

privacySchema.index({ isActive: 1 });
privacySchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Privacy', privacySchema);