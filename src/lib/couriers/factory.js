// const PathaoAdapter = require('./adapters/PathaoAdapter');
// const SteadfastAdapter = require('./adapters/SteadfastAdapter');
// const RedxAdapter = require('./adapters/RedxAdapter');

// /**
//  * Create a courier adapter instance based on slug
//  */
// function createCourierAdapter(slug, creds, storeConfig) {
//   switch (slug.toLowerCase()) {
//     case 'pathao':
//       return new PathaoAdapter(creds, storeConfig);
//     case 'steadfast':
//       return new SteadfastAdapter(creds, storeConfig);
//     case 'redx':
//       return new RedxAdapter(creds, storeConfig);
//     default:
//       throw new Error(`Unsupported courier: ${slug}`);
//   }
// }

// /**
//  * Test connection for a courier
//  */
// async function testCourierConnection(slug, creds, storeConfig) {
//   const adapter = createCourierAdapter(slug, creds, storeConfig);
//   return await adapter.testConnection();
// }

// /**
//  * Create delivery order with a courier
//  */
// async function createCourierOrder(slug, creds, storeConfig, orderData) {
//   const adapter = createCourierAdapter(slug, creds, storeConfig);
//   return await adapter.createOrder(orderData);
// }

// /**
//  * Get tracking for a courier
//  */
// async function getCourierTracking(slug, creds, trackingNumber) {
//   const adapter = createCourierAdapter(slug, creds, {});
//   return await adapter.getTracking(trackingNumber);
// }

// /**
//  * Cancel a courier order
//  */
// async function cancelCourierOrder(slug, creds, storeConfig, courierOrderId) {
//   const adapter = createCourierAdapter(slug, creds, storeConfig);
//   return await adapter.cancelOrder(courierOrderId);
// }

// async function getCustomerLifetimeStats(slug, creds, storeConfig, phone) {
//   const adapter = createCourierAdapter(slug, creds, storeConfig);
//   if (typeof adapter.getCustomerLifetimeStats !== 'function') {
//     return {
//       success: false,
//       error: `Courier ${slug} does not support lifetime stats`,
//       configured: false
//     };
//   }
//   return await adapter.getCustomerLifetimeStats(phone);
// }

// module.exports = {
//   createCourierAdapter,
//   testCourierConnection,
//   createCourierOrder,
//   getCourierTracking,
//   cancelCourierOrder,
//   getCustomerLifetimeStats
// };

// lib/couriers/factory.js

const PathaoAdapter = require('./adapters/PathaoAdapter');
const SteadfastAdapter = require('./adapters/SteadfastAdapter');
const RedxAdapter = require('./adapters/RedxAdapter');

// ============================================================
// ✅ STATUS NORMALIZATION MAP
// ============================================================
const STATUS_MAP = {
  // Common / Standard statuses
  'pending': 'pending',
  'processing': 'processing',
  'picked_up': 'picked_up',
  'in_transit': 'in_transit',
  'out_for_delivery': 'out_for_delivery',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'failed': 'failed',
  'returned': 'returned',
  
  // Pathao specific
  'picked': 'picked_up',
  'on_the_way': 'in_transit',
  'ontheway': 'in_transit',
  'on the way': 'in_transit',
  
  // Steadfast specific
  'pending': 'pending',
  'processing': 'processing',
  'picked_up': 'picked_up',
  'in_transit': 'in_transit',
  'out_for_delivery': 'out_for_delivery',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'failed': 'failed',
  'returned': 'returned',
  'hold': 'pending',
  'onhold': 'pending',
  'on hold': 'pending',
  
  // Redx specific
  'process': 'processing',
  'pickup': 'picked_up',
  'transit': 'in_transit',
  'ondelivery': 'out_for_delivery',
  'on delivery': 'out_for_delivery',
  'rtn': 'returned',
  'return': 'returned',
  
  // Additional variations
  'dispatched': 'processing',
  'shipped': 'in_transit',
  'in transit': 'in_transit',
  'out for delivery': 'out_for_delivery',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'cancel': 'cancelled',
  'failed': 'failed',
  'returned': 'returned',
  'return': 'returned',
  'pending': 'pending',
  'pickup': 'picked_up',
  'picked up': 'picked_up',
};

/**
 * Normalize courier status to standard status
 * @param {string} status - Raw status from courier API
 * @returns {string} - Normalized status
 */
function normalizeStatus(status) {
  if (!status) return 'processing';
  const lowerStatus = status.toLowerCase().trim();
  return STATUS_MAP[lowerStatus] || 'processing';
}

/**
 * Check if a status indicates delivery
 * @param {string} status - Normalized status
 * @returns {boolean}
 */
function isDeliveredStatus(status) {
  const normalized = normalizeStatus(status);
  return normalized === 'delivered';
}

