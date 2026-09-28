
// const Banner = require('../models/Banner');

// // ============================================================
// // HELPER: Create default banner config
// // ============================================================
// const createDefaultConfig = async (userId = null) => {
//   const defaultConfig = {
//     slides: [
//       {
//         bgImage: '/images/hh.PNG',
//         ctaLabel: 'Explore the Collection',
//         ctaHref: '/collection',
//         displayOrder: 0,
//         isActive: true
//       },
//       {
//         bgImage: '/images/hh2.PNG',
//         ctaLabel: 'Shop New Arrivals',
//         ctaHref: '/new-arrivals',
//         displayOrder: 1,
//         isActive: true
//       }
//     ],
//     announcements: [
//       { text: '🚚 Free Delivery on orders over ৳1000', order: 0, isActive: true },
//       { text: '💳 Cash on Delivery Available', order: 1, isActive: true },
//       { text: '🎁 Get 10% Off on Your First Order', order: 2, isActive: true }
//     ],
//     isActive: true
//   };

//   if (userId) defaultConfig.updatedBy = userId;

//   return await Banner.create(defaultConfig);
// };

// // ============================================================
// // PUBLIC: Get homepage data (slides + announcements)
// // ============================================================
// // @desc    Get banner slides + announcements for homepage
// // @route   GET /api/banners/homepage
// // @access  Public
// const getBannerForHomepage = async (req, res) => {
//   res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
//   try {
//     let config = await Banner.findOne({ isActive: true });

//     if (!config) {
//       config = await createDefaultConfig();
//     }

//     // Filter active slides
//     const activeSlides = (config.slides || [])
//       .filter((s) => s.isActive !== false)
//       .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
//       .map((s) => ({
//         id: s._id,
//         bgImage: s.bgImage || '/images/hh.PNG',
//         ctaLabel: s.ctaLabel || '',
//         ctaHref: s.ctaHref || '/products'
//       }));

//     // Filter active announcements
//     const activeAnnouncements = (config.announcements || [])
//       .filter((a) => a.isActive !== false)
//       .sort((a, b) => (a.order || 0) - (b.order || 0))
//       .map((a) => ({
//         id: a._id,
//         text: a.text,
//         order: a.order
//       }));

//     res.json({
//       success: true,
//       data: {
//         slides: activeSlides,
//         announcements: activeAnnouncements
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get homepage banner error:', error);
//     res.json({
//       success: true,
//       data: { slides: [], announcements: [] },
//       error: error.message
//     });
//   }
// };

// // ============================================================
// // ADMIN: Get full banner config
// // ============================================================
// // @desc    Get banner config (admin)
// // @route   GET /api/banners/admin
// // @access  Private (Moderator/Admin)
// const getAdminBanner = async (req, res) => {
//   res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
//   try {
//     let config = await Banner.findOne();

//     if (!config) {
//       config = await createDefaultConfig(req.user.id);
//     }

//     res.json({
//       success: true,
//       data: config
//     });
//   } catch (error) {
//     console.error('❌ Get admin banner error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching banner'
//     });
//   }
// };

// // ============================================================
// // ADMIN: Update full banner config
// // ============================================================
// // @desc    Update banner config (slides + announcements)
// // @route   PUT /api/banners/admin
// // @access  Private (Moderator/Admin)
// const updateBanner = async (req, res) => {
//   try {
//     let config = await Banner.findOne();

//     if (!config) {
//       config = await createDefaultConfig(req.user.id);
//     }

//     const { slides, announcements, isActive } = req.body;

//     if (Array.isArray(slides)) {
//       config.slides = slides.map((s, idx) => ({
//         _id: s._id, // preserve if exists
//         bgImage: s.bgImage,
//         ctaLabel: s.ctaLabel || '',
//         ctaHref: s.ctaHref || '/products',
//         displayOrder: s.displayOrder !== undefined ? s.displayOrder : idx,
//         isActive: s.isActive !== false
//       }));
//     }

//     if (Array.isArray(announcements)) {
//       config.announcements = announcements.map((a, idx) => ({
//         _id: a._id,
//         text: a.text,
//         order: a.order !== undefined ? a.order : idx,
//         isActive: a.isActive !== false
//       }));
//     }

//     if (isActive !== undefined) {
//       config.isActive = isActive;
//     }

//     config.updatedBy = req.user.id;
//     await config.save();

//     res.json({
//       success: true,
//       data: config,
//       message: 'Banner updated successfully'
//     });
//   } catch (error) {
//     console.error('❌ Update banner error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating banner'
//     });
//   }
// };

// // ============================================================
// // ADMIN: Reset to defaults
// // ============================================================
// // @desc    Reset banner config to defaults
// // @route   POST /api/banners/admin/reset
// // @access  Private (Moderator/Admin)
// const resetBanner = async (req, res) => {
//   try {
//     await Banner.deleteMany({});
//     const config = await createDefaultConfig(req.user.id);

//     res.json({
//       success: true,
//       data: config,
//       message: 'Banner reset to default'
//     });
//   } catch (error) {
//     console.error('❌ Reset banner error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting banner'
//     });
//   }
// };

// // ============================================================
// // STATS (optional, for admin dashboard)
// // ============================================================
// const getBannerStats = async (req, res) => {
//   try {
//     const config = await Banner.findOne();

//     if (!config) {
//       return res.json({
//         success: true,
//         data: { slides: 0, activeSlides: 0, announcements: 0, activeAnnouncements: 0 }
//       });
//     }

