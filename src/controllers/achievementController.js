const Achievement = require('../models/Achievement');

// ============================================================
// PUBLIC: Get all active achievements
// @route   GET /api/achievements
// @access  Public
// ============================================================
const getPublicAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('❌ Get public achievements error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching achievements'
    });
  }
};

// ============================================================
// ADMIN: Get all achievements (including inactive)
// @route   GET /api/achievements/admin
// @access  Private (Moderator/Admin)
// ============================================================
const getAdminAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('❌ Get admin achievements error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching achievements'
    });
  }
};

// ============================================================
// ADMIN: Create achievement
// @route   POST /api/achievements/admin
// @access  Private (Moderator/Admin)
// ============================================================
const createAchievement = async (req, res) => {
  try {
    const { logo, title, subtitle, description, image, displayOrder, isActive } = req.body;

    if (!logo || !title || !image) {
      return res.status(400).json({
        success: false,
        error: 'Logo, title, and image are required'
      });
    }

    const achievement = await Achievement.create({
      logo,
      title,
      subtitle: subtitle || '',
      description: description || '',
      image,
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      data: achievement,
      message: 'Achievement created successfully'
    });
  } catch (error) {
    console.error('❌ Create achievement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating achievement'
    });
  }
};

// ============================================================
// ADMIN: Update achievement
// @route   PUT /api/achievements/admin/:id
// @access  Private (Moderator/Admin)
// ============================================================
const updateAchievement = async (req, res) => {
  try {
    const { logo, title, subtitle, description, image, displayOrder, isActive } = req.body;

    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    if (logo !== undefined) achievement.logo = logo;
    if (title !== undefined) achievement.title = title;
    if (subtitle !== undefined) achievement.subtitle = subtitle;
    if (description !== undefined) achievement.description = description;
    if (image !== undefined) achievement.image = image;
    if (displayOrder !== undefined) achievement.displayOrder = displayOrder;
    if (isActive !== undefined) achievement.isActive = isActive;

    await achievement.save();

    res.json({
      success: true,
      data: achievement,
      message: 'Achievement updated successfully'
    });
  } catch (error) {
    console.error('❌ Update achievement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating achievement'
    });
  }
};

// ============================================================
// ADMIN: Delete achievement
// @route   DELETE /api/achievements/admin/:id
// @access  Private (Moderator/Admin)
// ============================================================
const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    await achievement.deleteOne();

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete achievement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting achievement'
    });
  }
};

// ============================================================
// ADMIN: Toggle achievement status
// @route   PATCH /api/achievements/admin/:id/toggle
// @access  Private (Moderator/Admin)
// ============================================================
const toggleAchievementStatus = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    achievement.isActive = !achievement.isActive;
    await achievement.save();

    res.json({
      success: true,
      data: achievement,
      message: `Achievement ${achievement.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    console.error('❌ Toggle achievement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling achievement'
    });
  }
};

// ============================================================
// ADMIN: Reorder achievements
// @route   PUT /api/achievements/admin/reorder
// @access  Private (Moderator/Admin)
// ============================================================
const reorderAchievements = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        error: 'Orders array is required'
      });
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { displayOrder: item.displayOrder }
      }
    }));

    if (bulkOps.length > 0) {
      await Achievement.bulkWrite(bulkOps);
    }

    const achievements = await Achievement.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: achievements,
      message: 'Achievements reordered successfully'
    });
  } catch (error) {
    console.error('❌ Reorder achievements error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while reordering achievements'
    });
  }
};

module.exports = {
  getPublicAchievements,
  getAdminAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  toggleAchievementStatus,
  reorderAchievements
};