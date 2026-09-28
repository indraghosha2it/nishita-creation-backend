// controllers/blogController.js
const Blog = require('../models/Blog');
const { cloudinary, extractPublicIdFromUrl } = require('../config/cloudinary'); // Keep this one
// const { deleteBlogFile, deleteMultipleBlogFiles } = require('../config/blogCloudinary');
// controllers/blogController.js - Update the createBlog function


// @desc    Create new blog post (Accepts JSON with Cloudinary URLs and YouTube video)
// @route   POST /api/blogs
// @access  Private (Moderator/Admin)
const createBlog = async (req, res) => {
  try {
    console.log('📝 Create blog request received');
    console.log('Body:', req.body);

    const {
      title,
      author,
      category,
      publishDate,
      excerpt,
      content,
      tags,
      featured,
      paragraphs,
      metaTitle,
      metaDescription,
      metaKeywords,
      // Cloudinary URLs from frontend
      featuredImageUrl,
      featuredImagePublicId,
      // YouTube video data
      youtubeVideo,
      thumbnailImages
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Blog title is required'
      });
    }

    if (!author) {
      return res.status(400).json({
        success: false,
        error: 'Author name is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    if (!excerpt) {
      return res.status(400).json({
        success: false,
        error: 'Excerpt is required'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Main content is required'
      });
    }

    // Check if featured image URL is provided
    if (!featuredImageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Featured image is required'
      });
    }

    // Parse JSON fields if they come as strings
    let parsedTags = [];
    let parsedParagraphs = [];
    let parsedThumbnailImages = [];

    try {
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }
      
      if (paragraphs) {
        parsedParagraphs = typeof paragraphs === 'string' ? JSON.parse(paragraphs) : paragraphs;
      }

      if (thumbnailImages) {
        parsedThumbnailImages = typeof thumbnailImages === 'string' ? JSON.parse(thumbnailImages) : thumbnailImages;
      }
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid data format for tags, paragraphs, or thumbnail images'
      });
    }

    // Validate paragraphs
    if (parsedParagraphs && parsedParagraphs.length > 0) {
      for (const [index, para] of parsedParagraphs.entries()) {
        if (!para.header || !para.header.trim()) {
          return res.status(400).json({
            success: false,
            error: `Section ${index + 1}: Header is required`
          });
        }
        if (!para.description || !para.description.trim()) {
          return res.status(400).json({
            success: false,
            error: `Section ${index + 1}: Description is required`
          });
        }
      }
    }

    // Process paragraphs (already have image URLs from frontend)
    const paragraphsWithImages = parsedParagraphs.map((paragraph) => ({
      header: paragraph.header,
      description: paragraph.description,
      image: paragraph.image || null
    }));

    // Process thumbnail images (already have URLs from frontend)
    const processedThumbnailImages = parsedThumbnailImages.map((thumb) => ({
      url: thumb.url,
      publicId: thumb.publicId
    }));

    // Process YouTube video (if provided)
    let processedYoutubeVideo = null;
    if (youtubeVideo && youtubeVideo.videoId) {
      processedYoutubeVideo = {
        url: youtubeVideo.url,
        videoId: youtubeVideo.videoId,
        thumbnail: youtubeVideo.thumbnail
      };
    }

    // Create blog post
    const blog = await Blog.create({
      title,
      author,
      category,
      publishDate: publishDate || new Date(),
      excerpt,
      content,
      tags: parsedTags,
      featured: featured === 'true' || featured === true,
      paragraphs: paragraphsWithImages,
      featuredImage: featuredImageUrl,
      featuredImagePublicId: featuredImagePublicId,
      thumbnailImages: processedThumbnailImages,
      youtubeVideo: processedYoutubeVideo,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      metaKeywords: metaKeywords || '',
      createdBy: req.user.id,
      isActive: true
    });

    // Populate createdBy for response
    await blog.populate('createdBy', 'contactPerson email role');

    res.status(201).json({
      success: true,
      data: blog,
      message: 'Blog post created successfully'
    });
  } catch (error) {
    console.error('❌ Create blog error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating blog post'
    });
  }
};

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      featured,
      sort = '-publishDate'
    } = req.query;

    // Build query
    const query = { isActive: true }; // Only show active blogs to public

    // Filter by category
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // Filter by featured
    if (featured === 'true') {
      query.featured = true;
    }

    // Search by text
    if (search) {
      query.$text = { $search: search };
    }

    // Parse sort
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { publishDate: -1 };
    } else if (sort === 'oldest') {
      sortOption = { publishDate: 1 };
    } else if (sort === 'popular') {
      sortOption = { views: -1 };
    } else {
      sortOption = { publishDate: -1 };
    }

    const blogs = await Blog.find(query)
      .populate('createdBy', 'contactPerson email role')
      .sort(sortOption)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching blogs'
    });
  }
};

