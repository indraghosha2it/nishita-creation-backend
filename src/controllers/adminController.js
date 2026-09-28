

// controllers/adminController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ============================================
// CREATE USER - UPDATED (Allows all roles)
// ============================================
const createUser = async (req, res) => {
  try {
    const {
      contactPerson,
      email,
      phone,
      whatsapp,
      country,
      address,
      city,
      zipCode,
      password,
      role,
      permissions,
      dashboardAccess,
      emailVerified,
      isActive,
      registrationStatus
    } = req.body;

    console.log('📝 Creating user with role:', role);

    // ✅ Allow ALL admin roles including super_admin, admin, moderator, call_center_agent
    const allowedRoles = ['super_admin', 'admin', 'moderator', 'call_center_agent'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Role must be one of: ${allowedRoles.join(', ')}`
      });
    }

    // Validate required fields
    const missingFields = [];
    if (!contactPerson) missingFields.push('contactPerson');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Get default permissions based on role
    let defaultPermissions = [];
    let defaultDashboardAccess = [];

    if (role === 'super_admin') {
      defaultPermissions = ['*'];
      defaultDashboardAccess = [
        'analytics', 'users', 'products', 'orders', 'content',
        'reviews', 'support', 'settings', 'coupons', 'banners',
        'blogs', 'delivery', 'payments', 'roles'
      ];
    } else {
      const rolePermissions = require('../config/rolePermissions');
      defaultPermissions = rolePermissions[role]?.permissions || [];
      defaultDashboardAccess = rolePermissions[role]?.dashboardAccess || [];
    }

    // Create new user
    const user = new User({
      contactPerson,
      email: email.toLowerCase(),
      phone,
      whatsapp: whatsapp || '',
      country: country || 'Bangladesh',
      address: address || 'Not Specified',
      city: city || 'Not Specified',
      zipCode: zipCode || 'Not Specified',
      role: role,
      password: hashedPassword,
      isActive: isActive !== undefined ? isActive : true,
      emailVerified: emailVerified !== undefined ? emailVerified : true,
      registrationStatus: registrationStatus || 'completed',
      authProvider: 'local',
      createdBy: req.user.id,
      permissions: permissions || defaultPermissions,
      dashboardAccess: dashboardAccess || defaultDashboardAccess,
      roleAssignedBy: req.user.id,
      roleAssignedAt: new Date()
    });

    await user.save();

    console.log('✅ User account created:', user._id);
    console.log('👤 Role:', role);
    console.log('🔑 Permissions:', user.permissions);
    console.log('📊 Dashboard Access:', user.dashboardAccess);

    res.status(201).json({
      success: true,
      message: `${role} account created successfully!`,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Create user error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error during user creation'
    });
  }
};

// ============================================
// GET USERS - UPDATED (Includes role stats)
// ============================================
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      filter.role = role;
    }

    // Get users with filter
    const users = await User.find(filter)
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'email contactPerson');

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    // ✅ Get role statistics
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Format role stats
    const stats = {
      super_admin: 0,
      admin: 0,
      moderator: 0,
      call_center_agent: 0,
      customer: 0
    };

    roleStats.forEach(stat => {
      if (stats.hasOwnProperty(stat.role)) {
        stats[stat.role] = stat.count;
      }
    });

    res.json({
      success: true,
      users,
      totalPages,
      currentPage: page,
      totalUsers,
      roleStats: stats
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// ============================================
// UPDATE USER
// ============================================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contactPerson,
      email,
      phone,
      whatsapp,
      role,
      isActive
    } = req.body;

    // ✅ Allow ALL roles for update
    const allowedRoles = ['super_admin', 'admin', 'moderator', 'call_center_agent'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}`
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent modifying super_admin (except by another super_admin)
    if (user.role === 'super_admin' && req.user.id !== id && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify super admin account'
      });
    }

    // Update fields
    if (contactPerson) user.contactPerson = contactPerson;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (whatsapp !== undefined) user.whatsapp = whatsapp;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// ============================================
// DELETE USER
// ============================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deleting super_admin
    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete super admin account'
      });
    }

    // Prevent deleting own account
    if (id === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// ============================================
// GET CUSTOMERS
// ============================================
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let filter = { role: 'customer' };
    
    if (search) {
      filter.$or = [
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(filter)
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCustomers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / limit);

    res.json({
      success: true,
      customers,
      totalPages,
      currentPage: page,
      totalCustomers
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
};

// ============================================
// UPDATE CUSTOMER
// ============================================
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contactPerson,
      email,
      phone,
      whatsapp,
      isActive
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role !== 'customer') {
      return res.status(400).json({
        success: false,
        error: 'User is not a customer'
      });
    }

    if (contactPerson) user.contactPerson = contactPerson;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (whatsapp !== undefined) user.whatsapp = whatsapp;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'Customer updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
};

// ============================================
// RESET CUSTOMER PASSWORD
// ============================================
const resetCustomerPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role !== 'customer') {
      return res.status(400).json({
        success: false,
        error: 'User is not a customer'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Customer password reset successfully'
    });

  } catch (error) {
    console.error('Reset customer password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset customer password'
    });
  }
};

