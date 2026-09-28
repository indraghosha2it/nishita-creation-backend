
const mongoose = require('mongoose');
const Barcode = require('../models/Barcode');
const Product = require('../models/Product');
const { generateAndUploadBarcodeImage } = require('../utils/generateBarcodeImage');

// Generate numeric-only barcode (10-11 digits)
const generateCustomBarcodeNumber = (sequence) => {
  // Format: 8XXXXXXXXX (10 digits total)
  // First digit: 8 (toy category)
  // Next 8 digits: sequence padded to 8 digits
  // Last digit: check digit
  const sequenceStr = sequence.toString().padStart(8, '0');
  const barcodeWithoutCheck = `8${sequenceStr}`;
  
  // Calculate simple checksum (Luhn-like but simpler)
  let sum = 0;
  for (let i = 0; i < barcodeWithoutCheck.length; i++) {
    const digit = parseInt(barcodeWithoutCheck[i]);
    if (i % 2 === 0) {
      sum += digit * 3;
    } else {
      sum += digit * 1;
    }
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return barcodeWithoutCheck + checkDigit; // 10 digits total
};

// @desc    Generate barcodes in bulk
// @route   POST /api/barcodes/generate
// @access  Private (Admin/Moderator)
const generateBarcodes = async (req, res) => {
  try {
    const { count = 100 } = req.body;
    
    console.log(`🚀 Starting generation of ${count} numeric barcodes`);
    
    const generatedBarcodes = [];
    const batchId = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Get existing barcodes
    const existingBarcodes = await Barcode.find({}, 'barcodeNumber');
    
    // Find the maximum sequence number from existing barcodes
    let maxSequence = 0;
    for (const barcode of existingBarcodes) {
      const numStr = barcode.barcodeNumber;
      if (numStr && numStr.length >= 9) {
        // Extract sequence from barcode (digits 2-9, skipping first digit and last check digit)
        const sequenceStr = numStr.substring(1, 9);
        const sequenceNum = parseInt(sequenceStr, 10);
        if (!isNaN(sequenceNum) && sequenceNum > maxSequence) {
          maxSequence = sequenceNum;
        }
      }
    }
    
    const startFrom = maxSequence + 1;
    console.log(`Last sequence found: ${maxSequence}, starting from: ${startFrom}`);
    
    const existingSet = new Set(existingBarcodes.map(b => b.barcodeNumber));
    
    for (let i = 0; i < count; i++) {
      const sequenceNumber = startFrom + i;
      const barcodeNumber = generateCustomBarcodeNumber(sequenceNumber);
      
      if (existingSet.has(barcodeNumber)) {
        console.log(`Skipping duplicate: ${barcodeNumber}`);
        continue;
      }
      
      console.log(`Processing ${i + 1}/${count}: ${barcodeNumber}`);
      
      let barcodeImageUrl = '';
      let barcodeImagePublicId = '';
      
      try {
        const result = await generateAndUploadBarcodeImage(barcodeNumber);
        barcodeImageUrl = result.url;
        barcodeImagePublicId = result.publicId;
        console.log(`✅ Success: ${barcodeNumber}`);
      } catch (imgError) {
        console.error(`❌ Failed for ${barcodeNumber}:`, imgError.message);
      }
      
      const barcode = new Barcode({
        barcodeNumber,
        format: 'CODE-128',
        batchId,
        status: 'available',
        barcodeImageUrl,
        barcodeImagePublicId,
        generatedBy: req.user.id,
        metadata: {
          sequence: sequenceNumber
        }
      });
      
      await barcode.save();
      generatedBarcodes.push(barcode);
      existingSet.add(barcodeNumber);
    }
    
    console.log(`✅ Completed! Generated ${generatedBarcodes.length} barcodes`);
    
    res.status(201).json({
      success: true,
      data: {
        batchId,
        generatedCount: generatedBarcodes.length,
        requestedCount: count,
        startFrom,
        endAt: startFrom + generatedBarcodes.length - 1,
        barcodes: generatedBarcodes
      },
      message: `Successfully generated ${generatedBarcodes.length} numeric barcodes`
    });
  } catch (error) {
    console.error('Generate barcodes error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all available barcodes
// @route   GET /api/barcodes/available
// @access  Private (Admin/Moderator)
const getAvailableBarcodes = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    const query = { status: 'available' };
    if (search) {
      query.barcodeNumber = { $regex: search, $options: 'i' };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [barcodes, total] = await Promise.all([
      Barcode.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Barcode.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: barcodes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get available barcodes error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all assigned barcodes
// @route   GET /api/barcodes/assigned
// @access  Private (Admin/Moderator)
const getAssignedBarcodes = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    const query = { status: 'assigned' };
    if (search) {
      query.$or = [
        { barcodeNumber: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
        { productSku: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [barcodes, total] = await Promise.all([
      Barcode.find(query)
        // .populate('productId', 'productName skuCode images')
        .populate('productId', 'productName slug skuCode images')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Barcode.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: barcodes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get assigned barcodes error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



// const validateBarcode = async (req, res) => {
//   try {
//     const { barcodeNumber } = req.params;
//     const { productId } = req.query;

//     // ✅ CHANGE 1: Populate productId with slug
//     const barcode = await Barcode.findOne({ barcodeNumber })
//       .populate('productId', 'productName slug skuCode');

//     // Check if barcode is already assigned to a Product document
//     let existingProduct = null;
//     if (productId) {
//       existingProduct = await Product.findOne({
//         barcode: barcodeNumber,
//         _id: { $ne: productId }
//       }).select('productName slug skuCode');
//     } else {
//       existingProduct = await Product.findOne({ barcode: barcodeNumber })
//         .select('productName slug skuCode');   // ✅ CHANGE 2: select slug
//     }

//     if (!barcode && !existingProduct) {
//       return res.json({
//         success: true,
//         data: {
//           isValid: true,
//           exists: false,
//           status: 'new',
//           message: 'This barcode can be used for a new product'
//         }
//       });
//     }

//     // ✅ CHANGE 3: Add productSlug to Product-model match
//     if (existingProduct) {
//       return res.json({
//         success: true,
//         data: {
//           isValid: false,
//           exists: true,
//           status: 'assigned',
//           productId: existingProduct._id,
//           productSlug: existingProduct.slug,              // ← NEW
//           productName: existingProduct.productName,
//           message: `This barcode is already assigned to product: ${existingProduct.productName}`
//         }
//       });
//     }

//     // ✅ CHANGE 4: Add productSlug to Barcode-model match
//     if (barcode && barcode.status === 'assigned') {
//       if (barcode.productId && (!productId || barcode.productId.toString() !== productId)) {
//         // barcode.productId is now a populated object, so extract _id and slug
//         const populatedProductId =
//           barcode.productId?._id || barcode.productId;
//         const populatedSlug = barcode.productId?.slug || null;
//         const populatedName =
//           barcode.productName || barcode.productId?.productName || '';

//         return res.json({
//           success: true,
//           data: {
//             isValid: false,
//             exists: true,
//             status: 'assigned',
//             productId: populatedProductId,      // ← string/objectId
//             productSlug: populatedSlug,          // ← NEW (slug for routing)
//             productName: populatedName,
//             message: `This barcode is already assigned to product: ${populatedName}`
//           }
//         });
//       }
//     }

//     if (barcode && barcode.status === 'available') {
//       return res.json({
//         success: true,
//         data: {
//           isValid: true,
//           exists: true,
//           status: 'available',
//           message: 'This barcode is available and can be assigned'
//         }
//       });
//     }

//     res.json({
//       success: true,
//       data: {
//         isValid: true,
//         exists: true,
//         status: barcode?.status || 'available',
//         message: 'Barcode is available'
//       }
//     });
//   } catch (error) {
//     console.error('Validate barcode error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };



const validateBarcode = async (req, res) => {
  try {
    const { barcodeNumber } = req.params;
    const { productId } = req.query;

    // ✅ FIX 1: Convert productId (string from query) to ObjectId for proper comparison
    const currentProductId = productId ? new mongoose.Types.ObjectId(productId) : null;

    // Check Barcode collection
    const barcode = await Barcode.findOne({ barcodeNumber })
      .populate('productId', 'productName slug skuCode');

    // Check Product collection (exclude current product using ObjectId)
    let existingProduct = null;
    if (currentProductId) {
      existingProduct = await Product.findOne({
        barcode: barcodeNumber,
        _id: { $ne: currentProductId }        // ✅ FIX 2: ObjectId vs ObjectId
      }).select('productName slug skuCode');
    } else {
      existingProduct = await Product.findOne({ barcode: barcodeNumber })
        .select('productName slug skuCode');
    }

    if (!barcode && !existingProduct) {
      return res.json({
        success: true,
        data: {
          isValid: true,
          exists: false,
          status: 'new',
          message: 'This barcode can be used for a new product'
        }
      });
    }

    // Barcode assigned to a DIFFERENT product (found via Product collection)
    if (existingProduct) {
      return res.json({
        success: true,
        data: {
          isValid: false,
          exists: true,
          status: 'assigned',
          productId: existingProduct._id,
          productSlug: existingProduct.slug,
          productName: existingProduct.productName,
          message: `This barcode is already assigned to product: ${existingProduct.productName}`
        }
      });
    }

    // Barcode exists in Barcode collection and is assigned
    if (barcode && barcode.status === 'assigned') {
      const assignedProductId =
        barcode.productId?._id || barcode.productId;

      // ✅ FIX 3: If barcode is assigned to the CURRENT product being edited → VALID
      if (
        assignedProductId &&
        currentProductId &&
        assignedProductId.toString() === currentProductId.toString()
      ) {
        return res.json({
          success: true,
          data: {
            isValid: true,
            exists: true,
            status: 'assigned',
            productId: assignedProductId,
            productSlug: barcode.productId?.slug || null,
            productName:
              barcode.productName ||
              barcode.productId?.productName ||
              '',
            message: 'This barcode is already assigned to this product'
          }
        });
      }

      // Assigned to a DIFFERENT product → invalid
      if (
        assignedProductId &&
        (!currentProductId ||
          assignedProductId.toString() !== currentProductId.toString())
      ) {
        const populatedName =
          barcode.productName ||
          barcode.productId?.productName ||
          '';

        return res.json({
          success: true,
          data: {
            isValid: false,
            exists: true,
            status: 'assigned',
            productId: assignedProductId,
            productSlug: barcode.productId?.slug || null,
            productName: populatedName,
            message: `This barcode is already assigned to product: ${populatedName}`
          }
        });
      }
    }

    if (barcode && barcode.status === 'available') {
      return res.json({
        success: true,
        data: {
          isValid: true,
          exists: true,
          status: 'available',
          message: 'This barcode is available and can be assigned'
        }
      });
    }

    res.json({
      success: true,
      data: {
        isValid: true,
        exists: true,
        status: barcode?.status || 'available',
        message: 'Barcode is available'
      }
    });
  } catch (error) {
    console.error('Validate barcode error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get barcode statistics
// @route   GET /api/barcodes/stats

// @access  Private (Admin)
const getBarcodeStats = async (req, res) => {
  try {
    const [total, available, assigned, inactive] = await Promise.all([
      Barcode.countDocuments(),
      Barcode.countDocuments({ status: 'available' }),
      Barcode.countDocuments({ status: 'assigned' }),
      Barcode.countDocuments({ status: 'inactive' })
    ]);
    
    const usageRate = total > 0 ? ((assigned / total) * 100).toFixed(1) : 0;
    
    res.json({
      success: true,
      data: {
        stats: {
          total,
          available,
          assigned,
          inactive,
          usageRate: parseFloat(usageRate)
        }
      }
    });
  } catch (error) {
    console.error('Get barcode stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Release barcode
// @route   PUT /api/barcodes/:barcodeNumber/release
// @access  Private (Admin/Moderator)
const releaseBarcode = async (req, res) => {
  try {
    const { barcodeNumber } = req.params;
    
    const barcode = await Barcode.findOne({ barcodeNumber });
    
    if (!barcode) {
      return res.status(404).json({
        success: false,
        error: 'Barcode not found'
      });
    }
    
    if (barcode.productId) {
      await Product.findByIdAndUpdate(barcode.productId, {
        $unset: { barcode: '' }
      });
    }
    
    barcode.productId = null;
    barcode.productSku = '';
    barcode.productName = '';
    barcode.status = 'available';
    await barcode.save();
    
    res.json({
      success: true,
      data: barcode,
      message: 'Barcode released successfully'
    });
  } catch (error) {
    console.error('Release barcode error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete barcode
// @route   DELETE /api/barcodes/:barcodeNumber
// @access  Private (Admin only)
const deleteBarcode = async (req, res) => {
  try {
    const { barcodeNumber } = req.params;
    
    const barcode = await Barcode.findOne({ barcodeNumber });
    
    if (!barcode) {
      return res.status(404).json({
        success: false,
        error: 'Barcode not found'
      });
    }
    
    if (barcode.barcodeImagePublicId) {
      try {
        const cloudinary = require('cloudinary').v2;
        await cloudinary.uploader.destroy(barcode.barcodeImagePublicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete Cloudinary image:', cloudinaryError);
      }
    }
    
    if (barcode.productId) {
      await Product.findByIdAndUpdate(barcode.productId, {
        $unset: { barcode: '' }
      });
    }
    
    await Barcode.findOneAndDelete({ barcodeNumber });
    
    res.json({
      success: true,
      message: 'Barcode deleted successfully'
    });
  } catch (error) {
    console.error('Delete barcode error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  generateBarcodes,
  getAvailableBarcodes,
  getAssignedBarcodes,
  validateBarcode,
  getBarcodeStats,
  releaseBarcode,
  deleteBarcode
};