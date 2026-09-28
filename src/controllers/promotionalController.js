// const PromotionalSetting = require('../models/PromotionalSetting');
// const Product = require('../models/Product');

// // @desc    Get promotional settings
// // @route   GET /api/promotional-settings
// // @access  Private (Admin only)
// const getPromotionalSettings = async (req, res) => {
//   try {
//     let settings = await PromotionalSetting.findOne().populate('products.productId');
    
//     if (!settings) {
//       settings = await PromotionalSetting.create({
//         isActive: true,
//         products: [],
//         intervals: [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
//         maxShows: 3
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       data: settings
//     });
//   } catch (error) {
//     console.error('Error fetching promotional settings:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get public promotional data for frontend
// // @route   GET /api/promotional
// // @access  Public
// // @desc    Get public promotional data for frontend
// // @route   GET /api/promotional
// // @access  Public
// // @desc    Get public promotional data for frontend
// // @route   GET /api/promotional
// // @access  Public
// const getPublicPromotionalData = async (req, res) => {
//   try {
//     console.log('Fetching promotional settings...');
    
//     // Populate the productId field with ALL product data
//     const settings = await PromotionalSetting.findOne()
//       .populate({
//         path: 'products.productId',
//         model: 'Product',
//         // Select ALL fields needed for the modal
//         select: 'productName description instruction fabric orderUnit weightPerUnit moq pricePerUnit quantityBasedPricing sizes colors images additionalInfo customizationOptions isFeatured tags metaSettings isActive createdBy views inquiryCount'
//       });
    
//     console.log('Settings found:', settings ? 'Yes' : 'No');
    
//     if (!settings) {
//       console.log('No settings found, returning default');
//       return res.status(200).json({
//         success: true,
//         data: {
//           isActive: false,
//           products: [],
//           intervals: [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
//           maxShows: 3
//         }
//       });
//     }
    
//     if (!settings.isActive) {
//       console.log('Settings are inactive');
//       return res.status(200).json({
//         success: true,
//         data: {
//           isActive: false,
//           products: [],
//           intervals: settings.intervals,
//           maxShows: settings.maxShows
//         }
//       });
//     }
    
//     if (!settings.products || settings.products.length === 0) {
//       console.log('No products in settings');
//       return res.status(200).json({
//         success: true,
//         data: {
//           isActive: settings.isActive,
//           products: [],
//           intervals: settings.intervals,
//           maxShows: settings.maxShows
//         }
//       });
//     }
    
//     // Filter out products that might have been deleted
//     const validProducts = settings.products.filter(p => p.productId !== null);
    
//     if (validProducts.length === 0) {
//       console.log('No valid products after filtering');
//       return res.status(200).json({
//         success: true,
//         data: {
//           isActive: settings.isActive,
//           products: [],
//           intervals: settings.intervals,
//           maxShows: settings.maxShows
//         }
//       });
//     }
    
//     console.log(`Found ${validProducts.length} valid products`);
    
//     // Format response for frontend - include ALL product details
//     const formattedProducts = validProducts.map(item => {
//       const product = item.productId;
//       console.log('Processing product:', product.productName);
      
//       // Format images array - ensure it's always an array of URLs
//       let formattedImages = [];
//       if (product.images && Array.isArray(product.images)) {
//         formattedImages = product.images.map(img => ({
//           url: img.url,
//           publicId: img.publicId,
//           isPrimary: img.isPrimary
//         }));
//       } else if (product.images && typeof product.images === 'object') {
//         formattedImages = [product.images];
//       }
      
//       return {
//         // Basic Info
//         productId: product._id,
//         productName: product.productName || 'Product Name',
//         description: product.description || '',
//         instruction: product.instruction || '',
        
//         // Pricing & MOQ
//         pricePerUnit: product.pricePerUnit || 0,
//         moq: product.moq || 1,
//         quantityBasedPricing: product.quantityBasedPricing || [],
        
//         // Product Details
//         fabric: product.fabric || 'Premium Quality',
//         orderUnit: product.orderUnit || 'piece',
//         weightPerUnit: product.weightPerUnit || null,
        
//         // Variants
//         sizes: product.sizes || [],
//         colors: product.colors || [],
        
//         // Images
//         images: formattedImages,
        