// @desc    Get all blog posts (Admin/Moderator view - includes inactive)
// @route   GET /api/admin/blogs
// @access  Private (Moderator/Admin)
// const getAllBlogsAdmin = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 20, 
//       category, 
//       search,
//       status,
//       sort = '-createdAt'
//     } = req.query;

//     // Build query
//     const query = {};

//     // Filter by category
//     if (category) {
//       query.category = category;
//     }

//     // Filter by status (active/inactive)
//     if (status === 'active') {
//       query.isActive = true;
//     } else if (status === 'inactive') {
//       query.isActive = false;
//     }

//     // Search by text
//     if (search) {
//       query.$text = { $search: search };
//     }

//     const blogs = await Blog.find(query)
//       .populate('createdBy', 'contactPerson email role')
//       .populate('updatedBy', 'contactPerson email role')
//       .sort(sort)
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));

//     const total = await Blog.countDocuments(query);

//     res.json({
//       success: true,
//       data: blogs,
//       pagination: {
//         total,
//         page: parseInt(page),
//         pages: Math.ceil(total / parseInt(limit)),
//         limit: parseInt(limit)
//       }
//     });
//   } catch (error) {
//     console.error('Get admin blogs error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching blogs'
//     });
//   }
// };

// @desc    Get all blog posts (Admin/Moderator view - includes inactive)
// @route   GET /api/admin/blogs
// @access  Private (Moderator/Admin)
const getAllBlogsAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search,
      status,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status (active/inactive)
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Search by text - FIXED VERSION
    if (search && search.trim()) {
      // Option 1: Using regex search (more flexible, doesn't require text index)
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
      
      // Option 2: If you prefer text search (requires text index)
      // query.$text = { $search: search };
    }

    console.log('Blog search query:', { search, query }); // Debug log

    const blogs = await Blog.find(query)
      .populate('createdBy', 'contactPerson email role')
      .populate('updatedBy', 'contactPerson email role')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get admin blogs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching blogs'
    });
  }
};

// @desc    Get single blog post by slug or ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is MongoDB ObjectId or slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let query = {};
    if (isObjectId) {
      query = { _id: id };
    } else {
      query = { slug: id };
    }
    
    // Only show active blogs to public
    query.isActive = true;

    const blog = await Blog.findOne(query)
      .populate('createdBy', 'contactPerson email role');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching blog'
    });
  }
};

// @desc    Get single blog post for editing (Admin/Moderator)
// @route   GET /api/admin/blogs/:id
// @access  Private (Moderator/Admin)
const getBlogForEdit = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('createdBy', 'contactPerson email role')
      .populate('updatedBy', 'contactPerson email role');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Get blog for edit error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching blog'
    });
  }
};





// @desc    Update blog post (Accepts JSON with Cloudinary URLs)
// @route   PUT /api/admin/blogs/:id
// @access  Private (Moderator/Admin)
// const updateBlog = async (req, res) => {
//   try {
//     console.log('📝 Update blog request received');
//     console.log('Body:', req.body);

//     const blog = await Blog.findById(req.params.id);

//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         error: 'Blog post not found'
//       });
//     }

//     // Check permissions
//     if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
//       return res.status(403).json({
//         success: false,
//         error: 'You do not have permission to update blogs'
//       });
//     }

