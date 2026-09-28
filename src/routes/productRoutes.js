
const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const { generateUniqueSku, validateSku } = require('../controllers/skuController');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addProductReview,
  getFeaturedProducts,
  getBannerProducts,
  getFlashSaleProducts,
  getTrendingProducts,
  toggleProductStatus,
  getAdminProducts,
  getUniqueUnits,
  getColorsByIds,
  duplicateProduct,
    restockBulk,
    getProductByBarcode,
    getProductRestockHistory,   // ✅ ADD
  getAllRestockLogs, 
  deleteRestockLog,
  getStockAlertProducts
} = require('../controllers/productController');

// ============================================================
// PUBLIC ROUTES
// ============================================================
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/banner', getBannerProducts);
router.get('/flash-sale', getFlashSaleProducts);
router.get('/trending', getTrendingProducts);
router.get('/units/all', getUniqueUnits);
router.post('/colors-by-ids', getColorsByIds);
router.get('/barcode/:barcodeNumber', getProductByBarcode);

// Barcode/SKU search routes
// router.get('/barcode/:barcode', async (req, res) => {
//   try {
//     const { barcode } = req.params;
//     const Product = require('../models/Product');

//     const product = await Product.findOne({
//       $or: [
//         { barcode: barcode },
//         { skuCode: barcode }
//       ]
//     }).populate('category', 'name slug').populate('tags', 'name image');

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         error: 'Product not found for this barcode/SKU'
//       });
//     }

//     res.json({
//       success: true,
//       data: product
//     });
//   } catch (error) {
//     console.error('Get product by barcode error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

router.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const Product = require('../models/Product');
    const Barcode = require('../models/Barcode');

    const product = await Product.findOne({
      $or: [
        { barcode: barcode },
        { skuCode: barcode }
      ]
    }).populate('category', 'name slug').populate('tags', 'name image');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found for this barcode/SKU'
      });
    }

    // ✅ Fetch barcode image
    let barcodeImageUrl = '';
    let barcodeImagePublicId = '';
    if (product.barcode) {
      const barcodeDoc = await Barcode.findOne({ barcodeNumber: product.barcode });
      if (barcodeDoc) {
        barcodeImageUrl = barcodeDoc.barcodeImageUrl || '';
        barcodeImagePublicId = barcodeDoc.barcodeImagePublicId || '';
      }
    }

    const productObj = product.toObject();
    productObj.barcodeImageUrl = barcodeImageUrl;
    productObj.barcodeImagePublicId = barcodeImagePublicId;

    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/sku/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const Product = require('../models/Product');

    const product = await Product.findOne({ skuCode: sku })
      .populate('category', 'name slug')
      .populate('tags', 'name image');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found for this SKU'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product by SKU error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// ✅ FIXED: BARCODE VALIDATION ROUTE
// Response format matches frontend expectations
// ============================================================
router.get('/validate-barcode/:barcodeNumber', async (req, res) => {
  try {
    const { barcodeNumber } = req.params;
    const Barcode = require('../models/Barcode');
    const Product = require('../models/Product');

    // Check format
    if (!/^[0-9]{8,13}$/.test(barcodeNumber)) {
      return res.json({
        success: true,
        data: {
          isValid: false,
          exists: false,
          status: 'invalid',
          message: 'Barcode must be 8-13 digits only'
        }
      });
    }

    const existingProduct = await Product.findOne({ barcode: barcodeNumber });
    const existingBarcode = await Barcode.findOne({ barcodeNumber });

    // Case 1: Barcode assigned to a product (via Product collection)
    if (existingProduct) {
      return res.json({
        success: true,
        data: {
          isValid: false,
          exists: true,
          status: 'assigned',
          productId: existingProduct._id,
          productName: existingProduct.productName,
          message: `Barcode already assigned to: ${existingProduct.productName}`
        }
      });
    }

    // Case 2: Barcode exists in Barcode collection and is assigned
    if (existingBarcode && existingBarcode.status === 'assigned') {
      return res.json({
        success: true,
        data: {
          isValid: false,
          exists: true,
          status: 'assigned',
          productId: existingBarcode.productId,
          productName: existingBarcode.productName,
          message: `Barcode already assigned to: ${existingBarcode.productName}`
        }
      });
    }

    // Case 3: Barcode exists and is available
    if (existingBarcode && existingBarcode.status === 'available') {
      return res.json({
        success: true,
        data: {
          isValid: true,
          exists: true,
          status: 'available',
          message: 'Barcode is available for assignment'
        }
      });
    }

    // Case 4: Barcode doesn't exist anywhere (new)
    return res.json({
      success: true,
      data: {
        isValid: true,
        exists: false,
        status: 'new',
        message: 'New barcode - will be registered when product is created'
      }
    });
  } catch (error) {
    console.error('Validate barcode error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Brands with products (Public)
router.get('/brands/with-products', async (req, res) => {
  try {
    const Product = require('../models/Product');

    const brands = await Product.aggregate([
      { $match: { isActive: true, brand: { $ne: '', $exists: true } } },
      { $group: {
          _id: '$brand',
          count: { $sum: 1 },
          products: { $push: '$_id' }
        }
      },
      { $sort: { count: -1 } },
      { $project: {
          name: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      success: true,
      data: brands
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Categories with products (Public)
router.get('/categories/with-products', async (req, res) => {
  try {
    const Category = require('../models/Category');

    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $match: {
          productCount: { $gt: 0 }
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          productCount: 1,
          _id: 1
        }
      },
      { $sort: { productCount: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// IMPORTANT: This dynamic route must come AFTER all specific routes
router.get('/:id', getProductById);

// ============================================================
// PROTECTED ROUTES (Require Authentication)
// ============================================================
router.use(protect);


router.get('/admin/restock-logs', isModeratorOrAdmin, getAllRestockLogs);

// Review route
router.post('/:id/review', addProductReview);

// Generate unique SKU
router.post('/generate-sku', isModeratorOrAdmin, generateUniqueSku);

// Validate SKU uniqueness
router.get('/validate-sku/:skuCode', isModeratorOrAdmin, validateSku);

// ============================================================
// SLUG UNIQUENESS CHECK
// ============================================================
router.get('/check-slug/:slug', isModeratorOrAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    const Product = require('../models/Product');

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existingProduct = await Product.findOne({ slug: cleanSlug });

    res.json({
      success: true,
      data: {
        isAvailable: !existingProduct,
        slug: cleanSlug,
        message: existingProduct ? `Slug "${cleanSlug}" is already taken by product: ${existingProduct.productName}` : 'Slug is available'
      }
    });
  } catch (error) {
    console.error('Error checking slug:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while checking slug'
    });
  }
});


router.get('/:id/restock-history', getProductRestockHistory);

// Toggle product status
router.put('/:id/toggle', isModeratorOrAdmin, toggleProductStatus);

// CRUD operations
router.post('/', isModeratorOrAdmin, createProduct);
router.put('/:id', isModeratorOrAdmin, updateProduct);
router.delete('/:id', isModeratorOrAdmin, deleteProduct);
router.get('/admin/all', isModeratorOrAdmin, getAdminProducts);
router.post('/:id/duplicate', isModeratorOrAdmin, duplicateProduct);
router.post('/restock-bulk', isModeratorOrAdmin, restockBulk);
router.delete('/admin/restock-logs/:id', isModeratorOrAdmin, deleteRestockLog);
router.get('/admin/stock-alerts', isModeratorOrAdmin, getStockAlertProducts);

module.exports = router;