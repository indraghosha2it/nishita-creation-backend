

// // backend/src/controllers/termsController.js
// const Terms = require('../models/Terms');

// // Helper: Generate section ID
// const generateSectionId = () => {
//   return Math.floor(Math.random() * 1000);
// };

// // @desc    Get terms (public)
// // @route   GET /api/terms
// // @access  Public
// const getPublicTerms = async (req, res) => {
//   try {
//     let terms = await Terms.findOne({ isActive: true });
    
//     if (!terms) {
//       terms = await createDefaultTerms();
//     }

//     // ONLY show active sections to the public
//     const activeSections = terms.sections.filter(section => section.isActive !== false);
    
//     res.json({
//       success: true,
//       data: {
//         heroTitle: terms.heroTitle || 'Terms & Conditions',
//         heroDescription: terms.heroDescription || 'Please read these terms carefully before using our website and services.',
//         introText: terms.introText || 'Welcome to BeautyBucket. These Terms & Conditions govern your use of our website and services.',
//         heroImage: terms.heroImage || '/images/bg10.jpg',
//         ctaImage: terms.ctaImage || '/images/pattern.png',
//         sections: activeSections.sort((a, b) => a.displayOrder - b.displayOrder),
//         lastUpdated: terms.lastUpdated || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
//       }
//     });
//   } catch (error) {
//     console.error('Get public terms error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching terms'
//     });
//   }
// };

// // @desc    Get terms (admin) - SHOW ALL SECTIONS
// // @route   GET /api/admin/terms
// // @access  Private (Admin/Moderator)
// const getAdminTerms = async (req, res) => {
//   try {
//     let terms = await Terms.findOne();
    
//     if (!terms) {
//       terms = await createDefaultTerms();
//     }

//     const sortedSections = terms.sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
//     terms.sections = sortedSections;

//     res.json({
//       success: true,
//       data: terms
//     });
//   } catch (error) {
//     console.error('Get admin terms error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching terms'
//     });
//   }
// };

// // @desc    Update terms
// // @route   PUT /api/admin/terms
// // @access  Private (Admin/Moderator)
// const updateTerms = async (req, res) => {
//   try {
//     let terms = await Terms.findOne();
    
//     if (!terms) {
//       terms = await createDefaultTerms();
//     }

//     const { 
//       heroTitle, 
//       heroDescription, 
//       introText,
//       heroImage,
//       ctaImage,
//       sections, 
//       lastUpdated,
//       isActive 
//     } = req.body;

//     if (heroTitle) terms.heroTitle = heroTitle;
//     if (heroDescription) terms.heroDescription = heroDescription;
//     if (introText) terms.introText = introText;
//     if (heroImage) terms.heroImage = heroImage;
//     if (ctaImage) terms.ctaImage = ctaImage;
//     if (lastUpdated) terms.lastUpdated = lastUpdated;
//     if (isActive !== undefined) terms.isActive = isActive;

//     if (sections && Array.isArray(sections)) {
//       const processedSections = sections.map((section, index) => {
//         const isActiveValue = section.isActive !== undefined ? Boolean(section.isActive) : true;
        
//         return {
//           id: section.id || generateSectionId(),
//           title: section.title || 'Untitled Section',
//           icon: section.icon || 'FaFileContract',
//           description: section.description || '',
//           details: section.details || [],
//           isActive: isActiveValue,
//           displayOrder: section.displayOrder !== undefined ? section.displayOrder : index
//         };
//       });
      
//       terms.sections = processedSections;
//     }

//     terms.updatedBy = req.user.id;
//     await terms.save();

//     const updatedTerms = await Terms.findById(terms._id);
    
//     res.json({
//       success: true,
//       data: updatedTerms,
//       message: 'Terms updated successfully'
//     });
//   } catch (error) {
//     console.error('Update terms error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating terms'
//     });
//   }
// };

// // @desc    Reset terms to default
// // @route   POST /api/admin/terms/reset
// // @access  Private (Admin)
// const resetTerms = async (req, res) => {
//   try {
//     console.log('⚠️ RESETTING TERMS TO DEFAULT');
//     await Terms.deleteMany({});
//     const terms = await createDefaultTerms();

//     res.json({
//       success: true,
//       data: terms,
//       message: 'Terms reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset terms error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting terms'
//     });
//   }
// };