/**
 * Check if a status is terminal (no further changes)
 * @param {string} status - Normalized status
 * @returns {boolean}
 */
function isTerminalStatus(status) {
  const normalized = normalizeStatus(status);
  return ['delivered', 'cancelled', 'returned', 'failed'].includes(normalized);
}

/**
 * Get display label for status
 * @param {string} status - Normalized status
 * @returns {string}
 */
function getStatusLabel(status) {
  const labels = {
    'pending': 'Pending',
    'processing': 'Processing',
    'picked_up': 'Picked Up',
    'in_transit': 'In Transit',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'failed': 'Failed',
    'returned': 'Returned'
  };
  const normalized = normalizeStatus(status);
  return labels[normalized] || normalized;
}

/**
 * Create a courier adapter instance based on slug
 */
function createCourierAdapter(slug, creds, storeConfig) {
  const slugLower = slug.toLowerCase();
  
  switch (slugLower) {
    case 'pathao':
      return new PathaoAdapter(creds, storeConfig);
    case 'steadfast':
      return new SteadfastAdapter(creds, storeConfig);
    case 'redx':
      return new RedxAdapter(creds, storeConfig);
    default:
      throw new Error(`Unsupported courier: ${slug}`);
  }
}

/**
 * Test connection for a courier
 * @param {string} slug - Courier slug
 * @param {object} creds - Courier credentials
 * @param {object} storeConfig - Store configuration
 * @returns {Promise<object>}
 */
async function testCourierConnection(slug, creds, storeConfig) {
  try {
    const adapter = createCourierAdapter(slug, creds, storeConfig);
    return await adapter.testConnection();
  } catch (error) {
    console.error(`Test connection error (${slug}):`, error);
    return {
      success: false,
      message: error.message || 'Connection test failed'
    };
  }
}

/**
 * Create delivery order with a courier
 * @param {string} slug - Courier slug
 * @param {object} creds - Courier credentials
 * @param {object} storeConfig - Store configuration
 * @param {object} orderData - Order data
 * @returns {Promise<object>}
 */
async function createCourierOrder(slug, creds, storeConfig, orderData) {
  try {
    const adapter = createCourierAdapter(slug, creds, storeConfig);
    const result = await adapter.createOrder(orderData);
    
    // Ensure consistent response format
    return {
      success: result.success || false,
      courierOrderId: result.courierOrderId || result.orderId || result.consignment_id || null,
      trackingNumber: result.trackingNumber || result.tracking_code || result.consignment_id || null,
      trackingUrl: result.trackingUrl || result.tracking_url || null,
      labelUrl: result.labelUrl || result.label_url || null,
      invoiceUrl: result.invoiceUrl || result.invoice_url || null,
      message: result.message || 'Order created',
      fullResponse: result.fullResponse || result
    };
  } catch (error) {
    console.error(`Create courier order error (${slug}):`, error);
    return {
      success: false,
      message: error.message || 'Failed to create delivery order',
      error: error.message
    };
  }
}

/**
 * Get tracking for a courier
 * @param {string} slug - Courier slug
 * @param {object} creds - Courier credentials
 * @param {string} trackingNumber - Tracking number
 * @returns {Promise<object>}
 */
