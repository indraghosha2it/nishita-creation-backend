const express = require('express');
const router = express.Router();
const { uploadProduct, deleteImage } = require('../config/cloudinary');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// @desc    Upload company logo
// @route   POST /api/upload/company-logo
// @access  Private/Admin
router.post('/company-logo', protect, isAdmin, uploadProduct.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }
    
    console.log('✅ Logo uploaded successfully:', req.file);

    res.json({
      success: true,
      fileUrl: req.file.path,
      publicId: req.file.filename,
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('❌ Logo upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload logo' 
    });
  }
});

// @desc    Delete logo
// @route   DELETE /api/upload/delete-logo
// @access  Private/Admin
router.delete('/delete-logo', protect, isAdmin, async (req, res) => {
  try {
    const { publicId } = req.query;
    
    if (!publicId) {
      return res.status(400).json({ 
        success: false, 
        error: 'No public ID provided' 
      });
    }
    
    const result = await deleteImage(publicId);
    
    res.json({ 
      success: result, 
      message: 'Logo deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Logo deletion error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete logo' 
    });
  }
});

module.exports = router;