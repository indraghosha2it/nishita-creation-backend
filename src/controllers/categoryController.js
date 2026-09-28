const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Moderator/Admin)
const createCategory = async (req, res) => {
  try {
    console.log('Create category request:', req.body);
    console.log('File:', req.file);

    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      // If there's an uploaded file, delete it from Cloudinary
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Category image is required'
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description: description || '',
      image: {
        url: req.file.path,
        publicId: req.file.filename
      },
      createdBy: req.user.id
    });

    // Populate createdBy info
    await category.populate('createdBy', 'contactPerson email');

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    // If there's an uploaded file, delete it from Cloudinary
    if (req.file) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating category'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { isActive: true };

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(query)
      .populate('createdBy', 'contactPerson')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

       const categoriesWithCounts = categories.map(category => {
      const categoryObj = category.toObject();
      return {
        ...categoryObj,
        subcategoryCount: category.subcategories?.length || 0
      };
    });

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching categories'
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'contactPerson email');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching category'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Moderator/Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: 'Category with this name already exists'
        });
      }
      category.name = name;
    }

    // Update description if provided
    if (description !== undefined) {
      category.description = description;
    }

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (category.image.publicId) {
        await cloudinary.uploader.destroy(category.image.publicId);
      }
      
      // Set new image
      category.image = {
        url: req.file.path,
        publicId: req.file.filename
      };
    }

    await category.save();
    await category.populate('createdBy', 'contactPerson email');

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    
    // If there's an uploaded file, delete it from Cloudinary
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Delete image from Cloudinary
    if (category.image.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId);
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting category'
    });
  }
};

// @desc    Get category with product count
// @route   GET /api/categories/:id/details
// @access  Public
const getCategoryDetails = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'contactPerson email');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({ 
      category: category._id,
      isActive: true,
      isApproved: true 
    });

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (error) {
    console.error('Get category details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching category details'
    });
  }
};

// @desc    Get category with its products
// @route   GET /api/categories/:id/with-products
// @access  Public
const getCategoryWithProducts = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'contactPerson email')
      .populate('products.productId', 'description fabric images sizes colors quantityBasedPricing');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category with products error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching category'
    });
  }
};

// @desc    Get all products in a category



// controllers/categoryController.js

// Add these new controller functions
// ============ SIMPLIFIED SUBCATEGORY CONTROLLERS (NAME ONLY) ============

// @desc    Add subcategory to a category (Name only - no image/description)
// @route   POST /api/categories/:categoryId/subcategories
// @access  Private (Moderator/Admin)
const addSubcategory = async (req, res) => {
  try {
    const { name } = req.body;
    const categoryId = req.params.categoryId;

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Subcategory name is required'
      });
    }

    // Find the category
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if subcategory with same name already exists
    const existingSubcategory = category.subcategories.find(
      sub => sub.name.toLowerCase() === name.toLowerCase()
    );

    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        error: 'Subcategory with this name already exists in this category'
      });
    }

    // Create new subcategory object (Name only - no image/description)
    const newSubcategory = {
      name: name.trim(),
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to category
    category.subcategories.push(newSubcategory);
    await category.save();

    // Get the newly added subcategory (last one)
    const addedSubcategory = category.subcategories[category.subcategories.length - 1];

    res.status(201).json({
      success: true,
      data: addedSubcategory,
      message: 'Subcategory added successfully'
    });
  } catch (error) {
    console.error('Add subcategory error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while adding subcategory'
    });
  }
};

// @desc    Get all subcategories of a category
// @route   GET /api/categories/:categoryId/subcategories
// @access  Public
// const getSubcategories = async (req, res) => {
//   try {
//     const category = await Category.findById(req.params.categoryId)
//       .select('name subcategories');

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         error: 'Category not found'
//       });
//     }

//     // Filter only active subcategories
//     const activeSubcategories = category.subcategories.filter(sub => sub.isActive === true);

//     // Return simplified subcategory data (only needed fields)
//     const simplifiedSubcategories = activeSubcategories.map(sub => ({
//       _id: sub._id,
//       name: sub.name,
//       slug: sub.slug,
//       isActive: sub.isActive,
//       productCount: sub.productCount,
//       createdAt: sub.createdAt,
//       updatedAt: sub.updatedAt
//     }));

//     res.json({
//       success: true,
//       data: {
//         categoryId: category._id,
//         categoryName: category.name,
//         subcategories: simplifiedSubcategories,
//         total: simplifiedSubcategories.length
//       }
//     });
//   } catch (error) {
//     console.error('Get subcategories error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching subcategories'
//     });
//   }
// };

