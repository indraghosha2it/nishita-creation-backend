
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const { getLifetimeStats } = require('./src/lib/couriers/lifetimeStats');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const bannerRoutes = require('./src/routes/bannerRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const blogRoutes = require('./src/routes/blogRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const promotionalRoutes = require('./src/routes/promotionalRoutes');
const popupRoutes = require('./src/routes/popupRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const barcodeRoutes = require('./src/routes/barcodeRoutes');
const brandRoutes = require('./src/routes/brandRoutes');
const adminCourierRoutes = require('./src/routes/adminCourierRoutes');
const tagRoutes = require('./src/routes/tagRoutes');
const footerRoutes = require('./src/routes/footerRoutes');
const navbarRoutes = require('./src/routes/navbarRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const homepageRoutes = require('./src/routes/homepageRoutes');
const whyChooseUsRoutes = require('./src/routes/whyChooseUsRoutes');
const termsRoutes = require('./src/routes/termsRoutes');
const privacyRoutes = require('./src/routes/privacyRoutes');
const contactAdminRoutes = require('./src/routes/contactMainRoute');
const aboutRoutes = require('./src/routes/aboutRoutes');
const incompleteOrderRoutes = require('./src/routes/incompleteOrderRoutes');
const orderRestrictionRoutes = require('./src/routes/orderRestrictionRoutes');
const pixelRoutes = require('./src/routes/pixelRoutes');
const customCodeRoutes = require('./src/routes/customCodeRoutes');
const mediaRoutes = require('./src/routes/mediaRoutes');
const productCostRoutes = require('./src/routes/productCostRoutes');
const emailSettingsRoutes = require('./src/routes/emailSettingsRoutes');
const courierWebhookRoutes = require('./src/routes/courierWebhookRoutes');
const chatConversationRoutes = require('./src/routes/chatConversationRoutes');
const chatFAQRoutes = require('./src/routes/chatFAQRoutes');
// Add with other route imports
const dealRoutes = require('./src/routes/dealRoutes');
// In server.js - Add with other route imports
const trustResultsRoutes = require('./src/routes/trustResultsRoutes');
// Add with other route imports
const achievementRoutes = require('./src/routes/achievementRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
// Add with other route imports
const courseRoutes = require('./src/routes/courseRoutes');







// Initialize Express app
const app = express();

// ============================================
// CORS MIDDLEWARE
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'https://nishitascreation.com',
  'https://idyllic-arithmetic-bdeb80.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'Cache-Control', // ✅ ADD THIS
    'cache-control' ]
}));

// ============================================
// BODY PARSERS
// ============================================
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use(cookieParser());
app.use(compression());

// JSON Syntax Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ JSON Syntax Error:', err.message);
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid JSON payload. Please check your request format.' 
    });
  }
  next();
});

// ============================================
// MONGODB CONNECTION (serverless-safe, cached)
// ============================================
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn; // reuse existing connection, no reconnect
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
      console.log(`📊 Database: ${mongooseInstance.connection.name}`);
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// ✅ REMOVE THIS LINE - Don't call connectDB() here anymore
// connectDB(); // DELETE THIS LINE

// ============================================
// ✅ ENSURE DB CONNECTION BEFORE HANDLING REQUESTS
// ============================================
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('❌ DB connection middleware error:', error.message);
    res.status(503).json({ 
      success: false, 
      error: 'Database unavailable, please try again' 
    });
  }
});

