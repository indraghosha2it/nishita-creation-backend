
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Create a new review (supports both logged-in and guest users)
// @route   POST /api/reviews
// @access  Public (with optional auth)
const createReview = async (req, res) => {
  try {
    const {
      rating,
      title,
      comment,
      productId,
      productName,
      images = [],
      video = null,
      isAnonymous = false,
      reviewerName,
      email
    } = req.body;

    // Check if user is logged in
    const isLoggedIn = req.user && req.user.id;
    
    let userId = null;
    let userName = '';
    let userEmail = '';
    let isGuest = false;
    let isVerifiedPurchase = false;

    if (isLoggedIn) {
      // Logged in user
      userId = req.user.id;
      userEmail = req.user.email || '';
      userName = req.user.contactPerson || req.user.companyName || userEmail.split('@')[0] || 'User';
      isGuest = false;
      
      // Check if user has purchased this product
      if (productId) {
        // Find if user has a completed order with this product
        const hasPurchased = await Order.findOne({
          userId: userId,
          orderStatus: 'delivered',
          'items.productId': productId
        });
        
        isVerifiedPurchase = !!hasPurchased;
      }
    } else {
      // Guest user - validation required
      if (!reviewerName || !reviewerName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please provide your name'
        });
      }
      
      userName = reviewerName.trim();
      userEmail = email ? email.toLowerCase().trim() : '';
      isGuest = true;
      isVerifiedPurchase = false;
      
      // Validate email if provided
      if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address'
        });
      }
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Review must be at least 10 characters long'
      });
    }

    if (comment.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Review cannot exceed 500 characters'
      });
    }

    // For logged-in users, check if they've already reviewed this product
    if (!isGuest && productId) {
      const existingReview = await Review.findOne({
        user: userId,
        product: productId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this product'
        });
      }
    }
    
    // For guest users with email, check if same email has reviewed this product recently
    if (isGuest && productId && userEmail) {
      const existingReview = await Review.findOne({
        guestEmail: userEmail,
        product: productId,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          error: 'You have already reviewed this product recently'
        });
      }
    }

    // Create review
    const review = await Review.create({
      user: userId,
      userName,
      email: userEmail,
      product: productId || null,
      productName: productName || '',
      rating,
      title: title || '',
      comment: comment.trim(),
      images: images || [],
      video: video || null,
      isAnonymous: isLoggedIn ? isAnonymous : false,
      isGuest,
      guestEmail: isGuest ? userEmail : null,
      guestName: isGuest ? userName : null,
      isVerifiedPurchase,
      status: 'pending',
      isApproved: false
    });

    // Populate user info for response (if logged in)
    if (!isGuest) {
      await review.populate('user', 'contactPerson email profilePicture');
    }

    res.status(201).json({
      success: true,
      data: review,
      message: isGuest 
        ? 'Review submitted successfully! It will be published after moderation.'
        : `Review submitted successfully and pending approval${isVerifiedPurchase ? ' (Verified Purchase)' : ''}`
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit review'
    });
  }
};

