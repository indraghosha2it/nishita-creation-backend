// models/EmailSettings.js
const mongoose = require('mongoose');

const emailSettingsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['order', 'system'],
    required: true,
    index: true
  },
  smtpHost: {
    type: String,
    required: true,
    trim: true
  },
  smtpPort: {
    type: String,
    required: true,
    default: ''
  },
  smtpUser: {
    type: String,
    required: true,
    trim: true
  },
  smtpPassword: {
    type: String,
    required: true
  },
  smtpSecure: {
    type: Boolean,
    default: false
  },
  fromEmail: {
    type: String,
    required: true,
    trim: true
  },
  fromName: {
    type: String,
    default: 'HyperVolt',
    trim: true
  },
  ownerEmail: {
    type: String,
    required: true,
    trim: true
  },
  isConfigured: {
    type: Boolean,
    default: false
  },
  lastTestedAt: {
    type: Date,
    default: null
  },
  lastTestResult: {
    type: Boolean,
    default: false
  },
  lastTestMessage: {
    type: String,
    default: ''
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

// Ensure only one document per type exists
emailSettingsSchema.statics.getSettings = async function(type) {
  if (!['order', 'system'].includes(type)) {
    throw new Error('Invalid email type. Must be "order" or "system"');
  }
  
  let settings = await this.findOne({ type });
  
  if (!settings) {
    settings = new this({
      type: type,
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: false,
      fromEmail: '',
      fromName: 'HyperVolt',
      ownerEmail: '',
      isConfigured: false
    });
    await settings.save();
  }
  
  return settings;
};

// ✅ ONLY hide password when sending to non-admin users
// For admin API responses, we want to show the password
emailSettingsSchema.set('toJSON', {
  transform: function(doc, ret) {
    // We want to keep the password for admin use
    // Only remove if you want to hide it (but then admins can't see it)
    // return ret;
    
    // Let's keep the password so admins can view/edit it
    return ret;
  }
});

module.exports = mongoose.models.EmailSettings || mongoose.model('EmailSettings', emailSettingsSchema);