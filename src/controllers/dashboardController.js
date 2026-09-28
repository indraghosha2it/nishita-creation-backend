const User = require('../models/User');

// @desc    Get dashboard data based on user role
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const user = req.user;
    const role = user.role;

    // Base data for all admin roles
    const baseData = {
      user: {
        id: user._id,
        name: user.contactPerson,
        email: user.email,
        role: user.role
      },
      stats: {
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0
      }
    };

    let dashboardData = { ...baseData };

    // Role-specific data
    switch(role) {
      case 'super_admin':
        dashboardData = {
          ...dashboardData,
          sections: [
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
          ],
          canConfigureRoles: true,
          canManageAll: true,
          widgets: [
            'system_stats',
            'user_growth',
            'revenue_chart',
            'recent_orders',
            'role_distribution',
            'system_health'
          ]
        };
        break;

      case 'admin':
        dashboardData = {
          ...dashboardData,
          sections: [
            'analytics',
            'users',
            'products',
            'orders',
            'content',
            'reviews',
            'coupons',
            'banners',
            'blogs',
            'payments'
          ],
          canManageUsers: true,
          canManageProducts: true,
          canManageOrders: true,
          widgets: [
            'sales_stats',
            'recent_orders',
            'top_products',
            'user_activity'
          ]
        };
        break;

      case 'moderator':
        dashboardData = {
          ...dashboardData,
          sections: [
            'analytics',
            'products',
            'content',
            'reviews',
            'banners',
            'blogs'
          ],
          canModerateContent: true,
          canManageReviews: true,
          widgets: [
            'content_stats',
            'pending_reviews',
            'recent_products'
          ]
        };
        break;

      case 'call_center_agent':
        dashboardData = {
          ...dashboardData,
          sections: [
            'analytics',
            'orders',
            'support',
            'delivery'
          ],
          canManageOrders: true,
          canViewCustomers: true,
          widgets: [
            'order_stats',
            'recent_orders',
            'customer_inquiries',
            'delivery_status'
          ]
        };
        break;

      default:
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
    }

    // Get real stats (implement your actual data fetching)
    // const stats = await getStats(role);
    // dashboardData.stats = stats;

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard'
    });
  }
};

// @desc    Get role-specific widgets
// @route   GET /api/dashboard/widgets
// @access  Private
const getWidgets = async (req, res) => {
  try {
    const user = req.user;
    const role = user.role;

    // Define widgets based on role
    const widgets = {
      super_admin: [
        { id: 'system_stats', title: 'System Statistics', visible: true },
        { id: 'user_growth', title: 'User Growth', visible: true },
        { id: 'revenue_chart', title: 'Revenue Chart', visible: true },
        { id: 'recent_orders', title: 'Recent Orders', visible: true },
        { id: 'role_distribution', title: 'Role Distribution', visible: true }
      ],
      admin: [
        { id: 'sales_stats', title: 'Sales Statistics', visible: true },
        { id: 'recent_orders', title: 'Recent Orders', visible: true },
        { id: 'top_products', title: 'Top Products', visible: true },
        { id: 'user_activity', title: 'User Activity', visible: true }
      ],
      moderator: [
        { id: 'content_stats', title: 'Content Statistics', visible: true },
        { id: 'pending_reviews', title: 'Pending Reviews', visible: true },
        { id: 'recent_products', title: 'Recent Products', visible: true }
      ],
      call_center_agent: [
        { id: 'order_stats', title: 'Order Statistics', visible: true },
        { id: 'recent_orders', title: 'Recent Orders', visible: true },
        { id: 'customer_inquiries', title: 'Customer Inquiries', visible: true },
        { id: 'delivery_status', title: 'Delivery Status', visible: true }
      ]
    };

    res.json({
      success: true,
      data: widgets[role] || []
    });
  } catch (error) {
    console.error('Get widgets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get widgets'
    });
  }
};

module.exports = {
  getDashboardData,
  getWidgets
};