// @desc    Get all reviews (with filters)
// @route   GET /api/reviews
// @access  Public/Private (Admin/Mod/SuperAdmin can see all)
const getReviews = async (req, res) => {
  try {
    console.log('=== GET REVIEWS DEBUG ===');
    console.log('User:', req.user ? { id: req.user.id, role: req.user.role } : 'No user');
    console.log('Query params:', req.query);
    
    const {
      page = 1,
      limit = 10,
      productId,
      userId,
      status,
      rating,
      isApproved,
      search,
      sort = '-createdAt',
      includeUserPending = 'false' // NEW: flag to include user's pending reviews
    } = req.query;

    const query = {};

    // Filter by product
    if (productId) {
      query.product = productId;
    }

    // Filter by user
    if (userId) {
      if (userId === 'me') {
        // Get current user's reviews
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: 'Please login to view your reviews'
          });
        }
        query.user = req.user.id;
      } else {
        query.user = userId;
      }
    }

    // Get current logged-in user ID and role
    const currentUserId = req.user?._id || req.user?.id;
    const userRole = req.user?.role;
    
    // Check if user is admin, moderator, OR super_admin
    const isAdminOrMod = userRole && ['admin', 'moderator', 'super_admin'].includes(userRole);
    
    console.log('Is Admin/Mod/SuperAdmin:', isAdminOrMod);
    console.log('User Role:', userRole);

    // ========== STATUS FILTERING ==========
    // If status is 'approved' and user is logged in, we want to show:
    // 1. All approved reviews
    // 2. User's own pending reviews (if includeUserPending is true)
    const shouldIncludePending = includeUserPending === 'true' && currentUserId;
    
    if (status && status !== 'all') {
      // If status is 'approved' and user wants to see their pending reviews too
      if (status === 'approved' && shouldIncludePending) {
        // Show approved reviews + user's pending reviews
        query.$or = [
          { status: 'approved', isApproved: true },
          { user: currentUserId, status: 'pending' }
        ];
        // Don't set query.status directly
      } else {
        // Normal status filter
        query.status = status;
      }
    } else if (!status && !isAdminOrMod) {
      // If no status filter and user is not admin/mod/super_admin
      // Show approved reviews + user's own pending/rejected
      query.$or = [
        { status: 'approved', isApproved: true },
        ...(currentUserId ? [
          { user: currentUserId, status: 'pending' },
          { user: currentUserId, status: 'rejected' }
        ] : [])
      ];
    }
    // For admin/mod/super_admin with no status filter, show ALL reviews
    // No additional filtering needed

    // Filter by rating
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    // Filter by approval status (admin/mod/super_admin only)
    if (isApproved !== undefined && isApproved !== 'all' && isAdminOrMod) {
      query.isApproved = isApproved === 'true';
    }

    // Search in comment and title
    if (search && search.trim()) {
      const searchRegex = { $regex: search, $options: 'i' };
      if (query.$or) {
        query.$or.push(
          { comment: searchRegex },
          { title: searchRegex },
          { userName: searchRegex }
        );
      } else {
        query.$or = [
          { comment: searchRegex },
          { title: searchRegex },
          { userName: searchRegex }
        ];
      }
    }

    console.log('Final query:', JSON.stringify(query, null, 2));
    
    // Count total reviews in database for debugging
    const totalAll = await Review.countDocuments({});
    console.log('Total reviews in database:', totalAll);
    
    // Count with our query
    const countWithQuery = await Review.countDocuments(query);
    console.log('Reviews matching query:', countWithQuery);
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'rating_asc':
        sortOption = { rating: 1 };
        break;
      case 'rating_desc':
        sortOption = { rating: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'contactPerson email profilePicture')
        .populate('product', 'productName slug images')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query)
    ]);

    console.log(`Found ${reviews.length} reviews out of ${total} total matching query`);
    console.log('First review sample:', reviews[0] ? {
      id: reviews[0]._id,
      productName: reviews[0].productName,
      status: reviews[0].status
    } : 'No reviews');

    // Calculate average rating and distribution for products (if product filter is applied)
    let stats = null;
    if (productId) {
      const allProductReviews = await Review.find({ 
        product: productId, 
        status: 'approved',
        isApproved: true 
      });
      
      const totalReviews = allProductReviews.length;
      const avgRating = totalReviews > 0 
        ? allProductReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allProductReviews.forEach(r => {
        distribution[r.rating]++;
      });
      
      stats = {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        ratingDistribution: distribution
      };
    }

    res.json({
      success: true,
      data: reviews,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch reviews'
    });
  }
};

