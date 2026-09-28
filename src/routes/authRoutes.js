

// // routes/authRoutes.js
// const express = require('express');
// const router = express.Router();
// const {
//   registerUser,
//   verifyOTP,
//   resendOTP,
//   loginUser,
//   getMe,
//   updateProfile,
//   changePassword,
//   forgotPassword,
//   resetPassword,
//   verifyResetOTP,
//   googleAuth,
//   completeProfile,
//   logoutUser,
//   googleSignup,
//   checkProfileStatus,
//   adminCreateCustomer,
//   subscribeToNewsletter,
//   unsubscribeFromNewsletter,
//   getSubscriptionStatus,
//   // 🆕 New role management functions
//   createStaffAccount,
//   updateUserRole,
//   getDashboardAccess
// } = require('../controllers/authController');
// const { protect, authorize, isAdmin, isModeratorOrAdmin, isCallCenterOrAbove } = require('../middleware/authMiddleware');

// // ============================================
// // PUBLIC ROUTES (No authentication required)
// // ============================================
// router.post('/register', registerUser);
// router.post('/verify-otp', verifyOTP);
// router.post('/resend-otp', resendOTP);
// router.post('/login', loginUser);
// router.post('/forgot-password', forgotPassword);
// router.post('/verify-reset-otp', verifyResetOTP);
// router.post('/reset-password', resetPassword);
// router.post('/google', googleAuth);
// router.post('/google-signup', googleSignup);

// // ============================================
// // PROTECTED ROUTES (Authentication required)
// // ============================================
// router.get('/me', protect, getMe);
// router.put('/profile', protect, updateProfile);
// router.put('/change-password', protect, changePassword);
// router.post('/logout', protect, logoutUser);
// router.get('/profile-status', protect, checkProfileStatus);
// router.post('/complete-profile', protect, completeProfile);

// // ============================================
// // SUBSCRIPTION ROUTES (Protected)
// // ============================================
// router.post('/subscribe', protect, subscribeToNewsletter);
// router.post('/unsubscribe', protect, unsubscribeFromNewsletter);
// router.get('/subscription-status', protect, getSubscriptionStatus);

// // ============================================
// // 🆕 DASHBOARD ACCESS ROUTE (Protected)
// // ============================================
// router.get('/dashboard-access', protect, getDashboardAccess);

// // ============================================
// // ADMIN ROUTES (Admin role required)
// // ============================================
// // Admin can create customer accounts
// router.post('/admin/create-customer', protect, authorize('admin'), adminCreateCustomer);

// // Admin can view users
// router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
//   try {
//     const User = require('../models/User');
//     const users = await User.find({})
//       .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
//       .sort({ createdAt: -1 });
    
//     res.json({
//       success: true,
//       count: users.length,
//       data: users
//     });
//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch users'
//     });
//   }
// });

// // Admin can get user by ID
// router.get('/admin/users/:userId', protect, authorize('admin'), async (req, res) => {
//   try {
//     const User = require('../models/User');
//     const user = await User.findById(req.params.userId)
//       .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
//       .populate('createdBy', 'email contactPerson')
//       .populate('roleAssignedBy', 'email contactPerson');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }
    
//     res.json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch user'
//     });
//   }
// });

// // Admin can toggle user active status
// router.put('/admin/users/:userId/toggle-status', protect, authorize('admin'), async (req, res) => {
//   try {
//     const User = require('../models/User');
//     const user = await User.findById(req.params.userId);
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         error: 'User not found'
//       });
//     }
    
//     // Prevent deactivating super admin
//     if (user.role === 'super_admin') {
//       return res.status(403).json({
//         success: false,
//         error: 'Cannot deactivate super admin account'
//       });
//     }
    
//     user.isActive = !user.isActive;
//     await user.save();
    
//     res.json({
//       success: true,
//       message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
//       data: {
//         userId: user._id,
//         isActive: user.isActive
//       }
//     });
//   } catch (error) {
//     console.error('Toggle user status error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to toggle user status'
//     });
//   }
// });

// // ============================================
// // 🆕 SUPER ADMIN ROUTES (Super Admin only)
// // ============================================
// // Super Admin can create staff accounts (admin, moderator, call_center_agent)
// router.post(
//   '/super-admin/create-staff', 
//   protect, 
//   authorize('super_admin'), 
//   createStaffAccount
// );

