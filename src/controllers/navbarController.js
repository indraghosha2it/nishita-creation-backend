
// // backend/src/controllers/navbarController.js
// const Navbar = require('../models/Navbar');

// // ============================================================
// // 1. GET NAVBAR DATA
// // ============================================================

// // @desc    Get navbar data (public)
// // @route   GET /api/navbar
// // @access  Public
// const getPublicNavbar = async (req, res) => {
//   try {
//     let navbar = await Navbar.findOne({ isActive: true });
    
//     if (!navbar) {
//       navbar = await createDefaultNavbar();
//     }

//     const user = req.user;
//     let filteredItems = navbar.items || [];
    
//     if (user) {
//       filteredItems = navbar.items.filter(item => item.isActive !== false);
//     } else {
//       filteredItems = navbar.items.filter(item => 
//         item.isActive !== false && 
//         (item.requiredRole === 'all' || !item.requiredRole)
//       );
//     }

//     filteredItems = filteredItems.sort((a, b) => (a.order || 0) - (b.order || 0));

//     res.json({
//       success: true,
//       data: {
//         items: filteredItems,
//         logo: navbar.logo || {
//           text: 'Smart Gadget',
//           highlightText: 'Gadget',
//           icon: 'Zap',
//           logoUrl: ''
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get public navbar error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching navbar'
//     });
//   }
// };

// // @desc    Get navbar data (admin)
// // @route   GET /api/navbar/admin
// // @access  Private (Admin/Moderator)
// const getAdminNavbar = async (req, res) => {
//   try {
//     console.log('📡 Get admin navbar by:', req.user?.email, '(Role:', req.user?.role, ')');
    
//     let navbar = await Navbar.findOne();
    
//     if (!navbar) {
//       navbar = await createDefaultNavbar();
//     }

//     res.json({
//       success: true,
//       data: navbar
//     });
//   } catch (error) {
//     console.error('Get admin navbar error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching navbar'
//     });
//   }
// };

// // ============================================================
// // 2. UPDATE NAVBAR
// // ============================================================

// // @desc    Update navbar
// // @route   PUT /api/navbar/admin
// // @access  Private (Admin/Moderator)
// const updateNavbar = async (req, res) => {
//   try {
//     console.log('📝 Update navbar request from:', {
//       userId: req.user?._id,
//       email: req.user?.email,
//       role: req.user?.role
//     });

//     let navbar = await Navbar.findOne();
    
//     if (!navbar) {
//       navbar = await createDefaultNavbar();
//     }

//     const { items, logo, isActive } = req.body;

//     if (items) {
//       navbar.items = items;
//     }

//     if (logo) {
//       navbar.logo = {
//         ...navbar.logo,
//         ...logo
//       };
//     }

//     if (isActive !== undefined) {
//       navbar.isActive = isActive;
//     }

//     navbar.updatedBy = req.user.id;
//     await navbar.save();

//     console.log('✅ Navbar updated successfully by:', req.user?.email);

//     res.json({
//       success: true,
//       data: navbar,
//       message: 'Navbar updated successfully'
//     });
//   } catch (error) {
//     console.error('❌ Update navbar error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating navbar'
//     });
//   }
// };

// // ============================================================
// // 3. RESET NAVBAR
// // ============================================================

// // @desc    Reset navbar to default
// // @route   POST /api/navbar/admin/reset
// // @access  Private (Admin/Moderator)
// const resetNavbar = async (req, res) => {
//   try {
//     console.log('🔄 Resetting navbar to default by:', req.user?.email, '(Role:', req.user?.role, ')');
    
//     await Navbar.deleteOne({});
//     const navbar = await createDefaultNavbar();

//     res.json({
//       success: true,
//       data: navbar,
//       message: 'Navbar reset to default successfully'
//     });
//   } catch (error) {
//     console.error('Reset navbar error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while resetting navbar'
//     });
//   }
// };

// // ============================================================
// // 4. HELPER FUNCTIONS
// // ============================================================

// // Helper: Generate unique ID
// const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