// @desc    Get single review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'contactPerson email profilePicture')
      .populate('product', 'productName slug images regularPrice discountPrice');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check if review is approved for public viewing
    if (review.status !== 'approved' && (!req.user || !['admin', 'moderator', 'super_admin'].includes(req.user.role))) {
      return res.status(403).json({
        success: false,
        error: 'Review is not available'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch review'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Owner or Admin/Mod/SuperAdmin)
// const updateReview = async (req, res) => {
//   try {
//     const review = await Review.findById(req.params.id);

//     if (!review) {
//       return res.status(404).json({
//         success: false,
//         error: 'Review not found'
//       });
//     }

//     // Check permissions
//     const isOwner = review.user && review.user.toString() === req.user.id;
//     const isModerator = req.user.role === 'moderator';
//     const isAdmin = req.user.role === 'admin';
//     const isSuperAdmin = req.user.role === 'super_admin';

//     // For guest reviews, only admin/moderator/super_admin can edit
//     if (!review.user) {
//       if (!isModerator && !isAdmin && !isSuperAdmin) {
//         return res.status(403).json({
//           success: false,
//           error: 'Only admins, moderators, and super admins can edit guest reviews'
//         });
//       }
//     } else if (!isOwner && !isModerator && !isAdmin && !isSuperAdmin) {
//       return res.status(403).json({
//         success: false,
//         error: 'You are not authorized to update this review'
//       });
//     }

//     // Regular users can only update their own pending reviews
//     if (isOwner && !isModerator && !isAdmin && !isSuperAdmin && review.status !== 'pending') {
//       return res.status(400).json({
//         success: false,
//         error: 'You can only edit pending reviews'
//       });
//     }

//     const {
//       rating,
//       title,
//       comment,
//       isAnonymous,
//       status,
//       isFeatured,
//       imagesToDelete,
//       videoToDelete,
//       newImages,
//       newVideo
//     } = req.body;

//     // Update text fields
//     if (rating !== undefined) review.rating = rating;
//     if (title !== undefined) review.title = title;
//     if (comment !== undefined) review.comment = comment.trim();
//     if (isAnonymous !== undefined && review.user) review.isAnonymous = isAnonymous;
    
//     // Update status (admin/mod/super_admin only)
//     if (status && (isModerator || isAdmin || isSuperAdmin)) {
//       review.status = status;
//       if (status === 'approved') {
//         review.isApproved = true;
//         review.moderatedBy = req.user.id;
//         review.moderatedAt = new Date();
        
//         // Update product stats when review is approved
//         if (review.product) {
//           await updateProductReviewStats(review.product);
//         }
//       } else if (status === 'rejected') {
//         review.isApproved = false;
//         review.moderatedBy = req.user.id;
//         review.moderatedAt = new Date();
//       }
//     }
    
//     if (isFeatured !== undefined && (isModerator || isAdmin || isSuperAdmin)) {
//       review.isFeatured = isFeatured;
//     }

//     // Handle image deletion
//     if (imagesToDelete && imagesToDelete.length > 0 && (isOwner || isModerator || isAdmin || isSuperAdmin)) {
//       for (const publicId of imagesToDelete) {
//         try {
//           await cloudinary.uploader.destroy(publicId);
//           console.log(`Deleted image: ${publicId}`);
//         } catch (err) {
//           console.error('Failed to delete image:', err);
//         }
//       }
//       review.images = review.images.filter(img => !imagesToDelete.includes(img.publicId));
//     }

//     // Handle video deletion
//     if (videoToDelete && (isOwner || isModerator || isAdmin || isSuperAdmin)) {
//       try {
//         await cloudinary.uploader.destroy(videoToDelete, { resource_type: 'video' });
//         console.log(`Deleted video: ${videoToDelete}`);
//       } catch (err) {
//         console.error('Failed to delete video:', err);
//       }
//       review.video = null;
//     }

//     // Add new images
//     if (newImages && newImages.length > 0 && (isOwner || isModerator || isAdmin || isSuperAdmin)) {
//       if (!review.images) review.images = [];
//       review.images = [...review.images, ...newImages];
//       console.log(`Added ${newImages.length} new images`);
//     }

//     // Add new video
//     if (newVideo && (isOwner || isModerator || isAdmin || isSuperAdmin)) {
//       review.video = newVideo;
//       console.log('Added new video');
//     }

//     await review.save();

//     res.json({
//       success: true,
//       data: review,
//       message: 'Review updated successfully'
//     });

//   } catch (error) {
//     console.error('Update review error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Failed to update review'
//     });
//   }
// };

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Owner or Admin/Mod/SuperAdmin)
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Check permissions
    const isOwner = review.user && review.user.toString() === req.user.id;
    const isModerator = req.user.role === 'moderator';
    const isAdmin = req.user.role === 'admin';
    const isSuperAdmin = req.user.role === 'super_admin';

    // For guest reviews, only admin/moderator/super_admin can edit
    if (!review.user) {
      if (!isModerator && !isAdmin && !isSuperAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Only admins, moderators, and super admins can edit guest reviews'
        });
      }
    } else if (!isOwner && !isModerator && !isAdmin && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this review'
      });
    }

    // Regular users can only update their own pending reviews
    if (isOwner && !isModerator && !isAdmin && !isSuperAdmin && review.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'You can only edit pending reviews'
      });
    }

    const {
      rating,
      title,
      comment,
      isAnonymous,
      status,
      isFeatured,
      imagesToDelete,
      videoToDelete,
      newImages,
      newVideo
    } = req.body;

    // Update text fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment.trim();
    if (isAnonymous !== undefined && review.user) review.isAnonymous = isAnonymous;
    
    // Update status (admin/mod/super_admin only)
    if (status && (isModerator || isAdmin || isSuperAdmin)) {
      review.status = status;
      if (status === 'approved') {
        review.isApproved = true;
        review.moderatedBy = req.user.id;
        review.moderatedAt = new Date();
        
        // Update product stats when review is approved
        if (review.product) {
          await updateProductReviewStats(review.product);
        }
      } else if (status === 'rejected') {
        review.isApproved = false;
        review.moderatedBy = req.user.id;
        review.moderatedAt = new Date();
      }
    }
    
    if (isFeatured !== undefined && (isModerator || isAdmin || isSuperAdmin)) {
      review.isFeatured = isFeatured;
    }

    // ========== HANDLE IMAGE DELETION ==========
    if (imagesToDelete && Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
      console.log('Images to delete:', imagesToDelete);
      
      // Delete each image from Cloudinary
      for (const publicId of imagesToDelete) {
        if (publicId) {
          try {
            // Check if it's a Cloudinary public ID (not a full URL)
            let cloudinaryPublicId = publicId;
            
            // If it's a full URL, extract the public ID
            if (publicId.startsWith('http')) {
              // Extract public ID from Cloudinary URL
              const parts = publicId.split('/');
              const uploadIndex = parts.findIndex(part => part === 'upload');
              if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
                cloudinaryPublicId = parts.slice(uploadIndex + 2).join('/');
                // Remove file extension
                cloudinaryPublicId = cloudinaryPublicId.substring(0, cloudinaryPublicId.lastIndexOf('.'));
              }
            }
            
            console.log(`Attempting to delete image: ${cloudinaryPublicId}`);
            const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
            console.log(`Cloudinary delete result for ${cloudinaryPublicId}:`, result);
            
            if (result.result !== 'ok') {
              console.warn(`Failed to delete image ${cloudinaryPublicId}:`, result);
            }
          } catch (err) {
            console.error('Failed to delete image from Cloudinary:', err);
          }
        }
      }
      
      // Remove deleted images from review.images
      review.images = review.images.filter(img => {
        // Check if this image's publicId is in the delete list
        const publicId = img.publicId;
        if (!publicId) return true; // Keep images without publicId
        
        // If the publicId is in the delete list, remove it
        const shouldDelete = imagesToDelete.some(id => id === publicId);
        return !shouldDelete;
      });
      
      console.log(`Images after deletion: ${review.images.length}`);
    }

    // ========== HANDLE VIDEO DELETION ==========
    if (videoToDelete && (isOwner || isModerator || isAdmin || isSuperAdmin)) {
      console.log('Video to delete:', videoToDelete);
      
      try {
        let cloudinaryPublicId = videoToDelete;
        
        // If it's a full URL, extract the public ID
        if (videoToDelete.startsWith('http')) {
          const parts = videoToDelete.split('/');
          const uploadIndex = parts.findIndex(part => part === 'upload');
          if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
            cloudinaryPublicId = parts.slice(uploadIndex + 2).join('/');
            cloudinaryPublicId = cloudinaryPublicId.substring(0, cloudinaryPublicId.lastIndexOf('.'));
          }
        }
        
        console.log(`Attempting to delete video: ${cloudinaryPublicId}`);
        const result = await cloudinary.uploader.destroy(cloudinaryPublicId, { resource_type: 'video' });
        console.log(`Cloudinary delete result for video:`, result);
        
        if (result.result === 'ok') {
          review.video = null;
        } else {
          console.warn('Failed to delete video:', result);
        }
      } catch (err) {
        console.error('Failed to delete video from Cloudinary:', err);
      }
    }

    // ========== ADD NEW IMAGES ==========
    if (newImages && Array.isArray(newImages) && newImages.length > 0 && (isOwner || isModerator || isAdmin || isSuperAdmin)) {
      if (!review.images) review.images = [];
      review.images = [...review.images, ...newImages];
      console.log(`Added ${newImages.length} new images`);
    }

    // ========== ADD NEW VIDEO ==========
    if (newVideo && (isOwner || isModerator || isAdmin || isSuperAdmin)) {
      review.video = newVideo;
      console.log('Added new video');
    }

    await review.save();

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update review'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin/Mod/SuperAdmin only)
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Only admin, moderator, or super_admin can delete reviews
    if (!['admin', 'moderator', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins, moderators, and super admins can delete reviews'
      });
    }

    // Store product ID before deleting
    const productId = review.product;
    const wasApproved = review.status === 'approved';

    // Delete images from Cloudinary
    if (review.images && review.images.length > 0) {
      for (const image of review.images) {
        if (image.publicId) {
          try {
            await cloudinary.uploader.destroy(image.publicId);
          } catch (cloudinaryError) {
            console.error('Failed to delete image from Cloudinary:', cloudinaryError);
          }
        }
      }
    }

    // Delete video from Cloudinary
    if (review.video && review.video.publicId) {
      try {
        await cloudinary.uploader.destroy(review.video.publicId, { resource_type: 'video' });
      } catch (cloudinaryError) {
        console.error('Failed to delete video from Cloudinary:', cloudinaryError);
      }
    }

    await review.deleteOne();

    // Update product stats if review was approved
    if (wasApproved && productId) {
      await updateProductReviewStats(productId);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete review'
    });
  }
};