//     const slides = config.slides || [];
//     const announcements = config.announcements || [];

//     res.json({
//       success: true,
//       data: {
//         slides: slides.length,
//         activeSlides: slides.filter((s) => s.isActive !== false).length,
//         announcements: announcements.length,
//         activeAnnouncements: announcements.filter((a) => a.isActive !== false).length
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// module.exports = {
//   getBannerForHomepage,
//   getAdminBanner,
//   updateBanner,
//   resetBanner,
//   getBannerStats
// };



const Banner = require('../models/Banner');

// ============================================================
// HELPER: Create default banner config
// ============================================================
const createDefaultConfig = async (userId = null) => {
  const defaultConfig = {
    slides: [
      {
        title: '',
        bgImage: '/images/hh.PNG',
        ctaLabel: 'Explore the Collection',
        ctaHref: '/collection',
        displayOrder: 0,
        isActive: true
      },
      {
        title: '',
        bgImage: '/images/hh2.PNG',
        ctaLabel: 'Shop New Arrivals',
        ctaHref: '/new-arrivals',
        displayOrder: 1,
        isActive: true
      }
    ],
    announcements: [
      { text: '🚚 Free Delivery on orders over ৳1000', order: 0, isActive: true },
      { text: '💳 Cash on Delivery Available', order: 1, isActive: true },
      { text: '🎁 Get 10% Off on Your First Order', order: 2, isActive: true }
    ],
    isActive: true
  };

  if (userId) defaultConfig.updatedBy = userId;

  return await Banner.create(defaultConfig);
};

// ============================================================
// PUBLIC: Get homepage data (slides + announcements)
// ============================================================
const getBannerForHomepage = async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    let config = await Banner.findOne({ isActive: true });

    if (!config) {
      config = await createDefaultConfig();
    }

    // Filter active slides
    const activeSlides = (config.slides || [])
      .filter((s) => s.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((s) => ({
        id: s._id,
        title: s.title || '', // ✅ per-slide title
        bgImage: s.bgImage || '/images/hh.PNG',
        ctaLabel: s.ctaLabel || '',
        ctaHref: s.ctaHref || '/products'
      }));

    // Filter active announcements
    const activeAnnouncements = (config.announcements || [])
      .filter((a) => a.isActive !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((a) => ({
        id: a._id,
        text: a.text,
        order: a.order
      }));

    res.json({
      success: true,
      data: {
        slides: activeSlides,
        announcements: activeAnnouncements
      }
    });
  } catch (error) {
    console.error('❌ Get homepage banner error:', error);
    res.json({
      success: true,
      data: { slides: [], announcements: [] },
      error: error.message
    });
  }
};

// ============================================================
// ADMIN: Get full banner config
// ============================================================
const getAdminBanner = async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    let config = await Banner.findOne();

    if (!config) {
      config = await createDefaultConfig(req.user.id);
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('❌ Get admin banner error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching banner'
    });
  }
};

// ============================================================
// ADMIN: Update full banner config
// ============================================================
const updateBanner = async (req, res) => {
  try {
    let config = await Banner.findOne();

    if (!config) {
      config = await createDefaultConfig(req.user.id);
    }

    const { slides, announcements, isActive } = req.body;

    if (Array.isArray(slides)) {
      config.slides = slides.map((s, idx) => ({
        _id: s._id,
        title: s.title || '', // ✅ per-slide title
        bgImage: s.bgImage,
        ctaLabel: s.ctaLabel || '',
        ctaHref: s.ctaHref || '/products',
        displayOrder:
          s.displayOrder !== undefined ? s.displayOrder : idx,
        isActive: s.isActive !== false
      }));
    }

    if (Array.isArray(announcements)) {
      config.announcements = announcements.map((a, idx) => ({
        _id: a._id,
        text: a.text,
        order: a.order !== undefined ? a.order : idx,
        isActive: a.isActive !== false
      }));
    }

    if (isActive !== undefined) {
      config.isActive = isActive;
    }

    config.updatedBy = req.user.id;
    await config.save();

    res.json({
      success: true,
      data: config,
      message: 'Banner updated successfully'
    });
  } catch (error) {
    console.error('❌ Update banner error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating banner'
    });
  }
};

// ============================================================
// ADMIN: Reset to defaults
// ============================================================
const resetBanner = async (req, res) => {
  try {
    await Banner.deleteMany({});
    const config = await createDefaultConfig(req.user.id);

    res.json({
      success: true,
      data: config,
      message: 'Banner reset to default'
    });
  } catch (error) {
    console.error('❌ Reset banner error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting banner'
    });
  }
};

// ============================================================
// STATS
// ============================================================
const getBannerStats = async (req, res) => {
  try {
    const config = await Banner.findOne();

    if (!config) {
      return res.json({
        success: true,
        data: {
          slides: 0,
          activeSlides: 0,
          announcements: 0,
          activeAnnouncements: 0
        }
      });
    }

    const slides = config.slides || [];
    const announcements = config.announcements || [];

    res.json({
      success: true,
      data: {
        slides: slides.length,
        activeSlides: slides.filter((s) => s.isActive !== false).length,
        announcements: announcements.length,
        activeAnnouncements: announcements.filter(
          (a) => a.isActive !== false
        ).length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getBannerForHomepage,
  getAdminBanner,
  updateBanner,
  resetBanner,
  getBannerStats
};