// // Helper: Create default navbar
// const createDefaultNavbar = async () => {
//   const defaultNavbar = {
//     items: [
//       {
//         id: generateId(),
//         name: 'Home',
//         href: '/',
//         icon: 'Home',
//         order: 0,
//         isActive: true,
//         requiredRole: 'all'
//       },
//       {
//         id: generateId(),
//         name: 'Products',
//         href: '/products',
//         icon: 'Zap',
//         order: 1,
//         isActive: true,
//         requiredRole: 'all'
//       },
//       {
//         id: generateId(),
//         name: 'Track Order',
//         href: '/track',
//         icon: 'MapPin',
//         order: 2,
//         isActive: true,
//         requiredRole: 'all'
//       },
//       {
//         id: generateId(),
//         name: 'About',
//         href: '/about',
//         icon: 'Info',
//         order: 3,
//         isActive: true,
//         requiredRole: 'all'
//       },
//       {
//         id: generateId(),
//         name: 'Contact',
//         href: '/contact',
//         icon: 'Phone',
//         order: 4,
//         isActive: true,
//         requiredRole: 'all'
//       }
//     ],
//     logo: {
//       text: 'Beauty Bucket',
//       highlightText: 'Bucket',
//       icon: 'Zap',
//       logoUrl: ''
//     },
//     isActive: true
//   };

//   return await Navbar.create(defaultNavbar);
// };

// // ============================================================
// // 5. EXPORT CONTROLLERS
// // ============================================================

// module.exports = {
//   getPublicNavbar,
//   getAdminNavbar,
//   updateNavbar,
//   resetNavbar
// };


const Navbar = require('../models/Navbar');
const Category = require('../models/Category');

// ============================================================
// HELPER: Populate category data for navbar items
// ============================================================

const populateCategoryData = async (items) => {
  return await Promise.all(
    items.map(async (item) => {
      const itemObj = item.toObject ? item.toObject() : item;
      
      // If it's a category item, fetch category with subcategories
      if (itemObj.type === 'category' && itemObj.categoryId) {
        try {
          const category = await Category.findById(itemObj.categoryId)
            .select('name slug image description subcategories')
            .lean();
          
          if (category) {
            return {
              ...itemObj,
              category: {
                _id: category._id,
                name: category.name,
                slug: category.slug,
                image: category.image,
                description: category.description,
                // Map subcategories with their children
                subcategories: (category.subcategories || [])
                  .filter(sub => sub.isActive !== false)
                  .map(sub => ({
                    _id: sub._id,
                    name: sub.name,
                    slug: sub.slug,
                    productCount: sub.productCount,
                    children: (sub.children || [])
                      .filter(child => child.isActive !== false)
                      .map(child => ({
                        _id: child._id,
                        name: child.name,
                        slug: child.slug,
                        productCount: child.productCount
                      }))
                  }))
              }
            };
          }
        } catch (err) {
          console.error(`Error fetching category ${itemObj.categoryId}:`, err);
        }
      }
      
      return itemObj;
    })
  );
};

// ============================================================
// 1. GET NAVBAR DATA (PUBLIC)
// ============================================================

