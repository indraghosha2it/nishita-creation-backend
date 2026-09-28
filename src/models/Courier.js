
// const mongoose = require('mongoose');

// const courierSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   slug: { type: String, required: true, unique: true, lowercase: true },
//   apiEnabled: { type: Boolean, default: false },
//   credentialsEncrypted: { type: String, default: '' },
//   storeConfig: {
//     pathaoStoreId: { type: Number, default: null },
//     pathaoStoreName: { type: String, default: '' }
//   },
//   integrationStatus: {
//     lastTestedAt: { type: Date, default: null },
//     lastTestOk: { type: Boolean, default: false },
//     lastTestMessage: { type: String, default: '' }
//   },
//   capabilities: {
//     canTrack: { type: Boolean, default: true },
//     canReturn: { type: Boolean, default: true },
//     requiresWeight: { type: Boolean, default: true },
//     requiresDimensions: { type: Boolean, default: false }
//   },
//   isActive: { type: Boolean, default: true }
// }, { timestamps: true });

// module.exports = mongoose.models.Courier || mongoose.model('Courier', courierSchema);



// models/Courier.js

const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  apiEnabled: { type: Boolean, default: false },
  credentialsEncrypted: { type: String, default: '' },
  storeConfig: {
    pathaoStoreId: { type: Number, default: null },
    pathaoStoreName: { type: String, default: '' }
  },
  
  // ========== 🆕 WEBHOOK CONFIGURATION ==========
  webhookConfig: {
    enabled: { type: Boolean, default: false },
    secret: { type: String, default: null },      // For Pathao
    bearerToken: { type: String, default: null }, // For Steadfast
    token: { type: String, default: null },       // For RedX (query param)
    events: [{ type: String }],                   // Which events to receive
    lastSuccessAt: { type: Date, default: null },
    lastErrorAt: { type: Date, default: null },
    lastError: { type: String, default: '' }
  },
  
  integrationStatus: {
    lastTestedAt: { type: Date, default: null },
    lastTestOk: { type: Boolean, default: false },
    lastTestMessage: { type: String, default: '' }
  },
  capabilities: {
    canTrack: { type: Boolean, default: true },
    canReturn: { type: Boolean, default: true },
    requiresWeight: { type: Boolean, default: true },
    requiresDimensions: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Courier || mongoose.model('Courier', courierSchema);