// ============================================
// CACHE CONTROL MIDDLEWARE
// ============================================
const cacheControl = (duration) => {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${duration}`);
    next();
  };
};

app.use('/api/products', (req, res, next) => {
  // ✅ Skip caching for admin routes and non-GET requests
  if (req.path.startsWith('/admin') || req.method !== 'GET') {
    return next();
  }
  // Shorten cache to 30 seconds for public routes
  cacheControl(30)(req, res, next);
}, productRoutes);

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static('uploads'));

// ============================================
// API ROUTES
// ============================================

// Auth Routes
app.use('/api/auth', authRoutes);

// Role Management Routes (Super Admin only)
app.use('/api/roles', roleRoutes);

// Dashboard Routes (Protected)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/why-choose-us', whyChooseUsRoutes);
app.use('/api/admin/why-choose-us', whyChooseUsRoutes);

app.use('/api/footer', footerRoutes);
app.use('/api/admin/footer', footerRoutes);

// Admin Routes
app.use('/api/admin/email-settings', emailSettingsRoutes);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/admin', adminCourierRoutes);
app.use('/api/admin', adminRoutes);

// Category & Product Routes
// app.use('/api/categories', cacheControl(300), categoryRoutes);
app.use('/api/categories', (req, res, next) => {
  // ✅ Any authenticated request (admin panel) bypasses caching entirely.
  // Only truly anonymous public storefront GETs get cached.
  if (req.method !== 'GET' || req.headers.authorization) {
    res.set('Cache-Control', 'no-store');
    return next();
  }
  cacheControl(300)(req, res, next);
}, categoryRoutes);
app.use('/api/products', cacheControl(60), productRoutes);

// Brand Routes with cache
app.use('/api/brands', cacheControl(300), brandRoutes);

// Tag Routes with cache
app.use('/api/tags', cacheControl(300), tagRoutes);

// Content Routes
app.use('/api/banners/active', cacheControl(300));
app.use('/api/banners/homepage', cacheControl(300));
app.use('/api/banners', cacheControl(300), bannerRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/reviews', reviewRoutes);

// Upload Routes
app.use('/api/upload', uploadRoutes);

// Search Routes
app.use('/api/search', searchRoutes);

// Promotional & Popup Routes
app.use('/api', promotionalRoutes);
app.use('/api', popupRoutes);

// Cart & Wishlist Routes
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Coupon Routes
app.use('/api/coupons', couponRoutes);

// Payment Routes
app.use('/api/payments', paymentRoutes);

// Delivery Routes
app.use('/api/delivery', deliveryRoutes);

// Barcode Routes
app.use('/api/barcodes', barcodeRoutes);

// Footer Routes
// app.use('/api/footer', footerRoutes);
// app.use('/api/admin/footer', footerRoutes);

// app.use('/api/footer', footerRoutes);

// app.use('/api/admin/footer', footerRoutes);

// Homepage Routes
app.use('/api/homepage', homepageRoutes);
app.use('/api/admin/homepage', homepageRoutes);

// Terms Routes
app.use('/api/terms', termsRoutes);
app.use('/api/admin/terms', termsRoutes);

// Privacy Routes
app.use('/api/privacy', privacyRoutes);
app.use('/api/admin/privacy', privacyRoutes);

// Contact Routes
app.use('/api/contact', contactAdminRoutes);
app.use('/api/admin/contact', contactAdminRoutes);



// Navbar Routes
app.use('/api/navbar', navbarRoutes);
app.use('/api/admin/navbar', navbarRoutes);

// About Routes
app.use('/api/about', aboutRoutes);
app.use('/api/admin/about', aboutRoutes);

// Incomplete Orders
app.use('/api/incomplete-orders', incompleteOrderRoutes);

// Order Restrictions
app.use('/api/order-restrictions', orderRestrictionRoutes);

// Pixels
app.use('/api/pixels', pixelRoutes);

// Custom Code
app.use('/api/custom-code', customCodeRoutes);

// Product Cost
app.use('/api/product-cost', productCostRoutes);

// Webhook Routes
app.use('/api/webhooks/courier', courierWebhookRoutes);
// Add with other route usage
app.use('/api/chat/conversation', chatConversationRoutes);

// FAQ routes (public + admin)
app.use('/api/chat/faq', chatFAQRoutes);

// Add with other route usage
app.use('/api/deals', dealRoutes);

// Add with other route usage
app.use('/api/trust-results', trustResultsRoutes);

// Add with other route usage (after dealRoutes)
app.use('/api/achievements', achievementRoutes);
app.use('/api/videos', videoRoutes);

// Add with other route usage
app.use('/api/courses', courseRoutes);

// Courier Lifetime Stats
app.get('/api/courier-lifetime', async (req, res) => {
  try {
    const phoneNumber = req.query.phone;
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    console.log('📞 Courier lifetime request for:', phoneNumber);
    const result = await getLifetimeStats(phoneNumber);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch courier history'
    });
  }
});

// ============================================
// TEST & HEALTH ROUTES
// ============================================

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    database: mongoose.connection.name,
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: '/api/auth',
      roles: '/api/roles',
      dashboard: '/api/dashboard',
      admin: '/api/admin',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      payments: '/api/payments'
    }
  });
});

// Role info endpoint
app.get('/api/roles-info', (req, res) => {
  res.json({
    success: true,
    data: {
      roles: {
        super_admin: {
          name: 'Super Admin',
          description: 'Full system access, can manage all users and roles',
          level: 5
        },
        admin: {
          name: 'Admin',
          description: 'Can manage users, products, orders, and content',
          level: 4
        },
        moderator: {
          name: 'Moderator',
          description: 'Can manage products, content, and reviews',
          level: 3
        },
        call_center_agent: {
          name: 'Call Center Agent',
          description: 'Can manage orders, delivery, and customer support',
          level: 2
        },
        customer: {
          name: 'Customer',
          description: 'Regular customer access',
          level: 1
        }
      },
      dashboardSections: [
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
      ]
    }
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Something went wrong!',
    message: err.message,
    path: req.originalUrl
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed (SIGTERM)');
  process.exit(0);
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Roles info: http://localhost:${PORT}/api/roles-info`);
  console.log('\n📌 Available Routes:');
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/register`);
  console.log(`  GET    /api/auth/me`);
  console.log(`  GET    /api/dashboard`);
  console.log(`  GET    /api/roles/dashboard-access`);
  console.log(`  GET    /api/roles/users (Super Admin only)`);
  console.log(`  PUT    /api/roles/update/:userId (Super Admin only)`);
  console.log(`  POST   /api/auth/super-admin/create-staff (Super Admin only)`);
});