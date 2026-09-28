// // backend/src/models/Brand.js
// const mongoose = require('mongoose');

// const brandSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Brand name is required'],
//     unique: true,
//     trim: true,
//     uppercase: true
//   },
//   slug: {
//     type: String,
//     unique: true,
//     lowercase: true,
//     trim: true
//   },
//   logo: {
//     type: String,
//     default: ''
//   },
//   description: {
//     type: String,
//     default: ''
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   productCount: {
//     type: Number,
//     default: 0
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // ✅ FIXED: Following Product/Blog schema pattern - no parameters, no next()
// brandSchema.pre('save', function() {
//   if (this.isModified('name')) {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)+/g, '');
//   }
//   // No return, no next() needed
// });

// // Index for search
// brandSchema.index({ name: 1 });
// brandSchema.index({ isActive: 1 });
// brandSchema.index({ slug: 1 });

// // Check if model already exists (following Product pattern)
// const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

// module.exports = Brand;



// backend/src/models/Brand.js
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Brand name is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  productCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate slug before saving
brandSchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

// Index for search
brandSchema.index({ name: 1 });
brandSchema.index({ isActive: 1 });
brandSchema.index({ slug: 1 });

const Brand = mongoose.models.Brand || mongoose.model('Brand', brandSchema);

module.exports = Brand;