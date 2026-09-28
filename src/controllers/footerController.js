
// // backend/src/controllers/footerController.js
// const Footer = require('../models/Footer');
// const { cloudinary } = require('../config/cloudinary');

// // ============================================================
// // 1. GET FOOTER DATA
// // ============================================================

// const getPublicFooter = async (req, res) => {
//   try {
//     let footer = await Footer.findOne({ isActive: true });
    
//     if (!footer) {
//       footer = await createDefaultFooter(null);
//     }

//     res.json({
//       success: true,
//       data: footer
//     });
//   } catch (error) {
//     console.error('Get public footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching footer'
//     });
//   }
// };

// const getAdminFooter = async (req, res) => {
//   try {
//     let footer = await Footer.findOne();
    
//     if (!footer) {
//       footer = await createDefaultFooter(req.user.id);
//     }

//     res.json({
//       success: true,
//       data: footer
//     });
//   } catch (error) {
//     console.error('Get admin footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching footer'
//     });
//   }
// };

// // @desc    Create footer
// const createFooter = async (req, res) => {
//   try {
//     const existingFooter = await Footer.findOne();
//     if (existingFooter) {
//       return res.status(400).json({
//         success: false,
//         error: 'Footer already exists. Use PUT to update.'
//       });
//     }

//     const footerData = req.body;
//     footerData.updatedBy = req.user.id;

//     const footer = await Footer.create(footerData);

//     res.status(201).json({
//       success: true,
//       data: footer,
//       message: 'Footer created successfully'
//     });
//   } catch (error) {
//     console.error('Create footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while creating footer'
//     });
//   }
// };

// // @desc    Update footer
// const updateFooter = async (req, res) => {
//   try {
//     let footer = await Footer.findOne();
    
//     if (!footer) {
//       footer = await createDefaultFooter(req.user.id);
//     }

//     const footerData = req.body;
    
//     if (footerData.backgroundImage !== undefined) {
//       footer.backgroundImage = footerData.backgroundImage;
//     }
    
//     if (footerData.backgroundPublicId !== undefined) {
//       footer.backgroundPublicId = footerData.backgroundPublicId;
//     }
    
//     if (footerData.company) {
//       footer.company = {
//         ...footer.company.toObject(),
//         ...footerData.company
//       };
//     }
    
//     if (footerData.columns) {
//       footer.columns = footerData.columns;
//     }
    
//     if (footerData.trustBadges) {
//       footer.trustBadges = footerData.trustBadges;
//     }
    
//     if (footerData.paymentMethods) {
//       footer.paymentMethods = footerData.paymentMethods;
//     }
    
//     if (footerData.footerText !== undefined) {
//       footer.footerText = footerData.footerText;
//     }
    
//     if (footerData.showCopyright !== undefined) {
//       footer.showCopyright = footerData.showCopyright;
//     }
    
//     if (footerData.showTrustBadges !== undefined) {
//       footer.showTrustBadges = footerData.showTrustBadges;
//     }
    
//     if (footerData.showPaymentMethods !== undefined) {
//       footer.showPaymentMethods = footerData.showPaymentMethods;
//     }
    
//     if (footerData.isActive !== undefined) {
//       footer.isActive = footerData.isActive;
//     }

//     footer.updatedBy = req.user.id;
//     await footer.save();

//     res.json({
//       success: true,
//       data: footer,
//       message: 'Footer updated successfully'
//     });
//   } catch (error) {
//     console.error('Update footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating footer'
//     });
//   }
// };

// // @desc    Delete footer (soft delete)
// const deleteFooter = async (req, res) => {
//   try {
//     const footer = await Footer.findOne();
    
//     if (!footer) {
//       return res.status(404).json({
//         success: false,
//         error: 'Footer not found'
//       });
//     }

//     footer.isActive = false;
//     footer.updatedBy = req.user.id;
//     await footer.save();

//     res.json({
//       success: true,
//       message: 'Footer deactivated successfully'
//     });
//   } catch (error) {
//     console.error('Delete footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while deleting footer'
//     });
//   }
// };

// // @desc    Toggle footer status
// const toggleFooterStatus = async (req, res) => {
//   try {
//     const footer = await Footer.findOne();
    
//     if (!footer) {
//       return res.status(404).json({
//         success: false,
//         error: 'Footer not found'
//       });
//     }

//     footer.isActive = !footer.isActive;
//     footer.updatedBy = req.user.id;
//     await footer.save();

//     res.json({
//       success: true,
//       data: footer,
//       message: `Footer ${footer.isActive ? 'activated' : 'deactivated'} successfully`
//     });
//   } catch (error) {
//     console.error('Toggle footer status error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while toggling footer status'
//     });
//   }
// };

