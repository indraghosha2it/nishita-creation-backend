

// module.exports = router;
// backend/src/routes/roleRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const rolePermissions = require('../config/rolePermissions');

// ============================================
// SUPER ADMIN ONLY ROUTES
// ============================================

// Get all users with their roles (Super Admin only)
router.get('/users', protect, authorize('super_admin'), async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordOTPExpiry')
      .populate('createdBy', 'email contactPerson')
      .populate('roleAssignedBy', 'email contactPerson')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Update user role and permissions (Super Admin only)
router.put('/update/:userId', protect, authorize('super_admin'), async (req, res) => {
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

    // Prevent modifying super_admin account (except by another super_admin)
    if (user.role === 'super_admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify super admin account'
      });
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'moderator', 'call_center_agent', 'customer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // ✅ Validate dashboardAccess keys
    if (dashboardAccess) {
      // const validPageKeys = [
      //   'dashboard', 'profit_margin',
      //   'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score', 'create_order',
      //   'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
      //   'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer','manage_why_choose_us', 
      //   'terms_management', 'privacy_management', 'contact_management', 'about_management',
      //     'deal_management', 'trust_results_management',
      //   'pixel_settings', 'custom_code',
      //   'manage_reviews',
      //   'create_users', 'manage_users', 'manage_customers', 'role_management',
      //   'delivery_settings', 'media_library', 'email_settings', 'settings'
      // ];
      
      const validPageKeys = [
  // Dashboard
  'dashboard', 'profit_margin',
  // Orders
  'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score', 'create_order',
  // Products
  'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
  // ⭐ NEW — Barcodes
  'all_barcodes', 'barcode_scanner',
  // Website Layout
  'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer', 'manage_why_choose_us',
  'terms_management', 'privacy_management', 'contact_management', 'about_management',
  // ⭐ NEW — Website additions
  'deal_management', 'trust_results_management', 'video_management', 'achievement_management',
  // Pixel
  'pixel_settings', 'custom_code',
  // Reviews
  'manage_reviews',
  // ⭐ NEW — Courses & Coupons
  'manage_courses', 'coupons',
  // User Management
  'create_users', 'manage_users', 'manage_customers', 'role_management',
  // ⭐ NEW — Inventory group
  'inventory',
  'returned_items', 'stock_alert', 'restock', 'duplicate_customer', 'platform_sales', 'showroom_pos',
  // Settings
  'delivery_settings', 'media_library', 'email_settings', 'settings'
];
      // Remove any invalid keys
      const validAccess = dashboardAccess.filter(key => validPageKeys.includes(key));
      if (validAccess.length !== dashboardAccess.length) {
        console.warn('Some dashboard access keys were invalid and removed');
      }
      user.dashboardAccess = validAccess;
    }

    // Update fields
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
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
});

// Get role statistics (Super Admin only)
router.get('/stats', protect, authorize('super_admin'), async (req, res) => {
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
});