//         // Additional Info
//         additionalInfo: product.additionalInfo || [],
//         customizationOptions: product.customizationOptions || [],
        
//         // Tags & Featured
//         isFeatured: product.isFeatured || false,
//         tags: product.tags || [],
        
//         // Custom tag from promotional settings
//         promoTag: item.tag || 'Special Offer',
        
//         isActive: product.isActive !== undefined ? product.isActive : true
//       };
//     });
    
//     console.log('Formatted products count:', formattedProducts.length);
//     console.log('First product details:', {
//       name: formattedProducts[0]?.productName,
//       price: formattedProducts[0]?.pricePerUnit,
//       imagesCount: formattedProducts[0]?.images?.length,
//       hasSizes: formattedProducts[0]?.sizes?.length > 0,
//       hasColors: formattedProducts[0]?.colors?.length > 0
//     });
    
//     res.status(200).json({
//       success: true,
//       data: {
//         isActive: settings.isActive,
//         products: formattedProducts,
//         intervals: settings.intervals,
//         maxShows: settings.maxShows
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching public promotional data:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Create or update promotional settings
// // @route   POST /api/promotional-settings
// // @access  Private (Admin only)
// const updatePromotionalSettings = async (req, res) => {
//   try {
//     const { isActive, products, intervals, maxShows } = req.body;
    
//     // Validate intervals
//     if (!intervals || intervals.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one interval is required'
//       });
//     }
    
//     // Validate intervals have valid delays
//     for (const interval of intervals) {
//       if (interval.delay === undefined || interval.delay < 0) {
//         return res.status(400).json({
//           success: false,
//           error: 'All intervals must have a valid delay (0 or greater)'
//         });
//       }
//     }
    
//     // Validate products
//     if (products && products.length > 0) {
//       for (const item of products) {
//         if (!item.productId) {
//           return res.status(400).json({
//             success: false,
//             error: 'Each product must have a valid product ID'
//           });
//         }
        
//         if (!item.tag || item.tag.trim() === '') {
//           return res.status(400).json({
//             success: false,
//             error: 'Each product must have a tag'
//           });
//         }
        
//         const productExists = await Product.findById(item.productId);
//         if (!productExists) {
//           return res.status(400).json({
//             success: false,
//             error: `Product with ID ${item.productId} not found`
//           });
//         }
//       }
//     }
    
//     let settings = await PromotionalSetting.findOne();
    
//     if (settings) {
//       settings.isActive = isActive !== undefined ? isActive : settings.isActive;
//       settings.products = products || [];
//       settings.intervals = intervals;
//       settings.maxShows = maxShows || settings.maxShows;
//       await settings.save();
//     } else {
//       settings = await PromotionalSetting.create({
//         isActive: isActive !== undefined ? isActive : true,
//         products: products || [],
//         intervals: intervals,
//         maxShows: maxShows || 3
//       });
//     }
    
//     const populatedSettings = await PromotionalSetting.findById(settings._id).populate('products.productId');
    
//     res.status(200).json({
//       success: true,
//       data: populatedSettings
//     });
//   } catch (error) {
//     console.error('Error updating promotional settings:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Delete promotional settings
// // @route   DELETE /api/promotional-settings
// // @access  Private (Admin only)
// const deletePromotionalSettings = async (req, res) => {
//   try {
//     await PromotionalSetting.deleteMany();
//     res.status(200).json({
//       success: true,
//       message: 'Promotional settings cleared successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting promotional settings:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   getPromotionalSettings,
//   updatePromotionalSettings,
//   deletePromotionalSettings,
//   getPublicPromotionalData
// };


const PromotionalSetting = require('../models/PromotionalSetting');
const Product = require('../models/Product');

// @desc    Get all promotional settings (multiple documents)
// @route   GET /api/promotional-settings
// @access  Private (Admin only)
// const getAllPromotionalSettings = async (req, res) => {
//   try {
//     console.log('Fetching all promotional settings...');
//     const settings = await PromotionalSetting.find()
//       .populate('productId')
//       .sort({ order: 1, createdAt: -1 });
    
//     console.log(`Found ${settings.length} promotional settings`);
    
