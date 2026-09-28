const ProductCostSettings = require('../models/ProductCostSettings');

// @desc    Get product cost settings
// @route   GET /api/product-cost/settings
// @access  Private (Super Admin/Admin/Moderator)
const getSettings = async (req, res) => {
  try {
    const settings = await ProductCostSettings.getSettings();
    
    // Populate updatedBy if it exists
    if (settings.updatedBy) {
      await settings.populate('updatedBy', 'name email role');
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching settings'
    });
  }
};

// @desc    Update product cost settings
// @route   PUT /api/product-cost/settings
// @access  Private (Super Admin/Admin/Moderator)
const updateSettings = async (req, res) => {
  try {
    const { packagingCost, deliveryCost, notes } = req.body;

    // Check permissions
    if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. Only super admins, admins, and moderators can update settings.'
      });
    }

    // Validate input
    if (packagingCost !== undefined && packagingCost < 0) {
      return res.status(400).json({
        success: false,
        error: 'Packaging cost cannot be negative'
      });
    }
    
    if (deliveryCost !== undefined && deliveryCost < 0) {
      return res.status(400).json({
        success: false,
        error: 'Delivery cost cannot be negative'
      });
    }

    // Get or create settings
    let settings = await ProductCostSettings.findOne();
    if (!settings) {
      settings = new ProductCostSettings({
        packagingCost: 0,
        deliveryCost: 0,
        updatedBy: req.user.id,
        notes: notes || 'Default settings created'
      });
    }

    // Update fields
    if (packagingCost !== undefined) {
      settings.packagingCost = Number(packagingCost);
    }
    if (deliveryCost !== undefined) {
      settings.deliveryCost = Number(deliveryCost);
    }
    if (notes !== undefined) {
      settings.notes = notes;
    }
    
    // Only set updatedBy if user is authenticated
    if (req.user && req.user.id) {
      settings.updatedBy = req.user.id;
    }
    settings.updatedAt = new Date();
    settings.version += 1;

    await settings.save();

    // Populate updatedBy for response
    if (settings.updatedBy) {
      await settings.populate('updatedBy', 'name email role');
    }

    res.json({
      success: true,
      data: settings,
      message: 'Product cost settings updated successfully'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating settings'
    });
  }
};

// @desc    Reset settings to defaults
// @route   POST /api/product-cost/settings/reset
// @access  Private (Super Admin only)
const resetSettings = async (req, res) => {
  try {
    // Only super_admin can reset
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. Only super admins can reset settings.'
      });
    }

    let settings = await ProductCostSettings.findOne();
    if (!settings) {
      settings = new ProductCostSettings({
        packagingCost: 0,
        deliveryCost: 0,
        updatedBy: req.user.id,
        notes: 'Reset to default settings'
      });
    } else {
      settings.packagingCost = 0;
      settings.deliveryCost = 0;
      settings.updatedBy = req.user.id;
      settings.updatedAt = new Date();
      settings.version += 1;
      settings.notes = 'Reset to default settings';
    }

    await settings.save();

    if (settings.updatedBy) {
      await settings.populate('updatedBy', 'name email role');
    }

    res.json({
      success: true,
      data: settings,
      message: 'Settings reset to defaults successfully'
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};