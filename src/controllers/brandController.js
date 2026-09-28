// // backend/src/controllers/brandController.js
// const Brand = require('../models/Brand');

// // @desc    Create a new brand
// // @route   POST /api/brands
// // @access  Private (Admin/Moderator)
// const createBrand = async (req, res) => {
//   try {
//     const { name, logo, description } = req.body;

//     if (!name || !name.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: 'Brand name is required'
//       });
//     }

//     // Check if brand already exists
//     const existingBrand = await Brand.findOne({ 
//       name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
//     });

//     if (existingBrand) {
//       return res.status(400).json({
//         success: false,
//         error: 'Brand already exists'
//       });
//     }

//     const brand = await Brand.create({
//       name: name.trim().toUpperCase(),
//       logo: logo || '',
//       description: description || '',
//       createdBy: req.user.id
//     });

//     res.status(201).json({
//       success: true,
//       data: brand,
//       message: 'Brand created successfully'
//     });
//   } catch (error) {
//     console.error('Create brand error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get all brands
// // @route   GET /api/brands
// // @access  Public
// const getBrands = async (req, res) => {
//   try {
//     const { search, isActive, limit = 100 } = req.query;
    
//     let query = {};
    
//     if (search) {
//       query.name = { $regex: search, $options: 'i' };
//     }
    
//     if (isActive !== undefined) {
//       query.isActive = isActive === 'true';
//     }

//     const brands = await Brand.find(query)
//       .sort({ name: 1 })
//       .limit(parseInt(limit));

//     res.json({
//       success: true,
//       data: brands,
//       total: brands.length
//     });
//   } catch (error) {
//     console.error('Get brands error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get single brand by ID
// // @route   GET /api/brands/:id
// // @access  Public
// const getBrandById = async (req, res) => {
//   try {
//     const brand = await Brand.findById(req.params.id);
    
//     if (!brand) {
//       return res.status(404).json({
//         success: false,
//         error: 'Brand not found'
//       });
//     }

//     res.json({
//       success: true,
//       data: brand
//     });
//   } catch (error) {
//     console.error('Get brand error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Update brand
// // @route   PUT /api/brands/:id
// // @access  Private (Admin/Moderator)
// const updateBrand = async (req, res) => {
//   try {
//     const { name, logo, description, isActive } = req.body;
    
//     const brand = await Brand.findById(req.params.id);
    
//     if (!brand) {
//       return res.status(404).json({
//         success: false,
//         error: 'Brand not found'
//       });
//     }

//     if (name && name.trim()) {
//       // Check if new name conflicts with existing brand
//       const existingBrand = await Brand.findOne({ 
//         name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
//         _id: { $ne: brand._id }
//       });
      
//       if (existingBrand) {
//         return res.status(400).json({
//           success: false,
//           error: 'Brand name already exists'
//         });
//       }
      
//       brand.name = name.trim().toUpperCase();
//     }
    
//     if (logo !== undefined) brand.logo = logo;
//     if (description !== undefined) brand.description = description;
//     if (isActive !== undefined) brand.isActive = isActive;
    
//     await brand.save();

//     res.json({
//       success: true,
//       data: brand,
//       message: 'Brand updated successfully'
//     });
//   } catch (error) {
//     console.error('Update brand error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Delete brand
// // @route   DELETE /api/brands/:id
// // @access  Private (Admin only)
// const deleteBrand = async (req, res) => {
//   try {
//     const brand = await Brand.findById(req.params.id);
    
//     if (!brand) {
//       return res.status(404).json({
//         success: false,
//         error: 'Brand not found'
//       });
//     }

//     // Check if brand has products (optional - you can add this check)
//     // const productCount = await Product.countDocuments({ brand: brand.name });
//     // if (productCount > 0) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     error: `Cannot delete brand with ${productCount} associated products`
//     //   });
//     // }

//     await brand.deleteOne();

//     res.json({
//       success: true,
//       message: 'Brand deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete brand error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   createBrand,
//   getBrands,
//   getBrandById,
//   updateBrand,
//   deleteBrand
// };


// backend/src/controllers/brandController.js
const Brand = require('../models/Brand');

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Private (Admin/Moderator)
const createBrand = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        error: 'Brand already exists'
      });
    }

    const brand = await Brand.create({
      name: name.trim().toUpperCase(),
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
  try {
    const { search, isActive, limit = 100 } = req.query;
    
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const brands = await Brand.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: brands,
      total: brands.length
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single brand by ID
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private (Admin/Moderator)
const updateBrand = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    if (name && name.trim()) {
      // Check if new name conflicts with existing brand
      const existingBrand = await Brand.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: brand._id }
      });
      
      if (existingBrand) {
        return res.status(400).json({
          success: false,
          error: 'Brand name already exists'
        });
      }
      
      brand.name = name.trim().toUpperCase();
    }
    
    if (isActive !== undefined) brand.isActive = isActive;
    
    await brand.save();

    res.json({
      success: true,
      data: brand,
      message: 'Brand updated successfully'
    });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private (Admin only)
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    await brand.deleteOne();

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand
};