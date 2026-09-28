const Courier = require('../models/Courier');
const Order = require('../models/Order');
const { 
  saveCourierCredentials, 
  getCourierIntegration 
} = require('../lib/couriers/credentials');
const { 
  testCourierConnection,
  createCourierOrder,
  getCourierTracking,
  cancelCourierOrder
} = require('../lib/couriers/factory');

// ========== GET ALL COURIERS ==========
const getCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find({ isActive: true }).sort({ name: 1 });
    
    const courierStatus = await Promise.all(
      couriers.map(async (courier) => {
        const integration = await getCourierIntegration(courier.slug);
        return {
          ...courier.toObject(),
          integrationStatus: integration?.integrationStatus || null,
          configured: integration?.configured || false,
          apiEnabled: courier.apiEnabled
        };
      })
    );
    
    res.json({ success: true, data: courierStatus });
  } catch (error) {
    console.error('Get couriers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET SINGLE COURIER ==========
const getCourier = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);
    if (!courier) {
      return res.status(404).json({ success: false, error: 'Courier not found' });
    }
    
    const integration = await getCourierIntegration(courier.slug);
    
    res.json({
      success: true,
      data: {
        ...courier.toObject(),
        integrationStatus: integration?.integrationStatus || null,
        configured: integration?.configured || false,
        credentials: integration?.creds || {},
        apiEnabled: courier.apiEnabled || false,
        credentialFields: require('../lib/courierCredentials').courierCredentialFields[courier.slug] || []
      }
    });
  } catch (error) {
    console.error('Get courier error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE COURIER INTEGRATION ==========
const updateCourierIntegration = async (req, res) => {
  try {
    const { apiEnabled, credentials, storeConfig } = req.body || {};
    
    const courier = await saveCourierCredentials(req.params.id, {
      apiEnabled,
      credentials,
      storeConfig
    });
    
    if (!courier) {
      return res.status(404).json({ success: false, error: 'Courier not found' });
    }
    
    res.json({
      success: true,
      data: courier,
      message: 'Courier integration updated successfully'
    });
  } catch (error) {
    console.error('Update courier integration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== TEST COURIER CONNECTION ==========
const testCourierConnectionHandler = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);
    if (!courier) {
      return res.status(404).json({ success: false, error: 'Courier not found' });
    }
    
    const integration = await getCourierIntegration(courier.slug);
    if (!integration || !integration.creds) {
      return res.status(400).json({ 
        success: false, 
        error: 'Credentials not configured for this courier' 
      });
    }
    
    const result = await testCourierConnection(
      courier.slug,
      integration.creds,
      integration.storeConfig
    );
    
    courier.integrationStatus = {
      lastTestedAt: new Date(),
      lastTestOk: result.success,
      lastTestMessage: result.message || (result.success ? 'Connected successfully' : 'Connection failed')
    };
    await courier.save();
    
    res.json({
      success: true,
      data: result,
      message: result.success ? 'Connection test successful' : 'Connection test failed'
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== CREATE DELIVERY ORDER ==========
const createDeliveryOrder = async (req, res) => {
  try {
    const { slug } = req.params;
    const { orderId, weight, deliveryNote } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }
    
    const integration = await getCourierIntegration(slug);
    if (!integration || !integration.creds || !integration.apiEnabled) {
      return res.status(400).json({ 
        success: false, 
        error: 'Courier is not configured or disabled' 
      });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Check if order is cancelled
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: 'Order is cancelled. Cannot create delivery.' 
      });
    }
    
    // Check if order already has delivery
    if (order.deliveryService && order.deliveryService.courierOrderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Order already has a delivery service assigned' 
      });
    }
    
    // Prepare order data for courier
    const orderData = {
      ...order.toObject(),
      orderNumber: order.orderNumber || `ORD-${order._id.toString().slice(-8)}`,
      items: order.items.map(item => ({
        ...item,
        weight: weight ? weight / order.items.length : 0.5
      }))
    };
    
    const result = await createCourierOrder(
      slug,
      integration.creds,
      integration.storeConfig,
      orderData
    );
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.message || 'Failed to create delivery order' 
      });
    }
    
    // Update order with delivery info
    order.deliveryService = {
      courierId: integration.id,
      courierName: slug.charAt(0).toUpperCase() + slug.slice(1),
      courierSlug: slug,
      trackingNumber: result.trackingNumber,
      trackingUrl: result.trackingUrl,
      courierOrderId: result.courierOrderId,
      courierResponse: result.fullResponse,
      deliveryStatus: 'processing',
      labelUrl: result.labelUrl || '',
      invoiceUrl: result.invoiceUrl || '',
      deliveryNote: deliveryNote || '',
      weight: weight || 0.5,
      deliveryStatusHistory: [
        {
          status: 'processing',
          message: `Delivery order created with ${slug} courier service`,
          timestamp: new Date()
        }
      ]
    };
    
    // Auto-update order status to "processing" when delivery is created
    order.orderStatus = 'processing';
    order.trackingNumber = result.trackingNumber;
    order.processingAt = new Date();
    
    await order.save();
    
    res.json({
      success: true,
      data: {
        order,
        deliveryResult: result
      },
      message: `Delivery order created successfully with ${slug}`
    });
  } catch (error) {
    console.error('❌ Create delivery order error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create delivery order' 
    });
  }
};

// ========== GET ORDER TRACKING ==========
const getOrderTrackingHandler = async (req, res) => {
  try {
    const { slug, trackingNumber } = req.params;
    
    const integration = await getCourierIntegration(slug);
    if (!integration || !integration.creds) {
      return res.status(400).json({ 
        success: false, 
        error: 'Courier is not configured' 
      });
    }
    
    const result = await getCourierTracking(
      slug,
      integration.creds,
      trackingNumber
    );
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.message || 'Failed to get tracking info' 
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get tracking error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== CANCEL DELIVERY ORDER ==========
const cancelDeliveryOrder = async (req, res) => {
  try {
    const { slug, courierOrderId } = req.params;
    
    const integration = await getCourierIntegration(slug);
    if (!integration || !integration.creds) {
      return res.status(400).json({ 
        success: false, 
        error: 'Courier is not configured' 
      });
    }
    
    const result = await cancelCourierOrder(
      slug,
      integration.creds,
      integration.storeConfig,
      courierOrderId
    );
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.message || 'Failed to cancel delivery order' 
      });
    }
    
    // Update the order's delivery status
    const order = await Order.findOne({ 'deliveryService.courierOrderId': courierOrderId });
    if (order) {
      order.deliveryService.deliveryStatus = 'cancelled';
      order.deliveryService.deliveryStatusHistory.push({
        status: 'cancelled',
        message: `Order cancelled with ${slug} courier service`,
        timestamp: new Date()
      });
      await order.save();
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Delivery order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel delivery order error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getCouriers,
  getCourier,
  updateCourierIntegration,
  testCourierConnectionHandler,
  createDeliveryOrder,
  getOrderTrackingHandler,
  cancelDeliveryOrder
};