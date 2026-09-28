
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: function() {
      return this.authProvider !== 'google' || this.profileCompleted;
    },
    trim: true
  },
  // whatsapp: {
  //   type: String,
  //   required: function() {
  //     return this.authProvider !== 'google' || this.profileCompleted;
  //   },
  //   trim: true
  // },

  whatsapp: {
  type: String,
  trim: true,
  default: ''  // Optional - provides default empty string
},
  country: {
    type: String,
    required: function() {
      return this.authProvider !== 'google' || this.profileCompleted;
    },
    trim: true
  },
  address: {
    type: String,
    required: function() {
      return this.authProvider !== 'google' || this.profileCompleted;
    },
    trim: true
  },
  city: {
    type: String,
    required: function() {
      return this.authProvider !== 'google' || this.profileCompleted;
    },
    trim: true
  },
  zipCode: {
    type: String,
    required: function() {
      return this.authProvider !== 'google' || this.profileCompleted;
    },
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'call_center_agent', 'customer'],
    default: 'customer'
  },
  password: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  otp: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  registrationStatus: {
    type: String,
    enum: ['pending', 'verified', 'completed'],
    default: 'pending'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordOTP: {
    type: String,
    select: false
  },
  resetPasswordOTPExpiry: {
    type: Date,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  loginCount: {
    type: Number,
    default: 0
  },
  firebaseUid: {
    type: String,
    sparse: true,
    unique: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false }
  },
  isSubscribedToNewsletter: {
    type: Boolean,
    default: false
  },
  newsletterSubscriptionDate: {
    type: Date,
    default: null
  },
  newsletterPreferences: {
    type: String,
    enum: ['all', 'products_only', 'offers_only', 'sustainability_only'],
    default: 'all'
  },
  // NEW FIELDS FOR ROLE MANAGEMENT
  permissions: {
    type: [String],
    default: []
  },
  dashboardAccess: {
    type: [String],
    default: []
  },
  roleAssignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  roleAssignedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.emailVerificationToken;
  return userObject;
};

// Update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// NEW: Check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// NEW: Check if user can access dashboard section
userSchema.methods.canAccessDashboard = function(section) {
  if (this.role === 'super_admin') return true;
  return this.dashboardAccess.includes(section);
};

const User = mongoose.model('User', userSchema);
module.exports = User;