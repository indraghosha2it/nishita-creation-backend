
// // backend/src/models/Contact.js
// const mongoose = require('mongoose');

// // Stats Schema
// const statItemSchema = new mongoose.Schema({
//   icon: {
//     type: String,
//     enum: ['FaUsers', 'FaStar', 'FaAward', 'FaClock', 'FaBolt', 'FaShieldAlt', 'FaTruck', 'FaHeadset', 'FaHeart', 'FaGem'],
//     default: 'FaUsers'
//   },
//   value: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   label: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   }
// });

// // Quick Contact Schema
// const quickContactSchema = new mongoose.Schema({
//   icon: {
//     type: String,
//     enum: ['FaWhatsapp', 'FaPhone', 'FaEnvelope', 'FaMapMarkerAlt', 'FaClock'],
//     default: 'FaPhone'
//   },
//   label: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   value: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   link: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   color: {
//     type: String,
//     default: 'bg-[#06B6D4]'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   }
// });

// // Social Link Schema
// const socialLinkSchema = new mongoose.Schema({
//   platform: {
//     type: String,
//     enum: ['facebook', 'instagram', 'x', 'linkedin', 'youtube', 'tiktok', 'pinterest', 'snapchat', 'telegram', 'threads', 'github', 'viber', 'messenger'],
//     required: true
//   },
//   url: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   icon: {
//     type: String,
//     enum: ['FaFacebookF', 'FaInstagram', 'FaTwitter', 'FaLinkedinIn', 'FaYoutube', 'FaTiktok', 'FaPinterest', 'FaSnapchat', 'FaTelegram', 'FaGithub', 'FaViber', 'FaFacebookMessenger'],
//     default: 'FaFacebookF'
//   },
//   color: {
//     type: String,
//     default: 'hover:bg-[#1877F2]'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   }
// });

// // FAQ Item Schema
// const faqItemSchema = new mongoose.Schema({
//   question: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   answer: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   }
// });

// // Feature Schema (for leftSide/rightSide)
// const featureSchema = new mongoose.Schema({
//   icon: {
//     type: String,
//     enum: ['CheckCircle', 'Shield', 'Truck', 'Headphones', 'Clock', 'Star'],
//     default: 'CheckCircle'
//   },
//   title: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     required: true,
//     trim: true
//   }
// });

// // Main Contact Schema
// const contactSchema = new mongoose.Schema({
//   // Hero Section
//   hero: {
//     bgImage: {
//       type: String,
//       default: '/images/bg10.jpg'
//     },
//     badge: {
//       type: String,
//       default: 'Get in Touch'
//     },
//     title: {
//       type: String,
//       default: "We'd Love to"
//     },
//     highlightText: {
//       type: String,
//       default: 'Hear From You'
//     },
//     description: {
//       type: String,
//       default: 'Have questions about products, orders, or anything else? We\'re here to help and respond within 24 hours.'
//     }
//   },

//   // Stats Section
//   stats: [statItemSchema],

//   // Quick Contact Section
//   quickContacts: [quickContactSchema],

//   // Right Side Content
//   rightSide: {
//     badge: {
//       type: String,
//       default: 'Contact Us'
//     },
//     title: {
//       type: String,
//       default: "Let's Connect"
//     },
//     subtitle: {
//       type: String,
//       default: '& Make Beauty Happen'
//     },
//     description: {
//       type: String,
//       default: 'Whether you have questions about a product, need assistance with an order, or just want some beauty advice - our team is ready to help you.'
//     },
//     quickContactTitle: {
//       type: String,
//       default: 'Quick Contact'
//     },
//     socialTitle: {
//       type: String,
//       default: 'Follow Us'
//     },
//     features: [featureSchema]
//   },

//   // Left Side Content (alias for rightSide)
//   leftSide: {
//     badge: {
//       type: String,
//       default: 'Contact Us'
//     },
//     title: {
//       type: String,
//       default: "Let's Connect"
//     },
//     subtitle: {
//       type: String,
//       default: '& Make Beauty Happen'
//     },
//     description: {
//       type: String,
//       default: 'Whether you have questions about a product, need assistance with an order, or just want some beauty advice - our team is ready to help you.'
//     },
//     quickContactTitle: {
//       type: String,
//       default: 'Quick Contact'
//     },
//     socialTitle: {
//       type: String,
//       default: 'Follow Us'
//     },
//     features: [featureSchema]
//   },

//   // Social Links
//   socialLinks: [socialLinkSchema],

//   // FAQ Section
//   faq: {
//     badge: {
//       type: String,
//       default: 'FAQ'
//     },
//     title: {
//       type: String,
//       default: 'Frequently Asked Questions'
//     },
//     description: {
//       type: String,
//       default: 'Find quick answers to common questions about our products and services.'
//     },
//     items: [faqItemSchema]
//   },

//   // Map Section
//   map: {
//     title: {
//       type: String,
//       default: 'Find Us'
//     },
//     embedCode: {
//       type: String,
//       default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3649.5029279808477!2d90.3686038739732!3d23.83626858547701!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c14a38f924d3%3A0x39a8c038652ae720!2sHouse%20470%2C%20R9PC%2BHGM%2C%206%20Avenue%206%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1781765267904!5m2!1sen!2sbd'
//     }
//   },

