// backend/src/controllers/trustResultsController.js
const TrustResults = require('../models/TrustResults');

// ============================================================
// PUBLIC ROUTES
// ============================================================

const getPublicTrustResults = async (req, res) => {
  try {
    let data = await TrustResults.findOne({ isActive: true });
    
    if (!data) {
      data = await createDefaultTrustResults();
    }

    // Filter active items
    const activeProducts = data.featuredProducts?.filter(p => p.isActive !== false) || [];
    const activeTrustFeatures = data.trustFeatures?.filter(t => t.isActive !== false) || [];
    const activeTestimonials = data.testimonials?.filter(t => t.isActive !== false) || [];

    res.json({
      success: true,
      data: {
        sectionTitle: data.sectionTitle || 'TRUSTED BY THOUSANDS',
        mainHeading: data.mainHeading || 'REAL RESULTS. REAL CONFIDENCE.',
        featuredProducts: activeProducts.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
        trustFeatures: activeTrustFeatures.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
        testimonials: activeTestimonials.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
        testimonialsTitle: data.testimonialsTitle || 'LOVED BY OUR COMMUNITY'
      }
    });
  } catch (error) {
    console.error('Get public trust results error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching trust results'
    });
  }
};

// ============================================================
// ADMIN ROUTES
// ============================================================

const getAdminTrustResults = async (req, res) => {
  try {
    let data = await TrustResults.findOne();
    
    if (!data) {
      data = await createDefaultTrustResults();
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Get admin trust results error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching trust results'
    });
  }
};

const updateTrustResults = async (req, res) => {
  try {
    let data = await TrustResults.findOne();
    
    if (!data) {
      data = await createDefaultTrustResults();
    }

    const {
      sectionTitle,
      mainHeading,
      featuredProducts,
      trustFeatures,
      testimonials,
      testimonialsTitle,
      isActive
    } = req.body;

    if (sectionTitle !== undefined) data.sectionTitle = sectionTitle;
    if (mainHeading !== undefined) data.mainHeading = mainHeading;
    if (featuredProducts !== undefined) data.featuredProducts = featuredProducts;
    if (trustFeatures !== undefined) data.trustFeatures = trustFeatures;
    if (testimonials !== undefined) data.testimonials = testimonials;
    if (testimonialsTitle !== undefined) data.testimonialsTitle = testimonialsTitle;
    if (isActive !== undefined) data.isActive = isActive;

    data.updatedBy = req.user.id;
    await data.save();

    const updatedData = await TrustResults.findById(data._id);

    res.json({
      success: true,
      data: updatedData,
      message: 'Trust results updated successfully'
    });
  } catch (error) {
    console.error('Update trust results error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating trust results'
    });
  }
};

const resetTrustResults = async (req, res) => {
  try {
    await TrustResults.deleteMany({});
    const data = await createDefaultTrustResults();

    res.json({
      success: true,
      data: data,
      message: 'Trust results reset to default successfully'
    });
  } catch (error) {
    console.error('Reset trust results error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting trust results'
    });
  }
};

// ============================================================
// CREATE DEFAULT DATA
// ============================================================

const createDefaultTrustResults = async () => {
  const defaultData = {
    sectionTitle: 'TRUSTED BY THOUSANDS',
    mainHeading: 'REAL RESULTS. REAL CONFIDENCE.',
    
    featuredProducts: [
      {
        productName: 'Radiance Face Serum',
        image: '/images/products/radiance-serum.png',
        link: '/products',
        stats: [
          { value: '92%', text: 'saw brighter skin' },
          { value: '91%', text: 'noticed smoother texture' },
          { value: '89%', text: 'felt more confident in their skin' }
        ],
        beforeAfter: {
          beforeImage: '/images/results-before.jpg',
          afterImage: '/images/results-after.jpg',
          beforeLabel: 'BEFORE',
          afterLabel: 'AFTER 4 WEEKS'
        },
        displayOrder: 0,
        isActive: true
      },
      {
        productName: 'Nourishing Night Cream',
        image: '/images/products/night-cream.png',
        link: '/products',
        stats: [
          { value: '95%', text: 'woke up with hydrated skin' },
          { value: '88%', text: 'reduced fine lines' },
          { value: '93%', text: 'felt more rested' }
        ],
        beforeAfter: {
          beforeImage: '/images/results-before-2.jpg',
          afterImage: '/images/results-after-2.jpg',
          beforeLabel: 'BEFORE',
          afterLabel: 'AFTER 4 WEEKS'
        },
        displayOrder: 1,
        isActive: true
      },
      {
        productName: 'Revitalizing Eye Cream',
        image: '/images/products/eye-cream.png',
        link: '/products',
        stats: [
          { value: '90%', text: 'reduced dark circles' },
          { value: '87%', text: 'looked more awake' },
          { value: '94%', text: 'felt confident without makeup' }
        ],
        beforeAfter: {
          beforeImage: '/images/results-before-3.jpg',
          afterImage: '/images/results-after-3.jpg',
          beforeLabel: 'BEFORE',
          afterLabel: 'AFTER 4 WEEKS'
        },
        displayOrder: 2,
        isActive: true
      }
    ],
    
    trustFeatures: [
      { icon: 'ShieldCheck', title: 'DERMATOLOGIST TESTED', displayOrder: 0, isActive: true },
      { icon: 'FlaskConical', title: 'CLINICALLY PROVEN', displayOrder: 1, isActive: true },
      { icon: 'Leaf', title: 'CLEAN & NON-TOXIC', displayOrder: 2, isActive: true },
      { icon: 'HeartHandshake', title: 'CRUELTY FREE', displayOrder: 3, isActive: true },
      { icon: 'Heart', title: 'MADE WITH LOVE', displayOrder: 4, isActive: true }
    ],
    
    testimonials: [
      {
        name: 'Jessica M.',
        image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop',
        review: '"My skin has never looked better!"',
        description: '"The Radiance Serum is a game changer."',
        rating: 5,
        displayOrder: 0,
        isActive: true
      },
      {
        name: 'Priya R.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop',
        review: '"I love how gentle yet effective"',
        description: '"these products are. Highly recommend!"',
        rating: 5,
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Emily T.',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
        review: '"Luminous, clean, and results-driven."',
        description: '"Lumine is now my go-to skincare."',
        rating: 5,
        displayOrder: 2,
        isActive: true
      }
    ],
    
    testimonialsTitle: 'LOVED BY OUR COMMUNITY',
    isActive: true
  };

  return await TrustResults.create(defaultData);
};

module.exports = {
  getPublicTrustResults,
  getAdminTrustResults,
  updateTrustResults,
  resetTrustResults
};