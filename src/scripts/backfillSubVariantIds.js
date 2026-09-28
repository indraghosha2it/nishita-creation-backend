// scripts/backfillSubVariantIds.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import your Product model
const Product = require('../models/Product');

async function backfillSubVariantIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
    console.log('Connected to MongoDB');

    // Find all products that have variants with sub-variants
    const products = await Product.find({ 
      'variantTypes.0': { $exists: true } 
    });
    
    console.log(`Found ${products.length} products with variants`);
    
    let updatedCount = 0;

    for (const product of products) {
      let changed = false;

      // Loop through variant types
      product.variantTypes.forEach(vt => {
        // Loop through variants
        vt.variants.forEach(v => {
          // Loop through sub-variants
          v.subVariants.forEach(sv => {
            // If sub-variant doesn't have an id, generate one
            if (!sv.id) {
              sv.id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
              changed = true;
              console.log(`  Generated ID for sub-variant: ${sv.name} -> ${sv.id}`);
            }
          });
        });
      });

      if (changed) {
        await product.save();
        updatedCount++;
        console.log(`✅ Updated product: ${product.productName} (${product._id})`);
      }
    }

    console.log(`\n✅ Backfill complete! Updated ${updatedCount} products.`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error during backfill:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the backfill
backfillSubVariantIds();