const mongoose = require('mongoose');

const customCodeSchema = new mongoose.Schema({
  headerCode: {
    type: String,
    default: ''
  },
  bodyCode: {
    type: String,
    default: ''
  },
  footerCode: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
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
customCodeSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      headerCode: '',
      bodyCode: '',
      footerCode: '',
      active: true
    });
  }
  return settings;
};

const CustomCode = mongoose.models.CustomCode || mongoose.model('CustomCode', customCodeSchema);

module.exports = CustomCode;