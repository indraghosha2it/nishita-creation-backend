// backend/src/models/Deal.js
const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    // Remove required validation
    maxlength: [100, 'Title cannot exceed 100 characters'],
    default: '' // Default to empty string
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  buttonText: {
    type: String,
    trim: true,
    default: ''
  },
  buttonLink: {
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
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  backgroundColor: {
    type: String,
    default: '#FFF5F6'
  },
  textColor: {
    type: String,
    default: '#2D1B2E'
  },
  buttonColor: {
    type: String,
    default: '#EE4275'
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
dealSchema.index({ displayOrder: 1 });
dealSchema.index({ isActive: 1 });
dealSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Deal', dealSchema);