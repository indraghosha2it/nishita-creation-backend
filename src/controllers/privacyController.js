
// // backend/src/controllers/privacyController.js
// const Privacy = require('../models/Privacy');

// // Helper: Generate section ID
// const generateSectionId = () => {
//   return Math.floor(Math.random() * 1000);
// };

// // @desc    Get privacy (public)
// // @route   GET /api/privacy
// // @access  Public
// const getPublicPrivacy = async (req, res) => {
//   try {
//     let privacy = await Privacy.findOne({ isActive: true });
    
//     if (!privacy) {
//       privacy = await createDefaultPrivacy();
//     }

//     const activeSections = privacy.sections.filter(section => section.isActive !== false);
    
//     res.json({
//       success: true,
//       data: {
//         heroTitle: privacy.heroTitle,
//         heroSubtitle: privacy.heroSubtitle,
//         heroDescription: privacy.heroDescription,
//         heroImage: privacy.heroImage || '/images/bg10.jpg',
//         ctaImage: privacy.ctaImage || '/images/pattern.png',
//         introText: privacy.introText,
//         sections: activeSections.sort((a, b) => a.displayOrder - b.displayOrder),
//         quickInfo: privacy.quickInfo || { email: 'privacy@beautybucket.com', phone: '+880 1XXXXXXXXX', responseTime: 'Within 24 hours' },
//         lastUpdated: privacy.lastUpdated
//       }
//     });
//   } catch (error) {
//     console.error('Get public privacy error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching privacy policy'
//     });
//   }
// };

// // @desc    Get privacy (admin)
// // @route   GET /api/admin/privacy
// // @access  Private (Admin/Moderator)
// const getAdminPrivacy = async (req, res) => {
//   try {
//     let privacy = await Privacy.findOne();
    
//     if (!privacy) {
//       privacy = await createDefaultPrivacy();
//     }

//     const sortedSections = privacy.sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
//     privacy.sections = sortedSections;

//     res.json({
//       success: true,
//       data: privacy
//     });
//   } catch (error) {
//     console.error('Get admin privacy error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching privacy policy'
//     });
//   }
// };

// // @desc    Update privacy
// // @route   PUT /api/admin/privacy
// // @access  Private (Admin/Moderator)
// const updatePrivacy = async (req, res) => {
//   try {
//     let privacy = await Privacy.findOne();
    
//     if (!privacy) {
//       privacy = await createDefaultPrivacy();
//     }

//     const { 
//       heroTitle,
//       heroSubtitle,
//       heroDescription,
//       heroImage,
//       ctaImage,
//       introText,
//       sections,
//       quickInfo,
//       lastUpdated,
//       isActive 
//     } = req.body;

//     if (heroTitle) privacy.heroTitle = heroTitle;
//     if (heroSubtitle) privacy.heroSubtitle = heroSubtitle;
//     if (heroDescription) privacy.heroDescription = heroDescription;
//     if (heroImage) privacy.heroImage = heroImage;
//     if (ctaImage) privacy.ctaImage = ctaImage;
//     if (introText) privacy.introText = introText;
//     if (quickInfo) privacy.quickInfo = quickInfo;
//     if (lastUpdated) privacy.lastUpdated = lastUpdated;
//     if (isActive !== undefined) privacy.isActive = isActive;

//     if (sections && Array.isArray(sections)) {
//       const processedSections = sections.map((section, index) => {
//         const isActiveValue = section.isActive !== undefined ? Boolean(section.isActive) : true;
        
//         return {
//           id: section.id || generateSectionId(),
//           title: section.title || 'Untitled Section',
//           icon: section.icon || 'FaShieldAlt',
//           description: section.description || '',
//           details: section.details || [],
//           isActive: isActiveValue,
//           displayOrder: section.displayOrder !== undefined ? section.displayOrder : index
//         };
//       });
      
//       privacy.sections = processedSections;
//     }

//     privacy.updatedBy = req.user.id;
//     await privacy.save();

