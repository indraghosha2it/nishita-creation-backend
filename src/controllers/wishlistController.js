const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Public (with sessionId) or Private (with token)
// const getWishlist = async (req, res) => {
//   try {
//     const userId = req.user?._id;
//     const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
//     console.log('=== GET WISHLIST ===');
//     console.log('UserId:', userId);
//     console.log('SessionId:', sessionId);
    
//     let wishlist = null;
    
//     if (userId) {
//       wishlist = await Wishlist.findOne({ userId });
//       console.log('Searching for wishlist with userId:', userId);
//       console.log('Wishlist found:', !!wishlist);
//       if (wishlist) {
//         console.log('Wishlist totalItems:', wishlist.totalItems);
//       }
//     } else if (sessionId) {
//       wishlist = await Wishlist.findOne({ sessionId });
//       console.log('Searching for wishlist with sessionId:', sessionId);
//       console.log('Wishlist found:', !!wishlist);
//       if (wishlist) {
//         console.log('Wishlist totalItems:', wishlist.totalItems);
//       }
//     }
    
//     if (!wishlist) {
//       console.log('No wishlist found, returning empty wishlist');
//       return res.status(200).json({ 
//         success: true, 
//         data: { items: [], totalItems: 0 } 
//       });
//     }
    
//     res.json({ success: true, data: wishlist });
//   } catch (error) {
//     console.error('Get wishlist error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// @desc    Get user's wishlist with full product details
// @route   GET /api/wishlist
// @access  Public (with sessionId) or Private (with token)
const getWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    console.log('=== GET WISHLIST ===');
    console.log('UserId:', userId);
    console.log('SessionId:', sessionId);
    
    let wishlist = null;
    
    if (userId) {
      wishlist = await Wishlist.findOne({ userId });
      console.log('Searching for wishlist with userId:', userId);
      console.log('Wishlist found:', !!wishlist);
    } else if (sessionId) {
      wishlist = await Wishlist.findOne({ sessionId });
      console.log('Searching for wishlist with sessionId:', sessionId);
      console.log('Wishlist found:', !!wishlist);
    }
    
    if (!wishlist) {
      console.log('No wishlist found, returning empty wishlist');
      return res.status(200).json({ 
        success: true, 
        data: { items: [], totalItems: 0 } 
      });
    }
    
    // Enrich wishlist items with full product details
    const enrichedItems = await Promise.all(
      wishlist.items.map(async (item) => {
        try {
          const product = await Product.findById(item.productId).populate('category', 'name slug');
          
          if (product) {
            return {
              ...item.toObject(),
              // Add full product details
              images: product.images || [],
              tags: product.tags || [],
              ageGroup: product.ageGroup,
              brand: product.brand,
              category: product.category,
              categoryName: product.categoryName,
              subcategoryName: product.subcategoryName,
              childSubcategoryName: product.childSubcategoryName,
              fullDescription: product.fullDescription,
              shortDescription: product.shortDescription,
              rating: product.rating || 5,
              // Keep original wishlist data
              _id: item._id,
              productId: item.productId,
              productName: item.productName,
              productSlug: item.productSlug,
              image: item.image,
              regularPrice: item.regularPrice,
              discountPrice: item.discountPrice,
              stockQuantity: item.stockQuantity,
              addedAt: item.addedAt
            };
          }
          return item;
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return item;
        }
      })
    );
    
    const enrichedWishlist = {
      ...wishlist.toObject(),
      items: enrichedItems
    };
    
    res.json({ success: true, data: enrichedWishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add item to wishlist (toggle functionality - add/remove)
// @route   POST /api/wishlist
// @access  Public (with sessionId) or Private (with token)
// const addToWishlist = async (req, res) => {
//   console.log('=== ADD TO WISHLIST ===');
//   console.log('req.user:', req.user);
//   console.log('req.user?._id:', req.user?._id);
  
//   try {
//     const { productId } = req.body;
//     const userId = req.user?._id;
    
//     if (!productId) {
//       return res.status(400).json({ success: false, error: 'Product ID is required' });
//     }
    
//     // Get product details
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ success: false, error: 'Product not found' });
//     }
    