//     res.status(200).json({
//       success: true,
//       data: settings
//     });
//   } catch (error) {
//     console.error('Error fetching promotional settings:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// Update getAllPromotionalSettings to ensure showOnPages is included in response
const getAllPromotionalSettings = async (req, res) => {
  try {
    console.log('Fetching all promotional settings...');
    const settings = await PromotionalSetting.find()
      .populate('productId')
      .sort({ order: 1, createdAt: -1 });
    
    console.log(`Found ${settings.length} promotional settings`);
    
    // The showOnPages is already in the schema, so it will be included automatically
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching promotional settings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single promotional setting by ID
// @route   GET /api/promotional-settings/:id
// @access  Private (Admin only)
const getPromotionalSettingById = async (req, res) => {
  try {
    const setting = await PromotionalSetting.findById(req.params.id).populate('productId');
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Promotional setting not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Error fetching promotional setting:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};




// // Update createPromotionalSetting
// const createPromotionalSetting = async (req, res) => {
//   try {
//     const { productId, tag, intervals, maxShows, isActive, showOnPages } = req.body;
    
//     console.log('Creating promotional setting for product:', productId);
//     console.log('Received showOnPages:', showOnPages); // Debug log
    
//     // Validate product
//     if (!productId) {
//       return res.status(400).json({
//         success: false,
//         error: 'Product ID is required'
//       });
//     }
    
//     // Check if product already has a promotional setting
//     const existingSetting = await PromotionalSetting.findOne({ productId });
//     if (existingSetting) {
//       return res.status(400).json({
//         success: false,
//         error: 'This product already has a promotional setting'
//       });
//     }
    
//     // Verify product exists
//     const productExists = await Product.findById(productId);
//     if (!productExists) {
//       return res.status(400).json({
//         success: false,
//         error: 'Product not found'
//       });
//     }
    
//     // Validate intervals
//     if (!intervals || intervals.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'At least one interval is required'
//       });
//     }
    
//     // Get count for order
//     const count = await PromotionalSetting.countDocuments();
    
//     const setting = await PromotionalSetting.create({
//       productId,
//       tag: tag || 'Special Offer',
//       intervals: intervals || [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
//       maxShows: maxShows || 3,
//       isActive: isActive !== undefined ? isActive : true,
//       order: count,
//       showOnPages: showOnPages || []  // ✅ Save showOnPages
//     });
    
//     console.log('Promotional setting created:', setting._id);
//     console.log('Saved showOnPages:', setting.showOnPages);
    
//     const populatedSetting = await PromotionalSetting.findById(setting._id).populate('productId');
    
//     res.status(201).json({
//       success: true,
//       data: populatedSetting
//     });
//   } catch (error) {
//     console.error('Error creating promotional setting:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // Update updatePromotionalSetting
// const updatePromotionalSetting = async (req, res) => {
//   try {
//     const { tag, intervals, maxShows, isActive, order, showOnPages } = req.body;
    
//     console.log('Updating promotional setting:', req.params.id);
//     console.log('Received showOnPages:', showOnPages); // Debug log
    
//     const setting = await PromotionalSetting.findById(req.params.id);
    
//     if (!setting) {
//       return res.status(404).json({
//         success: false,
//         error: 'Promotional setting not found'
//       });
//     }
    
//     // Update fields
//     if (tag !== undefined) setting.tag = tag;
//     if (intervals !== undefined) setting.intervals = intervals;
//     if (maxShows !== undefined) setting.maxShows = maxShows;
//     if (isActive !== undefined) setting.isActive = isActive;
//     if (order !== undefined) setting.order = order;
//     if (showOnPages !== undefined) setting.showOnPages = showOnPages; // ✅ Save showOnPages
    
//     await setting.save();
    
//     console.log('Updated showOnPages:', setting.showOnPages);
    
//     const populatedSetting = await PromotionalSetting.findById(setting._id).populate('productId');
    
//     res.status(200).json({
//       success: true,
//       data: populatedSetting
//     });
//   } catch (error) {
//     console.error('Error updating promotional setting:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// Update createPromotionalSetting
const createPromotionalSetting = async (req, res) => {
  try {
    const { productId, tag, intervals, maxShows, isActive, showOnPages, categoryId } = req.body;
    
    console.log('Creating promotional setting for product:', productId);
    console.log('Received showOnPages:', showOnPages);
    console.log('Received categoryId:', categoryId);
    
    // Validate product
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }
    
    // Check if product already has a promotional setting
    const existingSetting = await PromotionalSetting.findOne({ productId });
    if (existingSetting) {
      return res.status(400).json({
        success: false,
        error: 'This product already has a promotional setting'
      });
    }
    
    // Verify product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(400).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // If categoryId is provided, verify category exists
    if (categoryId) {
      const Category = require('../models/Category');
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: 'Category not found'
        });
      }
    }
    
    
    // Validate intervals
    if (!intervals || intervals.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one interval is required'
      });
    }
    
    // Get count for order
    const count = await PromotionalSetting.countDocuments();
    
    const setting = await PromotionalSetting.create({
      productId,
      tag: tag || 'Special Offer',
      intervals: intervals || [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
      maxShows: maxShows || 3,
      isActive: isActive !== undefined ? isActive : true,
      order: count,
      showOnPages: showOnPages || [],
      categoryId: categoryId || null // Save categoryId
    });
    
    console.log('Promotional setting created:', setting._id);
    console.log('Saved showOnPages:', setting.showOnPages);
    console.log('Saved categoryId:', setting.categoryId);
    
    const populatedSetting = await PromotionalSetting.findById(setting._id)
      .populate('productId')
      .populate('categoryId', 'name'); // Populate category name
    
    res.status(201).json({
      success: true,
      data: populatedSetting
    });
  } catch (error) {
    console.error('Error creating promotional setting:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update updatePromotionalSetting
const updatePromotionalSetting = async (req, res) => {
  try {
    const { tag, intervals, maxShows, isActive, order, showOnPages, categoryId } = req.body;
    
    console.log('Updating promotional setting:', req.params.id);
    console.log('Received showOnPages:', showOnPages);
    console.log('Received categoryId:', categoryId);
    
    const setting = await PromotionalSetting.findById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Promotional setting not found'
      });
    }
    
    // If categoryId is provided and different from current, verify category exists
    if (categoryId !== undefined && categoryId !== setting.categoryId) {
      if (categoryId) {
        const Category = require('../models/Category');
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            error: 'Category not found'
          });
        }
      }
      setting.categoryId = categoryId || null;
    }
    
    // Update fields
    if (tag !== undefined) setting.tag = tag;
    if (intervals !== undefined) setting.intervals = intervals;
    if (maxShows !== undefined) setting.maxShows = maxShows;
    if (isActive !== undefined) setting.isActive = isActive;
    if (order !== undefined) setting.order = order;
    if (showOnPages !== undefined) setting.showOnPages = showOnPages;
    
    await setting.save();
    
    console.log('Updated showOnPages:', setting.showOnPages);
    console.log('Updated categoryId:', setting.categoryId);
    
    const populatedSetting = await PromotionalSetting.findById(setting._id)
      .populate('productId')
      .populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      data: populatedSetting
    });
  } catch (error) {
    console.error('Error updating promotional setting:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete a promotional setting
// @route   DELETE /api/promotional-settings/:id
// @access  Private (Admin only)
const deletePromotionalSetting = async (req, res) => {
  try {
    const setting = await PromotionalSetting.findById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Promotional setting not found'
      });
    }
    
    await setting.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Promotional setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting promotional setting:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



// @desc    Get public promotional data for frontend (returns ALL active settings sorted by latest)
// @route   GET /api/promotional
// @access  Public
// const getPublicPromotionalData = async (req, res) => {
//   try {
//     const { categoryId } = req.query; // Get categoryId from query params
//     console.log('Fetching promotional settings for public...');
//     console.log('Category filter:', categoryId);
    
//     // Sort by createdAt in DESCENDING order (latest first)
//     const settings = await PromotionalSetting.find({ isActive: true })
//       .populate('productId')
//       .sort({ createdAt: -1 });
    
//     console.log(`Found ${settings.length} active promotional settings`);
    
//     if (!settings || settings.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           isActive: false,
//           products: [],
//           intervals: [],
//           maxShows: 0
//         }
//       });
//     }
    
//     // Format products first
//     let formattedProducts = settings.map(setting => {
//       const product = setting.productId;
//       if (!product) return null;
      
//       // Get category ID from product (handle both populated and non-populated)
//       let productCategoryId = null;
//       if (product.category) {
//         if (typeof product.category === 'object' && product.category._id) {
//           productCategoryId = product.category._id.toString();
//         } else if (typeof product.category === 'string') {
//           productCategoryId = product.category;
//         }
//       }
      
//       return {
//         productId: product._id,
//         productName: product.productName || 'Product Name',
//         pricePerUnit: product.pricePerUnit || 0,
//         images: product.images || [],
//         fabric: product.fabric || 'Premium Quality',
//         moq: product.moq || 1,
//         orderUnit: product.orderUnit || 'piece',
//         tag: setting.tag || 'Special Offer',
//         colors: product.colors || [],
//         sizes: product.sizes || [],
//         quantityBasedPricing: product.quantityBasedPricing || [],
//         additionalInfo: product.additionalInfo || [],
//         intervals: setting.intervals,
//         maxShows: setting.maxShows,
//         createdAt: setting.createdAt,
//         showOnPages: setting.showOnPages || [],
//         categoryId: productCategoryId // Add categoryId to each product
//       };
//     }).filter(p => p !== null);
    
//     // Apply category filter if provided
//     let filteredProducts = formattedProducts;
//     if (categoryId) {
//       console.log(`Filtering products by category: ${categoryId}`);
//       filteredProducts = formattedProducts.filter(product => {
//         const matches = product.categoryId === categoryId;
//         console.log(`Product "${product.productName}" category ${product.categoryId} matches ${categoryId}: ${matches}`);
//         return matches;
//       });
//       console.log(`Filtered to ${filteredProducts.length} products for category ${categoryId}`);
//     }
    
//     // If no products match the category, return empty
//     if (filteredProducts.length === 0) {
//       console.log('No products found for this category');
//       return res.status(200).json({
//         success: true,
//         data: {
//           isActive: true,
//           products: [],
//           intervals: settings[0]?.intervals || [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
//           maxShows: settings[0]?.maxShows || 3
//         }
//       });
//     }
    
//     const firstSetting = settings[0];
    
//     res.status(200).json({
//       success: true,
//       data: {
//         isActive: true,
//         products: filteredProducts,
//         intervals: firstSetting?.intervals || [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
//         maxShows: firstSetting?.maxShows || 3
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching public promotional data:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };



