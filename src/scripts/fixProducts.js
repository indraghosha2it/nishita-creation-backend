// D:\Smart-Gadget(2)\smart-gadget-backend\src\scripts\fixProducts.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

// Import your Product model from the backend
const Product = require('../models/Product');

async function fixProducts() {
  try {
    // Connect to your MongoDB
    const mongoURI = 'mongodb+srv://indraghosha2it_smart_gadget_db_user:vGZ1lGPNGdLYg1Ii@cluster0.lkqg9yw.mongodb.net/gadget?appName=Cluster0';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`📊 Found ${products.length} products to process`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        const updateData = {};

        // 1. Add missing fields with defaults
        if (product.buyingPrice === undefined || product.buyingPrice === null) {
          updateData.buyingPrice = 0;
        }

        if (product.packagingCost === undefined || product.packagingCost === null) {
          updateData.packagingCost = 0;
        }

        if (product.deliveryCost === undefined || product.deliveryCost === null) {
          updateData.deliveryCost = 0;
        }

        if (product.videoUrl === undefined) {
          updateData.videoUrl = '';
        }

        if (product.videoPublicId === undefined) {
          updateData.videoPublicId = '';
        }

        if (product.videoType === undefined) {
          updateData.videoType = 'upload';
        }

        if (product.faqs === undefined) {
          updateData.faqs = [];
        }

        if (product.updatedBy === undefined) {
          updateData.updatedBy = null;
        }

        if (product.lastUpdatedAt === undefined) {
          updateData.lastUpdatedAt = null;
        }

        // 2. Ensure metaSettings exists
        if (!product.metaSettings || typeof product.metaSettings !== 'object') {
          updateData.metaSettings = {
            metaTitle: '',
            metaDescription: '',
            metaKeywords: []
          };
        }

        // 3. Ensure reviewStats exists
        if (!product.reviewStats || typeof product.reviewStats !== 'object') {
          updateData.reviewStats = {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          };
        }

        // 4. Ensure colors is array
        if (!product.colors || !Array.isArray(product.colors)) {
          updateData.colors = [];
        }

        // 5. Ensure additionalInfo is array
        if (!product.additionalInfo || !Array.isArray(product.additionalInfo)) {
          updateData.additionalInfo = [];
        }

        // 6. Recalculate costPerItem
        const buyingPrice = product.buyingPrice || 0;
        const packagingCost = product.packagingCost || 0;
        const deliveryCost = product.deliveryCost || 0;
        updateData.costPerItem = buyingPrice + packagingCost + deliveryCost;

        // 7. Generate slug if missing
        if (!product.slug || product.slug === '') {
          let slug = product.productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          
          // Check if slug already exists
          const existingSlug = await Product.findOne({
            slug: slug,
            _id: { $ne: product._id }
          });
          
          if (existingSlug) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
          }
          
          updateData.slug = slug;
        }

        // 8. Fix brand if it's an ObjectId or empty
        if (product.brand && typeof product.brand === 'object') {
          updateData.brand = product.brand.toString();
        } else if (!product.brand || product.brand === '') {
          updateData.brand = '';
        }

        // 9. Ensure tags is array
        if (!product.tags || !Array.isArray(product.tags)) {
          updateData.tags = [];
        }

        // 10. Ensure images have proper structure
        if (product.images && Array.isArray(product.images)) {
          const updatedImages = product.images.map((img, index) => {
            if (typeof img === 'string') {
              return {
                url: img,
                publicId: extractPublicIdFromUrl(img),
                isPrimary: index === 0
              };
            }
            return img;
          });
          updateData.images = updatedImages;
        }

        // Apply updates if there are any changes
        if (Object.keys(updateData).length > 0) {
          await Product.updateOne(
            { _id: product._id },
            { $set: updateData }
          );
          updated++;
          console.log(`✅ Fixed: ${product.productName}`);
        } else {
          skipped++;
          console.log(`⏭️  No changes needed: ${product.productName}`);
        }

      } catch (error) {
        console.error(`❌ Error fixing product ${product._id}:`, error.message);
      }
    }

    console.log('\n📊 ========== MIGRATION COMPLETE ==========');
    console.log(`✅ Updated: ${updated} products`);
    console.log(`⏭️  Skipped: ${skipped} products`);
    console.log(`📊 Total: ${products.length} products processed`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Helper function to extract public ID from URL
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
    console.error('Error extracting public ID:', error);
  }
  return null;
}

// Run the migration
fixProducts();