const express = require('express');
const router = express.Router();
const CustomCode = require('../models/CustomCode');
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');

// @desc    Get custom code settings (public)
// @route   GET /api/custom-code/settings
// @access  Public
router.get('/settings', async (req, res) => {
  try {
    const settings = await CustomCode.getSettings();
    
    // Only send what's needed for the frontend
    const publicConfig = {
      headerCode: settings.headerCode,
      bodyCode: settings.bodyCode,
      footerCode: settings.footerCode,
      active: settings.active
    };
    
    res.json({
      success: true,
      data: publicConfig
    });
  } catch (error) {
    console.error('Get custom code error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update custom code settings (admin only)
// @route   PUT /api/custom-code/settings
// @access  Private (Super Admin/Admin/Moderator)
router.put('/settings', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const { headerCode, bodyCode, footerCode, active } = req.body;
    
    let settings = await CustomCode.getSettings();
    
    // Update fields
    if (headerCode !== undefined) settings.headerCode = headerCode;
    if (bodyCode !== undefined) settings.bodyCode = bodyCode;
    if (footerCode !== undefined) settings.footerCode = footerCode;
    if (active !== undefined) settings.active = active;
    
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();
    
    await settings.save();
    
    res.json({
      success: true,
      data: settings,
      message: 'Custom code updated successfully'
    });
  } catch (error) {
    console.error('Update custom code error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;