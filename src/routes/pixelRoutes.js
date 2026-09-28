const express = require('express');
const router = express.Router();
const PixelSettings = require('../models/PixelSettings');
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');

// @desc    Get pixel settings
// @route   GET /api/pixels/settings
// @access  Public (for client-side loading) / Private for admin
router.get('/settings', async (req, res) => {
  try {
    const settings = await PixelSettings.getSettings();
    
    // For public access, only send necessary config (no sensitive data)
    const publicConfig = {
      enabled: settings.enabled,
      facebook: {
        enabled: settings.facebook.enabled,
        pixelId: settings.facebook.pixelId,
        debug: settings.facebook.debug,
        autoConfig: settings.facebook.autoConfig
      },
      google: {
        enabled: settings.google.enabled,
        measurementId: settings.google.measurementId,
        debug: settings.google.debug
      },
      customEvents: settings.customEvents
    };
    
    res.json({
      success: true,
      data: publicConfig
    });
  } catch (error) {
    console.error('Get pixel settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get full pixel settings (admin only)
// @route   GET /api/pixels/admin/settings
// @access  Private (Super Admin/Admin/Moderator)
router.get('/admin/settings', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const settings = await PixelSettings.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get admin pixel settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update pixel settings
// @route   PUT /api/pixels/settings
// @access  Private (Super Admin/Admin/Moderator)
router.put('/settings', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const {
      enabled,
      facebook,
      google,
      customEvents
    } = req.body;

    let settings = await PixelSettings.getSettings();

    // Update settings
    if (enabled !== undefined) settings.enabled = enabled;
    
    if (facebook) {
      settings.facebook = {
        ...settings.facebook,
        ...facebook
      };
    }
    
    if (google) {
      settings.google = {
        ...settings.google,
        ...google
      };
    }
    
    if (customEvents) {
      settings.customEvents = {
        ...settings.customEvents,
        ...customEvents
      };
    }
    
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();

    await settings.save();

    res.json({
      success: true,
      data: settings,
      message: 'Pixel settings updated successfully'
    });
  } catch (error) {
    console.error('Update pixel settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Test Facebook Pixel
// @route   POST /api/pixels/facebook/test
// @access  Private (Super Admin/Admin/Moderator)
router.post('/facebook/test', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const { pixelId, testEventCode } = req.body;
    
    if (!pixelId) {
      return res.status(400).json({
        success: false,
        error: 'Pixel ID is required'
      });
    }

    // Construct test URL
    const testUrl = `https://www.facebook.com/adsmanager/manage/pixel/${pixelId}/test-events`;
    
    res.json({
      success: true,
      data: {
        message: 'Test event URL generated',
        testUrl: testUrl,
        instructions: 'Open the URL in your browser to test the pixel'
      }
    });
  } catch (error) {
    console.error('Test pixel error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;