// // @desc    Get raw database data
// // @route   GET /api/admin/terms/raw-data
// // @access  Private (Admin)
// const getRawData = async (req, res) => {
//   try {
//     const terms = await Terms.findOne().lean();
    
//     if (!terms) {
//       return res.status(404).json({
//         success: false,
//         error: 'No terms data found'
//       });
//     }

//     res.json({
//       success: true,
//       data: terms
//     });
//   } catch (error) {
//     console.error('Error getting raw data:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get terms (admin) - FORCED ALL SECTIONS
// // @route   GET /api/admin/terms/all
// // @access  Private (Admin/Moderator)
// const getAdminTermsAll = async (req, res) => {
//   try {
//     let terms = await Terms.findOne();
    
//     if (!terms) {
//       terms = await createDefaultTerms();
//     }

//     const allSections = terms.sections.map(s => ({
//       ...s.toObject ? s.toObject() : s,
//       isActive: s.isActive
//     }));

//     const sortedSections = allSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

//     res.json({
//       success: true,
//       data: {
//         sections: sortedSections,
//         heroTitle: terms.heroTitle,
//         heroDescription: terms.heroDescription,
//         introText: terms.introText,
//         heroImage: terms.heroImage || '/images/bg10.jpg',
//         ctaImage: terms.ctaImage || '/images/pattern.png',
//         lastUpdated: terms.lastUpdated,
//         isActive: terms.isActive,
//         _id: terms._id,
//         updatedBy: terms.updatedBy,
//         createdAt: terms.createdAt,
//         updatedAt: terms.updatedAt
//       }
//     });
//   } catch (error) {
//     console.error('Get admin terms all error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching terms'
//     });
//   }
// };

