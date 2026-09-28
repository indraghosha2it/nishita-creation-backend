
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
// Make sure Order model is imported or available
// const Order = mongoose.model('Order'); // You'll need to require Order model

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private (Admin/Moderator)
const createCoupon = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      spendThreshold,
      highlightText,
      colorTheme,
      description,
      couponCode,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxTotalUses,
      maxUsesPerUser,
      expiresAt,
      isActive,
      showOnHomepage,
      isFirstPurchaseOnly,
      applicableCategories,
      stackable,
      autoApply
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Coupon title is required' });
    }
    
    if (!highlightText || !highlightText.trim()) {
      return res.status(400).json({ success: false, error: 'Highlight text is required' });
    }
    
    if (!couponCode || !couponCode.trim()) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
    }
    
    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ 
        success: false, 
        error: 'Coupon code already exists. Please use a different code.' 
      });
    }
    
    // Validate discount based on type
    if (discountType !== 'free_shipping') {
      if (!discountValue || discountValue <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Discount value is required and must be greater than 0' 
        });
      }
      if (discountType === 'percentage' && discountValue > 100) {
        return res.status(400).json({ 
          success: false, 
          error: 'Percentage discount cannot exceed 100%' 
        });
      }
    }
    
    // Validate expiry date
    if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        return res.status(400).json({ 
          success: false, 
          error: 'Expiry date cannot be in the past' 
        });
      }
    }
    
    // Create coupon
    const coupon = await Coupon.create({
      title: title.trim(),
      subtitle: subtitle || '',
      spendThreshold: spendThreshold || '',
      highlightText: highlightText.trim(),
      colorTheme: colorTheme || {},
      description: description || '',
      couponCode: couponCode.toUpperCase().trim(),
      discountType,
      discountValue: discountType !== 'free_shipping' ? Number(discountValue) : 0,
      minimumOrderAmount: minimumOrderAmount || 0,
      maxTotalUses: maxTotalUses || null,
      maxUsesPerUser: maxUsesPerUser || 1,
      expiresAt: expiresAt || null,
      isActive: isActive !== undefined ? isActive : true,
      showOnHomepage: showOnHomepage || false,
      isFirstPurchaseOnly: isFirstPurchaseOnly || false,
      applicableCategories: applicableCategories || [],
      stackable: stackable || false,
      autoApply: autoApply || false,
      createdBy: req.user.id
    });
    
    // Populate createdBy for response
    await coupon.populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully'
    });
    
  } catch (error) {
    console.error('Create coupon error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating coupon'
    });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin/Moderator)
const getCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      discountType,
      isActive,
      showOnHomepage,
      sort = '-createdAt'
    } = req.query;
    
    const query = {};
    
    // Search by coupon code or title
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { couponCode: searchRegex },
        { title: searchRegex }
      ];
    }
    
    // Filter by discount type
    if (discountType) {
      query.discountType = discountType;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Filter by homepage display
    if (showOnHomepage !== undefined) {
      query.showOnHomepage = showOnHomepage === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'createdAt_asc':
        sortOption = { createdAt: 1 };
        break;
      case 'createdAt_desc':
        sortOption = { createdAt: -1 };
        break;
      case 'code_asc':
        sortOption = { couponCode: 1 };
        break;
      case 'usage_desc':
        sortOption = { totalUsedCount: -1 };
        break;
      case 'expires_asc':
        sortOption = { expiresAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate('createdBy', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Coupon.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: coupons,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching coupons'
    });
  }
};