//     let wishlist;
    
//     if (userId) {
//       // LOGGED IN USER - Find or create wishlist by userId
//       console.log('Adding to wishlist for logged-in user:', userId);
//       wishlist = await Wishlist.findOne({ userId });
      
//       if (!wishlist) {
//         wishlist = new Wishlist({
//           userId: userId,
//           sessionId: null,
//           items: []
//         });
//         console.log('Created new wishlist for user:', userId);
//       }
//     } else {
//       // GUEST USER - Find or create wishlist by sessionId
//       let sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      
//       if (!sessionId) {
//         sessionId = `wish_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       }
      
//       console.log('Adding to wishlist for guest user, sessionId:', sessionId);
//       wishlist = await Wishlist.findOne({ sessionId });
      
//       if (!wishlist) {
//         wishlist = new Wishlist({
//           userId: null,
//           sessionId: sessionId,
//           items: []
//         });
//         console.log('Created new wishlist for session:', sessionId);
//       }
      
//       // Set session cookie for guest
//       if (!req.headers['x-session-id']) {
//         res.cookie('wishlistSessionId', sessionId, {
//           httpOnly: true,
//           maxAge: 30 * 24 * 60 * 60 * 1000,
//           sameSite: 'lax'
//         });
//       }
      
//       // Store sessionId to return in response
//       wishlist._tempSessionId = sessionId;
//     }
    
//     // Check if product already in wishlist (toggle functionality)
//     const existingItemIndex = wishlist.items.findIndex(
//       item => item.productId.toString() === productId
//     );
    
//     let isInWishlist = false;
    
//     if (existingItemIndex >= 0) {
//       // Product already in wishlist - remove it
//       wishlist.items.splice(existingItemIndex, 1);
//       console.log('Removed item from wishlist');
//       isInWishlist = false;
//     } else {
//       // Add new item
//       wishlist.items.push({
//         productId: product._id,
//         productName: product.productName,
//         productSlug: product.slug || product._id.toString(),
//         image: product.images && product.images[0]?.url || '',
//         regularPrice: product.regularPrice,
//         discountPrice: product.discountPrice || 0,
//         stockQuantity: product.stockQuantity
//       });
//       console.log('Added new item to wishlist');
//       isInWishlist = true;
//     }
    
//     // Update totals - totalItems should be the number of unique items
//     wishlist.totalItems = wishlist.items.length;
//     wishlist.updatedAt = new Date();
    
//     await wishlist.save();
    
//     console.log('Wishlist saved - Total items:', wishlist.totalItems, 'User ID:', userId || 'guest');
    
//     // Prepare response
//     const responseData = {
//       success: true,
//       data: wishlist,
//       message: isInWishlist ? 'Added to wishlist' : 'Removed from wishlist',
//       isInWishlist: isInWishlist
//     };
    
//     // Only send sessionId for guest users
//     if (!userId && wishlist._tempSessionId) {
//       responseData.sessionId = wishlist._tempSessionId;
//       delete wishlist._tempSessionId;
//     }
    
//     res.json(responseData);
    
