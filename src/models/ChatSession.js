// backend/src/models/ChatSession.js

const mongoose = require('mongoose');

// Individual message schema
const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isError: {
    type: Boolean,
    default: false
  },
  faqMatched: {
    type: Boolean,
    default: false
  },
  faqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatFAQ'
  }
});

// Main chat session schema
const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    index: true
  },
  sessionId: {
    type: String,
    sparse: true,
    index: true
  },
  messages: [chatMessageSchema],
  context: {
    currentPage: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    referrer: { type: String, default: '' },
    custom: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalInteractions: {
    type: Number,
    default: 0
  },
  faqMatches: {
    type: Number,
    default: 0
  },
  productSearches: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ userId: 1, lastActivity: -1 });
chatSessionSchema.index({ sessionId: 1, lastActivity: -1 });
chatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 2592000 });

// Pre-save hooks
chatSessionSchema.pre('save', function(next) {
  if (!this.userId && !this.sessionId) {
    next(new Error('Either userId or sessionId must be provided'));
  }
  next();
});

chatSessionSchema.pre('save', function(next) {
  this.messageCount = this.messages.length;
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);