//     const {
//       title,
//       author,
//       category,
//       publishDate,
//       excerpt,
//       content,
//       tags,
//       featured,
//       paragraphs,
//       metaTitle,
//       metaDescription,
//       metaKeywords,
//       isActive,
//       // Cloudinary URLs from frontend
//       featuredImageUrl,
//       featuredImagePublicId,
//       videoUrl,
//       videoPublicId,
//       thumbnailImages,
//       imagesToDelete // Array of publicIds to delete from Cloudinary
//     } = req.body;

//     // Update fields if provided
//     if (title) blog.title = title;
//     if (author) blog.author = author;
//     if (category) blog.category = category;
//     if (publishDate) blog.publishDate = publishDate;
//     if (excerpt) blog.excerpt = excerpt;
//     if (content) blog.content = content;
//     if (featured !== undefined) blog.featured = featured === 'true' || featured === true;
//     if (isActive !== undefined) blog.isActive = isActive === 'true' || isActive === true;
//     if (metaTitle !== undefined) blog.metaTitle = metaTitle;
//     if (metaDescription !== undefined) blog.metaDescription = metaDescription;
//     if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;

//     // Parse and update tags
//     if (tags) {
//       try {
//         const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
//         blog.tags = parsedTags;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid tags format'
//         });
//       }
//     }

//     // Parse and update paragraphs
//     if (paragraphs) {
//       try {
//         const parsedParagraphs = typeof paragraphs === 'string' ? JSON.parse(paragraphs) : paragraphs;
        
//         // Validate paragraphs
//         if (parsedParagraphs && parsedParagraphs.length > 0) {
//           for (const [index, para] of parsedParagraphs.entries()) {
//             if (!para.header || !para.header.trim()) {
//               return res.status(400).json({
//                 success: false,
//                 error: `Section ${index + 1}: Header is required`
//               });
//             }
//             if (!para.description || !para.description.trim()) {
//               return res.status(400).json({
//                 success: false,
//                 error: `Section ${index + 1}: Description is required`
//               });
//             }
//           }
//         }
        
//         blog.paragraphs = parsedParagraphs;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           error: 'Invalid paragraphs format'
//         });
//       }
//     }

//     // Handle featured image update
//     if (featuredImageUrl && featuredImageUrl !== blog.featuredImage) {
//       // Delete old featured image from Cloudinary
//       if (blog.featuredImagePublicId) {
//         try {
//           await cloudinary.uploader.destroy(blog.featuredImagePublicId);
//           console.log('Old featured image deleted:', blog.featuredImagePublicId);
//         } catch (err) {
//           console.error('Error deleting old featured image:', err);
//         }
//       }
      
//       blog.featuredImage = featuredImageUrl;
//       blog.featuredImagePublicId = featuredImagePublicId;
//     }

//     // Handle video update
//     if (videoUrl !== undefined) {
//       // Delete old video from Cloudinary if it exists and is being replaced
//       if (blog.videoPublicId && videoUrl !== blog.videoUrl) {
//         try {
//           await cloudinary.uploader.destroy(blog.videoPublicId, { resource_type: 'video' });
//           console.log('Old video deleted:', blog.videoPublicId);
//         } catch (err) {
//           console.error('Error deleting old video:', err);
//         }
//       }
      
//       blog.videoUrl = videoUrl;
//       blog.videoPublicId = videoPublicId;
//     }

//     // Handle thumbnail images
//     if (thumbnailImages) {
//       try {
//         const parsedThumbnailImages = typeof thumbnailImages === 'string' 
//           ? JSON.parse(thumbnailImages) 
//           : thumbnailImages;
        
//         blog.thumbnailImages = parsedThumbnailImages;
//       } catch (error) {
//         console.error('Error parsing thumbnail images:', error);
//       }
//     }

//     // Delete images marked for removal from Cloudinary
//     if (imagesToDelete && Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
//       for (const publicId of imagesToDelete) {
//         try {
//           await cloudinary.uploader.destroy(publicId);
//           console.log('Deleted image from Cloudinary:', publicId);
//         } catch (err) {
//           console.error('Error deleting image:', err);
//         }
//       }
//     }

//     blog.updatedBy = req.user.id;
//     await blog.save();
//     console.log('✅ Blog updated successfully');

//     await blog.populate([
//       { path: 'createdBy', select: 'contactPerson email role' },
//       { path: 'updatedBy', select: 'contactPerson email role' }
//     ]);

