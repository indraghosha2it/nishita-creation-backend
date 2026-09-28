// backend/src/models/WhyChooseUs.js
const mongoose = require('mongoose');

// ============================================================
// WHY CHOOSE US - SINGLE CARD SCHEMA
// ============================================================

const whyChooseUsCardSchema = new mongoose.Schema({
  icon: {
    type: String,
    enum: [
      'Shield', 'Truck', 'Leaf', 'Award', 
      'Star', 'Heart', 'Clock', 'Gift',
      'Sparkles', 'Flower2', 'Droplets', 'Sun',
      'Moon', 'ThumbsUp', 'CheckCircle2', 'Crown',
      'Users', 'Smile', 'Gem', 'Hand'
    ],
    default: 'Shield'
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'Title is required'],
    default: 'Quality Assurance'
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Description is required'],
    default: 'Premium quality products sourced directly from trusted brands'
  },
  side: {
    type: String,
    enum: ['left', 'right'],
    default: 'left'
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// ============================================================
// MAIN WHY CHOOSE US SCHEMA
// ============================================================

const whyChooseUsSchema = new mongoose.Schema({
  // Section Settings
  section: {
    badge: {
      type: String,
      default: 'Why Choose Us'
    },
    title: {
      type: String,
      default: 'Why Choose Us'
    },
    subtitle: {
      type: String,
      default: 'Discover why thousands of beauty enthusiasts trust us for their skincare and makeup needs'
    }
  },

  // Cards/Items
  cards: {
    type: [whyChooseUsCardSchema],
    default: [],
    validate: {
      validator: function(cards) {
        return cards.length <= 12;
      },
      message: 'Maximum 12 cards allowed'
    }
  },

  // ✅ Center Image - This will be stored and served from backend
  centerImage: {
    type: String,
    default: '/images/choose.jpg'
  },

  // Bottom Trust Badges
  trustBadges: {
    type: [{
      icon: {
        type: String,
        enum: ['ThumbsUp', 'CheckCircle2', 'Crown', 'Award', 'Heart', 'Star', 'Shield', 'Users'],
        default: 'ThumbsUp'
      },
      label: {
        type: String,
        trim: true,
        default: 'Trusted by 10k+ Customers'
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    default: []
  },

  // Display Settings
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

// ============================================================
// INDEXES
// ============================================================

whyChooseUsSchema.index({ isActive: 1 });
whyChooseUsSchema.index({ updatedAt: -1 });

// ============================================================
// EXPORT
// ============================================================

module.exports = mongoose.model('WhyChooseUs', whyChooseUsSchema);