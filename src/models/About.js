
// // backend/src/models/About.js
// const mongoose = require('mongoose');

// // ============================================================
// // STATS SCHEMA
// // ============================================================

// const statItemSchema = new mongoose.Schema({
//   icon: {
//     type: String,
//     enum: ['FaAward', 'FaUsers', 'GiLipstick', 'FaStar', 'FaHeart', 'FaLeaf', 'FaShieldAlt'],
//     default: 'FaAward'
//   },
//   value: {
//     type: String,
//     trim: true,
//     default: '0'
//   },
//   label: {
//     type: String,
//     trim: true,
//     default: 'Stat'
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// });

// const statsSchema = new mongoose.Schema({
//   backgroundImage: {
//     type: String,
//     default: '/images/bg5.PNG'
//   },
//   items: {
//     type: [statItemSchema],
//     default: []
//   }
// });

// // ============================================================
// // WHY CHOOSE US SCHEMA
// // ============================================================

// const whyChooseUsSchema = new mongoose.Schema({
//   backgroundImage: {
//     type: String,
//     default: '/images/bg5.PNG'
//   },
//   badge: {
//     type: String,
//     default: 'Why Choose Us'
//   },
//   title: {
//     type: String,
//     default: 'Beauty Is Power, A Smile Is Its Word'
//   },
//   description: {
//     type: String,
//     default: 'We believe that true beauty starts from within. Our carefully selected products are designed to help you feel confident, radiant, and completely yourself.'
//   },
//   buttonText: {
//     type: String,
//     default: 'Explore More'
//   },
//   buttonLink: {
//     type: String,
//     default: '/products'
//   },
//   cards: [{
//     icon: {
//       type: String,
//       enum: ['FaLeaf', 'FaHeart', 'FaShieldAlt', 'FaTruck', 'FaStar', 'FaUsers', 'FaAward', 'GiSparkles'],
//       default: 'FaLeaf'
//     },
//     title: {
//       type: String,
//       trim: true,
//       default: 'Card Title'
//     },
//     description: {
//       type: String,
//       trim: true,
//       default: 'Card description'
//     }
//   }]
// });

// // ============================================================
// // STORY SCHEMA
// // ============================================================

// const storyImageSchema = new mongoose.Schema({
//   src: {
//     type: String,
//     default: ''
//   },
//   alt: {
//     type: String,
//     default: 'Story image'
//   },
//   displayOrder: {
//     type: Number,
//     default: 0
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// });

// const trustIndicatorSchema = new mongoose.Schema({
//   icon: {
//     type: String,
//     enum: ['FaCheckCircle', 'FaShippingFast', 'FaGift', 'FaSmile', 'FaStar', 'FaUsers', 'FaAward'],
//     default: 'FaCheckCircle'
//   },
//   label: {
//     type: String,
//     trim: true,
//     default: 'Trust Indicator'
//   }
// });

// const storySchema = new mongoose.Schema({
//   badge: {
//     type: String,
//     default: 'Our Story'
//   },
//   title: {
//     type: String,
//     default: 'A Journey of Beauty & Trust'
//   },
//   paragraphs: {
//     type: [String],
//     default: []
//   },
//   trustIndicators: {
//     type: [trustIndicatorSchema],
//     default: []
//   },
//   images: {
//     type: [storyImageSchema],
//     default: []
//   }
// });

// // ============================================================
// // HERO SCHEMA - Simplified (Only Left & Right Images)
// // ============================================================

