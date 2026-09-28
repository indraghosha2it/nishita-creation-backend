// backend/src/models/ChatFAQ.js

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    unique: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  keywords: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['general', 'products', 'policies', 'orders', 'shipping', 'payment', 'brands', 'other'],
    default: 'general'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
faqSchema.index({ question: 'text', keywords: 'text' });
faqSchema.index({ category: 1, isActive: 1 });
faqSchema.index({ priority: -1 });

// Virtual: get all keywords
faqSchema.virtual('allKeywords').get(function() {
  const questionWords = this.question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const manualKeywords = this.keywords || [];
  
  // ✅ FIXED: Removed extra closing parenthesis
  return [...new Set([...questionWords, ...manualKeywords])];
});

// Pre-save hook to generate keywords
faqSchema.pre('save', function(next) {
  if (!this.keywords || this.keywords.length === 0) {
    this.keywords = this.question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }
  next();
});

module.exports = mongoose.model('ChatFAQ', faqSchema);