// models/Blog.js - Following Product schema pattern (no next parameter)
const mongoose = require('mongoose');

const blogParagraphSchema = new mongoose.Schema({
  header: {
    type: String,
    required: [true, 'Section header is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Section description is required']
  },
  image: {
    type: String
  }
}, { _id: false });

const thumbnailImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  }
}, { _id: false });

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
category: {
  type: String,
  required: [true, 'Category is required'],
  enum: [
    'parenting-kids',
    'toys-games',
    'education-learning',
    'gift-guides',
    'kids-activities',
    'child-development',
    'trends-news',
    'health-safety',
    'lifestyle-family',
    'sustainability-eco-friendly'
  ]
},
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    required: [true, 'Main content is required']
  },
  paragraphs: [blogParagraphSchema],
  featuredImage: {
    type: String,
    required: [true, 'Featured image is required']
  },
  featuredImagePublicId: {
    type: String,
    required: true
  },
  thumbnailImages: [thumbnailImageSchema],
  tags: [{
    type: String,
    trim: true
  }],
  youtubeVideo: {
    url: {
      type: String,
      trim: true
    },
    videoId: {
      type: String,
      trim: true
    },
    thumbnail: {
      type: String,
      trim: true
    }
  },
  //  videoUrl: {
  //   type: String,
  //   trim: true
  // },
  // videoPublicId: {
  //   type: String
  // },


  featured: {
    type: Boolean,
    default: false
  },
  metaTitle: {
    type: String,
    trim: true,
    default: ''
  },
  metaDescription: {
    type: String,
    trim: true,
    default: '',
  },
  metaKeywords: {
    type: String,
    trim: true,
    default: ''

  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ✅ FIXED: Following Product schema pattern - no parameters, no next()
blogSchema.pre('save', function() {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  // No return, no next() needed
});

// Index for search
blogSchema.index({ title: 'text', author: 'text', content: 'text', excerpt: 'text' });

blogSchema.index({ category: 1, featured: 1, isActive: 1 });
blogSchema.index({ publishDate: -1 });

// Check if model already exists
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

module.exports = Blog;