// @desc    Get all subcategories of a category (WITH CHILDREN)
// @route   GET /api/categories/:categoryId/subcategories
// @access  Public
const getSubcategories = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId)
      .select('name subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Filter only active subcategories and include their children
    const activeSubcategories = category.subcategories
      .filter(sub => sub.isActive === true)
      .map(sub => ({
        _id: sub._id,
        name: sub.name,
        slug: sub.slug,
        isActive: sub.isActive,
        productCount: sub.productCount,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        children: sub.children ? sub.children.filter(child => child.isActive === true).map(child => ({
          _id: child._id,
          name: child.name,
          slug: child.slug,
          isActive: child.isActive,
          productCount: child.productCount,
          createdAt: child.createdAt,
          updatedAt: child.updatedAt
        })) : []
      }));

    res.json({
      success: true,
      data: {
        categoryId: category._id,
        categoryName: category.name,
        subcategories: activeSubcategories,
        total: activeSubcategories.length
      }
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching subcategories'
    });
  }
};

// @desc    Get single subcategory
// @route   GET /api/categories/:categoryId/subcategories/:subcategoryId

const getSubcategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(req.params.subcategoryId);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    // Return simplified subcategory data
    res.json({
      success: true,
      data: {
        categoryId: category._id,
        categoryName: category.name,
        _id: subcategory._id,
        name: subcategory.name,
        slug: subcategory.slug,
        isActive: subcategory.isActive,
        productCount: subcategory.productCount,
        createdAt: subcategory.createdAt,
        updatedAt: subcategory.updatedAt
      }
    });
  } catch (error) {
    console.error('Get subcategory error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching subcategory'
    });
  }
};

// @desc    Update subcategory (Name only - no image/description)
// @route   PUT /api/categories/:categoryId/subcategories/:subcategoryId
// @access  Private (Moderator/Admin)
const updateSubcategory = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(req.params.subcategoryId);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    // Check if new name conflicts with existing subcategory
    if (name && name !== subcategory.name) {
      const nameExists = category.subcategories.some(
        sub => sub.name.toLowerCase() === name.toLowerCase() && 
               sub._id.toString() !== req.params.subcategoryId
      );
      
      if (nameExists) {
        return res.status(400).json({
          success: false,
          error: 'Subcategory with this name already exists'
        });
      }
      subcategory.name = name.trim();
    }

    // Update isActive status if provided
    if (isActive !== undefined) {
      subcategory.isActive = isActive;
    }
    
    subcategory.updatedAt = new Date();

    await category.save();

    // Return updated subcategory data
    res.json({
      success: true,
      data: {
        _id: subcategory._id,
        name: subcategory.name,
        slug: subcategory.slug,
        isActive: subcategory.isActive,
        productCount: subcategory.productCount,
        updatedAt: subcategory.updatedAt
      },
      message: 'Subcategory updated successfully'
    });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating subcategory'
    });
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/categories/:categoryId/subcategories/:subcategoryId
// @access  Private (Moderator/Admin)
const deleteSubcategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(req.params.subcategoryId);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    // Check if subcategory has products
    if (subcategory.productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete subcategory - It has ${subcategory.productCount} product(s)`
      });
    }

    // Remove subcategory
    category.subcategories.pull({ _id: req.params.subcategoryId });
    await category.save();

    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting subcategory'
    });
  }
};


// ============ CHILD SUBCATEGORY (SUB-SUBCATEGORY) CONTROLLERS ============

// @desc    Add child subcategory to a subcategory
// @route   POST /api/categories/:categoryId/subcategories/:subcategoryId/children
// @access  Private (Moderator/Admin)
const addChildSubcategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { categoryId, subcategoryId } = req.params;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Child subcategory name is required'
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    // Check for duplicate child names
    const existingChild = subcategory.children.find(
      child => child.name.toLowerCase() === name.toLowerCase()
    );

    if (existingChild) {
      return res.status(400).json({
        success: false,
        error: 'Child subcategory with this name already exists'
      });
    }

    const newChild = {
      name: name.trim(),
      isActive: true,
      productCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    subcategory.children.push(newChild);
    await category.save();

    const addedChild = subcategory.children[subcategory.children.length - 1];

    res.status(201).json({
      success: true,
      data: addedChild,
      message: 'Child subcategory added successfully'
    });
  } catch (error) {
    console.error('Add child subcategory error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while adding child subcategory'
    });
  }
};


// @desc    Get all child subcategories of a subcategory
// @route   GET /api/categories/:categoryId/subcategories/:subcategoryId/children
// @access  Public
const getChildSubcategories = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.params;
    const category = await Category.findById(categoryId).select('name subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    const activeChildren = (subcategory.children || [])
      .filter(child => child.isActive === true)
      .map(child => ({
        _id: child._id,
        name: child.name,
        slug: child.slug,
        isActive: child.isActive,
        productCount: child.productCount,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt
      }));

    res.json({
      success: true,
      data: {
        categoryId: category._id,
        categoryName: category.name,
        subcategoryId: subcategory._id,
        subcategoryName: subcategory.name,
        children: activeChildren,
        total: activeChildren.length
      }
    });
  } catch (error) {
    console.error('Get child subcategories error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching child subcategories'
    });
  }
};

// @desc    Update child subcategory
// @route   PUT /api/categories/:categoryId/subcategories/:subcategoryId/children/:childId
// @access  Private (Moderator/Admin)
const updateChildSubcategory = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const { categoryId, subcategoryId, childId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    const child = subcategory.children.id(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Child subcategory not found'
      });
    }

    if (name && name !== child.name) {
      const nameExists = subcategory.children.some(
        c => c.name.toLowerCase() === name.toLowerCase() && 
             c._id.toString() !== childId
      );
      
      if (nameExists) {
        return res.status(400).json({
          success: false,
          error: 'Child subcategory with this name already exists'
        });
      }
      child.name = name.trim();
    }

    if (isActive !== undefined) {
      child.isActive = isActive;
    }
    
    child.updatedAt = new Date();
    await category.save();

    res.json({
      success: true,
      data: {
        _id: child._id,
        name: child.name,
        slug: child.slug,
        isActive: child.isActive,
        productCount: child.productCount,
        updatedAt: child.updatedAt
      },
      message: 'Child subcategory updated successfully'
    });
  } catch (error) {
    console.error('Update child subcategory error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating child subcategory'
    });
  }
};

// @desc    Delete child subcategory
// @route   DELETE /api/categories/:categoryId/subcategories/:subcategoryId/children/:childId
// @access  Private (Moderator/Admin)
const deleteChildSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId, childId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const subcategory = category.subcategories.id(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    const child = subcategory.children.id(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Child subcategory not found'
      });
    }

    if (child.productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete - It has ${child.productCount} product(s)`
      });
    }

    subcategory.children.pull({ _id: childId });
    await category.save();

    res.json({
      success: true,
      message: 'Child subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Delete child subcategory error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting child subcategory'
    });
  }
};
// Add this function to get categories with products for toy store
// @desc    Get categories with their products (for toy store frontend)
// @route   GET /api/categories/with-products
// @access  Public
const getCategoriesWithProducts = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug image description subcategories productCount')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories with products error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching categories'
    });
  }
};

