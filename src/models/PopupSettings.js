// models/PopupSettings.js
const mongoose = require('mongoose');

const popupSettingsSchema = new mongoose.Schema({
  // Which popup to show
  activePopup: {
    type: String,
    enum: ['promotional', 'newsletter', 'none', 'both'],
    default: 'promotional'
  },
  
  // Priority order if both are selected
  priority: {
    type: String,
    enum: ['promotional_first', 'newsletter_first', 'alternating'],
    default: 'promotional_first'
  },
  
  // Newsletter popup configuration
  newsletter: {
    isActive: {
      type: Boolean,
      default: true
    },
    intervals: {
      type: [{
        delay: {
          type: Number,
          default: 5
        }
      }],
      default: [{ delay: 5 }, { delay: 15 }, { delay: 15 }]
    },
    maxShows: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    }
  },
  
  // Promotional popup configuration
  promotional: {
    isActive: {
      type: Boolean,
      default: true
    },
    // Reuse existing promotional settings or reference them
    useExistingPromotionalSettings: {
      type: Boolean,
      default: true
    }
  },
  
  // Global settings
  globalSettings: {
    enabledForLoggedInUsers: {
      type: Boolean,
      default: true
    },
    enabledForLoggedOutUsers: {
      type: Boolean,
      default: true
    },
    delayBeforeFirstPopup: {
      type: Number,
      default: 5 // seconds
    },
    popupFrequency: {
      type: String,
      enum: ['session', 'daily', 'weekly', 'once'],
      default: 'session'
    }
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Singleton - only one document should exist
popupSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('PopupSettings', popupSettingsSchema);