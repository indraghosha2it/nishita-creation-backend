// routes/upload.js
const express = require('express');
const router = express.Router();
const { uploadProduct, deleteImage } = require('../config/cloudinary');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Upload company logo
router.post('/company-logo', protect, isAdmin, uploadProduct.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      fileUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete logo
router.delete('/delete-logo', protect, isAdmin, async (req, res) => {
  try {
    const { publicId } = req.query;
    if (!publicId) {
      return res.status(400).json({ success: false, error: 'No public ID provided' });
    }
    
    const result = await deleteImage(publicId);
    res.json({ success: result, message: 'Logo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;