// const heroSchema = new mongoose.Schema({
//   leftImage: {
//     type: String,
//     default: '/images/bg1.png'
//   },
//   rightImage: {
//     type: String,
//     default: '/images/bg8.png'
//   },
//   badge: {
//     type: String,
//     default: 'About Us'
//   },
//   title: {
//     type: String,
//     default: 'Redefining Beauty'
//   },
//   highlightedText: {
//     type: String,
//     default: 'for Everyone'
//   },
//   description: {
//     type: String,
//     default: 'We believe beauty is for everyone. Our mission is to bring you the finest beauty products with expert care, fast delivery, and a touch of luxury.'
//   },
//   buttonText: {
//     type: String,
//     default: 'Explore Products'
//   },
//   buttonLink: {
//     type: String,
//     default: '/products'
//   },
//   secondaryButtonText: {
//     type: String,
//     default: 'Get in Touch'
//   },
//   secondaryButtonLink: {
//     type: String,
//     default: '/contact'
//   }
// });

// // ============================================================
// // CURATED FOR YOU SCHEMA
// // ============================================================

// const curatedForYouSchema = new mongoose.Schema({
//   badge: {
//     type: String,
//     default: 'Curated For You'
//   },
//   title: {
//     type: String,
//     default: 'Beauty, Curated For You'
//   },
//   description: {
//     type: String,
//     default: 'Discover our handpicked collection of premium beauty products, carefully selected to enhance your natural beauty.'
//   },
//   buttonText: {
//     type: String,
//     default: 'View All Products'
//   },
//   buttonLink: {
//     type: String,
//     default: '/products'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// });

// // ============================================================
// // CTA SCHEMA
// // ============================================================

// const ctaSchema = new mongoose.Schema({
//   backgroundImage: {
//     type: String,
//     default: '/images/cta-bg.jpg'
//   },
//   title: {
//     type: String,
//     default: "We're Here to Help"
//   },
//   description: {
//     type: String,
//     default: 'Our beauty experts are ready to assist you with any questions about products or orders.'
//   },
//   buttonText: {
//     type: String,
//     default: 'Shop Now'
//   },
//   buttonLink: {
//     type: String,
//     default: '/products'
//   },
//   secondaryButtonText: {
//     type: String,
//     default: 'Contact Us'
//   },
//   secondaryButtonLink: {
//     type: String,
//     default: '/contact'
//   }
// });

// // ============================================================
// // MAIN ABOUT SCHEMA
// // ============================================================

// const aboutSchema = new mongoose.Schema({
//   hero: {
//     type: heroSchema,
//     default: () => ({})
//   },
//   stats: {
//     type: statsSchema,
//     default: () => ({})
//   },
//   story: {
//     type: storySchema,
//     default: () => ({})
//   },
//   whyChooseUs: {
//     type: whyChooseUsSchema,
//     default: () => ({})
//   },
//   curatedForYou: {
//     type: curatedForYouSchema,
//     default: () => ({})
//   },
//   cta: {
//     type: ctaSchema,
//     default: () => ({})
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

// aboutSchema.index({ isActive: 1 });
// aboutSchema.index({ updatedAt: -1 });

// module.exports = mongoose.model('About', aboutSchema);

const mongoose = require('mongoose');

// ============================================================
// REUSABLE
// ============================================================

const buttonSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  link: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
});