//     res.json({
//       success: true,
//       data: blog,
//       message: 'Blog post updated successfully'
//     });
//   } catch (error) {
//     console.error('❌ Update blog error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating blog'
//     });
//   }
// };
// @desc    Update blog post (Accepts JSON with Cloudinary URLs and YouTube video)
// @route   PUT /api/admin/blogs/:id
// @access  Private (Moderator/Admin)
const updateBlog = async (req, res) => {
  try {
    console.log('📝 Update blog request received');
    console.log('Body:', req.body);

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update blogs'
      });
    }

    const {
      title,
      author,
      category,
      publishDate,
      excerpt,
      content,
      tags,
      featured,
      paragraphs,
      metaTitle,
      metaDescription,
      metaKeywords,
      isActive,
      // Cloudinary URLs from frontend
      featuredImageUrl,
      featuredImagePublicId,
      // YouTube video data
      youtubeVideo,
      thumbnailImages,
      imagesToDelete // Array of publicIds to delete from Cloudinary
    } = req.body;

    // Update fields if provided
    if (title) blog.title = title;
    if (author) blog.author = author;
    if (category) blog.category = category;
    if (publishDate) blog.publishDate = publishDate;
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (featured !== undefined) blog.featured = featured === 'true' || featured === true;
    if (isActive !== undefined) blog.isActive = isActive === 'true' || isActive === true;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;

    // Parse and update tags
    if (tags) {
      try {
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        blog.tags = parsedTags;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tags format'
        });
      }
    }

    // Parse and update paragraphs
    if (paragraphs) {
      try {
        const parsedParagraphs = typeof paragraphs === 'string' ? JSON.parse(paragraphs) : paragraphs;
        
        // Validate paragraphs
        if (parsedParagraphs && parsedParagraphs.length > 0) {
          for (const [index, para] of parsedParagraphs.entries()) {
            if (!para.header || !para.header.trim()) {
              return res.status(400).json({
                success: false,
                error: `Section ${index + 1}: Header is required`
              });
            }
            if (!para.description || !para.description.trim()) {
              return res.status(400).json({
                success: false,
                error: `Section ${index + 1}: Description is required`
              });
            }
          }
        }
        
        blog.paragraphs = parsedParagraphs;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid paragraphs format'
        });
      }
    }

    // Handle featured image update
    if (featuredImageUrl && featuredImageUrl !== blog.featuredImage) {
      // Delete old featured image from Cloudinary
      if (blog.featuredImagePublicId) {
        try {
          await cloudinary.uploader.destroy(blog.featuredImagePublicId);
          console.log('Old featured image deleted:', blog.featuredImagePublicId);
        } catch (err) {
          console.error('Error deleting old featured image:', err);
        }
      }
      
      blog.featuredImage = featuredImageUrl;
      blog.featuredImagePublicId = featuredImagePublicId;
    }

    // Handle YouTube video update
    if (youtubeVideo !== undefined) {
      // youtubeVideo can be null (to remove video) or an object with video data
      if (youtubeVideo === null || (youtubeVideo && !youtubeVideo.videoId)) {
        // Remove video
        blog.youtubeVideo = null;
      } else if (youtubeVideo && youtubeVideo.videoId) {
        // Update or add video
        blog.youtubeVideo = {
          url: youtubeVideo.url,
          videoId: youtubeVideo.videoId,
          thumbnail: youtubeVideo.thumbnail
        };
      }
    }

    // Handle thumbnail images
    if (thumbnailImages) {
      try {
        const parsedThumbnailImages = typeof thumbnailImages === 'string' 
          ? JSON.parse(thumbnailImages) 
          : thumbnailImages;
        
        blog.thumbnailImages = parsedThumbnailImages;
      } catch (error) {
        console.error('Error parsing thumbnail images:', error);
      }
    }

    // Delete images marked for removal from Cloudinary
    if (imagesToDelete && Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
      for (const publicId of imagesToDelete) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log('Deleted image from Cloudinary:', publicId);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      }
    }

    blog.updatedBy = req.user.id;
    await blog.save();
    console.log('✅ Blog updated successfully');

    await blog.populate([
      { path: 'createdBy', select: 'contactPerson email role' },
      { path: 'updatedBy', select: 'contactPerson email role' }
    ]);

    res.json({
      success: true,
      data: blog,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    console.error('❌ Update blog error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating blog'
    });
  }
};





