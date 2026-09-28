


// // routes/searchRoutes.js
// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');
// const Category = require('../models/Category');

// // @desc    Search across products and categories
// // @route   GET /api/search
// // @access  Public
// const search = async (req, res) => {
//   try {
//     const { q } = req.query;
    
//     if (!q || q.trim() === '') {
//       return res.json({
//         success: true,
//         data: []
//       });
//     }

//     const searchRegex = new RegExp(q.trim(), 'i');
    
//     // Search products
//     const products = await Product.find({
//       $or: [
//         { productName: searchRegex },
//         { description: searchRegex },
//         { fabric: searchRegex },
//         { tags: { $in: [searchRegex] } }
//       ],
//       isActive: true
//     })
//     .select('productName description images pricePerUnit moq category')
//     .limit(10);

//     // Search categories
//     const categories = await Category.find({
//       $or: [
//         { name: searchRegex },
//         { description: searchRegex }
//       ],
//       isActive: true
//     })
//     .select('name description image')
//     .limit(5);

//     // Format and combine results
//     const results = [
//       ...products.map(p => ({
//         _id: p._id,
//         type: 'product',
//         title: p.productName,
//         description: p.description,
//         image: p.images?.[0]?.url,
//         price: p.pricePerUnit,
//         moq: p.moq,
//         category: p.category,
//         url: `/productDetails?id=${p._id}`
//       })),
//       ...categories.map(c => ({
//         _id: c._id,
//         type: 'category',
//         title: c.name,
//         description: c.description,
//          image: c.image?.url, 
//         url: `/products?category=${c._id}`
//       }))
//     ];

//     res.json({
//       success: true,
//       data: results
//     });

//   } catch (error) {
//     console.error('Search error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while searching'
//     });
//   }
// };

// router.get('/', search);

// module.exports = router;
// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Search across products and categories
// @route   GET /api/search
// @access  Public
const search = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    // Search products
    const products = await Product.find({
      $or: [
        { productName: searchRegex },
        { description: searchRegex },
        { fabric: searchRegex },
        { tags: { $in: [searchRegex] } }
      ],
      isActive: true
    })
    .populate('category', 'name')
    .select('productName description images pricePerUnit moq category colors quantityBasedPricing targetedCustomer')
    .limit(10);

    console.log('Products found:', products.length);
    
    // Log first product's images to debug
    if (products.length > 0) {
      console.log('First product images:', products[0].images);
    }

    // Search categories
    const categories = await Category.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ],
      isActive: true
    })
    .select('name description image')
    .limit(5);

    // Format and combine results
    const results = [
      ...products.map(p => {
        // Ensure images is always an array
        const productImages = Array.isArray(p.images) ? p.images : [];
        
        return {
          _id: p._id,
          type: 'product',
          title: p.productName,
          description: p.description,
          images: productImages, // Send the full images array
          image: productImages.length > 0 ? productImages[0].url : null, // First image URL
          price: p.pricePerUnit,
          moq: p.moq,
          category: p.category?.name || 'Product',
          categoryId: p.category?._id,
          colors: p.colors || [],
          quantityBasedPricing: p.quantityBasedPricing || [],
            targetedCustomer: p.targetedCustomer || 'unisex',
          url: `/productDetails?id=${p._id}`
        };
      }),
      ...categories.map(c => ({
        _id: c._id,
        type: 'category',
        title: c.name,
        description: c.description,
        image: c.image?.url,
        url: `/products?category=${c._id}`
      }))
    ];

    console.log('First result images:', results[0]?.images);

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while searching'
    });
  }
};

router.get('/', search);

module.exports = router;