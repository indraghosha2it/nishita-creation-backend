// const mongoose = require('mongoose');

// const videoSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       trim: true,
//       default: '',
//       maxlength: [200, 'Title cannot exceed 200 characters']
//     },
//     type: {
//       type: String,
//       enum: ['promotional', 'workshop', 'review'],
//       required: [true, 'Video type is required']
//     },
//     // Source: 'upload' | 'youtube' | 'facebook' | 'instagram'
//     sourceType: {
//       type: String,
//       enum: ['upload', 'youtube', 'facebook', 'instagram'],
//       default: 'upload'
//     },
//     // Direct video URL (Cloudinary) — used when sourceType === 'upload'
//     videoUrl: {
//       type: String,
//       default: ''
//     },
//     videoPublicId: {
//       type: String,
//       default: ''
//     },
//     // External embed URL — used when sourceType is youtube/facebook/instagram
//     embedUrl: {
//       type: String,
//       default: ''
//     },
//     // Optional thumbnail (for non-upload sources)
//     thumbnail: {
//       type: String,
//       default: ''
//     },
//     displayOrder: {
//       type: Number,
//       default: 0
//     },
//     isActive: {
//       type: Boolean,
//       default: true
//     }
//   },
//   { timestamps: true }
// );

// videoSchema.index({ isActive: 1, displayOrder: 1 });

// module.exports = mongoose.model('Video', videoSchema);




const mongoose = require('mongoose');

// ============================================================
// LIVE SESSION SCHEMA (separate collection, same file)
// ============================================================
const liveSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Date & time is required']
    },
    link: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

liveSessionSchema.index({ isActive: 1, scheduledAt: 1 });
liveSessionSchema.index({ displayOrder: 1 });

const LiveSession = mongoose.model('LiveSession', liveSessionSchema);

// ============================================================
// VIDEO SCHEMA
// ============================================================
const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    type: {
      type: String,
      enum: ['promotional', 'workshop', 'review'],
      required: [true, 'Video type is required']
    },
    sourceType: {
      type: String,
      enum: ['upload', 'youtube', 'facebook', 'instagram'],
      default: 'upload'
    },
    videoUrl: { type: String, default: '' },
    videoPublicId: { type: String, default: '' },
    embedUrl: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

videoSchema.index({ isActive: 1, displayOrder: 1 });
videoSchema.index({ isFeatured: 1 });

const Video = mongoose.model('Video', videoSchema);

module.exports = { Video, LiveSession };