//     const updatedPrivacy = await Privacy.findById(privacy._id);
    
//     res.json({
//       success: true,
//       data: updatedPrivacy,
//       message: 'Privacy policy updated successfully'
//     });
//   } catch (error) {
//     console.error('Update privacy error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating privacy policy'
//     });
//   }
// };

// // @desc    Reset privacy to default
// // @route   POST /api/admin/privacy/reset
// // @access  Private (Admin)
// const resetPrivacy = async (req, res) => {
//   try {
//     console.log('⚠️ RESETTING PRIVACY POLICY TO DEFAULT');
//     await Privacy.deleteMany({});
//     const privacy = await createDefaultPrivacy();

//     res.json({
//       success: true,
//       data: privacy,
//       message: 'Privacy policy reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset privacy error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting privacy policy'
//     });
//   }
// };

// // @desc    Get raw database data
// // @route   GET /api/admin/privacy/raw-data
// // @access  Private (Admin)
// const getRawData = async (req, res) => {
//   try {
//     const privacy = await Privacy.findOne().lean();
    
//     if (!privacy) {
//       return res.status(404).json({
//         success: false,
//         error: 'No privacy data found'
//       });
//     }

//     res.json({
//       success: true,
//       data: privacy
//     });
//   } catch (error) {
//     console.error('Error getting raw data:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get privacy (admin) - FORCED ALL SECTIONS
// // @route   GET /api/admin/privacy/all
// // @access  Private (Admin/Moderator)
// const getAdminPrivacyAll = async (req, res) => {
//   try {
//     let privacy = await Privacy.findOne();
    
//     if (!privacy) {
//       privacy = await createDefaultPrivacy();
//     }

//     const allSections = privacy.sections.map(s => ({
//       ...s.toObject ? s.toObject() : s,
//       isActive: s.isActive
//     }));

//     const sortedSections = allSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

//     res.json({
//       success: true,
//       data: {
//         sections: sortedSections,
//         heroTitle: privacy.heroTitle,
//         heroSubtitle: privacy.heroSubtitle,
//         heroDescription: privacy.heroDescription,
//         heroImage: privacy.heroImage || '/images/bg10.jpg',
//         ctaImage: privacy.ctaImage || '/images/pattern.png',
//         introText: privacy.introText,
//         quickInfo: privacy.quickInfo || { email: 'privacy@beautybucket.com', phone: '+880 1XXXXXXXXX', responseTime: 'Within 24 hours' },
//         lastUpdated: privacy.lastUpdated,
//         isActive: privacy.isActive,
//         _id: privacy._id,
//         updatedBy: privacy.updatedBy,
//         createdAt: privacy.createdAt,
//         updatedAt: privacy.updatedAt
//       }
//     });
//   } catch (error) {
//     console.error('Get admin privacy all error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching privacy policy'
//     });
//   }
// };