// // @desc    Create default terms - BEAUTY BUCKET with images
// const createDefaultTerms = async () => {
//   const defaultTerms = {
//     heroTitle: 'Terms & Conditions',
//     heroDescription: 'Please read these terms carefully before using our website and services. By accessing our platform, you agree to be bound by these terms.',
//     introText: 'Welcome to BeautyBucket. These Terms & Conditions ("Terms") govern your use of the BeautyBucket website, mobile application, and all related services (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.',
//     heroImage: '/images/bg10.jpg',
//     ctaImage: '/images/pattern.png',
//     lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
//     sections: [
//       {
//         id: 1,
//         title: 'Acceptance of Terms',
//         icon: 'FaFileContract',
//         description: 'By using BeautyBucket\'s website and services, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use our services.',
//         details: [
//           'These terms apply to all users of the BeautyBucket platform',
//           'By placing an order, you accept these terms in full',
//           'We reserve the right to update these terms at any time',
//           'Continued use constitutes acceptance of updated terms'
//         ],
//         isActive: true,
//         displayOrder: 0
//       },
//       {
//         id: 2,
//         title: 'Products & Services',
//         icon: 'FaShoppingBag',
//         description: 'BeautyBucket offers premium beauty products sourced from trusted brands and verified for authenticity.',
//         details: [
//           'All products are 100% authentic and sourced from authorized distributors',
//           'Product descriptions and images are for illustrative purposes',
//           'We reserve the right to modify or discontinue products at any time',
//           'Prices are subject to change without prior notice'
//         ],
//         isActive: true,
//         displayOrder: 1
//       },
//       {
//         id: 3,
//         title: 'Orders & Payments',
//         icon: 'FaCreditCard',
//         description: 'Orders are processed securely with multiple payment options including Cash on Delivery (COD) and online payments.',
//         details: [
//           'All orders are subject to acceptance and availability',
//           'Payment must be completed before order processing',
//           'Cash on Delivery is available for eligible areas',
//           'Online payments are processed through secure gateways'
//         ],
//         isActive: true,
//         displayOrder: 2
//       },
//       {
//         id: 4,
//         title: 'Delivery & Shipping',
//         icon: 'FaTruck',
//         description: 'We deliver across Bangladesh with fast and reliable shipping services.',
//         details: [
//           'Delivery times vary by location and product availability',
//           'Shipping fees are calculated at checkout',
//           'Free shipping is available for orders over ৳3000',
//           'Tracking information is provided for all shipped orders'
//         ],
//         isActive: true,
//         displayOrder: 3
//       },
//       {
//         id: 5,
//         title: 'Returns & Refunds',
//         icon: 'FaHands',
//         description: 'Customer satisfaction is our priority. We recommend inspecting your products upon delivery to ensure everything meets your expectations.',
//         details: [
//           'Please inspect the product in front of the delivery person upon arrival',
//           'If you find any issues, you can refuse delivery or request an immediate return',
//           'For issues noticed after delivery, contact us within 24 hours',
//           'All return/refund requests must be submitted within 7 days of delivery',
//           'Products must be unused, unopened, and in original packaging',
//           'Refunds are processed within 7–10 business days after verification'
//         ],
//         isActive: true,
//         displayOrder: 4
//       },
//       {
//         id: 6,
//         title: 'User Accounts',
//         icon: 'FaUserShield',
//         description: 'Creating an account with BeautyBucket provides you with a personalized shopping experience.',
//         details: [
//           'You are responsible for maintaining account security',
//           'Provide accurate and complete registration information',
//           'Notify us immediately of any unauthorized use',
//           'We reserve the right to suspend accounts for violations'
//         ],
//         isActive: true,
//         displayOrder: 5
//       },
//       {
//         id: 7,
//         title: 'Privacy & Data Protection',
//         icon: 'FaLock',
//         description: 'Your privacy is important to us. We protect your personal information in accordance with our Privacy Policy.',
//         details: [
//           'We collect minimal personal data necessary for order processing',
//           'Your data is never shared with third parties without consent',
//           'SSL encryption protects all transactions',
//           'You may request data deletion at any time'
//         ],
//         isActive: true,
//         displayOrder: 6
//       },
//       {
//         id: 8,
//         title: 'Intellectual Property',
//         icon: 'FaBalanceScale',
//         description: 'All content on BeautyBucket including logos, images, and text is protected by copyright.',
//         details: [
//           'Content is owned by BeautyBucket and its licensors',
//           'You may not reproduce, modify, or distribute our content',
//           'Trademarks and logos are protected by law',
//           'Unauthorized use may result in legal action'
//         ],
//         isActive: true,
//         displayOrder: 7
//       },
//       {
//         id: 9,
//         title: 'Limitation of Liability',
//         icon: 'FaExclamationTriangle',
//         description: 'BeautyBucket is not liable for any indirect, incidental, or consequential damages.',
//         details: [
//           'We are not responsible for third-party service interruptions',
//           'Product descriptions are provided "as is" without warranties',
//           'We are not liable for any damages exceeding the order value',
//           'Users agree to indemnify BeautyBucket for any violations'
//         ],
//         isActive: true,
//         displayOrder: 8
//       }
//     ],
//     isActive: true
//   };

//   return await Terms.create(defaultTerms);
// };

// module.exports = {
//   getPublicTerms,
//   getAdminTerms,
//   updateTerms,
//   resetTerms,
//   getRawData,
//   getAdminTermsAll
// };


const Terms = require('../models/Terms');

// ============================================================
// HELPERS
// ============================================================

const generateSectionId = () => Math.floor(Math.random() * 1000);

// ============================================================
// PUBLIC — GET /api/terms
// ============================================================

const getPublicTerms = async (req, res) => {
  try {
    let terms = await Terms.findOne({ isActive: true });
    if (!terms) terms = await createDefaultTerms();

    const activeSections = terms.sections.filter((s) => s.isActive !== false);

    res.json({
      success: true,
      data: {
        heroTitle: terms.heroTitle || 'Terms & Conditions',
        heroDescription:
          terms.heroDescription ||
          'Please read these terms carefully before using our website and services.',
        introText:
          terms.introText ||
          "Welcome to Nishita's Creation. These Terms & Conditions govern your use of our website and services.",
        heroImage: terms.heroImage || '/images/contact-hero.jpg',
        ctaImage: terms.ctaImage || '/images/cta-bg.jpg',
        sections: activeSections.sort((a, b) => a.displayOrder - b.displayOrder),
        lastUpdated:
          terms.lastUpdated ||
          new Date().toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          }),
      },
    });
  } catch (error) {
    console.error('Get public terms error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching terms',
    });
  }
};

// ============================================================
// ADMIN — GET /api/terms/admin
// ============================================================

