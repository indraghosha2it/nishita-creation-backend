// backend/src/controllers/whyChooseUsController.js
const WhyChooseUs = require('../models/WhyChooseUs');

// ============================================================
// DEFAULT DATA
// ============================================================

const getDefaultData = () => ({
  section: {
    badge: 'Why Choose Us',
    title: 'Why Choose Us',
    subtitle: 'Discover why thousands of beauty enthusiasts trust us for their skincare and makeup needs'
  },
  cards: [
    {
      icon: 'Shield',
      title: '100% Authentic',
      description: 'Premium quality products sourced directly from trusted brands',
      side: 'left',
      displayOrder: 0,
      isActive: true
    },
    {
      icon: 'Truck',
      title: 'Fast Delivery',
      description: 'Free shipping on orders above ৳500 with express delivery options',
      side: 'left',
      displayOrder: 1,
      isActive: true
    },
    {
      icon: 'Leaf',
      title: 'Cruelty-Free',
      description: 'We only stock products that are ethically sourced and tested',
      side: 'left',
      displayOrder: 2,
      isActive: true
    },
    {
      icon: 'Award',
      title: 'Curated Selection',
      description: 'Handpicked beauty products by our expert team of professionals',
      side: 'left',
      displayOrder: 3,
      isActive: true
    },
    {
      icon: 'Star',
      title: 'Trusted Reviews',
      description: 'Real customer reviews to help you make the right choice',
      side: 'right',
      displayOrder: 4,
      isActive: true
    },
    {
      icon: 'Heart',
      title: 'Love Your Skin',
      description: 'Formulated with natural ingredients for sensitive skin. Enriched with soothing botanicals',
      side: 'right',
      displayOrder: 5,
      isActive: true
    },
    {
      icon: 'Clock',
      title: '24/7 Support',
      description: 'Dedicated customer care team ready to assist you anytime',
      side: 'right',
      displayOrder: 6,
      isActive: true
    },
    {
      icon: 'Gift',
      title: 'Loyalty Rewards',
      description: 'Earn points and unlock exclusive deals with every purchase',
      side: 'right',
      displayOrder: 7,
      isActive: true
    }
  ],
  centerImage: '/images/choose.jpg',
  trustBadges: [
    {
      icon: 'ThumbsUp',
      label: 'Trusted by 10k+ Customers',
      isActive: true
    },
    {
      icon: 'CheckCircle2',
      label: '100% Satisfaction Guaranteed',
      isActive: true
    },
    {
      icon: 'Crown',
      label: 'Premium Quality Products',
      isActive: true
    }
  ],
  isActive: true
});

// ============================================================
// HELPERS
// ============================================================

const createDefault = async () => {
  return await WhyChooseUs.create(getDefaultData());
};

// ============================================================
// PUBLIC ROUTES
// ============================================================

// @desc    Get public Why Choose Us data
// @route   GET /api/why-choose-us/public
// @access  Public
const getPublicWhyChooseUs = async (req, res) => {
  try {
    let data = await WhyChooseUs.findOne({ isActive: true });
    
    if (!data) {
      data = await createDefault();
    }

    // Filter active cards
    const activeCards = data.cards?.filter(c => c.isActive !== false) || [];
    
    // Split into left and right
    const leftCards = activeCards
      .filter(c => c.side === 'left')
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    const rightCards = activeCards
      .filter(c => c.side === 'right')
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Filter active trust badges
    const activeBadges = data.trustBadges?.filter(b => b.isActive !== false) || [];

    res.json({
      success: true,
      data: {
        section: data.section || getDefaultData().section,
        leftCards,
        rightCards,
        centerImage: data.centerImage || '/images/choose.jpg',
        trustBadges: activeBadges
      }
    });
  } catch (error) {
    console.error('Get public why choose us error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching data'
    });
  }
};

// ============================================================
// ADMIN ROUTES
// ============================================================

// @desc    Get admin Why Choose Us data
// @route   GET /api/admin/why-choose-us
// @access  Private (Admin/Moderator)
const getAdminWhyChooseUs = async (req, res) => {
  try {
    let data = await WhyChooseUs.findOne();
    
    if (!data) {
      data = await createDefault();
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get admin why choose us error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching data'
    });
  }
};

// @desc    Update Why Choose Us data
// @route   PUT /api/admin/why-choose-us
// @access  Private (Admin/Moderator)
const updateWhyChooseUs = async (req, res) => {
  try {
    let data = await WhyChooseUs.findOne();
    
    if (!data) {
      data = await createDefault();
    }

    const {
      section,
      cards,
      centerImage,
      trustBadges,
      isActive
    } = req.body;

    // Update fields
    if (section) data.section = section;
    if (cards) data.cards = cards;
    if (centerImage) data.centerImage = centerImage;
    if (trustBadges) data.trustBadges = trustBadges;
    if (isActive !== undefined) data.isActive = isActive;

    data.updatedBy = req.user.id;
    await data.save();

    const updatedData = await WhyChooseUs.findById(data._id);

    res.json({
      success: true,
      data: updatedData,
      message: 'Why Choose Us updated successfully'
    });
  } catch (error) {
    console.error('Update why choose us error:', error);
    
    if (error.name === 'ValidationError') {
      const errorMessages = [];
      for (const [path, err] of Object.entries(error.errors)) {
        const fieldName = path.split('.').pop().replace(/([A-Z])/g, ' $1').toLowerCase();
        errorMessages.push(`The "${fieldName}" field is required.`);
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessages.join(' '),
        details: errorMessages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update. Please try again.',
      details: error.message
    });
  }
};

// @desc    Reset Why Choose Us to default
// @route   POST /api/admin/why-choose-us/reset
// @access  Private (Admin/Moderator)
const resetWhyChooseUs = async (req, res) => {
  try {
    console.log('🔄 Resetting Why Choose Us to default by:', req.user?.email, '(Role:', req.user?.role, ')');
    
    await WhyChooseUs.deleteMany({});
    const data = await createDefault();

    res.json({
      success: true,
      data,
      message: 'Why Choose Us reset to default successfully'
    });
  } catch (error) {
    console.error('Reset why choose us error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting'
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getPublicWhyChooseUs,
  getAdminWhyChooseUs,
  updateWhyChooseUs,
  resetWhyChooseUs
};