// // @desc    Create default privacy - BEAUTY BUCKET BRANDING
// const createDefaultPrivacy = async () => {
//   const defaultPrivacy = {
//     heroTitle: 'Your Privacy',
//     heroSubtitle: 'Matters to Us',
//     heroDescription: 'We are committed to protecting your personal data and being transparent about how we collect, use, and safeguard your information.',
//     heroImage: '/images/bg10.jpg',
//     ctaImage: '/images/pattern.png',
//     introText: 'Welcome to BeautyBucket. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.',
//     sections: [
//       {
//         id: 1,
//         title: 'Information We Collect',
//         icon: 'FaUsers',
//         description: 'We collect information to provide and improve our services to you.',
//         details: [
//           'Name, email address, phone number, and shipping/billing address',
//           'Payment information (processed securely through our payment partners)',
//           'IP address, browser type, device information, and usage data',
//           'Cookies and similar tracking technologies'
//         ],
//         isActive: true,
//         displayOrder: 0
//       },
//       {
//         id: 2,
//         title: 'How We Use Your Information',
//         icon: 'FaEye',
//         description: 'Your data helps us serve you better and improve our platform.',
//         details: [
//           'Process and fulfill your orders and deliveries',
//           'Communicate with you about orders, products, and promotions',
//           'Improve our website, products, and customer service',
//           'Prevent fraud and ensure the security of our platform',
//           'Comply with legal obligations and regulatory requirements'
//         ],
//         isActive: true,
//         displayOrder: 1
//       },
//       {
//         id: 3,
//         title: 'Data Sharing & Disclosure',
//         icon: 'FaShieldAlt',
//         description: 'We respect your privacy and limit data sharing to trusted partners.',
//         details: [
//           'We never sell or rent your personal data to third parties',
//           'Share data with trusted service providers (payment processors, delivery partners)',
//           'May disclose data when required by law or to protect our rights',
//           'Third-party services have their own privacy policies'
//         ],
//         isActive: true,
//         displayOrder: 2
//       },
//       {
//         id: 4,
//         title: 'Data Security',
//         icon: 'FaLock',
//         description: 'We implement industry-standard security measures to protect your data.',
//         details: [
//           'SSL encryption for all data transmission',
//           'Regular security audits and vulnerability assessments',
//           'Access controls and authentication measures',
//           'Secure data storage with industry-standard practices'
//         ],
//         isActive: true,
//         displayOrder: 3
//       },
//       {
//         id: 5,
//         title: 'Cookies & Tracking',
//         icon: 'FaCookie',
//         description: 'We use cookies to enhance your browsing experience.',
//         details: [
//           'Essential cookies for site functionality',
//           'Analytics cookies to understand user behavior',
//           'Preference cookies to remember your settings',
//           'You can manage cookie preferences in your browser settings'
//         ],
//         isActive: true,
//         displayOrder: 4
//       },
//       {
//         id: 6,
//         title: 'Your Rights',
//         icon: 'FaExclamationTriangle',
//         description: 'You have control over your personal data.',
//         details: [
//           'Access, correct, or delete your personal data',
//           'Withdraw consent for marketing communications',
//           'Request data portability',
//           'Lodge a complaint with data protection authorities'
//         ],
//         isActive: true,
//         displayOrder: 5
//       }
//     ],
//     quickInfo: {
//       email: 'privacy@beautybucket.com',
//       phone: '+880 1XXXXXXXXX',
//       responseTime: 'Within 24 hours'
//     },
//     isActive: true
//   };

//   return await Privacy.create(defaultPrivacy);
// };

// module.exports = {
//   getPublicPrivacy,
//   getAdminPrivacy,
//   updatePrivacy,
//   resetPrivacy,
//   getRawData,
//   getAdminPrivacyAll
// };



const Privacy = require('../models/Privacy');

// ============================================================
// HELPERS
// ============================================================

const generateSectionId = () => Math.floor(Math.random() * 1000);

// ============================================================
// PUBLIC — GET /api/privacy
// ============================================================

const getPublicPrivacy = async (req, res) => {
  try {
    let privacy = await Privacy.findOne({ isActive: true });
    if (!privacy) privacy = await createDefaultPrivacy();

    const activeSections = privacy.sections.filter((s) => s.isActive !== false);

    res.json({
      success: true,
      data: {
        heroTitle: privacy.heroTitle,
        heroSubtitle: privacy.heroSubtitle,
        heroDescription: privacy.heroDescription,
        heroImage: privacy.heroImage || '/images/contact-hero.jpg',
        ctaImage: privacy.ctaImage || '/images/cta-bg.jpg',
        introText: privacy.introText,
        sections: activeSections.sort((a, b) => a.displayOrder - b.displayOrder),
        quickInfo:
          privacy.quickInfo || {
            email: 'privacy@nishitascollection.com',
            phone: '+880 1XXXXXXXXX',
            responseTime: 'Within 24 hours',
          },
        lastUpdated: privacy.lastUpdated,
      },
    });
  } catch (error) {
    console.error('Get public privacy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching privacy policy',
    });
  }
};

// ============================================================
// ADMIN — GET /api/admin/privacy
// ============================================================

