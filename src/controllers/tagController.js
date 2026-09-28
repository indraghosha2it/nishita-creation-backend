

// const Tag = require('../models/Tag');

// // @desc    Create a new tag
// // @route   POST /api/tags
// // @access  Private (Admin/Moderator)
// const createTag = async (req, res) => {
//   try {
//     const { name, image, imageMobile } = req.body;

//     // Validation
//     if (!name || !name.trim()) {
//       return res.status(400).json({ success: false, error: 'Tag name is required' });
//     }

//     if (!image) {
//       return res.status(400).json({ success: false, error: 'Tag image is required' });
//     }

//     // Check if tag already exists
//     const existingTag = await Tag.findOne({ 
//       name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
//     });
    
//     if (existingTag) {
//       return res.status(400).json({ 
//         success: false, 
//         error: `Tag "${name}" already exists` 
//       });
//     }

//     // Get the highest order value
//     const lastTag = await Tag.findOne().sort({ order: -1 });
//     const newOrder = lastTag ? lastTag.order + 1 : 0;

//     // Create tag
//     const tag = await Tag.create({
//       name: name.trim(),
//       image: image,
//       imageMobile: imageMobile || '',
//       order: newOrder,
//       createdBy: req.user.id
//     });

//     res.status(201).json({
//       success: true,
//       data: tag,
//       message: 'Tag created successfully'
//     });
//   } catch (error) {
//     console.error('Create tag error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while creating tag'
//     });
//   }
// };

// // @desc    Get all tags
// // @route   GET /api/tags
// // @access  Public
// const getTags = async (req, res) => {
//   // Prevent browser caching
//   res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  
//   try {
//     const { isActive } = req.query;
    
//     let query = {};
    
//     if (isActive === 'true') {
//       query.isActive = true;
//     } else if (isActive === 'false') {
//       query.isActive = false;
//     }
    
//     const tags = await Tag.find(query)
//       .sort({ order: 1, name: 1 })
//       .populate('createdBy', 'name email');
    
//     res.json({
//       success: true,
//       data: tags
//     });
//   } catch (error) {
//     console.error('Get tags error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching tags'
//     });
//   }
// };

// // @desc    Get single tag by ID
// // @route   GET /api/tags/:id
// // @access  Public
// const getTagById = async (req, res) => {
//   try {
//     const tag = await Tag.findById(req.params.id).populate('createdBy', 'name email');
    
//     if (!tag) {
//       return res.status(404).json({ success: false, error: 'Tag not found' });
//     }
    
//     res.json({
//       success: true,
//       data: tag
//     });
//   } catch (error) {
//     console.error('Get tag error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching tag'
//     });
//   }
// };

// // @desc    Update tag
// // @route   PUT /api/tags/:id
// // @access  Private (Admin/Moderator)
// const updateTag = async (req, res) => {
//   try {
//     const tag = await Tag.findById(req.params.id);
    
//     if (!tag) {
//       return res.status(404).json({ success: false, error: 'Tag not found' });
//     }
    
//     const { name, isActive, image, imageMobile } = req.body;
    
//     // Update fields
//     if (name && name.trim()) {
//       // Check if new name conflicts with existing tag
//       const existingTag = await Tag.findOne({ 
//         name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
//         _id: { $ne: tag._id }
//       });
      
//       if (existingTag) {
//         return res.status(400).json({ 
//           success: false, 
//           error: `Tag "${name}" already exists` 
//         });
//       }
      
//       tag.name = name.trim();
//     }
    
//     if (image) {
//       tag.image = image;
//     }

//     if (imageMobile !== undefined) {
//       tag.imageMobile = imageMobile;
//     }
    
//     if (isActive !== undefined) {
//       tag.isActive = isActive;
//     }
    
//     await tag.save();
    
//     res.json({
//       success: true,
//       data: tag,
//       message: 'Tag updated successfully'
//     });
//   } catch (error) {
//     console.error('Update tag error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating tag'
//     });
//   }
// };

// // @desc    Delete tag
// // @route   DELETE /api/tags/:id
// // @access  Private (Admin only)
// const deleteTag = async (req, res) => {
//   try {
//     const tag = await Tag.findById(req.params.id);
    
//     if (!tag) {
//       return res.status(404).json({ success: false, error: 'Tag not found' });
//     }