// @desc    Approve review (Admin/Mod/SuperAdmin only)
// @route   PUT /api/reviews/:id/approve
// @access  Private (Admin/Mod/SuperAdmin)
const approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    review.status = 'approved';
    review.isApproved = true;
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    await review.save();

    // Update product rating and stats
    if (review.product) {
      await updateProductReviewStats(review.product);
    }

    res.json({
      success: true,
      data: review,
      message: 'Review approved successfully'
    });

  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to approve review'
    });
  }
};

// @desc    Reject review (Admin/Mod/SuperAdmin only)
// @route   PUT /api/reviews/:id/reject
// @access  Private (Admin/Mod/SuperAdmin)
const rejectReview = async (req, res) => {
  try {
    const { moderationNote } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    review.status = 'rejected';
    review.isApproved = false;
    review.moderationNote = moderationNote || '';
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    await review.save();

    // Update product stats if review was previously approved
    if (review.product) {
      await updateProductReviewStats(review.product);
    }

    res.json({
      success: true,
      data: review,
      message: 'Review rejected'
    });

  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reject review'
    });
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const userId = req.user.id;

    // Check if user already marked as helpful
    if (review.helpfulUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already marked this review as helpful'
      });
    }

    review.helpful += 1;
    review.helpfulUsers.push(userId);
    await review.save();

    res.json({
      success: true,
      data: { helpful: review.helpful },
      message: 'Review marked as helpful'
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to mark review as helpful'
    });
  }
};

