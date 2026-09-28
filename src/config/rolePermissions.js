

// // module.exports = rolePermissions;
// // backend/config/rolePermissions.js
// const rolePermissions = {
//   super_admin: {
//     permissions: ['*'],
//     dashboardAccess: [
//       // Dashboard
//       'dashboard', 'profit_margin',
//       // Orders
//       'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score', 'create_order',
//       // Products
//       'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
//       // Website Layout
//       'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer','manage_why_choose_us',
//       'terms_management', 'privacy_management', 'contact_management', 'about_management',
//       // Pixel
//       'pixel_settings', 'custom_code',
//       // Reviews
//       'manage_reviews',
//       // User Management
//       'create_users', 'manage_users', 'manage_customers', 'role_management',
//       // Settings
//       'delivery_settings', 'media_library', 'email_settings', 'settings'
//     ]
//   },
//   admin: {
//     permissions: [
//       'view_users', 'create_user', 'update_user',
//       'view_products', 'create_product', 'update_product',
//       'view_orders', 'update_order', 'manage_payments',
//       'view_content', 'create_content', 'update_content',
//       'view_reports', 'export_reports', 'view_analytics'
//     ],
//     dashboardAccess: [
//       // Dashboard
//       'dashboard', 'profit_margin',
//       // Orders
//       'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score',  'create_order',
//       // Products
//       'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
//       // Website Layout
//       'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer', 'manage_why_choose_us',
//       'terms_management', 'privacy_management', 'contact_management', 'about_management',
//       // Pixel
//       'pixel_settings', 'custom_code',
//       // Reviews
//       'manage_reviews',
//       // User Management
//       'create_users', 'manage_users', 'manage_customers',
//       // Settings
//       'delivery_settings', 'media_library', 'email_settings', 'settings'
//     ]
//   },
//   moderator: {
//     permissions: [
//       'view_products', 'create_product', 'update_product',
//       'view_content', 'create_content', 'update_content',
//       'view_reviews', 'manage_reviews',
//       'view_analytics'
//     ],
//     dashboardAccess: [
//       // Dashboard
//       'dashboard',
//       // Products
//       'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
//       // Website Layout
//       'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer','manage_why_choose_us',
//       'terms_management', 'privacy_management', 'contact_management', 'about_management',
//       // Pixel
//       'pixel_settings', 'custom_code',
//       // Reviews
//       'manage_reviews',
//       // Settings
//       'media_library'
//     ]
//   },
//   call_center_agent: {
//     permissions: [
//       'view_orders', 'update_order',
//       'view_customers',
//       'view_reports'
//     ],
//     dashboardAccess: [
//       'dashboard',
//       'all_orders', 'incomplete_orders', 'courier_score',
//       'manage_customers'
//     ]
//   },
//   customer: {
//     permissions: [],
//     dashboardAccess: []
//   }
// };

// module.exports = rolePermissions;




// backend/config/rolePermissions.js
const rolePermissions = {
  super_admin: {
    permissions: ['*'],
    dashboardAccess: [
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
      // ⭐ NEW — Website Layout additions
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
    ]
  },

  admin: {
    permissions: [
      'view_users', 'create_user', 'update_user',
      'view_products', 'create_product', 'update_product',
      'view_orders', 'update_order', 'manage_payments',
      'view_content', 'create_content', 'update_content',
      'view_reports', 'export_reports', 'view_analytics'
    ],
    dashboardAccess: [
      'dashboard', 'profit_margin',
      'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score', 'create_order',
      'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
      // ⭐ Barcodes
      'all_barcodes', 'barcode_scanner',
      'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer', 'manage_why_choose_us',
      'terms_management', 'privacy_management', 'contact_management', 'about_management',
      // ⭐ Website additions
      'deal_management', 'trust_results_management', 'video_management', 'achievement_management',
      'pixel_settings', 'custom_code',
      'manage_reviews',
      // ⭐ Courses & Coupons
      'manage_courses', 'coupons',
      'create_users', 'manage_users', 'manage_customers',
      // ⭐ Inventory
      'inventory',
      'returned_items', 'stock_alert', 'restock', 'duplicate_customer', 'platform_sales', 'showroom_pos',
      'delivery_settings', 'media_library', 'email_settings', 'settings'
    ]
  },

  moderator: {
    permissions: [
      'view_products', 'create_product', 'update_product',
      'view_content', 'create_content', 'update_content',
      'view_reviews', 'manage_reviews',
      'view_analytics'
    ],
    dashboardAccess: [
      'dashboard',
      'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
      // ⭐ Barcodes (moderator gets view only if you want — adjust as needed)
      'all_barcodes',
      'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer', 'manage_why_choose_us',
      'terms_management', 'privacy_management', 'contact_management', 'about_management',
      // ⭐ Website additions (optional)
      'deal_management', 'trust_results_management', 'video_management', 'achievement_management',
      'pixel_settings', 'custom_code',
      'manage_reviews',
      'media_library', 'settings'
    ]
  },

  call_center_agent: {
    permissions: [
      'view_orders', 'update_order',
      'view_customers',
      'view_reports'
    ],
    dashboardAccess: [
      'dashboard',
      'all_orders', 'incomplete_orders', 'courier_score',
      'manage_customers'
    ]
  },

  customer: {
    permissions: [],
    dashboardAccess: []
  }
};

module.exports = rolePermissions;