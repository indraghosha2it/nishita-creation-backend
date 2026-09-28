const IncompleteOrder = require('../models/IncompleteOrder');
const Order = require('../models/Order');

// ========== SAVE INCOMPLETE ORDER ==========
// const saveIncompleteOrder = async (req, res) => {
//   try {
//     const {
//       customerInfo,
//       items,
//       subtotal,
//       shippingCost,
//       discount,
//       total,
//       paymentMethod,
//       checkoutStep = 'information',
//       clientDeviceInfo = {}
//     } = req.body;

//     const userId = req.user?._id;
//     const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId || req.body.sessionId;

//     // Validate required fields
//     if (!items || items.length === 0) {
//       return res.status(400).json({ success: false, error: 'No items in order' });
//     }

//     // Build query to find existing incomplete order
//     const query = {};
//     if (userId) {
//       query.userId = userId;
//     } else if (sessionId) {
//       query.sessionId = sessionId;
//     } else {
//       return res.status(400).json({ success: false, error: 'No user or session identifier' });
//     }

//     query.isCompleted = false;

//     // Find existing incomplete order or create new
//     let incompleteOrder = await IncompleteOrder.findOne(query);

//     if (!incompleteOrder) {
//       incompleteOrder = new IncompleteOrder({
//         userId: userId || null,
//         sessionId: userId ? null : sessionId,
//         checkoutStep: 'information',
//         startedAt: new Date(),
//         lastInteractionAt: new Date()
//       });
//     }

//     // Update with new data
//     if (customerInfo) {
//       incompleteOrder.customerInfo = {
//         fullName: customerInfo.fullName || incompleteOrder.customerInfo.fullName || '',
//         email: customerInfo.email || incompleteOrder.customerInfo.email || '',
//         phone: customerInfo.phone || incompleteOrder.customerInfo.phone || '',
//         division: customerInfo.division || incompleteOrder.customerInfo.division || '',
//         address: customerInfo.address || incompleteOrder.customerInfo.address || '',
//         city: customerInfo.city || incompleteOrder.customerInfo.city || '',
//         zone: customerInfo.zone || incompleteOrder.customerInfo.zone || '',
//         area: customerInfo.area || incompleteOrder.customerInfo.area || '',
//         zipCode: customerInfo.zipCode || incompleteOrder.customerInfo.zipCode || '',
//         country: customerInfo.country || incompleteOrder.customerInfo.country || 'Bangladesh',
//         note: customerInfo.note || incompleteOrder.customerInfo.note || ''
//       };
//     }

//     if (items) {
//       incompleteOrder.items = items.map(item => ({
//         productId: item.productId,
//         productName: item.productName,
//         productSlug: item.productSlug,
//         image: item.image,
//         regularPrice: item.regularPrice,
//         discountPrice: item.discountPrice || 0,
//         quantity: item.quantity || 1,
//         unit: item.unit || 'pcs',
//         selectedColor: item.selectedColor || null,
//         colors: item.colors || []
//       }));
//     }

//     if (subtotal !== undefined) incompleteOrder.subtotal = subtotal;
//     if (shippingCost !== undefined) incompleteOrder.shippingCost = shippingCost;
//     if (discount !== undefined) incompleteOrder.discount = discount;
//     if (total !== undefined) incompleteOrder.total = total;
//     if (paymentMethod) incompleteOrder.paymentMethod = paymentMethod;
//     if (checkoutStep) incompleteOrder.checkoutStep = checkoutStep;

//     // Update device info
//     if (clientDeviceInfo || req) {
//       incompleteOrder.deviceInfo = {
//         ipAddress: req?.clientIP || req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || null,
//         userAgent: req?.headers?.['user-agent'] || null,
//         deviceType: clientDeviceInfo?.deviceType || null,
//         browser: clientDeviceInfo?.browser || null,
//         os: clientDeviceInfo?.os || null,
//         platform: clientDeviceInfo?.platform || null,
//         screenResolution: clientDeviceInfo?.screenResolution || null,
//         timezone: clientDeviceInfo?.timezone || null,
//         language: clientDeviceInfo?.language || null,
//         referrer: clientDeviceInfo?.referrer || null,
//         connectionType: clientDeviceInfo?.connectionType || null
//       };
//     }

//     incompleteOrder.lastInteractionAt = new Date();
//     await incompleteOrder.save();

//     res.json({
//       success: true,
//       data: incompleteOrder,
//       message: 'Checkout progress saved successfully'
//     });

