const User = require('../models/User');

// @desc    Get all users with role management data
// @route   GET /api/roles/users
// @access  Private (Super Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
      .populate('createdBy', 'email contactPerson')
      .populate('roleAssignedBy', 'email contactPerson');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// @desc    Update user role and permissions
// @route   PUT /api/roles/update/:userId
// @access  Private (Super Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions, dashboardAccess, isActive } = req.body;

    // Prevent self-demotion
    if (userId === req.user.id && role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'You cannot demote yourself'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent changing super_admin role (except by another super_admin)
    if (user.role === 'super_admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify super admin account'
      });
    }

    // Update fields
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    if (dashboardAccess) user.dashboardAccess = dashboardAccess;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    
    user.roleAssignedBy = req.user.id;
    user.roleAssignedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

// @desc    Get role statistics
// @route   GET /api/roles/stats
// @access  Private (Super Admin only)
const getRoleStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          inactive: {
            $sum: { $cond: ['$isActive', 0, 1] }
          }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          active: 1,
          inactive: 1,
          _id: 0
        }
      }
    ]);

    // Default roles with 0 if not present
    const roleDefaults = {
      super_admin: 0,
      admin: 0,
      moderator: 0,
      call_center_agent: 0,
      customer: 0
    };

    const result = {};
    stats.forEach(stat => {
      result[stat.role] = {
        total: stat.count,
        active: stat.active,
        inactive: stat.inactive
      };
    });

    // Fill in missing roles
    Object.keys(roleDefaults).forEach(role => {
      if (!result[role]) {
        result[role] = { total: 0, active: 0, inactive: 0 };
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get role statistics'
    });
  }
};

// @desc    Get dashboard sections accessible to user
// @route   GET /api/roles/dashboard-access
// @access  Private
const getDashboardAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Define all possible dashboard sections
    const allSections = [
      'analytics',
      'users',
      'products',
      'orders',
      'content',
      'reviews',
      'support',
      'settings',
      'coupons',
      'banners',
      'blogs',
      'delivery',
      'payments',
      'roles'
    ];

    // Super Admin has access to everything
    if (user.role === 'super_admin') {
      return res.json({
        success: true,
        data: {
          role: user.role,
          access: allSections,
          canConfigure: true
        }
      });
    }

    // Other roles: use dashboardAccess array or default based on role
    let access = user.dashboardAccess || [];
    
    // If no custom access defined, use role defaults
    if (access.length === 0) {
      const roleDefaults = {
        admin: ['analytics', 'users', 'products', 'orders', 'content', 'reviews', 'coupons', 'banners', 'blogs', 'payments'],
        moderator: ['analytics', 'products', 'content', 'reviews', 'banners', 'blogs'],
        call_center_agent: ['analytics', 'orders', 'support', 'delivery']
      };
      access = roleDefaults[user.role] || [];
    }

    res.json({
      success: true,
      data: {
        role: user.role,
        access: access,
        canConfigure: false
      }
    });
  } catch (error) {
    console.error('Get dashboard access error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard access'
    });
  }
};

// @desc    Get list of available permissions
// @route   GET /api/roles/permissions
// @access  Private (Super Admin only)
const getAvailablePermissions = async (req, res) => {
  const permissions = [
    // User Management
    'view_users',
    'create_user',
    'update_user',
    'delete_user',
    'manage_roles',
    'manage_permissions',
    
    // Product Management
    'view_products',
    'create_product',
    'update_product',
    'delete_product',
    'manage_categories',
    'manage_brands',
    'manage_tags',
    
    // Order Management
    'view_orders',
    'create_order',
    'update_order',
    'delete_order',
    'manage_delivery',
    'manage_payments',
    
    // Content Management
    'view_content',
    'create_content',
    'update_content',
    'delete_content',
    'manage_blogs',
    'manage_banners',
    'manage_coupons',
    
    // Support
    'view_support_tickets',
    'respond_to_support',
    'manage_reviews',
    'manage_contacts',
    
    // Settings
    'view_settings',
    'update_settings',
    'manage_system',
    
    // Reports
    'view_reports',
    'export_reports',
    'view_analytics'
  ];

  res.json({
    success: true,
    data: permissions
  });
};

module.exports = {
  getAllUsers,
  updateUserRole,
  getRoleStats,
  getDashboardAccess,
  getAvailablePermissions
};