// Get user's dashboard access (for current user)
router.get('/dashboard-access', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // ✅ Updated to match all page keys from frontend
    // const allSections = [
    //   'dashboard', 'profit_margin',
    //   'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score', 'create_order', 
    //   'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
    //   'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer', 'manage_why_choose_us', 
    //   'terms_management', 'privacy_management', 'contact_management', 'about_management',
    //    'deal_management', 'trust_results_management',
    //   'pixel_settings', 'custom_code',
    //   'manage_reviews',
    //   'create_users', 'manage_users', 'manage_customers', 'role_management',
    //   'delivery_settings', 'media_library', 'email_settings', 'settings'
    // ];
    const allSections = [
  'dashboard', 'profit_margin',
  'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score', 'create_order',
  'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
  'all_barcodes', 'barcode_scanner',                      // ⭐ NEW
  'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer', 'manage_why_choose_us',
  'terms_management', 'privacy_management', 'contact_management', 'about_management',
  'deal_management', 'trust_results_management', 'video_management', 'achievement_management',  // ⭐ NEW
  'pixel_settings', 'custom_code',
  'manage_reviews',
  'manage_courses', 'coupons',                            // ⭐ NEW
  'create_users', 'manage_users', 'manage_customers', 'role_management',
  'inventory',                                            // ⭐ NEW
  'returned_items', 'stock_alert', 'restock', 'duplicate_customer', 'platform_sales', 'showroom_pos',  // ⭐ NEW
  'delivery_settings', 'media_library', 'email_settings', 'settings'
];

    if (user.role === 'super_admin') {
      return res.json({
        success: true,
        data: {
          role: user.role,
          access: allSections,
          permissions: ['*'],
          canConfigure: true,
          isSuperAdmin: true
        }
      });
    }

    let access = user.dashboardAccess || [];
    
    if (access.length === 0) {
    //   const roleDefaults = {
    //     admin: [
    //       'dashboard', 'profit_margin',
    //       'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score',
    //       'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
    //       'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer',
    //       'deal_management',              // ✅ ADD
    // 'trust_results_management', 
    //       'terms_management', 'privacy_management', 'contact_management', 'about_management',
    //       'pixel_settings', 'custom_code',
    //       'manage_reviews',
    //       'create_users', 'manage_users', 'manage_customers',
    //       'delivery_settings', 'media_library', 'email_settings', 'settings'
    //     ],
    //     moderator: [
    //       'dashboard',
    //       'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
    //       'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer',
    //       'terms_management', 'privacy_management', 'contact_management', 'about_management', 
    //       'deal_management',              // ✅ ADD (optional)
    // 'trust_results_management',  
    //       'pixel_settings', 'custom_code',
    //       'manage_reviews',
    //       'media_library'
    //     ],
    //     call_center_agent: [
    //       'dashboard',
    //       'all_orders', 'incomplete_orders', 'courier_score',
    //       'manage_customers'
    //     ],
    //     customer: []
    //   };
    const roleDefaults = {
  admin: [
    'dashboard', 'profit_margin',
    'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score',
    'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
    'all_barcodes', 'barcode_scanner',                     // ⭐ NEW
    'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer',
    'deal_management', 'trust_results_management', 'video_management', 'achievement_management',  // ⭐ NEW
    'terms_management', 'privacy_management', 'contact_management', 'about_management',
    'pixel_settings', 'custom_code',
    'manage_reviews',
    'manage_courses', 'coupons',                           // ⭐ NEW
    'create_users', 'manage_users', 'manage_customers',
    'inventory',                                           // ⭐ NEW
    'returned_items', 'stock_alert', 'restock', 'duplicate_customer', 'platform_sales', 'showroom_pos',  // ⭐ NEW
    'delivery_settings', 'media_library', 'email_settings', 'settings'
  ],
  moderator: [
    'dashboard',
    'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
    'all_barcodes',                                        // ⭐ NEW
    'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer',
    'deal_management', 'trust_results_management', 'video_management', 'achievement_management',  // ⭐ NEW
    'terms_management', 'privacy_management', 'contact_management', 'about_management',
    'pixel_settings', 'custom_code',
    'manage_reviews',
    'media_library'
  ],
  call_center_agent: [
    'dashboard',
    'all_orders', 'incomplete_orders', 'courier_score',
    'manage_customers'
  ],
  customer: []
};
      access = roleDefaults[user.role] || [];
    }

    res.json({
      success: true,
      data: {
        role: user.role,
        access: access,
        permissions: user.permissions || [],
        canConfigure: false,
        isSuperAdmin: false
      }
    });
  } catch (error) {
    console.error('Get dashboard access error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard access'
    });
  }
});