const getAdminPrivacy = async (req, res) => {
  try {
    let privacy = await Privacy.findOne();
    if (!privacy) privacy = await createDefaultPrivacy();

    const sortedSections = privacy.sections.sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );
    privacy.sections = sortedSections;

    res.json({ success: true, data: privacy });
  } catch (error) {
    console.error('Get admin privacy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching privacy policy',
    });
  }
};

// ============================================================
// ADMIN — PUT /api/admin/privacy
// ============================================================

const updatePrivacy = async (req, res) => {
  try {
    let privacy = await Privacy.findOne();
    if (!privacy) privacy = await createDefaultPrivacy();

    const {
      heroTitle, heroSubtitle, heroDescription,
      heroImage, ctaImage, introText, sections,
      quickInfo, lastUpdated, isActive,
    } = req.body;

    if (heroTitle)       privacy.heroTitle = heroTitle;
    if (heroSubtitle)    privacy.heroSubtitle = heroSubtitle;
    if (heroDescription) privacy.heroDescription = heroDescription;
    if (heroImage)       privacy.heroImage = heroImage;
    if (ctaImage)        privacy.ctaImage = ctaImage;
    if (introText)       privacy.introText = introText;
    if (quickInfo)       privacy.quickInfo = quickInfo;
    if (lastUpdated)     privacy.lastUpdated = lastUpdated;
    if (isActive !== undefined) privacy.isActive = isActive;

    if (sections && Array.isArray(sections)) {
      privacy.sections = sections.map((section, index) => ({
        id: section.id || generateSectionId(),
        title: section.title || 'Untitled Section',
        icon: section.icon || 'FaShieldAlt',
        description: section.description || '',
        details: section.details || [],
        isActive: section.isActive !== undefined ? Boolean(section.isActive) : true,
        displayOrder: section.displayOrder !== undefined ? section.displayOrder : index,
      }));
    }

    privacy.updatedBy = req.user?.id || req.user?._id;
    await privacy.save();

    const updatedPrivacy = await Privacy.findById(privacy._id);

    res.json({
      success: true,
      data: updatedPrivacy,
      message: 'Privacy policy updated successfully',
    });
  } catch (error) {
    console.error('Update privacy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating privacy policy',
    });
  }
};

// ============================================================
// ADMIN — POST /api/admin/privacy/reset
// ============================================================

const resetPrivacy = async (req, res) => {
  try {
    console.log('⚠️ RESETTING PRIVACY POLICY TO DEFAULT');
    await Privacy.deleteMany({});
    const privacy = await createDefaultPrivacy();

    res.json({
      success: true,
      data: privacy,
      message: 'Privacy policy reset to default successfully',
    });
  } catch (error) {
    console.error('Reset privacy error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting privacy policy',
    });
  }
};

// ============================================================
// ADMIN — GET raw data
// ============================================================

