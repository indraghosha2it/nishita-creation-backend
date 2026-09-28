
// const mongoose = require('mongoose');

// const subCityChargeSchema = new mongoose.Schema({
//   upazila: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   charge: {
//     type: Number,
//     required: true,
//     min: 0
//   }
// });

// const deliverySettingsSchema = new mongoose.Schema({
//   insideDhaka: {
//     type: Number,
//     required: true,
//     default: 70,
//     min: 0
//   },
//   outsideDhaka: {
//     type: Number,
//     required: true,
//     default: 150,
//     min: 0
//   },
//   subCityCharges: {
//     type: [subCityChargeSchema],
//     default: []
//   },
//   updatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   lastUpdated: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Ensure only one settings document exists
// deliverySettingsSchema.statics.getSettings = async function() {
//   let settings = await this.findOne();
//   if (!settings) {
//     settings = await this.create({
//       insideDhaka: 70,
//       outsideDhaka: 150,
//       subCityCharges: []
//     });
//   }
//   return settings;
// };

// // Method to get delivery charge based on city and zone
// deliverySettingsSchema.methods.getDeliveryCharge = function(city, zone) {
//   // If city is Dhaka, check if there's a sub-city charge for this zone
//   if (city && city.toLowerCase() === 'dhaka') {
//     const subCityCharge = this.subCityCharges.find(
//       sc => sc.upazila.toLowerCase() === zone?.toLowerCase()
//     );
//     if (subCityCharge) {
//       return subCityCharge.charge;
//     }
//     return this.insideDhaka;
//   }
//   return this.outsideDhaka;
// };

// module.exports = mongoose.models.DeliverySettings || mongoose.model('DeliverySettings', deliverySettingsSchema);


const mongoose = require('mongoose');

// Sub-city charge schema (for Upazila/Thana level)
const subCityChargeSchema = new mongoose.Schema({
  upazila: {
    type: String,
    required: true,
    trim: true
  },
  charge: {
    type: Number,
    required: true,
    min: 0
  }
});

// Union/Area charge schema (for Union/Area level within Dhaka)
const unionChargeSchema = new mongoose.Schema({
  upazila: {
    type: String,
    required: true,
    trim: true
  },
  union: {
    type: String,
    required: true,
    trim: true
  },
  charge: {
    type: Number,
    required: true,
    min: 0
  }
});

const deliverySettingsSchema = new mongoose.Schema({
  insideDhaka: {
    type: Number,
    required: true,
    default: 70,
    min: 0
  },
  outsideDhaka: {
    type: Number,
    required: true,
    default: 150,
    min: 0
  },
  subCityCharges: {
    type: [subCityChargeSchema],
    default: []
  },
  unionCharges: { // NEW: Union/Area level charges
    type: [unionChargeSchema],
    default: []
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
deliverySettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      insideDhaka: 70,
      outsideDhaka: 150,
      subCityCharges: [],
      unionCharges: []
    });
  }
  return settings;
};

// Method to get delivery charge based on city, zone (upazila), and area (union)
deliverySettingsSchema.methods.getDeliveryCharge = function(city, zone, area) {
  // If city is Dhaka
  if (city && city.toLowerCase() === 'dhaka') {
    // Check for union-level charge (most specific)
    if (zone && area) {
      const unionCharge = this.unionCharges.find(
        uc => uc.upazila.toLowerCase() === zone.toLowerCase() && 
              uc.union.toLowerCase() === area.toLowerCase()
      );
      if (unionCharge) {
        return unionCharge.charge;
      }
    }
    
    // Check for upazila-level charge (less specific)
    if (zone) {
      const subCityCharge = this.subCityCharges.find(
        sc => sc.upazila.toLowerCase() === zone.toLowerCase()
      );
      if (subCityCharge) {
        return subCityCharge.charge;
      }
    }
    
    // Default inside Dhaka
    return this.insideDhaka;
  }
  
  return this.outsideDhaka;
};

module.exports = mongoose.models.DeliverySettings || mongoose.model('DeliverySettings', deliverySettingsSchema);