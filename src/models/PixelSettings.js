const mongoose = require('mongoose');

const pixelSettingsSchema = new mongoose.Schema({
  // Master switch
  enabled: {
    type: Boolean,
    default: false
  },
  
  // Facebook Pixel Settings
  facebook: {
    enabled: {
      type: Boolean,
      default: false
    },
    pixelId: {
      type: String,
      trim: true,
      default: ''
    },
    accessToken: {
      type: String,
      trim: true,
      default: ''
    },
    testEventCode: {
      type: String,
      trim: true,
      default: ''
    },
    autoConfig: {
      type: Boolean,
      default: true
    },
    debug: {
      type: Boolean,
      default: false
    },
    // For Conversions API
    capiEnabled: {
      type: Boolean,
      default: false
    },
    capiToken: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Google Analytics Settings
  google: {
    enabled: {
      type: Boolean,
      default: false
    },
    measurementId: {
      type: String,
      trim: true,
      default: ''
    },
    debug: {
      type: Boolean,
      default: false
    },
    // For GA4
    apiSecret: {
      type: String,
      trim: true,
      default: ''
    }
  },
  
  // Custom events tracking
  customEvents: {
    addToCart: {
      type: Boolean,
      default: true
    },
    initiateCheckout: {
      type: Boolean,
      default: true
    },
    purchase: {
      type: Boolean,
      default: true
    },
    viewContent: {
      type: Boolean,
      default: true
    },
    search: {
      type: Boolean,
      default: true
    },
    contact: {
      type: Boolean,
      default: true
    },
    newsletterSignup: {
      type: Boolean,
      default: true
    }
  },
  
  // Update tracking
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get current settings
pixelSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      enabled: false,
      facebook: { enabled: false, pixelId: '', accessToken: '', testEventCode: '', autoConfig: true, debug: false },
      google: { enabled: false, measurementId: '', debug: false },
      customEvents: {
        addToCart: true,
        initiateCheckout: true,
        purchase: true,
        viewContent: true,
        search: true,
        contact: true,
        newsletterSignup: true
      }
    });
  }
  return settings;
};

const PixelSettings = mongoose.models.PixelSettings || mongoose.model('PixelSettings', pixelSettingsSchema);

module.exports = PixelSettings;