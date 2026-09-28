// backend/src/models/TrustResults.js
const mongoose = require('mongoose');

// ============================================================
// FEATURED PRODUCT SCHEMA (for carousel items)
// ============================================================

const featuredProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    trim: true,
    required: [true, 'Product name is required'],
    default: 'Radiance Face Serum'
  },
  image: {
    type: String,
    trim: true,
    default: '/images/products/radiance-serum.png'
  },
  link: {
    type: String,
    trim: true,
    default: '/products'
  },
  // Stats specific to this product
  stats: [{
    value: {
      type: String,
      trim: true,
      default: '92%'
    },
    text: {
      type: String,
      trim: true,
      default: 'saw brighter skin'
    }
  }],
  // Before/After images for this product
  beforeAfter: {
    beforeImage: {
      type: String,
      trim: true,
      default: '/images/results-before.jpg'
    },
    afterImage: {
      type: String,
      trim: true,
      default: '/images/results-after.jpg'
    },
    beforeLabel: {
      type: String,
      trim: true,
      default: 'BEFORE'
    },
    afterLabel: {
      type: String,
      trim: true,
      default: 'AFTER 4 WEEKS'
    }
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// ============================================================
// STAT ITEM SCHEMA (Global stats - optional)
// ============================================================

const statItemSchema = new mongoose.Schema({
  value: {
    type: String,
    trim: true,
    required: [true, 'Stat value is required'],
    default: '92%'
  },
  text: {
    type: String,
    trim: true,
    required: [true, 'Stat text is required'],
    default: 'saw brighter skin'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// ============================================================
// TRUST FEATURE SCHEMA
// ============================================================

const trustFeatureSchema = new mongoose.Schema({
  icon: {
    type: String,
    enum: ['ShieldCheck', 'FlaskConical', 'Leaf', 'HeartHandshake', 'Heart', 'Star', 'Users', 'Award'],
    default: 'ShieldCheck'
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'Trust feature title is required'],
    default: 'DERMATOLOGIST TESTED'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// ============================================================
// TESTIMONIAL SCHEMA
// ============================================================

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Customer name is required'],
    default: 'Jessica M.'
  },
  image: {
    type: String,
    trim: true,
    default: ''
  },
  review: {
    type: String,
    trim: true,
    required: [true, 'Review text is required'],
    default: '"My skin has never looked better!"'
  },
  description: {
    type: String,
    trim: true,
    default: '"The Radiance Serum is a game changer."'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// ============================================================
// MAIN TRUST RESULTS SCHEMA
// ============================================================

const trustResultsSchema = new mongoose.Schema({
  // Section Titles
  sectionTitle: {
    type: String,
    trim: true,
    default: 'TRUSTED BY THOUSANDS'
  },
  mainHeading: {
    type: String,
    trim: true,
    default: 'REAL RESULTS. REAL CONFIDENCE.'
  },
  
  // Featured Products (Carousel items)
  featuredProducts: {
    type: [featuredProductSchema],
    default: []
  },
  
  // Trust Features (Global - shown on every slide)
  trustFeatures: {
    type: [trustFeatureSchema],
    default: []
  },
  
  // Testimonials
  testimonials: {
    type: [testimonialSchema],
    default: []
  },
  
  testimonialsTitle: {
    type: String,
    trim: true,
    default: 'LOVED BY OUR COMMUNITY'
  },
  
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
trustResultsSchema.index({ isActive: 1 });
trustResultsSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('TrustResults', trustResultsSchema);