// // Super Admin can update any user's role
// router.put(
//   '/super-admin/update-role/:userId', 
//   protect, 
//   authorize('super_admin'), 
//   updateUserRole
// );

// // Super Admin can get all users with role info
// router.get('/super-admin/users', protect, authorize('super_admin'), async (req, res) => {
//   try {
//     const User = require('../models/User');
//     const users = await User.find({})
//       .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
//       .populate('createdBy', 'email contactPerson')
//       .populate('roleAssignedBy', 'email contactPerson')
//       .sort({ createdAt: -1 });
    
//     // Group users by role
//     const roleGroups = {};
//     users.forEach(user => {
//       const role = user.role || 'customer';
//       if (!roleGroups[role]) {
//         roleGroups[role] = [];
//       }
//       roleGroups[role].push(user);
//     });
    
//     res.json({
//       success: true,
//       count: users.length,
//       data: users,
//       roleGroups: roleGroups
//     });
//   } catch (error) {
//     console.error('Get all users error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch users'
//     });
//   }
// });

// // Super Admin can get role statistics
// router.get('/super-admin/role-stats', protect, authorize('super_admin'), async (req, res) => {
//   try {
//     const User = require('../models/User');
//     const stats = await User.aggregate([
//       {
//         $group: {
//           _id: '$role',
//           count: { $sum: 1 },
//           active: {
//             $sum: { $cond: ['$isActive', 1, 0] }
//           },
//           inactive: {
//             $sum: { $cond: ['$isActive', 0, 1] }
//           }
//         }
//       },
//       {
//         $project: {
//           role: '$_id',
//           count: 1,
//           active: 1,
//           inactive: 1,
//           _id: 0
//         }
//       }
//     ]);

//     // Default roles with 0 if not present
//     const roleDefaults = {
//       super_admin: { total: 0, active: 0, inactive: 0 },
//       admin: { total: 0, active: 0, inactive: 0 },
//       moderator: { total: 0, active: 0, inactive: 0 },
//       call_center_agent: { total: 0, active: 0, inactive: 0 },
//       customer: { total: 0, active: 0, inactive: 0 }
//     };

//     const result = {};
//     stats.forEach(stat => {
//       result[stat.role] = {
//         total: stat.count,
//         active: stat.active,
//         inactive: stat.inactive
//       };
//     });

//     // Fill in missing roles
//     Object.keys(roleDefaults).forEach(role => {
//       if (!result[role]) {
//         result[role] = roleDefaults[role];
//       }
//     });

//     res.json({
//       success: true,
//       data: result
//     });
//   } catch (error) {
//     console.error('Get role stats error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to get role statistics'
//     });
//   }
// });

// // Super Admin can get available permissions
// router.get('/super-admin/permissions', protect, authorize('super_admin'), (req, res) => {
//   const permissions = [
//     // User Management
//     'view_users', 'create_user', 'update_user', 'delete_user', 'manage_roles', 'manage_permissions',
    
//     // Product Management
//     'view_products', 'create_product', 'update_product', 'delete_product', 'manage_categories', 'manage_brands', 'manage_tags',
    
//     // Order Management
//     'view_orders', 'create_order', 'update_order', 'delete_order', 'manage_delivery', 'manage_payments',
    
//     // Content Management
//     'view_content', 'create_content', 'update_content', 'delete_content', 'manage_blogs', 'manage_banners', 'manage_coupons',
    
//     // Support
//     'view_support_tickets', 'respond_to_support', 'manage_reviews', 'manage_contacts',
    
//     // Settings
//     'view_settings', 'update_settings', 'manage_system',
    
//     // Reports
//     'view_reports', 'export_reports', 'view_analytics'
//   ];

//   res.json({
//     success: true,
//     data: permissions
//   });
// });

// // ============================================
// // MODERATOR ROUTES (Moderator or higher)
// // ============================================
// router.get('/moderator/content', protect, isModeratorOrAdmin, (req, res) => {
//   res.json({
//     success: true,
//     message: 'Moderator content access granted',
//     data: {
//       role: req.user.role,
//       permissions: req.user.permissions || []
//     }
//   });
// });

