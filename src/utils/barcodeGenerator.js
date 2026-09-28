// backend/src/utils/barcodeGenerator.js
const bwipjs = require('bwip-js');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

// Configure Cloudinary (if you want to store barcode images)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Generate a barcode as a data URL or buffer
 * @param {string} data - The data to encode (SKU or product ID)
 * @param {string} format - Barcode format (default: 'code128')
 * @returns {Promise<Buffer>} - PNG buffer
 */
const generateBarcodeBuffer = async (data, format = 'code128') => {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: format,        // Barcode type
      text: data,          // Text to encode
      scale: 3,            // 3x scaling factor
      height: 10,          // Bar height in mm
      width: 2,            // Bar width
      includetext: true,   // Show human-readable text
      textxalign: 'center',// Center the text
      textsize: 11,        // Text size
      textcolor: '000000', // Text color
      backgroundcolor: 'ffffff', // Background color
      bordercolor: '000000', // Border color
    }, (err, png) => {
      if (err) reject(err);
      else resolve(png);
    });
  });
};

/**
 * Upload barcode to Cloudinary and return URL
 * @param {Buffer} barcodeBuffer - PNG buffer of barcode
 * @param {string} sku - SKU code for filename
 * @returns {Promise<string>} - Cloudinary URL
 */
const uploadBarcodeToCloudinary = async (barcodeBuffer, sku) => {
  try {
    // Create temp file path
    const tempFilePath = path.join(__dirname, `../temp/barcode-${sku}.png`);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, barcodeBuffer);
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'products/barcodes',
      public_id: `barcode-${sku}`,
      overwrite: true
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading barcode to Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate barcode for a product
 * @param {string} sku - SKU code
 * @param {string} productId - MongoDB product ID (optional fallback)
 * @returns {Promise<{barcode: string, barcodeImageUrl: string}>}
 */
const generateProductBarcode = async (sku, productId = null) => {
  // Use SKU as barcode data (you could also use product ID)
  const barcodeData = sku;
  
  try {
    // Generate barcode buffer
    const barcodeBuffer = await generateBarcodeBuffer(barcodeData);
    
    // Upload to Cloudinary
    const barcodeUrl = await uploadBarcodeToCloudinary(barcodeBuffer, sku);
    
    return {
      barcode: barcodeData,
      barcodeImageUrl: barcodeUrl
    };
  } catch (error) {
    console.error('Barcode generation error:', error);
    // Fallback: return just the barcode text without image
    return {
      barcode: barcodeData,
      barcodeImageUrl: ''
    };
  }
};

/**
 * Generate barcode for bulk products (useful for existing products)
 * @param {Array} products - Array of product objects with skuCode
 */
const generateBulkBarcodes = async (products) => {
  const results = [];
  
  for (const product of products) {
    try {
      const { barcode, barcodeImageUrl } = await generateProductBarcode(product.skuCode, product._id);
      results.push({
        productId: product._id,
        sku: product.skuCode,
        barcode,
        barcodeImageUrl,
        success: true
      });
    } catch (error) {
      results.push({
        productId: product._id,
        sku: product.skuCode,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
};

module.exports = {
  generateBarcodeBuffer,
  uploadBarcodeToCloudinary,
  generateProductBarcode,
  generateBulkBarcodes
};