//   // CTA Section
//   cta: {
//     bgImage: {
//       type: String,
//       default: '/images/pattern.png'
//     },
//     badge: {
//       type: String,
//       default: 'Still Have Questions?'
//     },
//     title: {
//       type: String,
//       default: "We're Here to Help"
//     },
//     description: {
//       type: String,
//       default: 'Our beauty experts are ready to assist you with any questions about products or orders.'
//     },
//     buttonText: {
//       type: String,
//       default: 'Call Now'
//     },
//     buttonLink: {
//       type: String,
//       default: 'tel:+8801871733305'
//     },
//     secondaryButtonText: {
//       type: String,
//       default: 'Browse Products'
//     },
//     secondaryButtonLink: {
//       type: String,
//       default: '/products'
//     }
//   },

//   // Form Settings
//   form: {
//     title: {
//       type: String,
//       default: 'Send Us a Message'
//     },
//     description: {
//       type: String,
//       default: "Fill in the form and we'll get back to you within 24 hours"
//     },
//     successMessage: {
//       type: String,
//       default: "Thank you! We'll get back to you within 24 hours."
//     }
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
// contactSchema.index({ isActive: 1 });
// contactSchema.index({ updatedAt: -1 });

// module.exports = mongoose.model('Contact', contactSchema);


const mongoose = require('mongoose');

// ============================================================
// SUB SCHEMAS
// ============================================================

const quickContactSchema = new mongoose.Schema({
  icon: {
    type: String,
    enum: ['FaWhatsapp', 'FaPhone', 'FaEnvelope', 'FaMapMarkerAlt', 'FaClock'],
    default: 'FaPhone',
  },
  label: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  link:  { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
});

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: [
      'facebook','instagram','x','linkedin','youtube','tiktok',
      'pinterest','snapchat','telegram','threads','github','viber','messenger',
    ],
    required: true,
  },
  url:  { type: String, required: true, trim: true },
  icon: {
    type: String,
    enum: [
      'FaFacebookF','FaInstagram','FaTwitter','FaLinkedinIn','FaYoutube',
      'FaTiktok','FaPinterest','FaSnapchat','FaTelegram','FaGithub',
      'FaViber','FaFacebookMessenger',
    ],
    default: 'FaFacebookF',
  },
  color: { type: String, default: 'hover:bg-[#1877F2]' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
});

const featureSchema = new mongoose.Schema({
  icon: {
    type: String,
    enum: ['CheckCircle', 'Shield', 'Truck', 'Headphones', 'Clock', 'Star'],
    default: 'CheckCircle',
  },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
});

const statItemSchema = new mongoose.Schema({
  icon: {
    type: String,
    enum: ['FaUsers','FaStar','FaAward','FaClock','FaBolt','FaShieldAlt','FaTruck','FaHeadset','FaHeart','FaGem'],
    default: 'FaUsers',
  },
  value: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
});

// ============================================================
// MAIN
// ============================================================

const contactSchema = new mongoose.Schema(
  {
    // Hero
    hero: {
      bgImage:       { type: String, default: '/images/contact-hero.jpg' },
      badge:         { type: String, default: 'Get In Touch' },
      title:         { type: String, default: "We'd Love to" },
      highlightText: { type: String, default: 'Hear From You' },
      description: {
        type: String,
        default:
          "Have questions about our handcrafted clothing, orders, or anything else? We're here to help and respond within 24 hours.",
      },
    },

    // Quick Contact Cards
    quickContacts: [quickContactSchema],

    // Left / Right side (we'll keep "leftSide" as the canonical one)
    leftSide: {
      badge:  { type: String, default: "Nishita's Collection" },
      title:  { type: String, default: "Let's Connect" },
      subtitle: { type: String, default: '& Craft Something Beautiful' },
      description: {
        type: String,
        default:
          'Whether you have questions about a product, need assistance with an order, or just want some styling advice — our team is ready to help.',
      },
      quickContactTitle: { type: String, default: 'Quick Contact' },
      socialTitle:       { type: String, default: 'Follow Us' },
      features: [featureSchema],
    },

    // Social
    socialLinks: [socialLinkSchema],

    // Map
    map: {
      title: { type: String, default: 'Find Us' },
      embedCode: {
        type: String,
        default:
          'https://www.google.com/maps?q=Motijheel,Dhaka&output=embed',
      },
    },

    // CTA — includes background image
    cta: {
      bgImage: {
        type: String,
        default: '/images/cta-bg.jpg',
      },
      badge:       { type: String, default: 'Still Have Questions?' },
      title:       { type: String, default: "We're Here to Help" },
      description: {
        type: String,
        default:
          'Our team is ready to assist you with anything — from sizing to styling.',
      },
      buttonText:            { type: String, default: 'Call Now' },
      buttonLink:            { type: String, default: 'tel:+8801XXXXXXXXX' },
      secondaryButtonText:   { type: String, default: 'Browse Collection' },
      secondaryButtonLink:   { type: String, default: '/products' },
    },

    // Form copy
    form: {
      title:          { type: String, default: "We'd Love to Hear From You" },
      description:    { type: String, default: "Fill in the form and we'll get back to you within 24 hours" },
      successMessage: { type: String, default: "Thank you! We'll get back to you within 24 hours." },
    },

    isActive:  { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

contactSchema.index({ isActive: 1 });
contactSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);