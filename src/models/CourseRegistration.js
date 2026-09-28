// models/CourseRegistration.js
const mongoose = require('mongoose');

const courseRegistrationSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  // User reference (if logged in)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Registration info
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  facebookId: {
    type: String,
    trim: true,
    default: ''
  },
  whatsappNumber: {
    type: String,
    trim: true,
    default: ''
  },
  // Registration status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  // Who confirmed/cancelled
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  // Additional notes
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  },
  // Registration source
  registrationSource: {
    type: String,
    enum: ['website', 'admin', 'phone', 'walk-in'],
    default: 'website'
  },
  // Payment info
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    trim: true,
    default: ''
  },
  paymentNote: {
    type: String,
    trim: true,
    default: ''
  },
  // Device info for tracking
  clientDeviceInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
courseRegistrationSchema.index({ courseId: 1, phone: 1 }, { unique: true });
courseRegistrationSchema.index({ courseId: 1, status: 1 });
courseRegistrationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CourseRegistration', courseRegistrationSchema);