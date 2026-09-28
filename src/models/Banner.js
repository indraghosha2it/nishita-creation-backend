


const mongoose = require('mongoose');

// ============================================================
// BANNER SLIDE SUB-SCHEMA
// ============================================================
const bannerSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: '', // ✅ per-slide title (optional)
    maxlength: [120, 'Slide title cannot exceed 120 characters']
  },
  bgImage: {
    type: String,
    required: [true, 'Background image is required']
  },
  ctaLabel: {
    type: String,
    trim: true,
    default: '' // empty = no button
  },
  ctaHref: {
    type: String,
    trim: true,
    default: '/products'
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
// ANNOUNCEMENT SUB-SCHEMA
// ============================================================
const announcementSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Announcement text is required'],
    trim: true,
    maxlength: [200, 'Announcement cannot exceed 200 characters']
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// ============================================================
// MAIN BANNER DOCUMENT (singleton pattern)
// — one document holds slides + announcements
// ============================================================
const bannerConfigSchema = new mongoose.Schema(
  {
    slides: [bannerSlideSchema],
    announcements: [announcementSchema],

    // Global toggle
    isActive: {
      type: Boolean,
      default: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

bannerConfigSchema.index({ isActive: 1 });
bannerConfigSchema.index({ updatedAt: -1 });

const Banner =
  mongoose.models.Banner || mongoose.model('Banner', bannerConfigSchema);

module.exports = Banner;