


// const mongoose = require('mongoose');

// const tagSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Tag name is required'],
//     unique: true,
//     trim: true,
//     maxlength: [50, 'Tag name cannot exceed 50 characters']
//   },
//   slug: {
//     type: String,
//     lowercase: true,
//     unique: true,
//     trim: true
//   },
//   image: {
//     type: String,
//     required: [true, 'Tag image is required'],
//     default: ''
//   },
//   imagePublicId: {
//     type: String,
//     default: ''
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   }
// }, {
//   timestamps: true
// });

// // Pre-save hook to generate slug
// tagSchema.pre('save', function() {
//   if (this.isModified('name')) {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)+/g, '');
//   }
// });

// // Indexes
// tagSchema.index({ name: 1 });
// tagSchema.index({ isActive: 1 });
// tagSchema.index({ slug: 1 });

// // Check if model already exists
// const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);

// module.exports = Tag;



const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Tag name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Tag image is required'],
    default: ''
  },
  imageMobile: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  imageMobilePublicId: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save hook to generate slug
tagSchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

// Indexes
tagSchema.index({ name: 1 });
tagSchema.index({ isActive: 1 });
tagSchema.index({ slug: 1 });
tagSchema.index({ order: 1 });

// Check if model already exists
const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);

module.exports = Tag;