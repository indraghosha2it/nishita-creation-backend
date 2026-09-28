const mongoose = require('mongoose');

const orderRestrictionSchema = new mongoose.Schema({
  // IP Based Restrictions
  ipRestrictions: {
    // Time interval restriction (same IP cannot place orders within this time)
    timeInterval: {
      enabled: { type: Boolean, default: false },
      value: { type: Number, default: 5 },
      unit: { type: String, enum: ['min', 'hr'], default: 'min' }
    },
    // Blocked IPs list
    blockedIPs: [{
      ip: { type: String, required: true },
      reason: { type: String, default: '' },
      addedAt: { type: Date, default: Date.now },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  },

  // Phone Based Restrictions
  phoneRestrictions: {
    // Time interval restriction (same phone cannot place orders within this time)
    timeInterval: {
      enabled: { type: Boolean, default: false },
      value: { type: Number, default: 10 },
      unit: { type: String, enum: ['min', 'hr'], default: 'min' }
    },
    // Blocked phone numbers
    blockedPhones: [{
      phone: { type: String, required: true },
      reason: { type: String, default: '' },
      addedAt: { type: Date, default: Date.now },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  },

  // Email Based Restrictions
  emailRestrictions: {
    // Blocked emails
    blockedEmails: [{
      email: { type: String, required: true },
      reason: { type: String, default: '' },
      addedAt: { type: Date, default: Date.now },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  },

  // Audit trail
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to check if a restriction exists
orderRestrictionSchema.statics.getRestrictions = async function() {
  let restrictions = await this.findOne();
  if (!restrictions) {
    restrictions = new this();
    await restrictions.save();
  }
  return restrictions;
};

module.exports = mongoose.models.OrderRestriction || mongoose.model('OrderRestriction', orderRestrictionSchema);