
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  isGuest: {
    type: Boolean,
    default: false
  },
  guestEmail: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        if (this.isGuest && !v) return true; // Email is now optional
        if (!this.isGuest) return true;
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  guestName: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (this.isGuest && !v) return false;
        return true;
      },
      message: 'Please provide your name for guest review'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: '' // Email is now optional
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  productName: {
    type: String,
    trim: true,
    default: ''
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  video: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNote: {
    type: String,
    trim: true,
    default: ''
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  reply: {
    text: {
      type: String,
      trim: true,
      default: ''
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    repliedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Pre-save middleware
reviewSchema.pre('save', async function() {
  // For guest reviews, ensure user is null and guest fields are present
  if (this.isGuest) {
    this.user = null;
    if (!this.guestName) {
      throw new Error('Guest reviews require guestName');
    }
    // Email is optional for guests
  } else {
    // For logged-in users, ensure user is present
    if (!this.user) {
      throw new Error('Logged-in reviews require a user ID');
    }
    this.guestEmail = null;
    this.guestName = null;
  }
});

// Indexes for better query performance
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ email: 1 });
reviewSchema.index({ isGuest: 1, guestEmail: 1 });

// Virtual for display name (handles anonymous reviews)
reviewSchema.virtual('displayName').get(function() {
  if (this.isAnonymous) {
    return 'Anonymous User';
  }
  return this.userName;
});

// Ensure virtuals are included in JSON output
reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

// Fix: Use mongoose.models to prevent overwriting model
module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);