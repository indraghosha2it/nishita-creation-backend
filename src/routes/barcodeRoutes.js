const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const {
  generateBarcodes,
  getAvailableBarcodes,
  getAssignedBarcodes,
  validateBarcode,
  getBarcodeStats,
  releaseBarcode,
  deleteBarcode
} = require('../controllers/barcodeController');

// Public routes
router.get('/validate/:barcodeNumber', validateBarcode);


// Protected routes
router.use(protect);

// Stats (admin only)
router.get('/stats', isModeratorOrAdmin, getBarcodeStats);

// Generate barcodes (moderator/admin) - Always CODE128
router.post('/generate', isModeratorOrAdmin, generateBarcodes);

// Get barcodes
router.get('/available', isModeratorOrAdmin, getAvailableBarcodes);
router.get('/assigned', isModeratorOrAdmin, getAssignedBarcodes);

// Single barcode operations
router.put('/:barcodeNumber/release', isModeratorOrAdmin, releaseBarcode);
router.delete('/:barcodeNumber', isAdmin, deleteBarcode);



// Add this after other routes
// Generate a single unique barcode
router.post('/generate-single', isModeratorOrAdmin, async (req, res) => {
  try {
    const Barcode = require('../models/Barcode');
    const { generateAndUploadBarcodeImage } = require('../utils/generateBarcodeImage');
    
    // Get all existing barcode numbers
    const existingBarcodes = await Barcode.find({}, 'barcodeNumber');
    const existingNumbers = new Set(existingBarcodes.map(b => b.barcodeNumber));
    
    // Find next available number starting from 8000000001
    let nextNumber = 8000000001;
    while (existingNumbers.has(nextNumber.toString())) {
      nextNumber++;
      if (nextNumber > 8999999999) {
        return res.status(500).json({ success: false, error: 'No available barcode numbers' });
      }
    }
    
    const barcodeNumber = nextNumber.toString();
    
    // Generate barcode image
    let barcodeImageUrl = '';
    let barcodeImagePublicId = '';
    
    try {
      const result = await generateAndUploadBarcodeImage(barcodeNumber);
      barcodeImageUrl = result.url;
      barcodeImagePublicId = result.publicId;
    } catch (imgError) {
      console.error('Failed to generate image:', imgError);
    }
    
    const batchId = `SINGLE_${Date.now()}`;
    
    const barcode = new Barcode({
      barcodeNumber,
      format: 'CODE-128',
      batchId,
      status: 'available',
      barcodeImageUrl,
      barcodeImagePublicId,
      generatedBy: req.user.id,
      metadata: {
        sequence: nextNumber
      }
    });
    
    await barcode.save();
    
    res.status(201).json({
      success: true,
      data: {
        barcodeNumber,
        barcodeImageUrl,
        message: 'Barcode generated successfully'
      }
    });
  } catch (error) {
    console.error('Generate single barcode error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;