//   } catch (error) {
//     console.error('Save incomplete order error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const saveIncompleteOrder = async (req, res) => {
  try {
    const {
      customerInfo,
      items,
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod,
      checkoutStep = 'information',
      clientDeviceInfo = {}
    } = req.body;

    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId || req.body.sessionId;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    // Build query to find existing incomplete order
    const query = {};
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return res.status(400).json({ success: false, error: 'No user or session identifier' });
    }

    query.isCompleted = false;

    // Find existing incomplete order or create new
    let incompleteOrder = await IncompleteOrder.findOne(query);

    if (!incompleteOrder) {
      incompleteOrder = new IncompleteOrder({
        userId: userId || null,
        sessionId: userId ? null : sessionId,
        checkoutStep: 'information',
        startedAt: new Date(),
        lastInteractionAt: new Date()
      });
    }

    // Update with new data
    if (customerInfo) {
      incompleteOrder.customerInfo = {
        fullName: customerInfo.fullName || incompleteOrder.customerInfo.fullName || '',
        email: customerInfo.email || incompleteOrder.customerInfo.email || '',
        phone: customerInfo.phone || incompleteOrder.customerInfo.phone || '',
        division: customerInfo.division || incompleteOrder.customerInfo.division || '',
        address: customerInfo.address || incompleteOrder.customerInfo.address || '',
        city: customerInfo.city || incompleteOrder.customerInfo.city || '',
        zone: customerInfo.zone || incompleteOrder.customerInfo.zone || '',
        area: customerInfo.area || incompleteOrder.customerInfo.area || '',
        zipCode: customerInfo.zipCode || incompleteOrder.customerInfo.zipCode || '',
        country: customerInfo.country || incompleteOrder.customerInfo.country || 'Bangladesh',
        note: customerInfo.note || incompleteOrder.customerInfo.note || ''
      };
    }

    // ========== MAP ITEMS WITH VARIANT/SUB-VARIANT FIELDS ==========
    if (items) {
      incompleteOrder.items = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        image: item.image,
        regularPrice: item.regularPrice,
        discountPrice: item.discountPrice || 0,
        quantity: item.quantity || 1,
        unit: item.unit || 'pcs',
        selectedColor: item.selectedColor || null,
        colors: item.colors || [],

        // ========== Preserve variant / sub-variant fields ==========
        variantId: item.variantId || null,
        variantName: item.variantName || null,
        variantType: item.variantType || null,
        subVariantId: item.subVariantId || null,
        subVariantName: item.subVariantName || null,
        variantRegularPrice: item.variantRegularPrice || 0,
        variantDiscountPrice: item.variantDiscountPrice || 0,
        variantImage: item.variantImage || '',
        isVariant: item.isVariant || false,
        isSubVariant: item.isSubVariant || false,
        isBaseProduct: item.isBaseProduct !== false,
        stockQuantity: item.stockQuantity || 0
        // ============================================================
      }));
    }

    if (subtotal !== undefined) incompleteOrder.subtotal = subtotal;
    if (shippingCost !== undefined) incompleteOrder.shippingCost = shippingCost;
    if (discount !== undefined) incompleteOrder.discount = discount;
    if (total !== undefined) incompleteOrder.total = total;
    if (paymentMethod) incompleteOrder.paymentMethod = paymentMethod;
    if (checkoutStep) incompleteOrder.checkoutStep = checkoutStep;

    // Update device info
    if (clientDeviceInfo || req) {
      incompleteOrder.deviceInfo = {
        ipAddress: req?.clientIP || req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || null,
        userAgent: req?.headers?.['user-agent'] || null,
        deviceType: clientDeviceInfo?.deviceType || null,
        browser: clientDeviceInfo?.browser || null,
        os: clientDeviceInfo?.os || null,
        platform: clientDeviceInfo?.platform || null,
        screenResolution: clientDeviceInfo?.screenResolution || null,
        timezone: clientDeviceInfo?.timezone || null,
        language: clientDeviceInfo?.language || null,
        referrer: clientDeviceInfo?.referrer || null,
        connectionType: clientDeviceInfo?.connectionType || null
      };
    }

    incompleteOrder.lastInteractionAt = new Date();
    await incompleteOrder.save();

    res.json({
      success: true,
      data: incompleteOrder,
      message: 'Checkout progress saved successfully'
    });

  } catch (error) {
    console.error('Save incomplete order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET INCOMPLETE ORDERS (Admin) ==========
const getIncompleteOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      sort = '-lastInteractionAt',
      status = 'all'
    } = req.query;

    const query = {};

    // Filter by completion status
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'active') {
      query.isCompleted = false;
    } else {
      // 'all' - show all
    }

    // Search by name, phone, email
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { 'customerInfo.fullName': searchRegex },
        { 'customerInfo.phone': searchRegex },
        { 'customerInfo.email': searchRegex },
        { 'items.productName': searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortOption = {};
    switch (sort) {
      case 'startedAt_asc': sortOption = { startedAt: 1 }; break;
      case 'startedAt_desc': sortOption = { startedAt: -1 }; break;
      case 'lastInteractionAt_asc': sortOption = { lastInteractionAt: 1 }; break;
      case 'total_asc': sortOption = { total: 1 }; break;
      case 'total_desc': sortOption = { total: -1 }; break;
      case '-lastInteractionAt': sortOption = { lastInteractionAt: -1 }; break;
      default: sortOption = { lastInteractionAt: -1 };
    }

    const [incompleteOrders, total] = await Promise.all([
      IncompleteOrder.find(query)
        .populate('userId', 'name email phone')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      IncompleteOrder.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: incompleteOrders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get incomplete orders error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET INCOMPLETE ORDER STATS ==========
const getIncompleteOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [
      totalIncomplete,
      activeIncomplete,
      todayIncomplete,
      monthIncomplete,
      totalRevenue,
      monthRevenue
    ] = await Promise.all([
      IncompleteOrder.countDocuments({ isCompleted: false }),
      IncompleteOrder.countDocuments({ isCompleted: false, lastInteractionAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      IncompleteOrder.countDocuments({ isCompleted: false, createdAt: { $gte: today } }),
      IncompleteOrder.countDocuments({ isCompleted: false, createdAt: { $gte: thisMonth } }),
      IncompleteOrder.aggregate([
        { $match: { isCompleted: false } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      IncompleteOrder.aggregate([
        { $match: { isCompleted: false, createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    // Get checkout step distribution
    const stepDistribution = await IncompleteOrder.aggregate([
      { $match: { isCompleted: false } },
      { $group: { _id: '$checkoutStep', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalIncomplete,
        activeIncomplete,
        todayIncomplete,
        monthIncomplete,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        stepDistribution
      }
    });

  } catch (error) {
    console.error('Get incomplete order stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== MARK INCOMPLETE ORDER AS COMPLETED ==========
const markAsCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderId } = req.body;

    const incompleteOrder = await IncompleteOrder.findById(id);

    if (!incompleteOrder) {
      return res.status(404).json({ success: false, error: 'Incomplete order not found' });
    }

    incompleteOrder.isCompleted = true;
    if (orderId) {
      incompleteOrder.completedOrderId = orderId;
    }

    await incompleteOrder.save();

    res.json({
      success: true,
      data: incompleteOrder,
      message: 'Incomplete order marked as completed'
    });

  } catch (error) {
    console.error('Mark as completed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== DELETE INCOMPLETE ORDER ==========
const deleteIncompleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const incompleteOrder = await IncompleteOrder.findByIdAndDelete(id);

    if (!incompleteOrder) {
      return res.status(404).json({ success: false, error: 'Incomplete order not found' });
    }

    res.json({
      success: true,
      message: 'Incomplete order deleted successfully'
    });

  } catch (error) {
    console.error('Delete incomplete order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== MARK INCOMPLETE ORDER AS COMPLETED (when order is placed) ==========
const markIncompleteOrderAsCompleted = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId || req.body.sessionId;

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    // Build query to find the incomplete order
    const query = {};
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return res.status(400).json({ success: false, error: 'No user or session identifier' });
    }

    query.isCompleted = false;

    // Find and update the incomplete order
    const incompleteOrder = await IncompleteOrder.findOne(query);

    if (incompleteOrder) {
      incompleteOrder.isCompleted = true;
      incompleteOrder.completedOrderId = orderId;
      incompleteOrder.checkoutStep = 'placed';
      await incompleteOrder.save();
      console.log('✅ Incomplete order marked as completed:', incompleteOrder._id);
    }

    res.json({
      success: true,
      message: 'Incomplete order marked as completed'
    });

  } catch (error) {
    console.error('Mark incomplete order as completed error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== DELETE INCOMPLETE ORDER (when order is placed) ==========
const deleteIncompleteOrderOnPlace = async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId || req.body.sessionId;

    // Build query to find the incomplete order
    const query = {};
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return res.status(400).json({ success: false, error: 'No user or session identifier' });
    }

    query.isCompleted = false;

    // Delete the incomplete order
    const result = await IncompleteOrder.findOneAndDelete(query);

    if (result) {
      console.log('🗑️ Incomplete order deleted after successful order placement:', result._id);
    }

    res.json({
      success: true,
      message: 'Incomplete order deleted successfully'
    });

  } catch (error) {
    console.error('Delete incomplete order on place error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  saveIncompleteOrder,
  getIncompleteOrders,
  getIncompleteOrderStats,
  markAsCompleted,
  deleteIncompleteOrder,
  markIncompleteOrderAsCompleted,  
  deleteIncompleteOrderOnPlace 
};