// @desc    Get single coupon by ID or code
// @route   GET /api/coupons/:id
// @access  Public (for validate) / Private (for admin)
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a coupon code or ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isObjectId ? { _id: id } : { couponCode: id.toUpperCase() };
    
    const coupon = await Coupon.findOne(query)
      .populate('createdBy', 'name email');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }
    
    res.json({
      success: true,
      data: coupon
    });
    
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching coupon'
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin/Moderator)
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }
    
    const {
      title,
      subtitle,
      spendThreshold,
      highlightText,
      colorTheme,
      description,
      couponCode,
      discountType,
      discountValue,
      minimumOrderAmount,
      maxTotalUses,
      maxUsesPerUser,
      expiresAt,
      isActive,
      showOnHomepage,
      isFirstPurchaseOnly,
      applicableCategories,
      stackable,
      autoApply
    } = req.body;
    
    // Check if new coupon code already exists (if changing)
    if (couponCode && couponCode.toUpperCase() !== coupon.couponCode) {
      const existingCoupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          error: 'Coupon code already exists'
        });
      }
      coupon.couponCode = couponCode.toUpperCase();
    }
    
    // Validate discount
    if (discountType !== 'free_shipping') {
      if (discountValue && discountValue <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Discount value must be greater than 0'
        });
      }
      if (discountType === 'percentage' && discountValue > 100) {
        return res.status(400).json({
          success: false,
          error: 'Percentage discount cannot exceed 100%'
        });
      }
    }
    
    // Update fields
    if (title !== undefined) coupon.title = title.trim();
    if (subtitle !== undefined) coupon.subtitle = subtitle;
    if (spendThreshold !== undefined) coupon.spendThreshold = spendThreshold;
    if (highlightText !== undefined) coupon.highlightText = highlightText.trim();
    if (colorTheme !== undefined) coupon.colorTheme = colorTheme;
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = minimumOrderAmount;
    if (maxTotalUses !== undefined) coupon.maxTotalUses = maxTotalUses || null;
    if (maxUsesPerUser !== undefined) coupon.maxUsesPerUser = maxUsesPerUser;
    if (expiresAt !== undefined) coupon.expiresAt = expiresAt || null;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (showOnHomepage !== undefined) coupon.showOnHomepage = showOnHomepage;
    if (isFirstPurchaseOnly !== undefined) coupon.isFirstPurchaseOnly = isFirstPurchaseOnly;
    if (applicableCategories !== undefined) coupon.applicableCategories = applicableCategories;
    if (stackable !== undefined) coupon.stackable = stackable;
    if (autoApply !== undefined) coupon.autoApply = autoApply;
    
    await coupon.save();
    await coupon.populate('createdBy', 'name email');
    
    res.json({
      success: true,
      data: coupon,
      message: 'Coupon updated successfully'
    });
    
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating coupon'
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin only)
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }
    
    await coupon.deleteOne();
    
    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting coupon'
    });
  }
};

// @desc    Validate coupon for cart
// @route   POST /api/coupons/validate
// @access  Public (with optional auth)
const validateCoupon = async (req, res) => {
  try {
    const { couponCode, cartSubtotal, userId, productIds, categoryIds } = req.body;
    
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      });
    }
    
    if (!cartSubtotal || cartSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart total is required'
      });
    }
    
    // Find coupon
    const coupon = await Coupon.findOne({ 
      couponCode: couponCode.toUpperCase(),
      isActive: true
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Invalid coupon code',
        code: 'INVALID_CODE'
      });
    }
    
    // Check if expired
    if (coupon.isExpired) {
      return res.status(400).json({
        success: false,
        error: 'This coupon has expired',
        code: 'EXPIRED'
      });
    }
    
    // Check if max uses reached
    if (coupon.isMaxUsesReached) {
      return res.status(400).json({
        success: false,
        error: 'This coupon has reached its maximum usage limit',
        code: 'MAX_USES_REACHED'
      });
    }
    
    // Check if user can use (first purchase only and per-user limit)
    if (userId) {
      const canUse = await coupon.canUserUse(userId);
      if (!canUse) {
        return res.status(400).json({
          success: false,
          error: 'You are not eligible to use this coupon',
          code: 'USER_NOT_ELIGIBLE'
        });
      }
    }
    
    // Check product/category restrictions
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      // If categories are specified, cart must contain products from these categories
      const hasApplicableCategory = categoryIds && categoryIds.some(
        catId => coupon.applicableCategories.some(
          appCatId => appCatId.toString() === catId.toString()
        )
      );
      if (!hasApplicableCategory) {
        return res.status(400).json({
          success: false,
          error: 'This coupon is only valid for specific categories',
          code: 'CATEGORY_RESTRICTION'
        });
      }
    }
    
    // Calculate discount
    const discountResult = coupon.calculateDiscount(cartSubtotal);
    
    if (!discountResult.isValid) {
      return res.status(400).json({
        success: false,
        error: discountResult.reason || 'Coupon conditions not met',
        code: 'CONDITIONS_NOT_MET',
        minimumRequired: coupon.minimumOrderAmount
      });
    }
    
    // Build response
    const response = {
      success: true,
      data: {
        couponId: coupon._id,
        couponCode: coupon.couponCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountResult.discount,
        freeShipping: discountResult.freeShipping || false,
        minimumOrderAmount: coupon.minimumOrderAmount,
        title: coupon.title,
        highlightText: coupon.highlightText,
        description: coupon.description
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while validating coupon'
    });
  }
};