// @desc    Delete blog post
// @route   DELETE /api/admin/blogs/:id
// @access  Private (Admin only)
// const deleteBlog = async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);

//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         error: 'Blog post not found'
//       });
//     }

//     // Check permissions - Admin only for delete
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         error: 'Only admins can delete blog posts'
//       });
//     }

//     // Delete all files from Cloudinary
//     // Delete featured image
//     if (blog.featuredImagePublicId) {
//       try {
//         await cloudinary.uploader.destroy(blog.featuredImagePublicId);
//         console.log('Featured image deleted:', blog.featuredImagePublicId);
//       } catch (err) {
//         console.error('Error deleting featured image:', err);
//       }
//     }

//     // Delete video
//     if (blog.videoPublicId) {
//       try {
//         await cloudinary.uploader.destroy(blog.videoPublicId, { resource_type: 'video' });
//         console.log('Video deleted:', blog.videoPublicId);
//       } catch (err) {
//         console.error('Error deleting video:', err);
//       }
//     }

//     // Delete thumbnail images
//     for (const thumb of blog.thumbnailImages) {
//       if (thumb.publicId) {
//         try {
//           await cloudinary.uploader.destroy(thumb.publicId);
//           console.log('Thumbnail deleted:', thumb.publicId);
//         } catch (err) {
//           console.error('Error deleting thumbnail:', err);
//         }
//       }
//     }

//     // Delete paragraph images
//     for (const para of blog.paragraphs) {
//       if (para.image) {
//         const publicId = extractPublicIdFromUrl(para.image);
//         if (publicId) {
//           try {
//             await cloudinary.uploader.destroy(publicId);
//             console.log('Paragraph image deleted:', publicId);
//           } catch (err) {
//             console.error('Error deleting paragraph image:', err);
//           }
//         }
//       }
//     }

//     await blog.deleteOne();

//     res.json({
//       success: true,
//       message: 'Blog post deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete blog error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while deleting blog'
//     });
//   }
// };

// @desc    Delete blog post
// @route   DELETE /api/admin/blogs/:id
// @access  Private (Admin only)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Check permissions - Admin only for delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete blog posts'
      });
    }

    // Delete all images from Cloudinary (but NOT videos since they're YouTube)
    // Delete featured image
    if (blog.featuredImagePublicId) {
      try {
        await cloudinary.uploader.destroy(blog.featuredImagePublicId);
        console.log('Featured image deleted:', blog.featuredImagePublicId);
      } catch (err) {
        console.error('Error deleting featured image:', err);
      }
    }

    // Delete thumbnail images
    for (const thumb of blog.thumbnailImages) {
      if (thumb.publicId) {
        try {
          await cloudinary.uploader.destroy(thumb.publicId);
          console.log('Thumbnail deleted:', thumb.publicId);
        } catch (err) {
          console.error('Error deleting thumbnail:', err);
        }
      }
    }

    // Delete paragraph images
    for (const para of blog.paragraphs) {
      if (para.image) {
        const publicId = extractPublicIdFromUrl(para.image);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log('Paragraph image deleted:', publicId);
          } catch (err) {
            console.error('Error deleting paragraph image:', err);
          }
        }
      }
    }

    await blog.deleteOne();

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting blog'
    });
  }
};

// @desc    Toggle blog active status
// @route   PUT /api/admin/blogs/:id/toggle
// @access  Private (Admin only)
const toggleBlogStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Check permissions - Admin only
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can toggle blog status'
      });
    }

    blog.isActive = !blog.isActive;
    blog.updatedBy = req.user.id;
    await blog.save();

    res.json({
      success: true,
      data: blog,
      message: `Blog ${blog.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle blog error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling blog status'
    });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getAllBlogsAdmin,
  getBlogById,
  getBlogForEdit,
  updateBlog,
  deleteBlog,
  toggleBlogStatus
};