// // @desc    Reset footer to default
// const resetFooter = async (req, res) => {
//   try {
//     await Footer.deleteMany({});
//     const footer = await createDefaultFooter(req.user.id);

//     res.json({
//       success: true,
//       data: footer,
//       message: 'Footer reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset footer error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting footer'
//     });
//   }
// };

// // @desc    Upload background image
// const uploadBackground = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: 'No background image provided'
//       });
//     }

//     const footer = await Footer.findOne();
//     if (footer && footer.backgroundPublicId) {
//       try {
//         await cloudinary.uploader.destroy(footer.backgroundPublicId);
//       } catch (error) {
//         console.error('Error deleting old background:', error);
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         url: req.file.path,
//         publicId: req.file.filename
//       },
//       message: 'Background image uploaded successfully'
//     });
//   } catch (error) {
//     console.error('Upload background error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while uploading background'
//     });
//   }
// };

// // @desc    Upload logo
// const uploadLogo = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: 'No logo image provided'
//       });
//     }

//     const footer = await Footer.findOne();
//     if (footer && footer.company && footer.company.logoPublicId) {
//       try {
//         await cloudinary.uploader.destroy(footer.company.logoPublicId);
//       } catch (error) {
//         console.error('Error deleting old logo:', error);
//       }
//     }

//     res.json({
//       success: true,
//       data: {
//         url: req.file.path,
//         publicId: req.file.filename
//       },
//       message: 'Logo uploaded successfully'
//     });
//   } catch (error) {
//     console.error('Upload logo error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while uploading logo'
//     });
//   }
// };

// // ============================================================
// // HELPER FUNCTIONS
// // ============================================================

// const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

// const createDefaultFooter = async (userId) => {
//   const defaultFooter = {
//     backgroundImage: '',
//     backgroundPublicId: '',
//     company: {
//       name: 'Beauty Bucket',
//       tagline: 'Premium Beauty Essentials',
//       description: 'Discover premium beauty products with expert care, fast delivery, and a touch of luxury across Bangladesh.',
//       address: 'Dhaka, Bangladesh',
//       phone: '+880 1XXXXXXXXX',
//       email: 'support@beautybucket.com',
//       hours: 'Always Open • 24/7 Online Ordering • Quick Response',
//       logoUrl: '/images/logo3.png',
//       logoPublicId: ''
//     },
//     columns: [
//       {
//         id: generateId(),
//         title: 'Company',
//         type: 'links',
//         items: [
//           { id: generateId(), label: 'Home', url: '/' },
//           { id: generateId(), label: 'Products', url: '/products' },
//           { id: generateId(), label: 'Track Order', url: '/track' },
//           { id: generateId(), label: 'About Us', url: '/about' },
//         ]
//       },
//       {
//         id: generateId(),
//         title: 'Support',
//         type: 'support',
//         items: [
//           { id: generateId(), label: 'Contact Us', url: '/contact' },
//           { id: generateId(), label: 'Register', url: '/register' },
//           { id: generateId(), label: 'Terms & Conditions', url: '/terms' },
//           { id: generateId(), label: 'Privacy Policy', url: '/privacy' },
//         ],
//         socialLinks: [
//           { platform: 'facebook', url: 'https://facebook.com/beautybucket', active: true },
//           { platform: 'instagram', url: 'https://instagram.com/beautybucket', active: true },
//           { platform: 'youtube', url: 'https://youtube.com/beautybucket', active: true },
//         ]
//       },
//       {
//         id: generateId(),
//         title: 'Contact Us',
//         type: 'contact',
//         items: [
//           { id: generateId(), type: 'address', label: 'Address', value: 'Dhaka, Bangladesh' },
//           { id: generateId(), type: 'phone', label: 'Phone', value: '+880 1XXXXXXXXX' },
//           { id: generateId(), type: 'email', label: 'Email', value: 'support@beautybucket.com' },
//           { id: generateId(), type: 'hours', label: 'Hours', value: 'Always Open • 24/7 Online Ordering' },
//         ]
//       }
//     ],
//     trustBadges: [
//       { type: 'authentic', label: '100% Authentic', active: true },
//       { type: 'warranty', label: 'Official Warranty', active: true },
//       { type: 'delivery', label: 'Fast Delivery', active: true },
//     ],
//     paymentMethods: [
//       { method: 'visa', active: true },
//       { method: 'mastercard', active: true },
//       { method: 'bkash', active: true },
//       { method: 'nagad', active: true },
//     ],
//     footerText: 'All rights reserved.',
//     showCopyright: true,
//     showTrustBadges: true,
//     showPaymentMethods: true,
//     isActive: true,
//     updatedBy: userId
//   };

//   return await Footer.create(defaultFooter);
// };

// module.exports = {
//   getPublicFooter,
//   getAdminFooter,
//   createFooter,
//   updateFooter,
//   deleteFooter,
//   toggleFooterStatus,
//   resetFooter,
//   uploadBackground,
//   uploadLogo
// };