// @desc    Get coupons for homepage (active, show on homepage)
// @route   GET /api/coupons/homepage
// @access  Public
const getHomepageCoupons = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const coupons = await Coupon.find({
      isActive: true,
      showOnHomepage: true,
      $or: [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: null }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('title subtitle highlightText colorTheme couponCode discountType discountValue minimumOrderAmount');
    
    res.json({
      success: true,
      data: coupons
    });
    
  } catch (error) {
    console.error('Get homepage coupons error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Check if coupon code exists
// @route   GET /api/coupons/check-code
// @access  Private (Admin/Moderator)
const checkCouponCode = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      });
    }
    
    const coupon = await Coupon.findOne({ couponCode: code.toUpperCase() });
    
    res.json({
      success: true,
      exists: !!coupon
    });
    
  } catch (error) {
    console.error('Check coupon code error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Record coupon usage (after order completion)
// @route   POST /api/coupons/:id/record-usage
// @access  Private
const recordCouponUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId, discountAmount, cartSubtotal, finalTotal } = req.body;
    const userId = req.user._id;
    
    const coupon = await Coupon.findById(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Coupon not found'
      });
    }
    
    // Add usage record
    coupon.usageRecords.push({
      userId,
      orderId,
      discountAmount,
      cartSubtotal,
      finalTotal,
      usedAt: new Date()
    });
    
    // Increment total used count
    coupon.totalUsedCount += 1;
    
    await coupon.save();
    
    res.json({
      success: true,
      message: 'Coupon usage recorded successfully'
    });
    
  } catch (error) {
    console.error('Record coupon usage error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



// @desc    Get available coupons for user (browse coupons)
// @route   POST /api/coupons/available
// @access  Private/Public
const getAvailableCoupons = async (req, res) => {
  try {
    const { userId, subtotal, productIds, categoryIds } = req.body;
    
    console.log('=== GET AVAILABLE COUPONS ===');
    console.log('userId:', userId);
    console.log('subtotal:', subtotal);
    
    const now = new Date();
    
    // Build query for active coupons that are not expired
    const query = {
      isActive: true,
      $or: [
        { expiresAt: { $gte: now } },
        { expiresAt: null }
      ]
    };
    
    // Get all active coupons
    let coupons = await Coupon.find(query).lean(); // Use .lean() for plain JS objects
    
    console.log(`Found ${coupons.length} active coupons`);
    
    // Filter coupons based on validation rules
    const availableCoupons = [];
    
    for (const coupon of coupons) {
      let isValid = true;
      let reason = null;
      
      console.log(`Checking coupon: ${coupon.couponCode}`);
      
      // Check if expired (manual check since virtual might not work with lean)
      if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
        isValid = false;
        reason = 'Expired';
        console.log(`  ❌ Expired: ${coupon.expiresAt}`);
      }
      
      // Check max total uses
      if (isValid && coupon.maxTotalUses && coupon.totalUsedCount >= coupon.maxTotalUses) {
        isValid = false;
        reason = 'Maximum total uses reached';
        console.log(`  ❌ Max total uses reached: ${coupon.totalUsedCount}/${coupon.maxTotalUses}`);
      }
      
      // Check minimum order amount
      if (isValid && coupon.minimumOrderAmount > 0 && subtotal < coupon.minimumOrderAmount) {
        isValid = false;
        reason = `Minimum order ৳${coupon.minimumOrderAmount}`;
        console.log(`  ❌ Minimum order not met: ${subtotal} < ${coupon.minimumOrderAmount}`);
      }
      
      // Check user eligibility (if user is logged in)
      if (isValid && userId) {
        // Check first purchase only
        if (coupon.isFirstPurchaseOnly) {
          try {
            const Order = mongoose.model('Order');
            const userOrders = await Order.countDocuments({ 
              userId: userId,
              paymentStatus: 'paid'
            });
            if (userOrders > 0) {
              isValid = false;
              reason = 'First purchase only';
              console.log(`  ❌ First purchase only - user already has ${userOrders} orders`);
            }
          } catch (err) {
            console.log('Order model not available, skipping first purchase check');
          }
        }
        
        // Check per-user usage limit
        if (isValid && coupon.maxUsesPerUser) {
          const userUsageCount = coupon.usageRecords?.filter(
            record => record.userId && record.userId.toString() === userId.toString()
          ).length || 0;
          
          if (userUsageCount >= coupon.maxUsesPerUser) {
            isValid = false;
            reason = `You have already used this coupon ${userUsageCount}/${coupon.maxUsesPerUser} times`;
            console.log(`  ❌ User usage limit reached: ${userUsageCount}/${coupon.maxUsesPerUser}`);
          }
        }
      }
      
      // Only add if valid
      if (isValid) {
        console.log(`  ✅ Coupon is valid!`);
        availableCoupons.push({
          ...coupon,
          isEligible: true,
          reason: null
        });
      }
    }
    
    console.log(`Returning ${availableCoupons.length} available coupons`);
    
    res.json({
      success: true,
      data: availableCoupons,
      count: availableCoupons.length
    });
    
  } catch (error) {
    console.error('Get available coupons error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getHomepageCoupons,
  checkCouponCode,
  recordCouponUsage,
  getAvailableCoupons
};