const getRawData = async (req, res) => {
  try {
    const privacy = await Privacy.findOne().lean();
    if (!privacy) {
      return res.status(404).json({ success: false, error: 'No privacy data found' });
    }
    res.json({ success: true, data: privacy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — GET /api/admin/privacy/all
// ============================================================

const getAdminPrivacyAll = async (req, res) => {
  try {
    let privacy = await Privacy.findOne();
    if (!privacy) privacy = await createDefaultPrivacy();

    const allSections = privacy.sections.map((s) => ({
      ...(s.toObject ? s.toObject() : s),
      isActive: s.isActive,
    }));

    const sortedSections = allSections.sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );

    res.json({
      success: true,
      data: {
        sections: sortedSections,
        heroTitle: privacy.heroTitle,
        heroSubtitle: privacy.heroSubtitle,
        heroDescription: privacy.heroDescription,
        heroImage: privacy.heroImage || '/images/contact-hero.jpg',
        ctaImage: privacy.ctaImage || '/images/cta-bg.jpg',
        introText: privacy.introText,
        quickInfo:
          privacy.quickInfo || {
            email: 'privacy@nishitascollection.com',
            phone: '+880 1XXXXXXXXX',
            responseTime: 'Within 24 hours',
          },
        lastUpdated: privacy.lastUpdated,
        isActive: privacy.isActive,
        _id: privacy._id,
        updatedBy: privacy.updatedBy,
        createdAt: privacy.createdAt,
        updatedAt: privacy.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get admin privacy all error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching privacy policy',
    });
  }
};

// ============================================================
// DEFAULT PRIVACY — Nishita's Creation
// ============================================================

const createDefaultPrivacy = async () => {
  const defaultPrivacy = {
    heroTitle: 'Your Privacy',
    heroSubtitle: 'Matters to Us',
    heroDescription:
      'We are committed to protecting your personal data and being transparent about how we collect, use, and safeguard your information.',
    heroImage: '/images/contact-hero.jpg',
    ctaImage: '/images/cta-bg.jpg',
    introText:
      "Welcome to Nishita's Creation. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.",
    sections: [
      {
        id: 1,
        title: 'Information We Collect',
        icon: 'FaUsers',
        description:
          'We collect information to process orders, deliver your purchases, and improve our services to you.',
        details: [
          'Name, email address, phone number, and shipping/billing address',
          'Payment information (processed securely through our payment partners)',
          'IP address, browser type, device information, and usage data',
          'Cookies and similar tracking technologies',
        ],
        isActive: true,
        displayOrder: 0,
      },
      {
        id: 2,
        title: 'How We Use Your Information',
        icon: 'FaEye',
        description:
          'Your data helps us serve you better, fulfill your orders, and improve your experience on our platform.',
        details: [
          'Process and fulfill your orders and deliveries',
          'Communicate with you about orders, new collections, and artisan stories',
          'Improve our website, products, and customer service',
          'Prevent fraud and ensure the security of our platform',
          'Comply with legal obligations and regulatory requirements',
        ],
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 3,
        title: 'Data Sharing & Disclosure',
        icon: 'FaShieldAlt',
        description:
          'We respect your privacy and limit data sharing to trusted partners.',
        details: [
          'We never sell or rent your personal data to third parties',
          'Share data with trusted service providers (payment processors, delivery partners)',
          'May disclose data when required by law or to protect our rights',
          'Third-party services have their own privacy policies',
        ],
        isActive: true,
        displayOrder: 2,
      },
      {
        id: 4,
        title: 'Data Security',
        icon: 'FaLock',
        description:
          'We implement industry-standard security measures to protect your data.',
        details: [
          'SSL encryption for all data transmission',
          'Regular security audits and vulnerability assessments',
          'Access controls and authentication measures',
          'Secure data storage with industry-standard practices',
        ],
        isActive: true,
        displayOrder: 3,
      },
      {
        id: 5,
        title: 'Cookies & Tracking',
        icon: 'FaCookie',
        description:
          'We use cookies to enhance your browsing experience.',
        details: [
          'Essential cookies for site functionality',
          'Analytics cookies to understand user behavior',
          'Preference cookies to remember your settings',
          'You can manage cookie preferences in your browser settings',
        ],
        isActive: true,
        displayOrder: 4,
      },
      {
        id: 6,
        title: 'Your Rights',
        icon: 'FaExclamationTriangle',
        description:
          'You have full control over your personal data.',
        details: [
          'Access, correct, or delete your personal data',
          'Withdraw consent for marketing communications',
          'Request data portability',
          'Lodge a complaint with data protection authorities',
        ],
        isActive: true,
        displayOrder: 5,
      },
    ],
    quickInfo: {
      email: 'privacy@nishitascollection.com',
      phone: '+880 1XXXXXXXXX',
      responseTime: 'Within 24 hours',
    },
    isActive: true,
  };

  return await Privacy.create(defaultPrivacy);
};

module.exports = {
  getPublicPrivacy,
  getAdminPrivacy,
  updatePrivacy,
  resetPrivacy,
  getRawData,
  getAdminPrivacyAll,
};