// backend/src/controllers/footerController.js
const Footer = require('../models/Footer');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

// ============================================================
// GET PUBLIC FOOTER
// ============================================================
const getPublicFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne({ isActive: true });
    if (!footer) footer = await createDefaultFooter(null);
    const populated = await populateFooterData(footer);
    res.json({ success: true, data: populated });
  } catch (error) {
    console.error('Get public footer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// GET ADMIN FOOTER
// ============================================================
const getAdminFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) footer = await createDefaultFooter(req.user.id);
    const populated = await populateFooterData(footer);
    res.json({ success: true, data: populated });
  } catch (error) {
    console.error('Get admin footer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFooterOptions = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug _id')
      .sort({ name: 1 })
      .lean();

    console.log(`✅ Footer options: ${categories.length} categories found`);

    res.json({
      success: true,
      data: {
        categories: categories.map(c => ({
          _id: c._id,
          name: c.name,
          slug: c.slug || c._id,
        })),
      },
    });
  } catch (error) {
    console.error('Get footer options error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// HELPER: populate category-based items in columns
// ============================================================
const populateFooterData = async (footer) => {
  const obj = footer.toObject ? footer.toObject() : { ...footer };
  if (!Array.isArray(obj.columns)) return obj;

  for (const column of obj.columns) {
    if (!Array.isArray(column.items)) continue;

    for (const item of column.items) {
      if (item.type === 'category' && item.categoryId) {
        try {
          const cat = await Category.findById(item.categoryId)
            .select('name slug _id')
            .lean();
          if (cat) {
            item.category = cat;
            item.url = `/products?category=${cat.slug || cat._id}`;
            if (!item.label) item.label = cat.name;
          }
        } catch (err) {
          console.error('Populate category item error:', err.message);
        }
      }
    }
  }

  return obj;
};

// ============================================================
// CREATE
// ============================================================
const createFooter = async (req, res) => {
  try {
    const existing = await Footer.findOne();
    if (existing) {
      return res.status(400).json({ success: false, error: 'Footer already exists. Use PUT to update.' });
    }
    const data = req.body;
    data.updatedBy = req.user.id;
    const footer = await Footer.create(data);
    res.status(201).json({ success: true, data: footer, message: 'Footer created successfully' });
  } catch (error) {
    console.error('Create footer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// UPDATE
// ============================================================
const updateFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();
    if (!footer) footer = await createDefaultFooter(req.user.id);

    const d = req.body;

    if (d.backgroundImage !== undefined) footer.backgroundImage = d.backgroundImage;
    if (d.backgroundPublicId !== undefined) footer.backgroundPublicId = d.backgroundPublicId;

    if (d.company) footer.company = { ...footer.company.toObject(), ...d.company };

    if (d.columns) {
      const cleanColumns = d.columns.map(col => {
        const { populatedData, ...rest } = col;
        return {
          ...rest,
          items: (rest.items || []).map(it => {
            const { category, ...restItem } = it;
            return restItem;
          }),
        };
      });
      footer.columns = cleanColumns;
    }

    if (d.trustBadges) footer.trustBadges = d.trustBadges;
    if (d.paymentMethods) footer.paymentMethods = d.paymentMethods;
    if (d.footerText !== undefined) footer.footerText = d.footerText;
    if (d.showCopyright !== undefined) footer.showCopyright = d.showCopyright;
    if (d.showTrustBadges !== undefined) footer.showTrustBadges = d.showTrustBadges;
    if (d.showPaymentMethods !== undefined) footer.showPaymentMethods = d.showPaymentMethods;
    if (d.isActive !== undefined) footer.isActive = d.isActive;

    footer.updatedBy = req.user.id;
    await footer.save();

    const populated = await populateFooterData(footer);
    res.json({ success: true, data: populated, message: 'Footer updated successfully' });
  } catch (error) {
    console.error('Update footer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// DELETE / TOGGLE / RESET / UPLOADS
// ============================================================
const deleteFooter = async (req, res) => {
  try {
    const footer = await Footer.findOne();
    if (!footer) return res.status(404).json({ success: false, error: 'Footer not found' });
    footer.isActive = false;
    footer.updatedBy = req.user.id;
    await footer.save();
    res.json({ success: true, message: 'Footer deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const toggleFooterStatus = async (req, res) => {
  try {
    const footer = await Footer.findOne();
    if (!footer) return res.status(404).json({ success: false, error: 'Footer not found' });
    footer.isActive = !footer.isActive;
    footer.updatedBy = req.user.id;
    await footer.save();
    res.json({
      success: true,
      data: footer,
      message: `Footer ${footer.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const resetFooter = async (req, res) => {
  try {
    await Footer.deleteMany({});
    const footer = await createDefaultFooter(req.user.id);
    res.json({ success: true, data: footer, message: 'Footer reset to default successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const uploadBackground = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No background image provided' });
    const footer = await Footer.findOne();
    if (footer?.backgroundPublicId) {
      try { await cloudinary.uploader.destroy(footer.backgroundPublicId); } catch (_) {}
    }
    res.json({
      success: true,
      data: { url: req.file.path, publicId: req.file.filename },
      message: 'Background image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No logo image provided' });
    const footer = await Footer.findOne();
    if (footer?.company?.logoPublicId) {
      try { await cloudinary.uploader.destroy(footer.company.logoPublicId); } catch (_) {}
    }
    res.json({
      success: true,
      data: { url: req.file.path, publicId: req.file.filename },
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// DEFAULT FOOTER — Nishita's Creation
// Company | Support | Explore | Contact
// ============================================================
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

const createDefaultFooter = async (userId) => {
  const defaultFooter = {
    backgroundImage: '',
    backgroundPublicId: '',
    company: {
      name: "Nishita's Creation",
       tagline: 'ব্লকপ্রিন্ট, এপ্লিক ও যশোরের হাতের কাজের পণ্য',
  description: 'নিজস্ব কারখানা ও দক্ষ কারিগরের হাত ধরে তৈরি প্রতিটি পণ্য — ঐতিহ্য, শিল্প ও যত্নের ছোঁয়ায়। সারা বাংলাদেশে দ্রুত ডেলিভারি ও নির্ভরযোগ্য সেবা।',
      address: 'Rayerbag, Kodomtoli, Jatrabari, Dhaka, Bangladesh',
      phone: '01747-708644',
      email: 'support@nishitascreation.com',
      hours: 'Always Open • 24/7 Online Ordering • Quick Response',
      logoUrl: '/images/logo3.png',
      logoPublicId: ''
    },
    columns: [
      {
        id: generateId(),
        title: 'Company',
        type: 'links',
        items: [
          { id: generateId(), type: 'link', label: 'Home', url: '/' },
          { id: generateId(), type: 'link', label: 'Products', url: '/products' },
          { id: generateId(), type: 'link', label: 'Track Order', url: '/track' },
          { id: generateId(), type: 'link', label: 'About Us', url: '/about' },
        ]
      },
      {
        id: generateId(),
        title: 'Support',
        type: 'support',
        items: [
          { id: generateId(), type: 'link', label: 'Contact Us', url: '/contact' },
          { id: generateId(), type: 'link', label: 'Login', url: '/login' },
          { id: generateId(), type: 'link', label: 'Terms & Conditions', url: '/terms' },
          { id: generateId(), type: 'link', label: 'Privacy Policy', url: '/privacy' },
        ],
        socialLinks: [
          { platform: 'facebook',  url: 'https://www.facebook.com/NishitasCreation/', active: true },
          { platform: 'instagram', url: 'https://www.instagram.com/nishitascreation/', active: true },
          { platform: 'youtube',   url: 'https://www.youtube.com/@NishitaPaulsLifestyle', active: true },
        ]
      },
      {
        id: generateId(),
        title: 'Explore',
        type: 'links',
        items: [
          { id: generateId(), type: 'link', label: 'Courses', url: '/courses' },
          { id: generateId(), type: 'link', label: 'Videos', url: '/videos' },
        ]
      },
      {
        id: generateId(),
        title: 'Contact Us',
        type: 'contact',
        items: [
          {
            id: generateId(),
            type: 'address',
            label: 'Address',
            value: ' Rayerbag, Kodomtoli, Jatrabari, Dhaka, Bangladesh'
          },
          { id: generateId(), type: 'phone', label: 'Phone', value: '01747-708644' },
          { id: generateId(), type: 'email', label: 'Email', value: 'support@nishitascreation.com' },
          { id: generateId(), type: 'hours', label: 'Hours', value: 'Always Open • 24/7 Online Ordering' },
        ]
      }
    ],
    trustBadges: [
      { type: 'authentic', label: '100% Authentic', active: true },
      { type: 'warranty', label: 'Official Warranty', active: true },
      { type: 'delivery', label: 'Fast Delivery', active: true },
    ],
    paymentMethods: [
      { method: 'visa', active: true },
      { method: 'mastercard', active: true },
      { method: 'bkash', active: true },
      { method: 'nagad', active: true },
    ],
    footerText: 'All rights reserved.',
    showCopyright: true,
    showTrustBadges: true,
    showPaymentMethods: true,
    isActive: true,
    updatedBy: userId
  };

  return await Footer.create(defaultFooter);
};

module.exports = {
  getPublicFooter,
  getAdminFooter,
  getFooterOptions,
  createFooter,
  updateFooter,
  deleteFooter,
  toggleFooterStatus,
  resetFooter,
  uploadBackground,
  uploadLogo
};