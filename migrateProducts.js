// backend/migrateProducts.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import your models - Counter is exported from Product
const Product = require('./src/models/Product');
// Counter is already exported from Product, so we don't need to import it separately

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-gadget', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Migration function
const migrateProducts = async () => {
  try {
    console.log('Starting product migration...');
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);

    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};

      console.log(`\nProcessing product: ${product.productName} (${product._id})`);

      // 1. Add missing fields with default values
      if (product.buyingPrice === undefined || product.buyingPrice === null) {
        // If buyingPrice doesn't exist, use costPerItem as fallback or set to 0
        updateData.buyingPrice = product.costPerItem || 0;
        needsUpdate = true;
        console.log(`  - Added buyingPrice: ${updateData.buyingPrice}`);
      }

      if (product.packagingCost === undefined || product.packagingCost === null) {
        updateData.packagingCost = 0;
        needsUpdate = true;
        console.log(`  - Added packagingCost: 0`);
      }

      if (product.deliveryCost === undefined || product.deliveryCost === null) {
        updateData.deliveryCost = 0;
        needsUpdate = true;
        console.log(`  - Added deliveryCost: 0`);
      }

      // 2. Recalculate costPerItem if buyingPrice, packagingCost, or deliveryCost changed
      if (needsUpdate || product.costPerItem === undefined || product.costPerItem === null) {
        const buyingPrice = updateData.buyingPrice !== undefined ? updateData.buyingPrice : (product.buyingPrice || 0);
        const packagingCost = updateData.packagingCost !== undefined ? updateData.packagingCost : (product.packagingCost || 0);
        const deliveryCost = updateData.deliveryCost !== undefined ? updateData.deliveryCost : (product.deliveryCost || 0);
        
        const calculatedCost = Number(buyingPrice) + Number(packagingCost) + Number(deliveryCost);
        
        if (product.costPerItem !== calculatedCost) {
          updateData.costPerItem = calculatedCost;
          needsUpdate = true;
          console.log(`  - Updated costPerItem: ${product.costPerItem || 'undefined'} → ${calculatedCost}`);
        }
      }

      // 3. Add updatedBy and lastUpdatedAt if missing
      if (product.updatedBy === undefined || product.updatedBy === null) {
        updateData.updatedBy = null;
        needsUpdate = true;
        console.log(`  - Added updatedBy: null`);
      }

      if (product.lastUpdatedAt === undefined || product.lastUpdatedAt === null) {
        updateData.lastUpdatedAt = null;
        needsUpdate = true;
        console.log(`  - Added lastUpdatedAt: null`);
      }

      // 4. Ensure reviewStats has all required fields
      if (!product.reviewStats || typeof product.reviewStats !== 'object') {
        updateData.reviewStats = {
          averageRating: product.rating || 0,
          totalReviews: product.reviews ? product.reviews.length : 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        };
        needsUpdate = true;
        console.log(`  - Added reviewStats`);
      } else {
        // Ensure ratingDistribution has all keys
        const dist = product.reviewStats.ratingDistribution || {};
        const requiredKeys = ['1', '2', '3', '4', '5'];
        let distNeedsUpdate = false;
        
        for (const key of requiredKeys) {
          if (dist[key] === undefined || dist[key] === null) {
            dist[key] = 0;
            distNeedsUpdate = true;
          }
        }
        
        if (distNeedsUpdate || product.reviewStats.averageRating === undefined || product.reviewStats.totalReviews === undefined) {
          updateData.reviewStats = {
            averageRating: product.rating || 0,
            totalReviews: product.reviews ? product.reviews.length : 0,
            ratingDistribution: dist
          };
          needsUpdate = true;
          console.log(`  - Updated reviewStats`);
        }
      }

      // 5. Ensure metaSettings has all required fields
      if (!product.metaSettings || typeof product.metaSettings !== 'object') {
        updateData.metaSettings = {
          metaTitle: '',
          metaDescription: '',
          metaKeywords: []
        };
        needsUpdate = true;
        console.log(`  - Added metaSettings`);
      } else {
        // Ensure metaSettings has all required keys
        let metaNeedsUpdate = false;
        const meta = product.metaSettings;
        
        if (meta.metaTitle === undefined) {
          meta.metaTitle = '';
          metaNeedsUpdate = true;
        }
        if (meta.metaDescription === undefined) {
          meta.metaDescription = '';
          metaNeedsUpdate = true;
        }
        if (meta.metaKeywords === undefined) {
          meta.metaKeywords = [];
          metaNeedsUpdate = true;
        }
        
        if (metaNeedsUpdate) {
          updateData.metaSettings = meta;
          needsUpdate = true;
          console.log(`  - Updated metaSettings`);
        }
      }

      // 6. Ensure images have publicId if missing
      if (product.images && Array.isArray(product.images)) {
        let imagesNeedUpdate = false;
        const updatedImages = product.images.map(img => {
          const imgObj = img.toObject ? img.toObject() : img;
          if (!imgObj.publicId && imgObj.url) {
            imagesNeedUpdate = true;
            const publicId = extractPublicIdFromUrl(imgObj.url);
            return { ...imgObj, publicId: publicId || '' };
          }
          return imgObj;
        });
        
        if (imagesNeedUpdate) {
          updateData.images = updatedImages;
          needsUpdate = true;
          console.log(`  - Updated images with publicId`);
        }
      }

      // 7. Ensure subcategoryName and childSubcategoryName are strings
      if (product.subcategoryName === null || product.subcategoryName === undefined) {
        updateData.subcategoryName = '';
        needsUpdate = true;
        console.log(`  - Added subcategoryName: ''`);
      }
      
      if (product.childSubcategoryName === null || product.childSubcategoryName === undefined) {
        updateData.childSubcategoryName = '';
        needsUpdate = true;
        console.log(`  - Added childSubcategoryName: ''`);
      }

      // 8. Ensure brand is a string
      if (product.brand === null || product.brand === undefined) {
        updateData.brand = '';
        needsUpdate = true;
        console.log(`  - Added brand: ''`);
      }

      // 9. Ensure tags is an array
      if (!product.tags || !Array.isArray(product.tags)) {
        updateData.tags = [];
        needsUpdate = true;
        console.log(`  - Added tags: []`);
      }

      // 10. Ensure colors is an array
      if (!product.colors || !Array.isArray(product.colors)) {
        updateData.colors = [];
        needsUpdate = true;
        console.log(`  - Added colors: []`);
      }

      // 11. Ensure additionalInfo is an array
      if (!product.additionalInfo || !Array.isArray(product.additionalInfo)) {
        updateData.additionalInfo = [];
        needsUpdate = true;
        console.log(`  - Added additionalInfo: []`);
      }

      // 12. Ensure faqs is an array
      if (!product.faqs || !Array.isArray(product.faqs)) {
        updateData.faqs = [];
        needsUpdate = true;
        console.log(`  - Added faqs: []`);
      }

      // 13. Ensure views is a number
      if (product.views === undefined || product.views === null || typeof product.views !== 'number') {
        updateData.views = 0;
        needsUpdate = true;
        console.log(`  - Added views: 0`);
      }

      // 14. Ensure purchaseCount is a number
      if (product.purchaseCount === undefined || product.purchaseCount === null || typeof product.purchaseCount !== 'number') {
        updateData.purchaseCount = 0;
        needsUpdate = true;
        console.log(`  - Added purchaseCount: 0`);
      }

      // 15. Generate SKU if missing
      if (!product.skuCode || product.skuCode === '') {
        try {
          const timestamp = Date.now().toString().slice(0, 5);
          const lastProduct = await Product.findOne({ 
            skuCode: { $regex: /^HV-/ } 
          }).sort({ createdAt: -1 });
          
          let nextSequence = 1001;
          
          if (lastProduct && lastProduct.skuCode) {
            const parts = lastProduct.skuCode.split('-');
            if (parts.length === 3) {
              const lastSeq = parseInt(parts[2]);
              if (!isNaN(lastSeq)) {
                nextSequence = lastSeq + 1;
              }
            }
          }
          
          const newSku = `HV-${timestamp}-${nextSequence}`;
          updateData.skuCode = newSku;
          needsUpdate = true;
          console.log(`  - Generated SKU: ${newSku}`);
        } catch (error) {
          console.error(`  - Error generating SKU:`, error.message);
        }
      }

      // Apply updates if needed
      if (needsUpdate) {
        // Update the product with the new data
        await Product.updateOne(
          { _id: product._id },
          { $set: updateData }
        );
        updatedCount++;
        console.log(`✅ Updated: ${product.productName}`);
        console.log(`   Fields changed: ${Object.keys(updateData).join(', ')}`);
      } else {
        console.log(`⏭️  No changes needed for: ${product.productName}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ MIGRATION COMPLETED!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`   Total products processed: ${products.length}`);
    console.log(`   Products updated: ${updatedCount}`);
    console.log(`   Products unchanged: ${products.length - updatedCount}`);
    console.log(`${'='.repeat(60)}`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url) {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      return publicId;
    }
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
  }
  return null;
}

// Run the migration
const runMigration = async () => {
  await connectDB();
  await migrateProducts();
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  mongoose.connection.close();
  process.exit(1);
});

// Run the migration
runMigration();