//   } catch (error) {
//     console.error('Add to wishlist error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// @desc    Add item to wishlist (toggle functionality - add/remove)
// @route   POST /api/wishlist
// @access  Public (with sessionId) or Private (with token)
const addToWishlist = async (req, res) => {
  console.log('=== ADD TO WISHLIST ===');
  console.log('req.user:', req.user);
  console.log('req.user?._id:', req.user?._id);
  
  try {
    const { productId } = req.body;
    const userId = req.user?._id;
    
    if (!productId) {
      return res.status(400).json({ success: false, error: 'Product ID is required' });
    }
    
    // Get product details with full data
    const product = await Product.findById(productId).populate('category', 'name slug');
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    let wishlist;
    
    if (userId) {
      // LOGGED IN USER - Find or create wishlist by userId
      console.log('Adding to wishlist for logged-in user:', userId);
      wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        wishlist = new Wishlist({
          userId: userId,
          sessionId: null,
          items: []
        });
        console.log('Created new wishlist for user:', userId);
      }
    } else {
      // GUEST USER - Find or create wishlist by sessionId
      let sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
      
      if (!sessionId) {
        sessionId = `wish_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      console.log('Adding to wishlist for guest user, sessionId:', sessionId);
      wishlist = await Wishlist.findOne({ sessionId });
      
      if (!wishlist) {
        wishlist = new Wishlist({
          userId: null,
          sessionId: sessionId,
          items: []
        });
        console.log('Created new wishlist for session:', sessionId);
      }
      
      // Set session cookie for guest
      if (!req.headers['x-session-id']) {
        res.cookie('wishlistSessionId', sessionId, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          sameSite: 'lax'
        });
      }
      
      // Store sessionId to return in response
      wishlist._tempSessionId = sessionId;
    }
    
    // Check if product already in wishlist (toggle functionality)
    const existingItemIndex = wishlist.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    let isInWishlist = false;
    
    if (existingItemIndex >= 0) {
      // Product already in wishlist - remove it
      wishlist.items.splice(existingItemIndex, 1);
      console.log('Removed item from wishlist');
      isInWishlist = false;
    } else {
      // Add new item with all product details
      wishlist.items.push({
        productId: product._id,
        productName: product.productName,
        productSlug: product.slug || product._id.toString(),
        image: product.images && product.images[0]?.url || '',
        regularPrice: product.regularPrice,
        discountPrice: product.discountPrice || 0,
        stockQuantity: product.stockQuantity
        // Note: images array, tags, ageGroup, etc. will be populated in getWishlist
      });
      console.log('Added new item to wishlist');
      isInWishlist = true;
    }
    
    // Update totals
    wishlist.totalItems = wishlist.items.length;
    wishlist.updatedAt = new Date();
    
    await wishlist.save();
    
    console.log('Wishlist saved - Total items:', wishlist.totalItems, 'User ID:', userId || 'guest');
    
    // Prepare response
    const responseData = {
      success: true,
      data: wishlist,
      message: isInWishlist ? 'Added to wishlist' : 'Removed from wishlist',
      isInWishlist: isInWishlist
    };
    
    // Only send sessionId for guest users
    if (!userId && wishlist._tempSessionId) {
      responseData.sessionId = wishlist._tempSessionId;
      delete wishlist._tempSessionId;
    }
    
    res.json(responseData);
    
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};




// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:itemId
// @access  Public (with sessionId) or Private (with token)
const removeFromWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    console.log('Removing item from wishlist - UserId:', userId, 'SessionId:', sessionId);
    
    // Allow both authenticated and guest users
    let wishlist;
    if (userId) {
      wishlist = await Wishlist.findOne({ userId });
    } else if (sessionId) {
      wishlist = await Wishlist.findOne({ sessionId });
    } else {
      return res.status(401).json({ success: false, error: 'Wishlist not found' });
    }
    
    if (!wishlist) {
      return res.status(404).json({ success: false, error: 'Wishlist not found' });
    }
    
    const originalLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(item => item._id.toString() !== itemId);
    
    console.log('Items before:', originalLength, 'Items after:', wishlist.items.length);
    
    // Recalculate totals
    wishlist.totalItems = wishlist.items.length;
    wishlist.updatedAt = new Date();
    
    await wishlist.save();
    
    console.log('Wishlist saved - Total items:', wishlist.totalItems);
    
    res.json({ success: true, data: wishlist });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Public (with sessionId) or Private (with token)
const clearWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    if (!userId && !sessionId) {
      return res.status(401).json({ success: false, error: 'Wishlist not found' });
    }
    
    let wishlist;
    if (userId) {
      wishlist = await Wishlist.findOne({ userId });
    } else {
      wishlist = await Wishlist.findOne({ sessionId });
    }
    
    if (wishlist) {
      wishlist.items = [];
      wishlist.totalItems = 0;
      wishlist.updatedAt = new Date();
      await wishlist.save();
    }
    
    res.json({ success: true, message: 'Wishlist cleared', data: { items: [], totalItems: 0 } });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Merge guest wishlist with user wishlist after login
// @route   POST /api/wishlist/merge
// @access  Private
const mergeWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = req.body.sessionId;
    
    console.log('Merging wishlist for user:', userId, 'SessionId:', sessionId);
    
    if (!sessionId) {
      return res.json({ success: true, message: 'No guest wishlist to merge' });
    }
    
    // Find guest wishlist
    const guestWishlist = await Wishlist.findOne({ sessionId });
    
    if (!guestWishlist || guestWishlist.items.length === 0) {
      return res.json({ success: true, message: 'No items to merge' });
    }
    
    console.log('Guest wishlist has', guestWishlist.items.length, 'items');
    
    // Find user wishlist
    let userWishlist = await Wishlist.findOne({ userId });
    
    if (!userWishlist) {
      // Convert guest wishlist to user wishlist
      guestWishlist.userId = userId;
      guestWishlist.sessionId = null;
      userWishlist = guestWishlist;
      
      // Update totals
      userWishlist.totalItems = userWishlist.items.length;
      userWishlist.updatedAt = new Date();
      
      await userWishlist.save();
    } else {
      // Merge items from guest wishlist to user wishlist - WITHOUT duplicates
      for (const guestItem of guestWishlist.items) {
        const alreadyExists = userWishlist.items.some(
          item => item.productId.toString() === guestItem.productId.toString()
        );
        
        if (!alreadyExists) {
          // New product - add to wishlist
          userWishlist.items.push(guestItem);
          console.log(`Added new product ${guestItem.productName} to user wishlist`);
        } else {
          console.log(`Product ${guestItem.productName} already in user wishlist, skipping merge`);
        }
      }
      
      // Update totals
      userWishlist.totalItems = userWishlist.items.length;
      userWishlist.updatedAt = new Date();
      
      await userWishlist.save();
      
      // Delete guest wishlist
      await guestWishlist.deleteOne();
    }
    
    console.log('Wishlist merged successfully. User wishlist now has', userWishlist.totalItems, 'items');
    
    res.json({ 
      success: true, 
      message: 'Wishlist merged successfully',
      data: userWishlist
    });
  } catch (error) {
    console.error('Merge wishlist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Check wishlist status for multiple products
// @route   POST /api/wishlist/check-status
// @access  Public (with sessionId) or Private (with token)
const checkWishlistStatus = async (req, res) => {
  try {
    const { productIds } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    let wishlist = null;
    if (userId) {
      wishlist = await Wishlist.findOne({ userId });
    } else if (sessionId) {
      wishlist = await Wishlist.findOne({ sessionId });
    }
    
    const inWishlistMap = {};
    if (wishlist && wishlist.items) {
      productIds.forEach(productId => {
        inWishlistMap[productId] = wishlist.items.some(item => item.productId.toString() === productId);
      });
    } else {
      productIds.forEach(productId => {
        inWishlistMap[productId] = false;
      });
    }
    
    res.json({ success: true, data: inWishlistMap });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Public (with sessionId) or Private (with token)
const checkWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    
    console.log('=== CHECK WISHLIST ITEM ===');
    console.log('Product ID:', productId);
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    
    let wishlist = null;
    if (userId) {
      wishlist = await Wishlist.findOne({ userId });
      console.log('Found wishlist by userId:', !!wishlist);
    } else if (sessionId) {
      wishlist = await Wishlist.findOne({ sessionId });
      console.log('Found wishlist by sessionId:', !!wishlist);
    }
    
    let inWishlist = false;
    if (wishlist && wishlist.items) {
      inWishlist = wishlist.items.some(item => item.productId.toString() === productId);
      console.log('Product in wishlist:', inWishlist);
    }
    
    res.json({ success: true, data: { inWishlist } });
  } catch (error) {
    console.error('Check wishlist item error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};



module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  mergeWishlist,
  checkWishlistStatus,
  checkWishlistItem
};