// @desc    Reply to review (Admin/Mod/SuperAdmin only)
// @route   POST /api/reviews/:id/reply
// @access  Private (Admin/Mod/SuperAdmin)
const replyToReview = async (req, res) => {
  try {
    const { replyText } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (!replyText || replyText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Reply text is required'
      });
    }

    review.reply = {
      text: replyText.trim(),
      repliedBy: req.user.id,
      repliedAt: new Date()
    };

    await review.save();

    await review.populate('reply.repliedBy', 'contactPerson email');

    res.json({
      success: true,
      data: review,
      message: 'Reply added successfully'
    });

  } catch (error) {
    console.error('Reply to review error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add reply'
    });
  }
};

// @desc    Get user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ user: req.user.id })
        .populate('product', 'productName slug images regularPrice discountPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ user: req.user.id })
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch your reviews'
    });
  }
};

// @desc    Upload media for review
// @route   POST /api/reviews/upload-media
// @access  Private
const uploadMedia = async (req, res) => {
  try {
    const { file, type } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    res.json({
      success: true,
      message: 'Upload endpoint - implement based on your needs'
    });

  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload media'
    });
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats
// @access  Public
const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const reviews = await Review.find({
      product: productId,
      status: 'approved',
      isApproved: true
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating]++;
    });

    const percentageDistribution = {};
    for (let i = 1; i <= 5; i++) {
      percentageDistribution[i] = totalReviews > 0 
        ? (distribution[i] / totalReviews) * 100 
        : 0;
    }

    res.json({
      success: true,
      data: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        ratingDistribution: distribution,
        percentageDistribution
      }
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch review statistics'
    });
  }
};

