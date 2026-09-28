// // routes/adminRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, isAdmin } = require('../middleware/authMiddleware');
// const { 
//   getUsers, 
//   updateUser, 
//   deleteUser,
//   getCustomers,  // Add this
//   deleteCustomer ,
//   createUser,// Add this
//    updateCustomer,        // Add this
//   resetCustomerPassword  // Add this
// } = require('../controllers/adminController');
// // All routes are protected and require admin role
// router.use(protect, isAdmin);

// router.get('/users', getUsers);
// router.post('/users', createUser);
// router.put('/users/:id', updateUser);
// router.delete('/users/:id', deleteUser);


// // Customer management routes
// router.get('/customers', getCustomers);
// router.put('/customers/:id', updateCustomer);                    // Edit customer
// router.put('/customers/:id/reset-password', resetCustomerPassword); // Reset password
// router.delete('/customers/:id', deleteCustomer);
// module.exports = router;



// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin, authorize } = require('../middleware/authMiddleware');
const { 
  getUsers, 
  updateUser, 
  deleteUser,
  getCustomers,
  deleteCustomer,
  createUser,
  updateCustomer,
  resetCustomerPassword,
  getRoleStats,
  getDashboardSections,
  updateUserPermissions,
  getAvailablePermissions
} = require('../controllers/adminController');

// ============================================
// All routes are protected and require admin role
// ============================================
router.use(protect, isAdmin);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================
router.get('/users', getUsers);
router.post('/users', createUser); // ✅ Updated to allow all roles
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ============================================
// CUSTOMER MANAGEMENT ROUTES
// ============================================
router.get('/customers', getCustomers);
router.put('/customers/:id', updateCustomer);
router.put('/customers/:id/reset-password', resetCustomerPassword);
router.delete('/customers/:id', deleteCustomer);

// ============================================
// 🆕 ROLE MANAGEMENT ROUTES (Super Admin only)
// ============================================
router.get('/role-stats', authorize('super_admin'), getRoleStats);
router.get('/dashboard-sections', authorize('super_admin'), getDashboardSections);
router.get('/available-permissions', authorize('super_admin'), getAvailablePermissions);
router.put('/users/:id/permissions', authorize('super_admin'), updateUserPermissions);

// ============================================
// 🆕 CREATE STAFF (Super Admin only)
// ============================================
router.post('/create-staff', authorize('super_admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const rolePermissions = require('../config/rolePermissions');
    
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
      dashboardAccess
    } = req.body;

    // ✅ Allow ALL roles including super_admin
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

    // Get default permissions based on role
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
      const rolePermissionsConfig = require('../config/rolePermissions');
      defaultPermissions = rolePermissionsConfig[role]?.permissions || [];
      defaultDashboardAccess = rolePermissionsConfig[role]?.dashboardAccess || [];
    }

    // Create new staff user
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
      isActive: true,
      emailVerified: true,
      registrationStatus: 'completed',
      authProvider: 'local',
      createdBy: req.user.id,
      permissions: permissions || defaultPermissions,
      dashboardAccess: dashboardAccess || defaultDashboardAccess,
      roleAssignedBy: req.user.id,
      roleAssignedAt: new Date()
    });

    await user.save();

    console.log('✅ Staff account created:', user._id);
    console.log('👤 Role:', role);
    console.log('🔑 Permissions:', user.permissions);

    res.status(201).json({
      success: true,
      message: `Staff account (${role}) created successfully!`,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Create staff error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error during staff creation'
    });
  }
});

// ============================================
// 🆕 TOGGLE USER STATUS
// ============================================
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent deactivating super admin (except by another super admin)
    if (user.role === 'super_admin' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot deactivate super admin account'
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
});

// ============================================
// 🆕 GET USER BY ID
// ============================================
router.get('/users/:id', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id)
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
});

// ============================================
// 🆕 GET ROLE DISTRIBUTION
// ============================================
router.get('/role-distribution', authorize('super_admin'), async (req, res) => {
  try {
    const User = require('../models/User');
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
});

module.exports = router;