// controllers/promotionalSettingsController.js work for category

// const getPublicPromotionalData = async (req, res) => {
//   try {
//     const { categoryId } = req.query;
//     const { isProductDetailsPage } = req.query;
    
//     console.log('========================================');
//     console.log('🎯 Fetching promotional data');
//     console.log('Category filter from query:', categoryId);
//     console.log('Is product details page:', isProductDetailsPage);
//     console.log('========================================');
    
//     // Get all active promotional settings
//     const settings = await PromotionalSetting.find({ isActive: true })
//       .populate('productId')
//       .populate('categoryId', 'name')
//       .sort({ createdAt: -1 });
    
//     console.log(`Found ${settings.length} active promotional settings`);
    
//     // Debug: Log each setting
//     settings.forEach((setting, idx) => {
//       console.log(`\n📌 Setting ${idx + 1}:`);
//       console.log(`   - Product: ${setting.productId?.productName}`);
//       console.log(`   - Promo Category ID (setting.categoryId): ${setting.categoryId?._id || setting.categoryId}`);
//       console.log(`   - Promo Category Name: ${setting.categoryId?.name}`);
//     });
    
//     if (!settings || settings.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           isActive: false,
//           products: [],
//           intervals: [],
//           maxShows: 0
//         }
//       });
//     }
    