const getAdminTerms = async (req, res) => {
  try {
    let terms = await Terms.findOne();
    if (!terms) terms = await createDefaultTerms();

    const sortedSections = terms.sections.sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
    );
    terms.sections = sortedSections;

    res.json({ success: true, data: terms });
  } catch (error) {
    console.error('Get admin terms error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching terms',
    });
  }
};

// ============================================================
// ADMIN — PUT /api/terms/admin
// ============================================================

const updateTerms = async (req, res) => {
  try {
    let terms = await Terms.findOne();
    if (!terms) terms = await createDefaultTerms();

    const {
      heroTitle, heroDescription, introText,
      heroImage, ctaImage, sections, lastUpdated, isActive,
    } = req.body;

    if (heroTitle)       terms.heroTitle = heroTitle;
    if (heroDescription) terms.heroDescription = heroDescription;
    if (introText)       terms.introText = introText;
    if (heroImage)       terms.heroImage = heroImage;
    if (ctaImage)        terms.ctaImage = ctaImage;
    if (lastUpdated)     terms.lastUpdated = lastUpdated;
    if (isActive !== undefined) terms.isActive = isActive;

    if (sections && Array.isArray(sections)) {
      terms.sections = sections.map((section, index) => ({
        id: section.id || generateSectionId(),
        title: section.title || 'Untitled Section',
        icon: section.icon || 'FaFileContract',
        description: section.description || '',
        details: section.details || [],
        isActive: section.isActive !== undefined ? Boolean(section.isActive) : true,
        displayOrder: section.displayOrder !== undefined ? section.displayOrder : index,
      }));
    }

    terms.updatedBy = req.user?.id || req.user?._id;
    await terms.save();

    const updatedTerms = await Terms.findById(terms._id);
    res.json({ success: true, data: updatedTerms, message: 'Terms updated successfully' });
  } catch (error) {
    console.error('Update terms error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating terms',
    });
  }
};

// ============================================================
// ADMIN — POST /api/terms/admin/reset
// ============================================================

const resetTerms = async (req, res) => {
  try {
    console.log('⚠️ RESETTING TERMS TO DEFAULT');
    await Terms.deleteMany({});
    const terms = await createDefaultTerms();
    res.json({ success: true, data: terms, message: 'Terms reset to default successfully' });
  } catch (error) {
    console.error('Reset terms error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting terms',
    });
  }
};

// ============================================================
// ADMIN — GET raw data
// ============================================================