// Get available permissions list
router.get('/permissions', protect, authorize('super_admin'), async (req, res) => {
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

// Get all page keys for frontend
// router.get('/page-keys', protect, authorize('super_admin'), async (req, res) => {
//   const pageKeys = [
//     // Dashboard
//     { key: 'dashboard', label: 'Dashboard', category: 'Dashboard' },
//     { key: 'profit_margin', label: 'Profit Margin', category: 'Dashboard' },
//     // Orders
//     { key: 'all_orders', label: 'All Orders', category: 'Orders' },
//     { key: 'incomplete_orders', label: 'Incomplete Orders', category: 'Orders' },
//     { key: 'order_restrictions', label: 'Order Restrictions', category: 'Orders' },
//     { key: 'courier_settings', label: 'Courier Settings', category: 'Orders' },
//     { key: 'courier_score', label: 'Courier Score', category: 'Orders' },
//     { key: 'create_order', label: 'Create Order', category: 'Orders' },
//     // Products
//     { key: 'all_products', label: 'All Products', category: 'Products' },
//     { key: 'create_products', label: 'Create Products', category: 'Products' },
//     { key: 'product_cost', label: 'Cost Settings', category: 'Products' },
//     { key: 'create_category', label: 'Create Category', category: 'Products' },
//     { key: 'manage_brands', label: 'Manage Brands', category: 'Products' },
//     { key: 'manage_tags', label: 'Manage Tags', category: 'Products' },
//     // Website Layout
//     { key: 'manage_navbar', label: 'Manage Navbar', category: 'Website Layout' },
//     { key: 'create_banner', label: 'Create Banner', category: 'Website Layout' },
//     { key: 'manage_banner', label: 'Manage Banner', category: 'Website Layout' },
//     { key: 'manage_homepage', label: 'Manage Homepage', category: 'Website Layout' },
//     { key: 'manage_footer', label: 'Manage Footer', category: 'Website Layout' },
//     { key: 'deal_management', label: 'Deal Management', category: 'Website Layout' },
// { key: 'trust_results_management', label: 'Trust Results', category: 'Website Layout' },
//     { key: 'terms_management', label: 'Terms Management', category: 'Website Layout' },
//     { key: 'privacy_management', label: 'Privacy Management', category: 'Website Layout' },
//     { key: 'contact_management', label: 'Contact Management', category: 'Website Layout' },
//     { key: 'about_management', label: 'About Management', category: 'Website Layout' },
//      { key: 'manage_why_choose_us', label: 'Manage Why Choose Us', category: 'Website Layout' }, 
//     // Pixel
//     { key: 'pixel_settings', label: 'Pixel Settings', category: 'Pixel' },
//     { key: 'custom_code', label: 'Custom Code', category: 'Pixel' },
//     // Reviews
//     { key: 'manage_reviews', label: 'Manage Reviews', category: 'Reviews' },
//     // User Management
//     { key: 'create_users', label: 'Create Users', category: 'User Management' },
//     { key: 'manage_users', label: 'Manage Users', category: 'User Management' },
//     { key: 'manage_customers', label: 'Create & Manage Customers', category: 'User Management' },
//     { key: 'role_management', label: 'Role Management', category: 'User Management' },
//     // Settings
//     { key: 'delivery_settings', label: 'Delivery Settings', category: 'Settings' },
//     { key: 'media_library', label: 'Media Library', category: 'Settings' },
//     { key: 'email_settings', label: 'Email Settings', category: 'Settings' },
//     { key: 'settings', label: 'Settings', category: 'Settings' }
//   ];

//   res.json({
//     success: true,
//     data: pageKeys
//   });
// });


router.get('/page-keys', protect, authorize('super_admin'), async (req, res) => {
  const pageKeys = [
    // Dashboard
    { key: 'dashboard', label: 'Dashboard', category: 'Dashboard' },
    { key: 'profit_margin', label: 'Profit Margin', category: 'Dashboard' },
    // Orders
    { key: 'all_orders', label: 'All Orders', category: 'Orders' },
    { key: 'incomplete_orders', label: 'Incomplete Orders', category: 'Orders' },
    { key: 'order_restrictions', label: 'Order Restrictions', category: 'Orders' },
    { key: 'courier_settings', label: 'Courier Settings', category: 'Orders' },
    { key: 'courier_score', label: 'Courier Score', category: 'Orders' },
    { key: 'create_order', label: 'Create Order', category: 'Orders' },
    // Products
    { key: 'all_products', label: 'All Products', category: 'Products' },
    { key: 'create_products', label: 'Create Products', category: 'Products' },
    { key: 'product_cost', label: 'Cost Settings', category: 'Products' },
    { key: 'create_category', label: 'Create Category', category: 'Products' },
    { key: 'manage_brands', label: 'Manage Brands', category: 'Products' },
    { key: 'manage_tags', label: 'Manage Tags', category: 'Products' },
    // ⭐ NEW — Barcodes (put under Products)
    { key: 'all_barcodes', label: 'All Barcodes', category: 'Products' },
    { key: 'barcode_scanner', label: 'Barcode Scanner', category: 'Products' },
    // Website Layout
    { key: 'manage_navbar', label: 'Manage Navbar', category: 'Website Layout' },
    { key: 'create_banner', label: 'Create Banner', category: 'Website Layout' },
    { key: 'manage_banner', label: 'Manage Banner', category: 'Website Layout' },
    { key: 'manage_homepage', label: 'Manage Homepage', category: 'Website Layout' },
    { key: 'manage_footer', label: 'Manage Footer', category: 'Website Layout' },
    { key: 'manage_why_choose_us', label: 'Manage Why Choose Us', category: 'Website Layout' },
    { key: 'deal_management', label: 'Deal Management', category: 'Website Layout' },
    { key: 'trust_results_management', label: 'Trust Results', category: 'Website Layout' },
    // ⭐ NEW — Website additions
    { key: 'video_management', label: 'Video Management', category: 'Website Layout' },
    { key: 'achievement_management', label: 'Achievement Management', category: 'Website Layout' },
    { key: 'terms_management', label: 'Terms Management', category: 'Website Layout' },
    { key: 'privacy_management', label: 'Privacy Management', category: 'Website Layout' },
    { key: 'contact_management', label: 'Contact Management', category: 'Website Layout' },
    { key: 'about_management', label: 'About Management', category: 'Website Layout' },
    // Pixel
    { key: 'pixel_settings', label: 'Pixel Settings', category: 'Pixel' },
    { key: 'custom_code', label: 'Custom Code', category: 'Pixel' },
    // Reviews
    { key: 'manage_reviews', label: 'Manage Reviews', category: 'Reviews' },
    // ⭐ NEW — Courses & Coupons
    { key: 'manage_courses', label: 'Manage Courses', category: 'Content' },
    { key: 'coupons', label: 'Manage Coupons', category: 'Content' },
    // User Management
    { key: 'create_users', label: 'Create Users', category: 'User Management' },
    { key: 'manage_users', label: 'Manage Users', category: 'User Management' },
    { key: 'manage_customers', label: 'Create & Manage Customers', category: 'User Management' },
    { key: 'role_management', label: 'Role Management', category: 'User Management' },
    // ⭐ NEW — Inventory
    { key: 'returned_items', label: 'Returned Items', category: 'Inventory' },
    { key: 'stock_alert', label: 'Stock Alert', category: 'Inventory' },
    { key: 'restock', label: 'Restock Item', category: 'Inventory' },
    { key: 'duplicate_customer', label: 'Duplicate Customer', category: 'Inventory' },
    { key: 'platform_sales', label: 'Platform Sale Details', category: 'Inventory' },
    { key: 'showroom_pos', label: 'Showroom POS', category: 'Inventory' },
    // Settings
    { key: 'delivery_settings', label: 'Delivery Settings', category: 'Settings' },
    { key: 'media_library', label: 'Media Library', category: 'Settings' },
    { key: 'email_settings', label: 'Email Settings', category: 'Settings' },
    { key: 'settings', label: 'Settings', category: 'Settings' }
  ];

  res.json({ success: true, data: pageKeys });
});

module.exports = router;