//     // Prevent deletion of the first tag (order 0)
//     if (tag.order === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'The first tag cannot be deleted. You can only edit it.' 
//       });
//     }
    
//     await tag.deleteOne();
    
//     res.json({
//       success: true,
//       message: 'Tag deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete tag error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while deleting tag'
//     });
//   }
// };

// // @desc    Toggle tag active status
// // @route   PUT /api/tags/:id/toggle
// // @access  Private (Admin/Moderator)
// const toggleTagStatus = async (req, res) => {
//   try {
//     const tag = await Tag.findById(req.params.id);
    
//     if (!tag) {
//       return res.status(404).json({ success: false, error: 'Tag not found' });
//     }
    
//     tag.isActive = !tag.isActive;
//     await tag.save();
    
//     res.json({
//       success: true,
//       data: tag,
//       message: `Tag ${tag.isActive ? 'activated' : 'deactivated'} successfully`
//     });
//   } catch (error) {
//     console.error('Toggle tag status error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while toggling tag status'
//     });
//   }
// };


// module.exports = {
//   createTag,
//   getTags,
//   getTagById,
//   updateTag,
//   deleteTag,
//   toggleTagStatus
// };



const Tag = require('../models/Tag');

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Private (Admin/Moderator)
const createTag = async (req, res) => {
  try {
    const { name, image, imageMobile } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Tag name is required' });
    }

    if (!image) {
      return res.status(400).json({ success: false, error: 'Tag image is required' });
    }

    // Check if tag already exists (case-insensitive)
    const existingTag = await Tag.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        error: `Tag "${name}" already exists`
      });
    }

    // Auto-assign order: first tag = 0, then 1, 2, 3...
    const lastTag = await Tag.findOne().sort({ order: -1 });
    const newOrder = lastTag ? lastTag.order + 1 : 0;

    // Create tag
    const tag = await Tag.create({
      name: name.trim(),
      image: image,
      imageMobile: imageMobile || '',
      order: newOrder,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: tag,
      message: 'Tag created successfully'
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating tag'
    });
  }
};

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res) => {
  // Prevent browser caching
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { isActive } = req.query;

    let query = {};

    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }

    const tags = await Tag.find(query)
      .sort({ order: 1, name: 1 })
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching tags'
    });
  }
};

// @desc    Get single tag by ID or slug
// @route   GET /api/tags/:id
// @access  Public
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;

    // Accept both ObjectId and slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { slug: id.toLowerCase() };

    const tag = await Tag.findOne(query).populate('createdBy', 'name email');

    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching tag'
    });
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private (Admin/Moderator)
const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    const { name, isActive, image, imageMobile } = req.body;

    // Update name (with duplicate check)
    if (name && name.trim()) {
      const existingTag = await Tag.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: tag._id }
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          error: `Tag "${name}" already exists`
        });
      }

      tag.name = name.trim();
    }

    // Update images
    if (image) {
      tag.image = image;
    }

    if (imageMobile !== undefined) {
      tag.imageMobile = imageMobile;
    }

    // Update active status
    if (isActive !== undefined) {
      tag.isActive = isActive;
    }

    await tag.save();

    res.json({
      success: true,
      data: tag,
      message: 'Tag updated successfully'
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating tag'
    });
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private (Admin only)
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    // 🔒 Protect the first tag (order 0) from deletion
    if (tag.order === 0) {
      return res.status(400).json({
        success: false,
        error: 'The first tag (Featured/Center) cannot be deleted. You can only edit it.'
      });
    }

    await tag.deleteOne();

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting tag'
    });
  }
};

// @desc    Toggle tag active status
// @route   PUT /api/tags/:id/toggle
// @access  Private (Admin/Moderator)
const toggleTagStatus = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    tag.isActive = !tag.isActive;
    await tag.save();

    res.json({
      success: true,
      data: tag,
      message: `Tag ${tag.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle tag status error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling tag status'
    });
  }
};

// @desc    Get single tag by slug (dedicated route helper)
// @route   GET /api/tags/slug/:slug
// @access  Public
const getTagBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tag = await Tag.findOne({
      slug: slug.toLowerCase(),
      isActive: true
    }).populate('createdBy', 'name email');

    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Get tag by slug error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching tag'
    });
  }
};

module.exports = {
  createTag,
  getTags,
  getTagById,
  getTagBySlug,
  updateTag,
  deleteTag,
  toggleTagStatus
};