// // ============================================
// // CALL CENTER ROUTES (Call center agent or higher)
// // ============================================
// router.get('/call-center/orders', protect, isCallCenterOrAbove, (req, res) => {
//   res.json({
//     success: true,
//     message: 'Call center order access granted',
//     data: {
//       role: req.user.role,
//       permissions: req.user.permissions || []
//     }
//   });
// });

// // ============================================
// // TEST ROUTES (For development)
// // ============================================
// // Test route to check role
// router.get('/test-role', protect, (req, res) => {
//   res.json({
//     success: true,
//     message: 'Role test',
//     data: {
//       userId: req.user._id,
//       email: req.user.email,
//       role: req.user.role,
//       permissions: req.user.permissions || [],
//       dashboardAccess: req.user.dashboardAccess || [],
//       isSuperAdmin: req.user.role === 'super_admin',
//       isAdmin: req.user.role === 'admin' || req.user.role === 'super_admin',
//       isModerator: ['super_admin', 'admin', 'moderator'].includes(req.user.role),
//       isCallCenterAgent: ['super_admin', 'admin', 'moderator', 'call_center_agent'].includes(req.user.role)
//     }
//   });
// });

// module.exports = router;





// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetOTP,
  googleAuth,
  completeProfile,
  logoutUser,
  googleSignup,
  checkProfileStatus,
  adminCreateCustomer,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getSubscriptionStatus,
  // 🆕 New role management functions
  createStaffAccount,
  updateUserRole,
  getDashboardAccess
} = require('../controllers/authController');
const { protect, authorize, isAdmin, isModeratorOrAdmin, isCallCenterOrAbove } = require('../middleware/authMiddleware');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);
router.post('/google-signup', googleSignup);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logoutUser);
router.get('/profile-status', protect, checkProfileStatus);
router.post('/complete-profile', protect, completeProfile);

// ============================================
// SUBSCRIPTION ROUTES (Protected)
// ============================================
router.post('/subscribe', protect, subscribeToNewsletter);
router.post('/unsubscribe', protect, unsubscribeFromNewsletter);
router.get('/subscription-status', protect, getSubscriptionStatus);

// ============================================
// 🆕 DASHBOARD ACCESS ROUTE (Protected)
// ============================================
router.get('/dashboard-access', protect, getDashboardAccess);

// ✅ Updated: Allow Moderator, Admin, and Super Admin to create customers
router.post('/admin/create-customer', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    // Allow Moderator, Admin, and Super Admin to create customers
    if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators and moderators can create customers'
      });
    }
    await adminCreateCustomer(req, res);
  } catch (error) {
    console.error('Create customer route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
});