//     // Format products with their associated data
//     let formattedProducts = settings.map(setting => {
//       const product = setting.productId;
//       if (!product) {
//         console.log(`⚠️ Setting has no product`);
//         return null;
//       }
      
//       // IMPORTANT: Get the target category ID from the promotional setting
//       // This is the category that will trigger this promo
//       let targetCategoryId = null;
//       if (setting.categoryId) {
//         // Handle both populated and unpopulated categoryId
//         targetCategoryId = setting.categoryId._id ? setting.categoryId._id.toString() : setting.categoryId.toString();
//       }
      
//       console.log(`\n📦 Product: ${product.productName}`);
//       console.log(`   This promo will show when user views category: ${targetCategoryId}`);
//       console.log(`   Promo Category Name: ${setting.categoryId?.name || 'None'}`);
      
//       return {
//         productId: product._id,
//         productName: product.productName || 'Product Name',
//         pricePerUnit: product.pricePerUnit || 0,
//         images: product.images || [],
//         fabric: product.fabric || 'Premium Quality',
//         moq: product.moq || 1,
//         orderUnit: product.orderUnit || 'piece',
//         tag: setting.tag || 'Special Offer',
//         colors: product.colors || [],
//         sizes: product.sizes || [],
//         quantityBasedPricing: product.quantityBasedPricing || [],
//         additionalInfo: product.additionalInfo || [],
//         intervals: setting.intervals,
//         maxShows: setting.maxShows,
//         createdAt: setting.createdAt,
//         showOnPages: setting.showOnPages || [],
//         // The category that triggers this promo
//         triggerCategoryId: targetCategoryId,
//         triggerCategoryName: setting.categoryId?.name || null
//       };
//     }).filter(p => p !== null);
    
