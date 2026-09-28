

const HomepageSettings = require('../models/HomepageSettings');
const Product = require('../models/Product');

// Helper: Generate unique ID
const generateId = () => `section_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;




// Update getPublicHomepage - REMOVE 'why_choose_us' handling
// const getPublicHomepage = async (req, res) => {
//   try {
//     let settings = await HomepageSettings.findOne();
    
//     if (!settings) {
//       settings = await createDefaultSettings();
//     }

//     // ONLY show active sections to the public
//     const activeSections = settings.sections.filter(section => section.isActive !== false);
    
//     const populatedSections = await Promise.all(
//       activeSections.map(async (section) => {
//         // For 'deals' type
//         if (section.type === 'deals') {
//           return {
//             ...section.toObject(),
//             products: []
//           };
//         }
        
//         // For 'trust_results' type
//         if (section.type === 'trust_results') {
//           return {
//             ...section.toObject(),
//             products: []
//           };
//         }
        
//         if (section.items && section.items.length > 0) {
//           const productIds = section.items.map(item => item.productId);
//           const products = await Product.find({
//             _id: { $in: productIds },
//             isActive: true
//           })
//           .select('productName brand images regularPrice discountPrice stockQuantity tags rating reviewStats slug unit')
//           .populate('category', 'name slug')
//           .populate('tags', 'name image')
//           .lean();
          
//           return {
//             ...section.toObject(),
//             products: products
//           };
//         }
//         return section.toObject();
//       })
//     );

//     const sortedSections = populatedSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

//     res.json({
//       success: true,
//       data: {
//         sections: sortedSections
//       }
//     });
//   } catch (error) {
//     console.error('Get homepage error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching homepage'
//     });
//   }
// };


const getPublicHomepage = async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne();
    
    if (!settings) {
      settings = await createDefaultSettings();
    }

    // ONLY show active sections to the public
    const activeSections = settings.sections.filter(section => section.isActive !== false);
    
    const populatedSections = await Promise.all(
      activeSections.map(async (section) => {
        // For 'deals' type
        if (section.type === 'deals') {
          return {
            ...section.toObject(),
            products: []
          };
        }
        
        // For 'trust_results' type
        if (section.type === 'trust_results') {
          return {
            ...section.toObject(),
            products: []
          };
        }

        // 👇👇👇 ADD IT RIGHT HERE 👇👇👇
        // For 'achievements' type
        if (section.type === 'achievements') {
          return {
            ...section.toObject(),
            products: []
          };
        }

        if (section.type === 'videos') {
  return {
    ...section.toObject(),
    products: []
  };
}
        // 👆👆👆 ADD IT RIGHT HERE 👆👆👆
        
        if (section.items && section.items.length > 0) {
          const productIds = section.items.map(item => item.productId);
          const products = await Product.find({
            _id: { $in: productIds },
            isActive: true
          })
          .select('productName brand images regularPrice discountPrice stockQuantity tags rating reviewStats slug unit')
          .populate('category', 'name slug')
          .populate('tags', 'name image')
          .lean();
          
          return {
            ...section.toObject(),
            products: products
          };
        }
        return section.toObject();
      })
    );

    const sortedSections = populatedSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.json({
      success: true,
      data: {
        sections: sortedSections
      }
    });
  } catch (error) {
    console.error('Get homepage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching homepage'
    });
  }
};




// @access  Private (Admin/Moderator)
const getAdminHomepage = async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne();
    
    if (!settings) {
      settings = await createDefaultSettings();
    }

    // IMPORTANT: DO NOT FILTER - Show ALL sections including inactive
    // Just sort by displayOrder
    const sortedSections = settings.sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    settings.sections = sortedSections;

    console.log('📊 ADMIN API - ALL sections (including inactive):');
    console.log(`Total: ${settings.sections.length} sections`);
    settings.sections.forEach(s => {
      console.log(`  ${s.name}: isActive = ${s.isActive} (${typeof s.isActive})`);
    });

    // Send the response with ALL sections
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get admin homepage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching homepage settings'
    });
  }
};

// @desc    Update homepage settings
// @route   PUT /api/admin/homepage
// @access  Private (Admin/Moderator)
const updateHomepage = async (req, res) => {
  try {
    console.log('📥 Received update request');
    
    let settings = await HomepageSettings.findOne();
    
    if (!settings) {
      settings = await createDefaultSettings();
    }

    const { sections } = req.body;

    if (sections && Array.isArray(sections)) {
      console.log('📊 Sections received from frontend:');
      sections.forEach(s => {
        console.log(`  ${s.name}: isActive = ${s.isActive} (${typeof s.isActive})`);
      });
      
      // Process all sections - preserve isActive values
      const processedSections = sections.map((section, index) => {
        // Keep the exact isActive value from the request
        const isActiveValue = section.isActive !== undefined ? Boolean(section.isActive) : true;
        
        return {
          id: section.id || generateId(),
          name: section.name || 'Unnamed Section',
          type: section.type || 'custom',
          isActive: isActiveValue, // Preserve the value
          displayOrder: section.displayOrder !== undefined ? section.displayOrder : index,
          items: section.items || [],
          customTitle: section.customTitle || '',
          customDescription: section.customDescription || '',
          layout: section.layout || 'grid',
          itemsPerRow: section.itemsPerRow || 5,
          viewAllLink: section.viewAllLink || '/products'
        };
      });
      
      // Replace all sections
      settings.sections = processedSections;
    }

    settings.updatedBy = req.user.id;
    
    // Save with validation
    await settings.save();
    
    // Fetch the updated document
    const updatedSettings = await HomepageSettings.findById(settings._id);
    
    console.log('✅ Saved sections:');
    updatedSettings.sections.forEach(s => {
      console.log(`  ${s.name}: isActive = ${s.isActive}`);
    });

    res.json({
      success: true,
      data: updatedSettings,
      message: 'Homepage updated successfully'
    });
  } catch (error) {
    console.error('❌ Update homepage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating homepage'
    });
  }
};

// @desc    Reset homepage to default
// @route   POST /api/admin/homepage/reset
// @access  Private (Admin)
const resetHomepage = async (req, res) => {
  try {
    console.log('⚠️ RESETTING HOMEPAGE TO DEFAULT');
    await HomepageSettings.deleteOne({});
    const settings = await createDefaultSettings();

    res.json({
      success: true,
      data: settings,
      message: 'Homepage reset to default successfully'
    });
  } catch (error) {
    console.error('Reset homepage error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting homepage'
    });
  }
};

// @desc    Debug homepage data
// @route   GET /api/homepage/debug
// @access  Public
const debugHomepage = async (req, res) => {
  try {
    const settings = await HomepageSettings.findOne();
    
    if (!settings) {
      return res.json({ success: false, error: 'No settings found' });
    }

    const activeSections = settings.sections.filter(s => s.isActive !== false);
    
    res.json({
      success: true,
      data: {
        allSections: settings.sections.map(s => ({ 
          name: s.name, 
          type: s.type,
          isActive: s.isActive,
          displayOrder: s.displayOrder 
        })),
        activeSections: activeSections.map(s => ({ 
          name: s.name, 
          type: s.type,
          isActive: s.isActive,
          displayOrder: s.displayOrder 
        })),
        totalSections: settings.sections.length,
        activeCount: activeSections.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get raw database data (bypass all processing)
// @route   GET /api/admin/homepage/raw-data
// @access  Private (Admin)
const getRawData = async (req, res) => {
  try {
    const settings = await HomepageSettings.findOne().lean();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'No homepage settings found'
      });
    }

    console.log('🔍 RAW DATABASE DATA:');
    console.log('Total sections in DB:', settings.sections.length);
    settings.sections.forEach((s, i) => {
      console.log(`  ${i}. ${s.name}: isActive = ${s.isActive} (${typeof s.isActive})`);
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting raw data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



// backend/src/controllers/homepageController.js - Updated createDefaultSettings (NO BRANDS)

// Update the createDefaultSettings function - REMOVED 'brands', ADDED 'why_choose_us'

// Update createDefaultSettings function - ADD 'deals'
const createDefaultSettings = async () => {
  const defaultSettings = {
    sections: [
      {
        id: generateId(),
        name: 'Hero Banner',
        type: 'hero',
        isActive: true,
        displayOrder: 0,
        items: []
      },
       {
        id: generateId(),
        name: 'Collections',
        type: 'categories',
        isActive: true,
        displayOrder: 1,
        items: []
      },
       {
        id: generateId(),
        name: 'Featured Products',
        type: 'featured',
        isActive: true,
        displayOrder: 2,
        items: []
      },
       {
        id: generateId(),
        name: 'Deals You Can\'t Miss',
        type: 'deals',
        isActive: true,
        displayOrder: 3,
        items: []
      },
      {
        id: generateId(),
        name: 'Big Sale',
        type: 'big_sale',
        isActive: true,
        displayOrder: 4,
        items: []
      },
    
     
  
       {
        id: generateId(),
        name: 'Trust & Results',
        type: 'trust_results',
        isActive: true,
        displayOrder: 5,
        items: []
      },
      {
  id: generateId(),
  name: 'Achievements',
  type: 'achievements',
  isActive: true,
  displayOrder: 6,
  items: []
},
{
  id: generateId(),
  name: 'Videos',
  type: 'videos',
  isActive: true,
  displayOrder: 7,
  items: []
}
     
    ],
    isActive: true
  };

  return await HomepageSettings.create(defaultSettings);
};

// @desc    Get homepage settings (admin) - FORCED ALL SECTIONS
// @route   GET /api/admin/homepage/all
// @access  Private (Admin/Moderator)
const getAdminHomepageAll = async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne();
    
    if (!settings) {
      settings = await createDefaultSettings();
    }

    // Force all sections to be included
    const allSections = settings.sections.map(s => ({
      ...s.toObject ? s.toObject() : s,
      // Ensure isActive is preserved
      isActive: s.isActive
    }));

    // Sort by displayOrder
    const sortedSections = allSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    console.log('📊 ADMIN ALL API - FORCED ALL SECTIONS:');
    console.log(`Total: ${sortedSections.length} sections`);
    sortedSections.forEach(s => {
      console.log(`  ${s.name}: isActive = ${s.isActive} (${typeof s.isActive})`);
    });

    res.json({
      success: true,
      data: {
        sections: sortedSections,
        isActive: settings.isActive,
        _id: settings._id,
        updatedBy: settings.updatedBy,
        createdAt: settings.createdAt,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Get admin homepage all error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching homepage settings'
    });
  }
};

module.exports = {
  getPublicHomepage,
  getAdminHomepage,
  updateHomepage,
  resetHomepage,
  debugHomepage,
  getRawData,
  getAdminHomepageAll
};