// Admin can view users
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({})
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Admin can get user by ID
router.get('/admin/users/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId)
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

// Admin can toggle user active status
router.put('/admin/users/:userId/toggle-status', protect, authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Prevent deactivating super admin
    if (user.role === 'super_admin') {
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
// 🆕 SUPER ADMIN ROUTES (Super Admin only)
// ============================================
// Super Admin can create staff accounts (admin, moderator, call_center_agent)
router.post(
  '/super-admin/create-staff', 
  protect, 
  authorize('super_admin'), 
  createStaffAccount
);

// Super Admin can update any user's role
router.put(
  '/super-admin/update-role/:userId', 
  protect, 
  authorize('super_admin'), 
  updateUserRole
);

// Super Admin can get all users with role info
router.get('/super-admin/users', protect, authorize('super_admin'), async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({})
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
      .populate('createdBy', 'email contactPerson')
      .populate('roleAssignedBy', 'email contactPerson')
      .sort({ createdAt: -1 });
    
    // Group users by role
    const roleGroups = {};
    users.forEach(user => {
      const role = user.role || 'customer';
      if (!roleGroups[role]) {
        roleGroups[role] = [];
      }
      roleGroups[role].push(user);
    });
    
    res.json({
      success: true,
      count: users.length,
      data: users,
      roleGroups: roleGroups
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Super Admin can get role statistics
router.get('/super-admin/role-stats', protect, authorize('super_admin'), async (req, res) => {
  try {
    const User = require('../models/User');
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

    // Fill in missing roles
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
});

// Super Admin can get available permissions
router.get('/super-admin/permissions', protect, authorize('super_admin'), (req, res) => {
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
});

// ============================================
// MODERATOR ROUTES (Moderator or higher)
// ============================================
router.get('/moderator/content', protect, isModeratorOrAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Moderator content access granted',
    data: {
      role: req.user.role,
      permissions: req.user.permissions || []
    }
  });
});

// ============================================
// CALL CENTER ROUTES (Call center agent or higher)
// ============================================
router.get('/call-center/orders', protect, isCallCenterOrAbove, (req, res) => {
  res.json({
    success: true,
    message: 'Call center order access granted',
    data: {
      role: req.user.role,
      permissions: req.user.permissions || []
    }
  });
});

// ============================================
// CUSTOMER MANAGEMENT ROUTES
// ============================================

// ✅ Get all customers (Moderator, Admin, Super Admin)
router.get('/admin/customers', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const { page = 1, limit = 10, search = '', country = '', subscription = '', role = 'customer' } = req.query;
    
    const query = { role: 'customer' };
    
    // Search filter
    if (search) {
      query.$or = [
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Country filter
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }
    
    // Subscription filter
    if (subscription === 'subscribed') {
      query.isSubscribedToNewsletter = true;
    } else if (subscription === 'unsubscribed') {
      query.isSubscribedToNewsletter = false;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [customers, total] = await Promise.all([
      User.find(query)
        .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      customers,
      total,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
});

// ✅ Get single customer (Moderator, Admin, Super Admin)
router.get('/admin/customers/:customerId', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const customer = await User.findById(req.params.customerId)
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    if (customer.role !== 'customer') {
      return res.status(400).json({
        success: false,
        error: 'User is not a customer'
      });
    }
    
    res.json({
      success: true,
      customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
});

// ✅ Update customer (Moderator, Admin, Super Admin)
router.put('/admin/customers/:customerId', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const {
      contactPerson,
      phone,
      whatsapp,
      country,
      address,
      city,
      zipCode,
      isActive,
      isSubscribedToNewsletter
    } = req.body;
    
    const customer = await User.findById(req.params.customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    if (customer.role !== 'customer') {
      return res.status(400).json({
        success: false,
        error: 'User is not a customer'
      });
    }
    
    // Update fields
    if (contactPerson) customer.contactPerson = contactPerson;
    if (phone) customer.phone = phone;
    if (whatsapp !== undefined) customer.whatsapp = whatsapp;
    if (country) customer.country = country;
    if (address) customer.address = address;
    if (city) customer.city = city;
    if (zipCode) customer.zipCode = zipCode;
    if (typeof isActive === 'boolean') customer.isActive = isActive;
    if (typeof isSubscribedToNewsletter === 'boolean') customer.isSubscribedToNewsletter = isSubscribedToNewsletter;
    
    await customer.save();
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      customer: customer.toJSON()
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
});

// ✅ Reset customer password (Moderator, Admin, Super Admin)
router.put('/admin/customers/:customerId/reset-password', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }
    
    const customer = await User.findById(req.params.customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    if (customer.role !== 'customer') {
      return res.status(400).json({
        success: false,
        error: 'User is not a customer'
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    customer.password = hashedPassword;
    await customer.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

// ✅ Delete customer (Admin and Super Admin only - NOT Moderator)
router.delete('/admin/customers/:customerId', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    // ✅ Only Admin and Super Admin can delete customers
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only administrators can delete customers'
      });
    }
    
    const User = require('../models/User');
    const customer = await User.findById(req.params.customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    if (customer.role !== 'customer') {
      return res.status(400).json({
        success: false,
        error: 'User is not a customer'
      });
    }
    
    await customer.deleteOne();
    
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
});

// ============================================
// TEST ROUTES (For development)
// ============================================
// Test route to check role
router.get('/test-role', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Role test',
    data: {
      userId: req.user._id,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions || [],
      dashboardAccess: req.user.dashboardAccess || [],
      isSuperAdmin: req.user.role === 'super_admin',
      isAdmin: req.user.role === 'admin' || req.user.role === 'super_admin',
      isModerator: ['super_admin', 'admin', 'moderator'].includes(req.user.role),
      isCallCenterAgent: ['super_admin', 'admin', 'moderator', 'call_center_agent'].includes(req.user.role)
    }
  });
});

module.exports = router;