const getPublicNavbar = async (req, res) => {
  try {
    let navbar = await Navbar.findOne({ isActive: true });
    
    if (!navbar) {
      navbar = await createDefaultNavbar();
    }

    // Populate category data for category-type items
    const populatedItems = await populateCategoryData(navbar.items || []);

    // Filter items based on user role
    const user = req.user;
    let filteredItems = populatedItems.filter(item => item.isActive !== false);
    
    if (!user) {
      filteredItems = filteredItems.filter(item => 
        item.requiredRole === 'all' || !item.requiredRole
      );
    } else if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'moderator') {
      filteredItems = filteredItems.filter(item => 
        item.requiredRole === 'all' || 
        item.requiredRole === 'authenticated' ||
        !item.requiredRole
      );
    }

    // Sort by order
    filteredItems = filteredItems.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Fetch all categories for the "ALL" sidebar (lightweight - no products)
    let allCategories = [];
    try {
      const categories = await Category.find({ isActive: true })
        .select('name slug image description subcategories productCount')
        .sort({ name: 1 })
        .lean();

      // Format categories for sidebar with full nested structure
      allCategories = categories.map(cat => ({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        productCount: cat.productCount,
        subcategories: (cat.subcategories || [])
          .filter(sub => sub.isActive !== false)
          .map(sub => ({
            _id: sub._id,
            name: sub.name,
            slug: sub.slug,
            productCount: sub.productCount,
            children: (sub.children || [])
              .filter(child => child.isActive !== false)
              .map(child => ({
                _id: child._id,
                name: child.name,
                slug: child.slug,
                productCount: child.productCount
              }))
          }))
      }));
    } catch (err) {
      console.error('Error fetching categories:', err);
    }

    res.json({
      success: true,
      data: {
        items: filteredItems,
        logo: navbar.logo || {
          text: 'Glow&Co',
          highlightText: 'BEAUTY',
          icon: 'Flower2',
          logoUrl: ''
        },
        topBar: navbar.topBar || {
          phone: '+880 1XXXXXXXXX',
          phoneLink: '/contact',
          showTrackOrder: true,
          trackOrderLink: '/track',
          trackOrderText: 'Track Order',
          showOutlet: true,
          outletText: 'Our Outlet'
        },
        outlet: navbar.outlet || {
          name: 'Main Outlet',
          address: '',
          phone: '',
          email: '',
          googleMapsEmbedUrl: '',
          googleMapsLink: ''
        },
        searchPlaceholders: navbar.searchPlaceholders || [
          'Search Products...',
          'Makeup...',
          'Skincare...',
          'Hair Care...',
          'Serum...',
          'Moisturizer...'
        ],
        styling: navbar.styling || {
          primaryColor: '#8B9D83',
          primaryLight: '#A8B8A0',
          primaryDark: '#6B7D63',
          backgroundColor: '#F1EFE3',
          textColor: '#292725',
          accentColor: '#d83a38'
        },
        categories: allCategories
      }
    });
  } catch (error) {
    console.error('Get public navbar error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching navbar'
    });
  }
};

// ============================================================
// 2. GET NAVBAR DATA (ADMIN)
// ============================================================

const getAdminNavbar = async (req, res) => {
  try {
    console.log('📡 Get admin navbar by:', req.user?.email, '(Role:', req.user?.role, ')');
    
    let navbar = await Navbar.findOne();
    
    if (!navbar) {
      navbar = await createDefaultNavbar();
    }

    // Fetch all categories with full structure for admin panel
    let categories = [];
    try {
      const rawCategories = await Category.find({ isActive: true })
        .select('name slug image description subcategories productCount')
        .sort({ name: 1 })
        .lean();

      categories = rawCategories.map(cat => ({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        description: cat.description,
        productCount: cat.productCount,
        subcategories: (cat.subcategories || []).map(sub => ({
          _id: sub._id,
          name: sub.name,
          slug: sub.slug,
          productCount: sub.productCount,
          children: (sub.children || []).map(child => ({
            _id: child._id,
            name: child.name,
            slug: child.slug,
            productCount: child.productCount
          }))
        }))
      }));
    } catch (err) {
      console.error('Error fetching categories for admin:', err);
    }

    // Get navbar with populated category info
    const navbarObj = navbar.toObject();
    const populatedItems = await populateCategoryData(navbarObj.items || []);

    res.json({
      success: true,
      data: {
        ...navbarObj,
        items: populatedItems,
        availableCategories: categories
      }
    });
  } catch (error) {
    console.error('Get admin navbar error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching navbar'
    });
  }
};

// ============================================================
// 3. UPDATE NAVBAR
// ============================================================