//     console.log(`\n📊 Formatted ${formattedProducts.length} active promotional products`);
    
//     // Apply category filter logic
//     let filteredProducts = [];
    
//     if (categoryId && isProductDetailsPage === 'true') {
//       // PRODUCT DETAILS PAGE: Show promos where triggerCategoryId matches the product's category
//       console.log(`\n🔍 Product Details Page - Looking for promos that trigger for category: ${categoryId}`);
      
//       filteredProducts = formattedProducts.filter(product => {
//         const shouldShow = product.triggerCategoryId === categoryId;
//         if (shouldShow) {
//           console.log(`✅ WILL SHOW: ${product.productName} (triggers for category: ${product.triggerCategoryName})`);
//         } else {
//           console.log(`❌ WILL NOT SHOW: ${product.productName} (triggers for category: ${product.triggerCategoryName})`);
//         }
//         return shouldShow;
//       });
      
//       console.log(`\n📊 Found ${filteredProducts.length} promotional products for category ${categoryId}`);
      
//     } else if (categoryId && isProductDetailsPage !== 'true') {
//       // PRODUCTS LISTING PAGE with category filter
//       console.log(`\n🔍 Products Page with category filter: ${categoryId}`);
      
//       filteredProducts = formattedProducts.filter(product => {
//         const shouldShow = product.triggerCategoryId === categoryId;
//         if (shouldShow) {
//           console.log(`✅ WILL SHOW: ${product.productName} (triggers for category: ${product.triggerCategoryName})`);
//         }
//         return shouldShow;
//       });
      
//     } else {
//       // NO CATEGORY FILTER - Show promos with no trigger category
//       console.log('\n🔍 No category filter - showing promos with no category restriction');
      
//       filteredProducts = formattedProducts.filter(product => {
//         const hasNoTriggerCategory = !product.triggerCategoryId;
//         if (hasNoTriggerCategory) {
//           console.log(`✅ WILL SHOW: ${product.productName} (no category restriction)`);
//         } else {
//           console.log(`❌ WILL NOT SHOW: ${product.productName} (only triggers for category: ${product.triggerCategoryName})`);
//         }
//         return hasNoTriggerCategory;
//       });
//     }
    
//     if (filteredProducts.length === 0) {
//       console.log('⚠️ No promotional products found for this filter');
//       return res.status(200).json({
//         success: true,
//         data: {
//           isActive: true,
//           products: [],
//           intervals: settings[0]?.intervals || [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
//           maxShows: settings[0]?.maxShows || 3
//         }
//       });
//     }
    
//     console.log(`\n✅ Returning ${filteredProducts.length} products:`);
//     filteredProducts.forEach(p => {
//       console.log(`   - ${p.productName} (triggers for category: ${p.triggerCategoryName || 'All Pages'})`);
//     });
    
//     const firstSetting = settings[0];
    
//     res.status(200).json({
//       success: true,
//       data: {
//         isActive: true,
//         products: filteredProducts,
//         intervals: firstSetting?.intervals || [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
//         maxShows: firstSetting?.maxShows || 3
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching public promotional data:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// controllers/promotionalSettingsController.js