// @desc    Get products by category with pagination and filters
// @route   GET /api/categories/:categoryId/products
// @access  Public
const getCategoryProducts = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { 
      page = 1, 
      limit = 12,
      subcategory,
      childSubcategory,
      ageGroup,
      minPrice,
      maxPrice,
      sort = '-createdAt'
    } = req.query;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Filter products
    let products = category.products.filter(p => p.isActive === true);
    
    // Filter by subcategory
    if (subcategory) {
      products = products.filter(p => p.subcategoryId?.toString() === subcategory);
    }
    
    // Filter by child subcategory
    if (childSubcategory) {
      products = products.filter(p => p.childSubcategoryId?.toString() === childSubcategory);
    }
    
    // Filter by age group
    if (ageGroup) {
      products = products.filter(p => p.ageGroup === ageGroup);
    }
    
    // Filter by price range
    const effectivePrice = (product) => product.discountPrice > 0 ? product.discountPrice : product.regularPrice;
    
    if (minPrice) {
      products = products.filter(p => effectivePrice(p) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => effectivePrice(p) <= parseFloat(maxPrice));
    }
    
    // Sort products
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => effectivePrice(a) - effectivePrice(b));
        break;
      case 'price_desc':
        products.sort((a, b) => effectivePrice(b) - effectivePrice(a));
        break;
      case 'name_asc':
        products.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'rating_desc':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedProducts = products.slice(skip, skip + parseInt(limit));
    const total = products.length;
    
    res.json({
      success: true,
      data: {
        category: {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image
        },
        products: paginatedProducts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching category products'
    });
  }
};

// @desc    Get category by slug with products
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true })
      .select('name slug description image subcategories products productCount');

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Only return active products
    const activeProducts = category.products.filter(p => p.isActive === true);
    
    res.json({
      success: true,
      data: {
        ...category.toObject(),
        products: activeProducts,
        activeProductCount: activeProducts.length
      }
    });
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching category'
    });
  }
};
// Add this new function to your categoryController.js

// @desc    Get lightweight categories (NO products, only categories with subcategories)
// @route   GET /api/categories/light
// @access  Public
const getLightweightCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug image description subcategories productCount') // ✅ Only select needed fields
      .sort({ name: 1 });

    // Format subcategories without products
    const formattedCategories = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: cat.description,
      productCount: cat.productCount,
      subcategories: cat.subcategories.map(sub => ({
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

    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Get lightweight categories error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching categories'
    });
  }
};







module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
 getCategoryWithProducts,
  updateCategory,
  deleteCategory,
  getCategoryDetails,

  addSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
   addChildSubcategory,
  getChildSubcategories,
  updateChildSubcategory,
  deleteChildSubcategory,
  getCategoriesWithProducts,
  getCategoryProducts,
  getCategoryBySlug,
  getLightweightCategories

};