// ============================================
// DELETE CUSTOMER
// ============================================
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.role !== 'customer') {
      return res.status(400).json({
        success: false,
        error: 'User is not a customer'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
};

// ============================================
// 🆕 GET ROLE STATISTICS
// ============================================
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

    const roleDefaults = {
      super_admin: { total: 0, active: 0, inactive: 0 },
      admin: { total: 0, active: 0, inactive: 0 },
      moderator: { total: 0, active: 0, inactive: 0 },
      call_center_agent: { total: 0, active: 0, inactive: 0 },
      customer: { total: 0, active: 0, inactive: 0 }
    };

    const result = {};
    stats.forEach(stat => {
      result[stat.role] = {
        total: stat.count,
        active: stat.active,
        inactive: stat.inactive
      };
    });

    Object.keys(roleDefaults).forEach(role => {
      if (!result[role]) {
        result[role] = roleDefaults[role];
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

// ============================================
// 🆕 GET DASHBOARD SECTIONS
// ============================================
const getDashboardSections = async (req, res) => {
  const sections = [
    { key: 'analytics', label: 'Analytics Dashboard', icon: 'LayoutDashboard' },
    { key: 'users', label: 'User Management', icon: 'Users' },
    { key: 'products', label: 'Product Management', icon: 'ShoppingBag' },
    { key: 'orders', label: 'Order Management', icon: 'MessageSquare' },
    { key: 'content', label: 'Content Management', icon: 'FileText' },
    { key: 'reviews', label: 'Reviews', icon: 'Star' },
    { key: 'support', label: 'Support', icon: 'Headphones' },
    { key: 'settings', label: 'Settings', icon: 'Settings' },
    { key: 'coupons', label: 'Coupons', icon: 'Ticket' },
    { key: 'banners', label: 'Banners', icon: 'LayoutTemplate' },
    { key: 'blogs', label: 'Blogs', icon: 'Newspaper' },
    { key: 'delivery', label: 'Delivery', icon: 'Truck' },
    { key: 'payments', label: 'Payments', icon: 'CreditCard' },
    { key: 'roles', label: 'Role Management', icon: 'ShieldCheck' }
  ];

  res.json({
    success: true,
    data: sections
  });
};

// ============================================
// 🆕 GET AVAILABLE PERMISSIONS
// ============================================
const getAvailablePermissions = async (req, res) => {
  const permissions = [
    // User Management
    'view_users', 'create_user', 'update_user', 'delete_user', 'manage_roles', 'manage_permissions',
    
    // Product Management
    'view_products', 'create_product', 'update_product', 'delete_product', 'manage_categories', 'manage_brands', 'manage_tags',
    
    // Order Management
    'view_orders', 'create_order', 'update_order', 'delete_order', 'manage_delivery', 'manage_payments',
    
    // Content Management
    'view_content', 'create_content', 'update_content', 'delete_content', 'manage_blogs', 'manage_banners', 'manage_coupons',
    
    // Support
    'view_support_tickets', 'respond_to_support', 'manage_reviews', 'manage_contacts',
    
    // Settings
    'view_settings', 'update_settings', 'manage_system',
    
    // Reports
    'view_reports', 'export_reports', 'view_analytics'
  ];

  res.json({
    success: true,
    data: permissions
  });
};

// ============================================
// 🆕 UPDATE USER PERMISSIONS
// ============================================
const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions, dashboardAccess } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent modifying super_admin permissions
    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify super admin permissions'
      });
    }

    if (permissions) user.permissions = permissions;
    if (dashboardAccess) user.dashboardAccess = dashboardAccess;
    
    user.roleAssignedBy = req.user.id;
    user.roleAssignedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'User permissions updated successfully',
      data: user.toJSON()
    });
  } catch (error) {
    console.error('Update user permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user permissions'
    });
  }
};

// ============================================
// 🆕 TOGGLE USER STATUS
// ============================================
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent deactivating super_admin
    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Cannot deactivate super admin account'
      });
    }

    // Prevent deactivating own account
    if (id === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle user status'
    });
  }
};

// ============================================
// GET USER BY ID
// ============================================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
      .populate('createdBy', 'email contactPerson')
      .populate('roleAssignedBy', 'email contactPerson');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
};

// ============================================
// GET ROLE DISTRIBUTION
// ============================================
const getRoleDistribution = async (req, res) => {
  try {
    const distribution = await User.aggregate([
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

    const roleDefaults = {
      super_admin: { total: 0, active: 0, inactive: 0 },
      admin: { total: 0, active: 0, inactive: 0 },
      moderator: { total: 0, active: 0, inactive: 0 },
      call_center_agent: { total: 0, active: 0, inactive: 0 },
      customer: { total: 0, active: 0, inactive: 0 }
    };

    const result = {};
    distribution.forEach(stat => {
      result[stat.role] = {
        total: stat.count,
        active: stat.active,
        inactive: stat.inactive
      };
    });

    Object.keys(roleDefaults).forEach(role => {
      if (!result[role]) {
        result[role] = roleDefaults[role];
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get role distribution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get role distribution'
    });
  }
};

// ============================================
// GET RECENT ACTIVITY
// ============================================
const getRecentActivity = async (req, res) => {
  try {
    const recentUsers = await User.find({})
      .select('contactPerson email role createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: recentUsers
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recent activity'
    });
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
  // User Management
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  toggleUserStatus,
  
  // Customer Management
  getCustomers,
  updateCustomer,
  resetCustomerPassword,
  deleteCustomer,
  
  // Role Management
  getRoleStats,
  getRoleDistribution,
  getDashboardSections,
  getAvailablePermissions,
  updateUserPermissions,
  
  // Activity
  getRecentActivity
};