const updateNavbar = async (req, res) => {
  try {
    console.log('📝 Update navbar request from:', {
      userId: req.user?._id,
      email: req.user?.email,
      role: req.user?.role
    });

    let navbar = await Navbar.findOne();
    
    if (!navbar) {
      navbar = await createDefaultNavbar();
    }

    const { 
      items, 
      logo, 
      isActive, 
      topBar, 
      outlet, 
      searchPlaceholders,
      styling 
    } = req.body;

    if (items) {
      navbar.items = items;
    }

    if (logo) {
      navbar.logo = {
        ...navbar.logo,
        ...logo
      };
    }

    if (topBar) {
      navbar.topBar = {
        ...navbar.topBar,
        ...topBar
      };
    }

    if (outlet) {
      navbar.outlet = {
        ...navbar.outlet,
        ...outlet
      };
    }

    if (searchPlaceholders) {
      navbar.searchPlaceholders = searchPlaceholders;
    }

    if (styling) {
      navbar.styling = {
        ...navbar.styling,
        ...styling
      };
    }

    if (isActive !== undefined) {
      navbar.isActive = isActive;
    }

    navbar.updatedBy = req.user.id;
    await navbar.save();

    console.log('✅ Navbar updated successfully by:', req.user?.email);

    res.json({
      success: true,
      data: navbar,
      message: 'Navbar updated successfully'
    });
  } catch (error) {
    console.error('❌ Update navbar error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating navbar'
    });
  }
};

// ============================================================
// 4. RESET NAVBAR
// ============================================================

const resetNavbar = async (req, res) => {
  try {
    console.log('🔄 Resetting navbar to default by:', req.user?.email);
    
    await Navbar.deleteOne({});
    const navbar = await createDefaultNavbar();

    res.json({
      success: true,
      data: navbar,
      message: 'Navbar reset to default successfully'
    });
  } catch (error) {
    console.error('Reset navbar error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while resetting navbar'
    });
  }
};

// ============================================================
// 5. HELPER FUNCTIONS
// ============================================================

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

const createDefaultNavbar = async () => {
  const defaultNavbar = {
    items: [
      {
        id: generateId(),
        name: 'All Products',
        href: '/products',
        type: 'link',
        order: 0,
        isActive: true,
        requiredRole: 'all'
      },
      {
        id: generateId(),
        name: 'About Us',
        href: '/about',
        type: 'link',
        order: 1,
        isActive: true,
     
        requiredRole: 'all'
      },
      {
        id: generateId(),
        name: 'Contact',
        href: '/contact',
        type: 'link',
        order: 2,
        isActive: true,
        requiredRole: 'all'
      },

       {
        id: generateId(),
        name: 'Videos',
        href: '/videos',
        type: 'link',
        order: 2,
        isActive: true,
        requiredRole: 'all'
      } ,
      {
        id: generateId(),
        name: 'Courses',
        href: '/courses',
        type: 'link',
        order: 3,
        isActive: true,
        requiredRole: 'all'
      }    
    ],
    logo: {
      text: "Nishat's Creation",       // ← CHANGED
      highlightText: 'Creation',
      icon: 'Flower2',
      logoUrl: ''
    },
    topBar: {
      phone: '+880 1747-708644',
      phoneLink: '/contact',
      showTrackOrder: true,
      trackOrderLink: '/track',
      trackOrderText: 'Track Order',
      showOutlet: true,
      outletText: 'Our Outlet'
    },
    outlet: {
      name: "Nishat's Collection Outlet",  
      address: 'shop no- 153, 154 ( 2nd floor), Rayerbag complex supermarket, Rayerbag, kodomtoli, Jatrabari, Dhaka. ( Landmark - Near Rayerbag Over bridge), Dhaka, Bangladesh',
      phone: '+8801747-708644',
      email: 'hello@nishatscollection.com',       // ← CHANGED
      googleMapsEmbedUrl: '',
      googleMapsLink: '',
      coordinates: { lat: null, lng: null },
      isActive: true
    },
    searchPlaceholders: [
      'Search Products...',
      'Makeup...',
      'Skincare...',
      'Hair Care...',
      'Face cream...',
      'Lipstick...',
      'Serum...',
      'Moisturizer...',
      'Sunscreen...',
      'Face wash...',
      'Perfume...'
    ],
    styling: {
      primaryColor: '#8B9D83',
      primaryLight: '#A8B8A0',
      primaryDark: '#6B7D63',
      backgroundColor: '#F1EFE3',
      textColor: '#292725',
      accentColor: '#d83a38'
    },
    isActive: true
  };

  return await Navbar.create(defaultNavbar);
};

module.exports = {
  getPublicNavbar,
  getAdminNavbar,
  updateNavbar,
  resetNavbar
};