const getPublicPromotionalData = async (req, res) => {
  try {
    const { categoryId, isProductDetailsPage, path } = req.query;
    
    console.log('========================================');
    console.log('🎯 Fetching promotional data');
    console.log('Category filter from query:', categoryId);
    console.log('Is product details page:', isProductDetailsPage);
    console.log('Current path:', path);
    console.log('========================================');
    
    // Get ALL active promotional settings, sorted by createdAt DESC (latest first)
    const settings = await PromotionalSetting.find({ isActive: true })
      .populate('productId')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 }); // Latest first
    
    console.log(`Found ${settings.length} active promotional settings`);
    
    if (!settings || settings.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          isActive: false,
          products: [],
          intervals: [],
          maxShows: 0
        }
      });
    }
    
    // Log all settings for debugging
    settings.forEach((setting, idx) => {
      console.log(`\n📌 Setting ${idx + 1}:`);
      console.log(`   - ID: ${setting._id}`);
      console.log(`   - Product: ${setting.productId?.productName}`);
      console.log(`   - Category restriction: ${setting.categoryId ? setting.categoryId.name : 'NONE (Show on all pages)'}`);
      console.log(`   - Created At: ${setting.createdAt}`);
      console.log(`   - Show On Pages: ${setting.showOnPages?.length ? setting.showOnPages.join(', ') : 'All pages'}`);
    });
    
    // Format products with their associated data
    let formattedProducts = settings.map(setting => {
      const product = setting.productId;
      if (!product) {
        console.log(`⚠️ Setting ${setting._id} has no product, skipping`);
        return null;
      }
      
      // Get the target category ID from the promotional setting
      let targetCategoryId = null;
      if (setting.categoryId) {
        targetCategoryId = setting.categoryId._id ? setting.categoryId._id.toString() : setting.categoryId.toString();
      }
      
      // Get showOnPages (ensure it's an array)
      let showOnPages = setting.showOnPages || [];
      if (showOnPages.length === 0) {
        // If empty array, treat as "show on all pages"
        showOnPages = null;
      }
      
      return {
        productId: product._id,
        productName: product.productName || 'Product Name',
        pricePerUnit: product.pricePerUnit || 0,
        images: product.images || [],
        fabric: product.fabric || 'Premium Quality',
        moq: product.moq || 1,
        orderUnit: product.orderUnit || 'piece',
        tag: setting.tag || 'Special Offer',
        colors: product.colors || [],
        sizes: product.sizes || [],
        quantityBasedPricing: product.quantityBasedPricing || [],
        additionalInfo: product.additionalInfo || [],
        intervals: setting.intervals,
        maxShows: setting.maxShows,
        createdAt: setting.createdAt,
        showOnPages: showOnPages, // This will be null for "all pages"
        triggerCategoryId: targetCategoryId,
        triggerCategoryName: setting.categoryId?.name || null
      };
    }).filter(p => p !== null);
    
    console.log(`\n📊 Formatted ${formattedProducts.length} active promotional products`);
    
    // Step 1: Filter by category logic
    let categoryFilteredProducts = [];
    
    if (categoryId && isProductDetailsPage === 'true') {
      // PRODUCT DETAILS PAGE: Show promos where triggerCategoryId matches the product's category
      console.log(`\n🔍 Product Details Page - Filtering for category: ${categoryId}`);
      
      categoryFilteredProducts = formattedProducts.filter(product => {
        const shouldShow = product.triggerCategoryId === categoryId;
        if (shouldShow) {
          console.log(`✅ WILL SHOW (category match): ${product.productName}`);
        } else if (!product.triggerCategoryId) {
          console.log(`❌ WILL NOT SHOW: ${product.productName} (no category restriction - only shows on pages without category filter)`);
        } else {
          console.log(`❌ WILL NOT SHOW: ${product.productName} (triggers for different category: ${product.triggerCategoryName})`);
        }
        return shouldShow;
      });
      
      console.log(`📊 Found ${categoryFilteredProducts.length} products matching category ${categoryId}`);
      
    } else if (categoryId && isProductDetailsPage !== 'true') {
      // PRODUCTS LISTING PAGE with category filter
      console.log(`\n🔍 Products Page with category filter: ${categoryId}`);
      
      categoryFilteredProducts = formattedProducts.filter(product => {
        const shouldShow = product.triggerCategoryId === categoryId;
        if (shouldShow) {
          console.log(`✅ WILL SHOW (category match): ${product.productName}`);
        } else if (!product.triggerCategoryId) {
          console.log(`❌ WILL NOT SHOW: ${product.productName} (no category restriction - only shows when no filter)`);
        } else {
          console.log(`❌ WILL NOT SHOW: ${product.productName} (triggers for different category)`);
        }
        return shouldShow;
      });
      
    } else {
      // NO CATEGORY FILTER - Show promos with NO trigger category only
      console.log('\n🔍 No category filter - showing promos with NO category restriction');
      
      categoryFilteredProducts = formattedProducts.filter(product => {
        const hasNoCategoryRestriction = !product.triggerCategoryId;
        if (hasNoCategoryRestriction) {
          console.log(`✅ WILL SHOW (no category restriction): ${product.productName}`);
        } else {
          console.log(`❌ WILL NOT SHOW: ${product.productName} (has category restriction: ${product.triggerCategoryName})`);
        }
        return hasNoCategoryRestriction;
      });
    }
    
    console.log(`\n📊 After category filtering: ${categoryFilteredProducts.length} products`);
    
    // Step 2: Filter by page (showOnPages) if path is provided
    let finalProducts = categoryFilteredProducts;
    
    if (path && categoryFilteredProducts.length > 0) {
      const currentPath = normalizePath(path);
      console.log(`\n📍 Filtering by page: ${currentPath}`);
      
      finalProducts = categoryFilteredProducts.filter(product => {
        // If showOnPages is null, show on all pages
        if (!product.showOnPages) {
          console.log(`✅ ${product.productName}: No page restrictions - showing`);
          return true;
        }
        
        // Check if current page is in allowed pages
        const normalizedShowOnPages = product.showOnPages.map(page => normalizePath(page));
        const isAllowed = normalizedShowOnPages.includes(currentPath);
        
        if (isAllowed) {
          console.log(`✅ ${product.productName}: Allowed on ${currentPath} - showing`);
        } else {
          console.log(`❌ ${product.productName}: NOT allowed on ${currentPath} - hiding`);
        }
        
        return isAllowed;
      });
      
      console.log(`\n📊 After page filtering: ${finalProducts.length} of ${categoryFilteredProducts.length} products`);
    }
    
    // Step 3: Ensure products are sorted by createdAt (latest first)
    finalProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (finalProducts.length === 0) {
      console.log('⚠️ No promotional products found after all filters');
      return res.status(200).json({
        success: true,
        data: {
          isActive: true,
          products: [],
          intervals: settings[0]?.intervals || [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
          maxShows: settings[0]?.maxShows || 3
        }
      });
    }
    
    console.log(`\n✅ Returning ${finalProducts.length} products (sorted by latest first):`);
    finalProducts.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.productName}`);
      console.log(`      - Created: ${new Date(p.createdAt).toLocaleString()}`);
      console.log(`      - Category Restriction: ${p.triggerCategoryName || 'None'}`);
      console.log(`      - Page Restriction: ${p.showOnPages ? p.showOnPages.join(', ') : 'All pages'}`);
    });
    
    // Get intervals and maxShows from the first product (they should be consistent)
    // But if different products have different intervals, use the first one
    const firstSetting = settings[0];
    
    res.status(200).json({
      success: true,
      data: {
        isActive: true,
        products: finalProducts,
        intervals: firstSetting?.intervals || [{ delay: 5 }, { delay: 15 }, { delay: 15 }],
        maxShows: firstSetting?.maxShows || 3
      }
    });
    
  } catch (error) {
    console.error('Error fetching public promotional data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to normalize paths
// function normalizePath(path) {
//   if (!path) return '/';
//   let normalized = path === '/' ? '/' : path.replace(/\/$/, '');
//   normalized = normalized.split('?')[0];
//   return normalized;
// }


// Helper function to normalize paths (CASE-INSENSITIVE)
function normalizePath(path) {
  if (!path) return '/';
  let normalized = path === '/' ? '/' : path.replace(/\/$/, '');
  normalized = normalized.split('?')[0];
  // IMPORTANT: Convert to lowercase for case-insensitive comparison
  return normalized.toLowerCase();
}
module.exports = {
  getAllPromotionalSettings,
  getPromotionalSettingById,
  createPromotionalSetting,
  updatePromotionalSetting,
  deletePromotionalSetting,
  getPublicPromotionalData
};