async function getCourierTracking(slug, creds, trackingNumber) {
  try {
    const adapter = createCourierAdapter(slug, creds, {});
    
    // Check if adapter has getTracking method
    if (typeof adapter.getTracking !== 'function') {
      return {
        success: false,
        status: 'pending',
        message: `Courier ${slug} does not support tracking`,
        history: [],
        location: null,
        estimatedDelivery: null
      };
    }
    
    const result = await adapter.getTracking(trackingNumber);
    
    if (!result || !result.success) {
      return {
        success: false,
        status: 'pending',
        message: result?.message || 'Tracking information not available',
        history: [],
        location: null,
        estimatedDelivery: null,
        error: result?.message
      };
    }
    
    // Normalize the status
    const normalizedStatus = normalizeStatus(result.status);
    
    // Build history with consistent format
    let history = [];
    if (result.history && Array.isArray(result.history)) {
      history = result.history.map(entry => {
        // Extract timestamp
        let timestamp = entry.timestamp || entry.at || entry.date || entry.time || new Date().toISOString();
        
        // Ensure timestamp is a string
        if (timestamp instanceof Date) {
          timestamp = timestamp.toISOString();
        }
        
        return {
          status: normalizeStatus(entry.status || entry.code || 'processing'),
          message: String(entry.message || entry.note || entry.description || 'Status update').trim(),
          location: String(entry.location || entry.place || '').trim(),
          timestamp: timestamp
        };
      });
      
      // Sort history by timestamp (oldest first)
      history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
    
    return {
      success: true,
      status: normalizedStatus,
      location: result.location || result.current_location || null,
      estimatedDelivery: result.estimatedDelivery || result.estimated_delivery || null,
      history: history,
      message: result.message || 'Tracking retrieved successfully',
      fullResponse: result.fullResponse || result,
      // Additional useful fields
      rawStatus: result.status,
      isDelivered: isDeliveredStatus(normalizedStatus),
      isTerminal: isTerminalStatus(normalizedStatus),
      statusLabel: getStatusLabel(normalizedStatus)
    };
    
  } catch (error) {
    console.error(`Get courier tracking error (${slug}):`, error);
    return {
      success: false,
      status: 'pending',
      message: error.message || 'Failed to get tracking information',
      history: [],
      location: null,
      estimatedDelivery: null,
      error: error.message
    };
  }
}

/**
 * Cancel a courier order
 * @param {string} slug - Courier slug
 * @param {object} creds - Courier credentials
 * @param {object} storeConfig - Store configuration
 * @param {string} courierOrderId - Courier order ID
 * @returns {Promise<object>}
 */
async function cancelCourierOrder(slug, creds, storeConfig, courierOrderId) {
  try {
    const adapter = createCourierAdapter(slug, creds, storeConfig);
    
    if (typeof adapter.cancelOrder !== 'function') {
      return {
        success: false,
        message: `Courier ${slug} does not support order cancellation`
      };
    }
    
    return await adapter.cancelOrder(courierOrderId);
  } catch (error) {
    console.error(`Cancel courier order error (${slug}):`, error);
    return {
      success: false,
      message: error.message || 'Failed to cancel order'
    };
  }
}

/**
 * Get customer lifetime stats from courier
 * @param {string} slug - Courier slug
 * @param {object} creds - Courier credentials
 * @param {object} storeConfig - Store configuration
 * @param {string} phone - Customer phone number
 * @returns {Promise<object>}
 */
async function getCustomerLifetimeStats(slug, creds, storeConfig, phone) {
  try {
    const adapter = createCourierAdapter(slug, creds, storeConfig);
    
    if (typeof adapter.getCustomerLifetimeStats !== 'function') {
      return {
        success: false,
        error: `Courier ${slug} does not support lifetime stats`,
        configured: false
      };
    }
    
    return await adapter.getCustomerLifetimeStats(phone);
  } catch (error) {
    console.error(`Get customer lifetime stats error (${slug}):`, error);
    return {
      success: false,
      error: error.message || 'Failed to get customer stats',
      configured: true
    };
  }
}

/**
 * Get available delivery areas for a courier
 * @param {string} slug - Courier slug
 * @param {object} creds - Courier credentials
 * @param {object} storeConfig - Store configuration
 * @param {string} districtName - Optional district name filter
 * @returns {Promise<object>}
 */
async function getAvailableAreas(slug, creds, storeConfig, districtName = null) {
  try {
    const adapter = createCourierAdapter(slug, creds, storeConfig);
    
    if (typeof adapter.getAvailableAreas !== 'function') {
      return {
        success: false,
        error: `Courier ${slug} does not support area lookup`,
        areas: []
      };
    }
    
    const areas = await adapter.getAvailableAreas(districtName);
    return {
      success: true,
      areas: areas || [],
      message: 'Areas retrieved successfully'
    };
  } catch (error) {
    console.error(`Get available areas error (${slug}):`, error);
    return {
      success: false,
      error: error.message || 'Failed to get areas',
      areas: []
    };
  }
}

/**
 * Get courier balance or account info
 * @param {string} slug - Courier slug
 * @param {object} creds - Courier credentials
 * @param {object} storeConfig - Store configuration
 * @returns {Promise<object>}
 */
async function getCourierBalance(slug, creds, storeConfig) {
  try {
    const adapter = createCourierAdapter(slug, creds, storeConfig);
    
    if (typeof adapter.getBalance !== 'function') {
      return {
        success: false,
        message: `Courier ${slug} does not support balance lookup`
      };
    }
    
    return await adapter.getBalance();
  } catch (error) {
    console.error(`Get courier balance error (${slug}):`, error);
    return {
      success: false,
      message: error.message || 'Failed to get balance'
    };
  }
}

// ============================================================
// ✅ EXPORTS
// ============================================================
module.exports = {
  // Main functions
  createCourierAdapter,
  testCourierConnection,
  createCourierOrder,
  getCourierTracking,
  cancelCourierOrder,
  getCustomerLifetimeStats,
  
  // Additional functions
  getAvailableAreas,
  getCourierBalance,
  
  // Helpers
  normalizeStatus,
  isDeliveredStatus,
  isTerminalStatus,
  getStatusLabel,
  STATUS_MAP
};