const galleryImageSchema = new mongoose.Schema({
  url: { type: String, default: '' },
  alt: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

// ============================================================
// HERO — single image
// ============================================================

const heroSchema = new mongoose.Schema({
  sectionName: { type: String, default: 'Hero' },
  image: { type: String, default: '/images/about1.jpg' },
  imageAlt: { type: String, default: 'Handcrafted traditional work' },

  badge: { type: String, default: 'আমাদের গল্প' },
  title: { type: String, default: 'ঐতিহ্যের ছোঁয়ায়' },
  highlightedText: { type: String, default: 'হাতের ভালোবাসা' },
  description: { type: String, default: '' },

  primaryButton: { type: buttonSchema, default: () => ({}) },
});

// ============================================================
// BRAND STORY — UP TO 4 IMAGES + features
// ============================================================

const storyFeatureSchema = new mongoose.Schema({
  icon: { type: String, default: 'FaLeaf' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
});

const brandStorySchema = new mongoose.Schema({
  sectionName: { type: String, default: 'Brand Story' },

  // ⬇ up to 4 images
  images: { type: [galleryImageSchema], default: [] },

  imageCaption: { type: String, default: 'আমাদের নিজস্ব কারখানা' },

  badge: { type: String, default: 'আমাদের সম্পর্কে' },
  title: { type: String, default: 'বিস্তৃত ঐতিহ্য,' },
  highlightedText: { type: String, default: 'স্বপ্নে নতুন প্রজন্ম' },
  description: { type: String, default: '' },

  features: { type: [storyFeatureSchema], default: [] },
});

// ============================================================
// JOURNEY — timeline items
// ============================================================

const journeyItemSchema = new mongoose.Schema({
  year: { type: String, default: '' },
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  image: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const journeySchema = new mongoose.Schema({
  sectionName: { type: String, default: 'Journey' },
  badge: { type: String, default: 'আমাদের যাত্রা' },
  title: { type: String, default: 'শুরু থেকে' },
  highlightedText: { type: String, default: 'আজ পর্যন্ত' },
  description: { type: String, default: '' },
  items: { type: [journeyItemSchema], default: [] },
});

// ============================================================
// CRAFTSMANSHIP — cards
// ============================================================

const craftCardSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const craftsmanshipSchema = new mongoose.Schema({
  sectionName: { type: String, default: 'Craftsmanship' },
  badge: { type: String, default: 'আমাদের কারুশিল্প' },
  title: { type: String, default: 'যত্নে তৈরি,' },
  highlightedText: { type: String, default: 'ঐতিহ্যের হাত ধরে' },
  description: { type: String, default: '' },
  button: { type: buttonSchema, default: () => ({}) },
  cards: { type: [craftCardSchema], default: [] },
});

// ============================================================
// ARTISAN — single image + quote
// ============================================================

const artisanSchema = new mongoose.Schema({
  sectionName: { type: String, default: 'Artisan' },
  image: { type: String, default: '/images/about/family.jpg' },
  imageAlt: { type: String, default: 'Our artisan team' },

  badge: { type: String, default: 'আমাদের কারিগর' },
  title: { type: String, default: 'কারিগরের হাতে' },
  highlightedText: { type: String, default: 'আমাদের গল্প' },
  description: { type: String, default: '' },

  quote: { type: String, default: '' },
  quoteAuthor: { type: String, default: '' },
  button: { type: buttonSchema, default: () => ({}) },
});

// ============================================================
// GALLERY — unlimited images
// ============================================================

const gallerySchema = new mongoose.Schema({
  sectionName: { type: String, default: 'Gallery' },
  badge: { type: String, default: 'মুহূর্তগুলো' },
  title: { type: String, default: 'আমাদের কাজের কিছু গল্প' },
  description: { type: String, default: '' },
  images: { type: [galleryImageSchema], default: [] },
});

// ============================================================
// CTA — single background image
// ============================================================

const ctaSchema = new mongoose.Schema({
  sectionName: { type: String, default: 'Final CTA' },
  backgroundImage: { type: String, default: '/images/about/cta.jpg' },
  title: { type: String, default: 'ঐতিহ্যের গল্প বাঁচুক' },
  description: { type: String, default: '' },
  primaryButton: { type: buttonSchema, default: () => ({}) },
});

// ============================================================
// MAIN
// ============================================================

const aboutSchema = new mongoose.Schema({
  hero:          { type: heroSchema,          default: () => ({}) },
  brandStory:    { type: brandStorySchema,    default: () => ({}) },
  journey:       { type: journeySchema,       default: () => ({}) },
  craftsmanship: { type: craftsmanshipSchema, default: () => ({}) },
  artisan:       { type: artisanSchema,       default: () => ({}) },
  gallery:       { type: gallerySchema,       default: () => ({}) },
  cta:           { type: ctaSchema,           default: () => ({}) },

  isActive:  { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

aboutSchema.index({ isActive: 1 });
aboutSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('About', aboutSchema);