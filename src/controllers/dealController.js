


// backend/src/controllers/dealController.js
const Deal = require('../models/Deal');

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @desc    Get all active deals
// @route   GET /api/deals
// @access  Public
const getPublicDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-createdBy -updatedBy -__v');

    // Filter by date if startDate/endDate are set
    const now = new Date();
    const filteredDeals = deals.filter(deal => {
      if (deal.startDate && deal.startDate > now) return false;
      if (deal.endDate && deal.endDate < now) return false;
      return true;
    });

    res.json({
      success: true,
      count: filteredDeals.length,
      data: filteredDeals
    });
  } catch (error) {
    console.error('Get public deals error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching deals'
    });
  }
};

// ============================================================
// ADMIN ROUTES
// ============================================================

// @desc    Get all deals (admin)
// @route   GET /api/admin/deals
// @access  Private (Admin/Moderator)
const getAdminDeals = async (req, res) => {
  try {
    const deals = await Deal.find().sort({ displayOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    console.error('Get admin deals error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching deals'
    });
  }
};

// @desc    Create a new deal
// @route   POST /api/admin/deals
// @access  Private (Admin/Moderator)
const createDeal = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      image,
      buttonText,
      buttonLink,
      displayOrder,
      isActive,
      startDate,
      endDate,
      backgroundColor,
      textColor,
      buttonColor
    } = req.body;

    // ✅ REMOVE title validation - only image is required
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required'
      });
    }

    // Check for duplicate display order if provided
    if (displayOrder !== undefined) {
      const existingDeal = await Deal.findOne({ displayOrder });
      if (existingDeal) {
        // Shift existing deals with higher order
        await Deal.updateMany(
          { displayOrder: { $gte: displayOrder } },
          { $inc: { displayOrder: 1 } }
        );
      }
    }

    // ✅ Ensure title is a string (empty if not provided)
    const finalTitle = title || '';

    const deal = await Deal.create({
      title: finalTitle,
      subtitle: subtitle || '',
      image,
      buttonText: buttonText || ' ',
      buttonLink: buttonLink || '/products',
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate || null,
      endDate: endDate || null,
      backgroundColor: backgroundColor || '#FFF5F6',
      textColor: textColor || '#2D1B2E',
      buttonColor: buttonColor || '#EE4275',
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: deal,
      message: 'Deal created successfully'
    });
  } catch (error) {
    console.error('Create deal error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating deal'
    });
  }
};

// @desc    Update a deal
// @route   PUT /api/admin/deals/:id
// @access  Private (Admin/Moderator)
const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      image,
      buttonText,
      buttonLink,
      displayOrder,
      isActive,
      startDate,
      endDate,
      backgroundColor,
      textColor,
      buttonColor
    } = req.body;

    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    // Handle display order change
    if (displayOrder !== undefined && displayOrder !== deal.displayOrder) {
      // Shift existing deals to make room
      if (displayOrder > deal.displayOrder) {
        await Deal.updateMany(
          { 
            displayOrder: { $gt: deal.displayOrder, $lte: displayOrder },
            _id: { $ne: id }
          },
          { $inc: { displayOrder: -1 } }
        );
      } else if (displayOrder < deal.displayOrder) {
        await Deal.updateMany(
          { 
            displayOrder: { $gte: displayOrder, $lt: deal.displayOrder },
            _id: { $ne: id }
          },
          { $inc: { displayOrder: 1 } }
        );
      }
      deal.displayOrder = displayOrder;
    }

    // Update fields - ensure title is never null/undefined
    if (title !== undefined) deal.title = title || '';
    if (subtitle !== undefined) deal.subtitle = subtitle;
    if (image !== undefined) deal.image = image;
  if (buttonText !== undefined) deal.buttonText = buttonText || '';
    if (buttonLink !== undefined) deal.buttonLink = buttonLink;
    if (isActive !== undefined) deal.isActive = isActive;
    if (startDate !== undefined) deal.startDate = startDate;
    if (endDate !== undefined) deal.endDate = endDate;
    if (backgroundColor !== undefined) deal.backgroundColor = backgroundColor;
    if (textColor !== undefined) deal.textColor = textColor;
    if (buttonColor !== undefined) deal.buttonColor = buttonColor;
    deal.updatedBy = req.user.id;

    await deal.save();

    res.json({
      success: true,
      data: deal,
      message: 'Deal updated successfully'
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating deal'
    });
  }
};

// @desc    Delete a deal
// @route   DELETE /api/admin/deals/:id
// @access  Private (Admin/Moderator)
const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    // Shift display order for remaining deals
    await Deal.updateMany(
      { displayOrder: { $gt: deal.displayOrder } },
      { $inc: { displayOrder: -1 } }
    );

    await deal.deleteOne();

    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting deal'
    });
  }
};

// @desc    Toggle deal active status
// @route   PATCH /api/admin/deals/:id/toggle
// @access  Private (Admin/Moderator)
const toggleDealStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    deal.isActive = !deal.isActive;
    deal.updatedBy = req.user.id;
    await deal.save();

    res.json({
      success: true,
      data: deal,
      message: `Deal ${deal.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle deal status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling deal status'
    });
  }
};

// @desc    Bulk reorder deals
// @route   PUT /api/admin/deals/reorder
// @access  Private (Admin/Moderator)
const reorderDeals = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        error: 'Orders array is required'
      });
    }

    const bulkOps = orders.map(({ id, displayOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { 
          displayOrder,
          updatedBy: req.user.id
        }
      }
    }));

    await Deal.bulkWrite(bulkOps);

    const updatedDeals = await Deal.find().sort({ displayOrder: 1 });

    res.json({
      success: true,
      data: updatedDeals,
      message: 'Deals reordered successfully'
    });
  } catch (error) {
    console.error('Reorder deals error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while reordering deals'
    });
  }
};

module.exports = {
  getPublicDeals,
  getAdminDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  toggleDealStatus,
  reorderDeals
};