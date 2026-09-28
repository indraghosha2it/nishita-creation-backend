

// // backend/src/controllers/skuController.js
// const Product = require('../models/Product');

// // Generate unique SKU for products with BB- prefix
// const generateUniqueSku = async (req, res) => {
//   try {
//     // Find the most recent product with a BB- SKU
//     const lastProduct = await Product.findOne({ 
//       skuCode: { $regex: /^BB-/ } 
//     }).sort({ createdAt: -1 });
    
//     let newSkuCode;
    
//     if (lastProduct && lastProduct.skuCode) {
//       const lastSku = lastProduct.skuCode;
//       const parts = lastSku.split('-');
      
//       if (parts.length === 3) {
//         const lastSequence = parseInt(parts[2]);
//         if (!isNaN(lastSequence)) {
//           const newSequence = lastSequence + 1;
//           const timestamp = Date.now().toString().slice(0, 5);
//           newSkuCode = `BB-${timestamp}-${newSequence}`;
          
//           const existing = await Product.findOne({ skuCode: newSkuCode });
//           if (!existing) {
//             return res.json({
//               success: true,
//               data: { skuCode: newSkuCode }
//             });
//           }
//         }
//       }
//     }
    
//     // If no existing BB- SKU found, start from 1001
//     const timestamp = Date.now().toString().slice(0, 5);
//     let baseSequence = 1001;
    
//     // Check if any BB- SKU exists at all
//     const anyBbSku = await Product.findOne({ 
//       skuCode: { $regex: /^BB-/ } 
//     });
    
//     if (!anyBbSku) {
//       newSkuCode = `BB-${timestamp}-${baseSequence}`;
//     } else {
//       // Fallback: generate with timestamp and random number
//       const randomNum = Math.floor(Math.random() * 1000);
//       newSkuCode = `BB-${timestamp}-${baseSequence + randomNum}`;
//     }
    
//     let isUnique = false;
//     let attempts = 0;
//     while (!isUnique && attempts < 5) {
//       const existing = await Product.findOne({ skuCode: newSkuCode });
//       if (!existing) {
//         isUnique = true;
//       } else {
//         const newRandom = Math.floor(Math.random() * 1000);
//         newSkuCode = `BB-${timestamp}-${baseSequence + newRandom}`;
//       }
//       attempts++;
//     }
    
//     res.json({
//       success: true,
//       data: { skuCode: newSkuCode }
//     });
    
//   } catch (error) {
//     console.error('Generate SKU error:', error);
//     // Fallback with timestamp
//     const fallbackSku = `BB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//     res.json({
//       success: true,
//       data: { skuCode: fallbackSku }
//     });
//   }
// };

// // Validate SKU uniqueness
// const validateSku = async (req, res) => {
//   try {
//     const { skuCode } = req.params;
//     const { excludeId } = req.query;
    
//     const query = { skuCode };
//     if (excludeId) {
//       query._id = { $ne: excludeId };
//     }
    
//     const existingProduct = await Product.findOne(query);
    
//     res.json({
//       success: true,
//       data: {
//         isUnique: !existingProduct,
//         message: existingProduct ? `SKU already used by: ${existingProduct.productName}` : 'SKU is available'
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// module.exports = { 
//   generateUniqueSku, 
//   validateSku
// };


// backend/src/controllers/skuController.js
const Product = require('../models/Product');

// Generate unique SKU for products with NC- prefix
const generateUniqueSku = async (req, res) => {
  try {
    // Find the most recent product with an NC- SKU
    const lastProduct = await Product.findOne({ 
      skuCode: { $regex: /^NC-/ } 
    }).sort({ createdAt: -1 });
    
    let newSkuCode;
    
    if (lastProduct && lastProduct.skuCode) {
      const lastSku = lastProduct.skuCode;
      const parts = lastSku.split('-');
      
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2]);
        if (!isNaN(lastSequence)) {
          const newSequence = lastSequence + 1;
          const timestamp = Date.now().toString().slice(0, 5);
          newSkuCode = `NC-${timestamp}-${newSequence}`;
          
          const existing = await Product.findOne({ skuCode: newSkuCode });
          if (!existing) {
            return res.json({
              success: true,
              data: { skuCode: newSkuCode }
            });
          }
        }
      }
    }
    
    // If no existing NC- SKU found, start from 1001
    const timestamp = Date.now().toString().slice(0, 5);
    let baseSequence = 1001;
    
    // Check if any NC- SKU exists at all
    const anyNcSku = await Product.findOne({ 
      skuCode: { $regex: /^NC-/ } 
    });
    
    if (!anyNcSku) {
      newSkuCode = `NC-${timestamp}-${baseSequence}`;
    } else {
      // Fallback: generate with timestamp and random number
      const randomNum = Math.floor(Math.random() * 1000);
      newSkuCode = `NC-${timestamp}-${baseSequence + randomNum}`;
    }
    
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const existing = await Product.findOne({ skuCode: newSkuCode });
      if (!existing) {
        isUnique = true;
      } else {
        const newRandom = Math.floor(Math.random() * 1000);
        newSkuCode = `NC-${timestamp}-${baseSequence + newRandom}`;
      }
      attempts++;
    }
    
    res.json({
      success: true,
      data: { skuCode: newSkuCode }
    });
    
  } catch (error) {
    console.error('Generate SKU error:', error);
    // Fallback with timestamp
    const fallbackSku = `NC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    res.json({
      success: true,
      data: { skuCode: fallbackSku }
    });
  }
};

// Validate SKU uniqueness
const validateSku = async (req, res) => {
  try {
    const { skuCode } = req.params;
    const { excludeId } = req.query;
    
    const query = { skuCode };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const existingProduct = await Product.findOne(query);
    
    res.json({
      success: true,
      data: {
        isUnique: !existingProduct,
        message: existingProduct ? `SKU already used by: ${existingProduct.productName}` : 'SKU is available'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = { 
  generateUniqueSku, 
  validateSku
};