const getRawData = async (req, res) => {
  try {
    const terms = await Terms.findOne().lean();
    if (!terms) return res.status(404).json({ success: false, error: 'No terms data found' });
    res.json({ success: true, data: terms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================
// ADMIN — GET /api/terms/admin/all
// ============================================================

const getAdminTermsAll = async (req, res) => {
  try {
    let terms = await Terms.findOne();
    if (!terms) terms = await createDefaultTerms();

    const allSections = terms.sections.map((s) => ({
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
        heroTitle: terms.heroTitle,
        heroDescription: terms.heroDescription,
        introText: terms.introText,
        heroImage: terms.heroImage || '/images/contact-hero.jpg',
        ctaImage: terms.ctaImage || '/images/cta-bg.jpg',
        lastUpdated: terms.lastUpdated,
        isActive: terms.isActive,
        _id: terms._id,
        updatedBy: terms.updatedBy,
        createdAt: terms.createdAt,
        updatedAt: terms.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get admin terms all error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching terms',
    });
  }
};

// ============================================================
// DEFAULT TERMS — Nishita's Creation
// ============================================================

const createDefaultTerms = async () => {
  const defaultTerms = {
    heroTitle: 'Terms & Conditions',
    heroDescription:
      'Please read these terms carefully before using our website and services. By accessing our platform, you agree to be bound by these terms.',
    introText:
      "Welcome to Nishita's Creation. These Terms & Conditions (\"Terms\") govern your use of the Nishita's Creation website, mobile application, and all related services (collectively, the \"Platform\"). By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Platform.",
    heroImage: '/images/contact-hero.jpg',
    ctaImage: '/images/cta-bg.jpg',
    lastUpdated: new Date().toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }),
    sections: [
      {
        id: 1,
        title: 'Acceptance of Terms',
        icon: 'FaFileContract',
        description:
          "By using Nishita's Creation website and services, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use our services.",
        details: [
          "These terms apply to all users of the Nishita's Creation platform",
          'By placing an order, you accept these terms in full',
          'We reserve the right to update these terms at any time',
          'Continued use constitutes acceptance of updated terms',
        ],
        isActive: true,
        displayOrder: 0,
      },
      {
        id: 2,
        title: 'Products & Craftsmanship',
        icon: 'FaShoppingBag',
        description:
          "Nishita's Creation offers handcrafted clothing inspired by Bangladeshi heritage — including blockprint, appliqué, and Jessore handwork.",
        details: [
          'Every piece is handcrafted; slight variations are natural and celebrated',
          'Product images are for illustrative purposes and may vary slightly from the actual product',
          'We reserve the right to modify or discontinue designs at any time',
          'Prices are subject to change without prior notice',
        ],
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 3,
        title: 'Orders & Payments',
        icon: 'FaCreditCard',
        description:
          'Orders are processed securely with multiple payment options including Cash on Delivery (COD) and online payments.',
        details: [
          'All orders are subject to acceptance and availability',
          'Payment must be completed before order processing',
          'Cash on Delivery is available for eligible areas',
          'Online payments are processed through secure gateways',
        ],
        isActive: true,
        displayOrder: 2,
      },
      {
        id: 4,
        title: 'Delivery & Shipping',
        icon: 'FaTruck',
        description:
          'We deliver across Bangladesh with fast and reliable shipping services.',
        details: [
          'Delivery times vary by location and product availability',
          'Shipping fees are calculated at checkout',
          'Free shipping is available for orders over ৳3000',
          'Tracking information is provided for all shipped orders',
        ],
        isActive: true,
        displayOrder: 3,
      },
      {
        id: 5,
        title: 'Returns & Refunds',
        icon: 'FaHands',
        description:
          'Customer satisfaction is our priority. Please inspect your order upon delivery to ensure everything meets your expectations.',
        details: [
          'Please inspect the product in front of the delivery person upon arrival',
          'If you find any issues, you may refuse delivery or request an immediate return',
          'For issues noticed after delivery, contact us within 24 hours',
          'All return/refund requests must be submitted within 7 days of delivery',
          'Products must be unused, unwashed, and in original packaging',
          'Refunds are processed within 7–10 business days after verification',
        ],
        isActive: true,
        displayOrder: 4,
      },
      {
        id: 6,
        title: 'User Accounts',
        icon: 'FaUserShield',
        description:
          "Creating an account with Nishita's Creation provides you with a personalized shopping experience.",
        details: [
          'You are responsible for maintaining account security',
          'Provide accurate and complete registration information',
          'Notify us immediately of any unauthorized use',
          'We reserve the right to suspend accounts for violations',
        ],
        isActive: true,
        displayOrder: 5,
      },
      {
        id: 7,
        title: 'Privacy & Data Protection',
        icon: 'FaLock',
        description:
          'Your privacy is important to us. We protect your personal information in accordance with our Privacy Policy.',
        details: [
          'We collect minimal personal data necessary for order processing',
          'Your data is never shared with third parties without consent',
          'SSL encryption protects all transactions',
          'You may request data deletion at any time',
        ],
        isActive: true,
        displayOrder: 6,
      },
      {
        id: 8,
        title: 'Intellectual Property',
        icon: 'FaBalanceScale',
        description:
          "All content on Nishita's Creation — including logos, images, designs, and text — is protected by copyright.",
        details: [
          "Content is owned by Nishita's Creation and its licensors",
          'You may not reproduce, modify, or distribute our content',
          'Trademarks and logos are protected by law',
          'Unauthorized use may result in legal action',
        ],
        isActive: true,
        displayOrder: 7,
      },
      {
        id: 9,
        title: 'Limitation of Liability',
        icon: 'FaExclamationTriangle',
        description:
          "Nishita's Creation is not liable for any indirect, incidental, or consequential damages.",
        details: [
          'We are not responsible for third-party service interruptions',
          'Product descriptions are provided "as is" without warranties',
          'We are not liable for any damages exceeding the order value',
          "Users agree to indemnify Nishita's Creation for any violations",
        ],
        isActive: true,
        displayOrder: 8,
      },
    ],
    isActive: true,
  };

  return await Terms.create(defaultTerms);
};

module.exports = {
  getPublicTerms,
  getAdminTerms,
  updateTerms,
  resetTerms,
  getRawData,
  getAdminTermsAll,
};