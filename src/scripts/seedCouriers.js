// // D:\Smart-Gadget\Gadget-backend\src\scripts\seedCouriers.js

// const mongoose = require('mongoose');
// const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// // IMPORTANT: Fix the path to Courier model
// const Courier = require('../models/Courier');

// const courierData = [
//   {
//     name: 'Pathao',
//     slug: 'pathao',
//     apiEnabled: false,
//     credentialsEncrypted: '',
//     storeConfig: {
//       pathaoStoreId: null,
//       pathaoStoreName: ''
//     },
//     capabilities: {
//       canTrack: true,
//       canReturn: true,
//       requiresWeight: true,
//       requiresDimensions: false
//     },
//     deliveryChargeConfig: {
//       baseCharge: 50,
//       perKgCharge: 20,
//       insideDhakaCharge: 70,
//       outsideDhakaCharge: 150
//     },
//     isActive: true
//   },
//   {
//     name: 'Steadfast',
//     slug: 'steadfast',
//     apiEnabled: false,
//     credentialsEncrypted: '',
//     storeConfig: {
//       steadfastStoreId: null
//     },
//     capabilities: {
//       canTrack: true,
//       canReturn: true,
//       requiresWeight: true,
//       requiresDimensions: false
//     },
//     deliveryChargeConfig: {
//       baseCharge: 40,
//       perKgCharge: 25,
//       insideDhakaCharge: 60,
//       outsideDhakaCharge: 120
//     },
//     isActive: true
//   }
// ];

// async function seedCouriers() {
//   try {
//     const mongoURI = process.env.MONGODB_URI;
//     if (!mongoURI) {
//       console.error('❌ MONGODB_URI not found in .env file');
//       process.exit(1);
//     }
    
//     console.log(`📡 Connecting to MongoDB...`);
    
//     // ✅ FIX: Remove deprecated options
//     // Just pass the URI without any options
//     await mongoose.connect(mongoURI);
    
//     console.log('✅ Connected to MongoDB');

//     // Check if couriers already exist
//     const existingCount = await Courier.countDocuments();
//     console.log(`📊 Existing couriers in DB: ${existingCount}`);

//     // Insert couriers
//     let insertedCount = 0;
//     let skippedCount = 0;
    
//     for (const courier of courierData) {
//       const existing = await Courier.findOne({ slug: courier.slug });
//       if (!existing) {
//         await Courier.create(courier);
//         console.log(`✅ Created courier: ${courier.name}`);
//         insertedCount++;
//       } else {
//         console.log(`⏭️ Skipped ${courier.name} (already exists)`);
//         skippedCount++;
//       }
//     }

//     // Verify
//     const finalCount = await Courier.countDocuments();
//     console.log(`\n📊 Final courier count: ${finalCount}`);
//     console.log(`✅ Inserted: ${insertedCount}`);
//     console.log(`⏭️ Skipped: ${skippedCount}`);

//     // List all couriers
//     const allCouriers = await Courier.find({}, 'name slug apiEnabled isActive');
//     console.log('\n📋 Current couriers:');
//     allCouriers.forEach(c => {
//       console.log(`  - ${c.name} (${c.slug}) | API: ${c.apiEnabled ? '✅' : '❌'} | Active: ${c.isActive ? '✅' : '❌'}`);
//     });

//     await mongoose.disconnect();
//     console.log('\n✅ Disconnected from MongoDB');
    
//   } catch (error) {
//     console.error('❌ Error seeding couriers:', error.message);
//     console.error(error.stack);
//     if (mongoose.connection.readyState === 1) {
//       await mongoose.disconnect();
//     }
//     process.exit(1);
//   }
// }

// // Run the seed
// console.log('🚀 Starting courier seed...\n');
// seedCouriers();


const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Courier = require('../models/Courier');

const courierData = [
  {
    name: 'Pathao',
    slug: 'pathao',
    apiEnabled: false,
    credentialsEncrypted: '',
    storeConfig: { pathaoStoreId: null, pathaoStoreName: '' },
    capabilities: { canTrack: true, canReturn: true, requiresWeight: true, requiresDimensions: false },
    deliveryChargeConfig: { baseCharge: 50, perKgCharge: 20, insideDhakaCharge: 70, outsideDhakaCharge: 150 },
    isActive: true
  },
  {
    name: 'Steadfast',
    slug: 'steadfast',
    apiEnabled: false,
    credentialsEncrypted: '',
    storeConfig: {},
    capabilities: { canTrack: true, canReturn: true, requiresWeight: true, requiresDimensions: false },
    deliveryChargeConfig: { baseCharge: 40, perKgCharge: 25, insideDhakaCharge: 60, outsideDhakaCharge: 120 },
    isActive: true
  },
  {
    name: 'RedX',
    slug: 'redx',
    apiEnabled: false,
    credentialsEncrypted: '',
    storeConfig: {},
    capabilities: { canTrack: true, canReturn: true, requiresWeight: true, requiresDimensions: false },
    deliveryChargeConfig: { baseCharge: 45, perKgCharge: 22, insideDhakaCharge: 65, outsideDhakaCharge: 130 },
    isActive: true
  }
];

async function seedCouriers() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const courier of courierData) {
      const existing = await Courier.findOne({ slug: courier.slug });
      if (!existing) {
        await Courier.create(courier);
        console.log(`✅ Created courier: ${courier.name}`);
        insertedCount++;
      } else {
        console.log(`⏭️ Skipped ${courier.name} (already exists)`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Inserted: ${insertedCount}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding couriers:', error.message);
    process.exit(1);
  }
}

seedCouriers();