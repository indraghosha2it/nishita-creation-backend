// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const {
//   getCouriers,
//   getCourier,
//   updateCourierIntegration,
//   testCourierConnectionHandler,
//   createDeliveryOrder,
//   getOrderTrackingHandler,
//   cancelDeliveryOrder,
  
// } = require('../controllers/adminCourierController');

// const {
//   getCourierScoresForPhone,
//   getCourierScoresForOrder
// } = require('../controllers/courierScoreController');

// // ========== GET ALL COURIERS ==========
// router.get('/couriers', protect, isModeratorOrAdmin, getCouriers);

// // ========== GET SINGLE COURIER ==========
// router.get('/couriers/:id', protect, isModeratorOrAdmin, getCourier);

// // ========== UPDATE COURIER INTEGRATION ==========
// router.put('/couriers/:id/integration', protect, isModeratorOrAdmin, updateCourierIntegration);

// // ========== TEST COURIER CONNECTION ==========
// router.post('/couriers/:id/test-connection', protect, isModeratorOrAdmin, testCourierConnectionHandler);

// // ========== CREATE DELIVERY ORDER ==========
// router.post('/couriers/:slug/create-order', protect, isModeratorOrAdmin, createDeliveryOrder);

// // ========== GET ORDER TRACKING ==========
// router.get('/couriers/:slug/track/:trackingNumber', protect, isModeratorOrAdmin, getOrderTrackingHandler);
// router.get('/courier-scores/phone/:phone', protect, isModeratorOrAdmin, getCourierScoresForPhone);
// router.get('/courier-scores/order/:orderId', protect, isModeratorOrAdmin, getCourierScoresForOrder);

// // ========== CANCEL DELIVERY ORDER ==========
// router.post('/couriers/:slug/cancel-order/:courierOrderId', protect, isModeratorOrAdmin, cancelDeliveryOrder);

// module.exports = router;




// routes/adminCourierRoutes.js

const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getCouriers,
  getCourier,
  updateCourierIntegration,
  testCourierConnectionHandler,
  createDeliveryOrder,
  getOrderTrackingHandler,
  cancelDeliveryOrder,
} = require('../controllers/adminCourierController');

const {
  getCourierScoresForPhone,
  getCourierScoresForOrder
} = require('../controllers/courierScoreController');

// ========== GET ALL COURIERS ==========
router.get('/couriers', protect, isModeratorOrAdmin, getCouriers);

// ========== GET SINGLE COURIER ==========
router.get('/couriers/:id', protect, isModeratorOrAdmin, getCourier);

// ========== UPDATE COURIER INTEGRATION ==========
// 🆕 This now handles both credentials AND webhook config
router.put('/couriers/:id/integration', protect, isModeratorOrAdmin, updateCourierIntegration);

// ========== TEST COURIER CONNECTION ==========
router.post('/couriers/:id/test-connection', protect, isModeratorOrAdmin, testCourierConnectionHandler);

// ========== CREATE DELIVERY ORDER ==========
router.post('/couriers/:slug/create-order', protect, isModeratorOrAdmin, createDeliveryOrder);

// ========== GET ORDER TRACKING ==========
router.get('/couriers/:slug/track/:trackingNumber', protect, isModeratorOrAdmin, getOrderTrackingHandler);

// ========== COURIER SCORES ==========
router.get('/courier-scores/phone/:phone', protect, isModeratorOrAdmin, getCourierScoresForPhone);
router.get('/courier-scores/order/:orderId', protect, isModeratorOrAdmin, getCourierScoresForOrder);

// ========== CANCEL DELIVERY ORDER ==========
router.post('/couriers/:slug/cancel-order/:courierOrderId', protect, isModeratorOrAdmin, cancelDeliveryOrder);

// ============================================================
// 🆕 WEBHOOK CONFIGURATION ENDPOINTS
// ============================================================