// @desc    Toggle featured status of a review (Admin/Mod/SuperAdmin only)
// @route   PUT /api/reviews/:id/featured
// @access  Private (Admin/Mod/SuperAdmin)
const toggleFeatured = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Only admin, moderator, or super_admin can toggle featured
    if (!['admin', 'moderator', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only admins, moderators, and super admins can feature reviews'
      });
    }

    // Toggle the featured status
    review.isFeatured = !review.isFeatured;
    await review.save();

    res.json({
      success: true,
      data: review,
      message: review.isFeatured ? 'Review featured successfully' : 'Review removed from featured'
    });

  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to toggle featured status'
    });
  }
};

// @desc    Get featured reviews
// @route   GET /api/reviews/featured
// @access  Public
const getFeaturedReviews = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const reviews = await Review.find({
      isFeatured: true,
      status: 'approved',
      isApproved: true
    })
      .populate('user', 'contactPerson email profilePicture')
      .populate('product', 'productName slug images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });

  } catch (error) {
    console.error('Get featured reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch featured reviews'
    });
  }
};

// ========== HELPER FUNCTION ==========

// Helper function to update product review stats
const updateProductReviewStats = async (productId) => {
  try {
    const productReviews = await Review.find({
      product: productId,
      status: 'approved',
      isApproved: true
    });

    const totalReviews = productReviews.length;
    const avgRating = totalReviews > 0
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    productReviews.forEach(r => {
      distribution[r.rating]++;
    });

    await Product.findByIdAndUpdate(productId, {
      rating: totalReviews > 0 ? Math.round(avgRating * 10) / 10 : 0,
      reviewStats: {
        averageRating: totalReviews > 0 ? Math.round(avgRating * 10) / 10 : 0,
        totalReviews: totalReviews,
        ratingDistribution: distribution
      }
    });

    console.log(`Updated product ${productId} review stats: ${totalReviews} reviews, avg ${Math.round(avgRating * 10) / 10}`);
  } catch (error) {
    console.error('Error updating product review stats:', error);
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  markHelpful,
  replyToReview,
  getMyReviews,
  uploadMedia,
  getReviewStats,
  toggleFeatured,
  getFeaturedReviews
};