// ========== GET WEBHOOK CONFIG FOR A COURIER ==========
router.get('/couriers/:id/webhook-config', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const Courier = require('../models/Courier');
    const courier = await Courier.findById(req.params.id);
    
    if (!courier) {
      return res.status(404).json({ success: false, error: 'Courier not found' });
    }

    // Return webhook config (mask sensitive data)
    const webhookConfig = courier.webhookConfig || {
      enabled: false,
      secret: null,
      bearerToken: null,
      token: null,
      events: []
    };

    // Mask sensitive values for display
    const maskedConfig = {
      enabled: webhookConfig.enabled || false,
      secret: webhookConfig.secret ? `${webhookConfig.secret.substring(0, 8)}...` : null,
      bearerToken: webhookConfig.bearerToken ? `${webhookConfig.bearerToken.substring(0, 8)}...` : null,
      token: webhookConfig.token ? `${webhookConfig.token.substring(0, 8)}...` : null,
      events: webhookConfig.events || [],
      hasSecret: !!webhookConfig.secret,
      hasBearerToken: !!webhookConfig.bearerToken,
      hasToken: !!webhookConfig.token,
      lastSuccessAt: webhookConfig.lastSuccessAt || null,
      lastErrorAt: webhookConfig.lastErrorAt || null,
      lastError: webhookConfig.lastError || ''
    };

    res.json({
      success: true,
      data: maskedConfig
    });
  } catch (error) {
    console.error('Get webhook config error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== UPDATE WEBHOOK CONFIG FOR A COURIER ==========
router.put('/couriers/:id/webhook-config', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const Courier = require('../models/Courier');
    const { enabled, secret, bearerToken, token, events } = req.body;
    
    const courier = await Courier.findById(req.params.id);
    
    if (!courier) {
      return res.status(404).json({ success: false, error: 'Courier not found' });
    }

    // Validate webhook config based on courier type
    if (enabled) {
      const slug = courier.slug;
      
      if (slug === 'pathao' && !secret) {
        return res.status(400).json({ 
          success: false, 
          error: 'Webhook secret is required for Pathao when webhooks are enabled' 
        });
      }
      
      if (slug === 'steadfast' && !bearerToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'Bearer token is required for Steadfast when webhooks are enabled' 
        });
      }
      
      if (slug === 'redx' && !token) {
        return res.status(400).json({ 
          success: false, 
          error: 'Webhook token is required for RedX when webhooks are enabled' 
        });
      }
    }

    // Update webhook config
    courier.webhookConfig = {
      enabled: enabled || false,
      secret: secret || courier.webhookConfig?.secret || null,
      bearerToken: bearerToken || courier.webhookConfig?.bearerToken || null,
      token: token || courier.webhookConfig?.token || null,
      events: events || courier.webhookConfig?.events || []
    };

    await courier.save();

    // Return updated config (masked)
    const webhookConfig = courier.webhookConfig;
    const maskedConfig = {
      enabled: webhookConfig.enabled || false,
      secret: webhookConfig.secret ? `${webhookConfig.secret.substring(0, 8)}...` : null,
      bearerToken: webhookConfig.bearerToken ? `${webhookConfig.bearerToken.substring(0, 8)}...` : null,
      token: webhookConfig.token ? `${webhookConfig.token.substring(0, 8)}...` : null,
      events: webhookConfig.events || [],
      hasSecret: !!webhookConfig.secret,
      hasBearerToken: !!webhookConfig.bearerToken,
      hasToken: !!webhookConfig.token
    };

    res.json({
      success: true,
      data: maskedConfig,
      message: 'Webhook configuration updated successfully'
    });
  } catch (error) {
    console.error('Update webhook config error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GENERATE WEBHOOK SECRET/TOKEN ==========
router.post('/couriers/:id/generate-webhook-secret', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const Courier = require('../models/Courier');
    const { type } = req.body; // 'secret', 'bearer', 'token'
    
    const courier = await Courier.findById(req.params.id);
    
    if (!courier) {
      return res.status(404).json({ success: false, error: 'Courier not found' });
    }

    let generatedValue;
    
    // Generate appropriate secret based on courier type
    if (courier.slug === 'pathao' || type === 'secret') {
      // Pathao expects UUID format
      generatedValue = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } else {
      // RedX and Steadfast use hex strings
      const timestamp = Date.now().toString(36);
      const random1 = Math.random().toString(36).substring(2, 10);
      const random2 = Math.random().toString(36).substring(2, 10);
      generatedValue = `${timestamp}${random1}${random2}`;
    }

    res.json({
      success: true,
      data: {
        generated: generatedValue,
        type: type || 'secret'
      },
      message: 'Webhook secret generated successfully'
    });
  } catch (error) {
    console.error('Generate webhook secret error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== TEST WEBHOOK CONFIGURATION ==========
router.post('/couriers/:id/test-webhook', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const Courier = require('../models/Courier');
    const courier = await Courier.findById(req.params.id);
    
    if (!courier) {
      return res.status(404).json({ success: false, error: 'Courier not found' });
    }

    const webhookConfig = courier.webhookConfig;
    
    if (!webhookConfig || !webhookConfig.enabled) {
      return res.status(400).json({ 
        success: false, 
        error: 'Webhooks are not enabled for this courier' 
      });
    }

    // Check if required fields are configured
    const slug = courier.slug;
    let missingFields = [];
    
    if (slug === 'pathao' && !webhookConfig.secret) {
      missingFields.push('secret');
    }
    if (slug === 'steadfast' && !webhookConfig.bearerToken) {
      missingFields.push('bearerToken');
    }
    if (slug === 'redx' && !webhookConfig.token) {
      missingFields.push('token');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required webhook fields: ${missingFields.join(', ')}`
      });
    }

    // Simulate webhook test
    // In production, you could send a test webhook to the courier's endpoint
    const testResult = {
      success: true,
      message: `Webhook configuration for ${courier.name} looks valid`,
      details: {
        enabled: webhookConfig.enabled,
        hasSecret: !!webhookConfig.secret,
        hasBearerToken: !!webhookConfig.bearerToken,
        hasToken: !!webhookConfig.token,
        events: webhookConfig.events || []
      }
    };

    res.json({
      success: true,
      data: testResult,
      message: 'Webhook configuration test completed'
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== GET WEBHOOK STATUS FOR ALL COURIERS ==========
router.get('/webhook-status', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const Courier = require('../models/Courier');
    const couriers = await Courier.find({ isActive: true });
    
    const status = couriers.map(courier => ({
      id: courier._id,
      name: courier.name,
      slug: courier.slug,
      webhookEnabled: courier.webhookConfig?.enabled || false,
      hasSecret: !!courier.webhookConfig?.secret,
      hasBearerToken: !!courier.webhookConfig?.bearerToken,
      hasToken: !!courier.webhookConfig?.token,
      events: courier.webhookConfig?.events || [],
      lastSuccessAt: courier.webhookConfig?.lastSuccessAt || null,
      lastErrorAt: courier.webhookConfig?.lastErrorAt || null
    }));

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get webhook status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;