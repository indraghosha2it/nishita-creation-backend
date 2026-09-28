
// const CourierAdapter = require('./CourierAdapter');

// const PATHAO_API_BASE = 'https://api-hermes.pathao.com';

// class PathaoAdapter extends CourierAdapter {
//   constructor(creds, storeConfig) {
//     super('pathao', creds, storeConfig);
//     this.accessToken = null;
//     this.tokenExpiry = null;

//     // ========== CITY/ZONE CACHE (replaces static zoneMapping.js) ==========
//     this.cityCache = null;
//     this.cityCacheTime = null;
//     this.zoneCache = new Map(); // cityId -> { zones, time }
//     this.cacheTTL = 6 * 60 * 60 * 1000; // 6 hours
//   }

//   async getAccessToken() {
//     if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
//       return this.accessToken;
//     }

//     try {
//       console.log('🔑 Getting Pathao access token...');

//       const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/issue-token`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           client_id: this.creds.clientId,
//           client_secret: this.creds.clientSecret,
//           username: this.creds.username,
//           password: this.creds.password,
//           grant_type: 'password',
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         console.error('❌ Pathao auth error:', data);
//         throw new Error(data?.message || 'Pathao authentication failed');
//       }

//       this.accessToken = data.access_token;
//       this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;

//       console.log('✅ Pathao token obtained successfully');
//       return this.accessToken;
//     } catch (error) {
//       console.error('❌ Pathao token error:', error);
//       throw new Error(`Pathao authentication failed: ${error.message}`);
//     }
//   }

//   async testConnection() {
//     try {
//       await this.getAccessToken();
//       const storeId = this.storeConfig.pathaoStoreId || this.creds.storeId;
//       if (!storeId) {
//         throw new Error('Pathao store_id is required');
//       }
//       return {
//         success: true,
//         message: 'Pathao API connected successfully',
//         storeId: storeId
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.message
//       };
//     }
//   }

//   // ========================================================================
//   // ========== DYNAMIC CITY / ZONE RESOLUTION (LIVE FROM PATHAO API) ==========
//   // ========================================================================

//   normalize(str) {
//     return (str || '')
//       .toString()
//       .toLowerCase()
//       .replace(/[^a-z0-9]/g, '')
//       .trim();
//   }

//   async fetchCities() {
//     const now = Date.now();
//     if (this.cityCache && this.cityCacheTime && (now - this.cityCacheTime) < this.cacheTTL) {
//       return this.cityCache;
//     }

//     try {
//       const token = await this.getAccessToken();
//       console.log('📡 Fetching Pathao city list...');

//       const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/countries/1/city-list`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//         },
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.message || 'Failed to fetch Pathao city list');
//       }

//       const cities = data?.data?.data || [];
//       if (!cities.length) {
//         throw new Error('Pathao returned an empty city list');
//       }

//       this.cityCache = cities;
//       this.cityCacheTime = now;
//       console.log(`✅ Fetched ${cities.length} Pathao cities`);
//       return cities;
//     } catch (error) {
//       console.error('❌ Fetch Pathao cities error:', error);
//       if (this.cityCache) {
//         console.log('⚠️ Using stale city cache due to fetch failure');
//         return this.cityCache;
//       }
//       throw error;
//     }
//   }

//   async fetchZones(cityId) {
//     const now = Date.now();
//     const cached = this.zoneCache.get(cityId);
//     if (cached && (now - cached.time) < this.cacheTTL) {
//       return cached.zones;
//     }

//     try {
//       const token = await this.getAccessToken();
//       console.log(`📡 Fetching Pathao zone list for city ${cityId}...`);

//       const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/cities/${cityId}/zone-list`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//         },
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.message || `Failed to fetch Pathao zone list for city ${cityId}`);
//       }

//       const zones = data?.data?.data || [];
//       this.zoneCache.set(cityId, { zones, time: now });
//       console.log(`✅ Fetched ${zones.length} Pathao zones for city ${cityId}`);
//       return zones;
//     } catch (error) {
//       console.error(`❌ Fetch Pathao zones error for city ${cityId}:`, error);
//       if (cached) {
//         console.log('⚠️ Using stale zone cache due to fetch failure');
//         return cached.zones;
//       }
//       throw error;
//     }
//   }

//   /**
//    * Resolve a district/city name (e.g. "Barguna") to a real Pathao city_id
//    */
//   async resolveCityId(districtName) {
//     const cities = await this.fetchCities();
//     const needle = this.normalize(districtName);

//     if (!needle) {
//       console.log('⚠️ No district provided, defaulting to Dhaka');
//       const dhaka = cities.find(c => this.normalize(c.city_name) === 'dhaka');
//       return dhaka ? dhaka.city_id : cities[0].city_id;
//     }

//     // Exact match first
//     let match = cities.find(c => this.normalize(c.city_name) === needle);

//     // Partial match fallback
//     if (!match) {
//       match = cities.find(c => {
//         const cityName = this.normalize(c.city_name);
//         return cityName.includes(needle) || needle.includes(cityName);
//       });
//     }

//     if (!match) {
//       console.log(`⚠️ Pathao city "${districtName}" not found, defaulting to Dhaka`);
//       match = cities.find(c => this.normalize(c.city_name) === 'dhaka') || cities[0];
//     } else {
//       console.log(`📍 Pathao city resolved: "${districtName}" → "${match.city_name}" (ID: ${match.city_id})`);
//     }

//     return match.city_id;
//   }

//   /**
//    * Resolve a zone/upazila name (e.g. "Amtali") to a real Pathao zone_id
//    * that is guaranteed to belong to the given cityId.
//    */
//   async resolveZoneId(cityId, zoneName) {
//     const zones = await this.fetchZones(cityId);

//     if (!zones.length) {
//       throw new Error(`No Pathao delivery zones available for city ID ${cityId}`);
//     }

//     const needle = this.normalize(zoneName);

//     let match = null;
//     if (needle) {
//       // Exact match first
//       match = zones.find(z => this.normalize(z.zone_name) === needle);

//       // Partial match fallback
//       if (!match) {
//         match = zones.find(z => {
//           const zoneNameNorm = this.normalize(z.zone_name);
//           return zoneNameNorm.includes(needle) || needle.includes(zoneNameNorm);
//         });
//       }
//     }

//     if (!match) {
//       console.log(`⚠️ Pathao zone "${zoneName}" not found for city ${cityId}, using first available zone: "${zones[0].zone_name}"`);
//       match = zones[0];
//     } else {
//       console.log(`📍 Pathao zone resolved: "${zoneName}" → "${match.zone_name}" (ID: ${match.zone_id})`);
//     }

//     return match.zone_id;
//   }

//   // ========================================================================

//   // async createOrder(orderData) {
//   //   try {
//   //     console.log('📦 Creating Pathao order...');

//   //     const token = await this.getAccessToken();
//   //     const storeId = this.storeConfig.pathaoStoreId || this.creds.storeId;

//   //     if (!storeId) {
//   //       throw new Error('Pathao store_id is required');
//   //     }

//   //     const pathaoOrderData = await this.formatOrderData(orderData, storeId);
//   //     console.log('📤 Pathao API request:', JSON.stringify(pathaoOrderData, null, 2));

//   //     const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders`, {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //         'Authorization': `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify(pathaoOrderData),
//   //     });

//   //     const data = await response.json();

//   //     // ========== IMPROVED ERROR HANDLING ==========
//   //     if (!response.ok) {
//   //       console.error('❌ Pathao error response:', JSON.stringify(data, null, 2));

//   //       let errorMessage = 'Pathao order creation failed';

//   //       if (data.errors) {
//   //         if (typeof data.errors === 'object') {
//   //           const errorMessages = [];
//   //           for (const [field, messages] of Object.entries(data.errors)) {
//   //             if (Array.isArray(messages)) {
//   //               errorMessages.push(`${field}: ${messages.join(', ')}`);
//   //             } else if (typeof messages === 'string') {
//   //               errorMessages.push(`${field}: ${messages}`);
//   //             } else if (typeof messages === 'object') {
//   //               for (const [subField, subMessages] of Object.entries(messages)) {
//   //                 if (Array.isArray(subMessages)) {
//   //                   errorMessages.push(`${field}.${subField}: ${subMessages.join(', ')}`);
//   //                 } else {
//   //                   errorMessages.push(`${field}.${subField}: ${subMessages}`);
//   //                 }
//   //               }
//   //             }
//   //           }
//   //           errorMessage = `Pathao API errors: ${errorMessages.join(', ')}`;
//   //         } else if (typeof data.errors === 'string') {
//   //           errorMessage = `Pathao API error: ${data.errors}`;
//   //         } else {
//   //           errorMessage = `Pathao API error: ${JSON.stringify(data.errors)}`;
//   //         }
//   //       } else if (data.message) {
//   //         errorMessage = `Pathao API error: ${data.message}`;
//   //       } else if (data.error) {
//   //         errorMessage = `Pathao API error: ${data.error}`;
//   //       }

//   //       if (data.code === 422 || data.status === 422) {
//   //         errorMessage = `Validation Error: ${errorMessage}`;
//   //       }

//   //       throw new Error(errorMessage);
//   //     }

//   //     const orderInfo = data.data || data;
//   //     return {
//   //       success: true,
//   //       courierOrderId: orderInfo.id || orderInfo.order_id,
//   //       trackingNumber: orderInfo.tracking_number || orderInfo.consignment_id || orderInfo.id,
//   //       trackingUrl: orderInfo.tracking_url || `https://pathao.com/bd/customer-tracking/?consignment_id=${orderInfo.consignment_id}`,
//   //       labelUrl: orderInfo.label_url || '',
//   //       invoiceUrl: orderInfo.invoice_url || '',
//   //       fullResponse: data,
//   //       message: 'Order created successfully with Pathao'
//   //     };
//   //   } catch (error) {
//   //     console.error('❌ Pathao order creation error:', error);
//   //     return {
//   //       success: false,
//   //       message: error.message
//   //     };
//   //   }
//   // }
// // PathaoAdapter.js - Update the createOrder method

// async createOrder(orderData) {
//   try {
//     console.log('📦 Creating Pathao order...');

//     const token = await this.getAccessToken();
//     const storeId = this.storeConfig.pathaoStoreId || this.creds.storeId;

//     if (!storeId) {
//       throw new Error('Pathao store_id is required');
//     }

//     const pathaoOrderData = await this.formatOrderData(orderData, storeId);
//     console.log('📤 Pathao API request:', JSON.stringify(pathaoOrderData, null, 2));

//     const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify(pathaoOrderData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error('❌ Pathao error response:', JSON.stringify(data, null, 2));
//       // ... error handling
//     }

//     const orderInfo = data.data || data;
//     const consignmentId = orderInfo.consignment_id || orderInfo.id || orderInfo.order_id;
    
//     // ========== GET CUSTOMER PHONE FROM ORDER DATA ==========
//     const customerPhone = orderData.customerInfo?.phone || '';
//     const cleanPhone = this.cleanPhoneNumber(customerPhone);

//     // ========== GENERATE CORRECT TRACKING URL ==========
//     const trackingUrl = consignmentId && cleanPhone
//       ? `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}&phone=${cleanPhone}`
//       : '';

//     console.log('✅ Generated tracking URL:', trackingUrl);

//     return {
//       success: true,
//       courierOrderId: consignmentId,
//       trackingNumber: consignmentId,
//       trackingUrl: trackingUrl,  // ✅ This is what gets stored in the order
//       labelUrl: orderInfo.label_url || '',
//       invoiceUrl: orderInfo.invoice_url || '',
//       fullResponse: data,
//       message: 'Order created successfully with Pathao'
//     };
//   } catch (error) {
//     console.error('❌ Pathao order creation error:', error);
//     return {
//       success: false,
//       message: error.message
//     };
//   }
// }


// // src/lib/couriers/adapters/PathaoAdapter.js

// // Add this method to the PathaoAdapter class

// /**
//  * Get lifetime delivery stats for a customer phone number
//  * This uses the Pathao merchant panel's customer success API
//  */
// async getCustomerLifetimeStats(phone) {
//   try {
//     console.log(`🔍 Pathao: Fetching lifetime stats for ${phone}`);
    
//     const token = await this.getAccessToken();
//     const cleanPhone = this.cleanPhoneNumber(phone);
    
//     const response = await fetch('https://merchant.pathao.com/api/v1/user/success', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ phone: cleanPhone }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error('❌ Pathao fraud check error:', data);
//       return {
//         success: false,
//         error: data?.message || 'Pathao customer lookup failed',
//         configured: true
//       };
//     }

//     const payload = data?.data || {};

//     // Check for v2 API with customer_rating
//     if (payload.version === 'v2' || payload.customer_rating) {
//       const rating = String(payload.customer_rating || 'unknown');
//       const addressCount = Array.isArray(payload.address_book) ? payload.address_book.length : 0;
      
//       // Map rating to approximate success rate
//       const ratingSuccessMap = {
//         new_customer: null,
//         good_customer: 85,
//         regular_customer: 65,
//         bad_customer: 20,
//         blocked: 0,
//       };
      
//       return {
//         success: true,
//         rating,
//         addressCount,
//         ratingBased: true,
//         configured: true,
//         // Return empty counts since v2 doesn't provide them
//         delivered: 0,
//         cancelled: 0,
//         total: 0,
//         successRate: ratingSuccessMap[rating] ?? 0
//       };
//     }

//     // Legacy v1 response with numeric counts
//     const customer = payload.customer || payload;
//     const delivered = Number(
//       customer?.successful_delivery ??
//       customer?.success_delivery ??
//       customer?.delivered ??
//       customer?.total_delivered ??
//       0
//     );
//     const total = Number(
//       customer?.total_delivery ??
//       customer?.total ??
//       customer?.total_parcels ??
//       0
//     );
//     const cancelled = Math.max(0, total - delivered);

//     return {
//       success: true,
//       delivered,
//       cancelled,
//       total,
//       configured: true,
//       ratingBased: false
//     };
    
//   } catch (error) {
//     console.error('❌ Pathao fraud check error:', error);
//     return {
//       success: false,
//       error: error.message || 'Pathao request failed',
//       configured: true
//     };
//   }
// }

//   async formatOrderData(order, storeId) {
//     const customer = order.customerInfo;

//     console.log('📍 Formatting Pathao order data:');
//     console.log('  Customer:', customer.fullName);
//     console.log('  Phone:', customer.phone);
//     console.log('  City:', customer.city);
//     console.log('  Zone:', customer.zone);
//     console.log('  Address:', customer.address);

//     // ========== RESOLVE CITY ID (LIVE FROM PATHAO) ==========
//     let cityId;
//     try {
//       cityId = await this.resolveCityId(customer.city);
//       console.log(`  City ID: ${cityId}`);
//     } catch (error) {
//       console.error('❌ Error resolving Pathao city ID:', error);
//       throw new Error(`Could not resolve a valid Pathao city for "${customer.city}": ${error.message}`);
//     }

//     // ========== RESOLVE ZONE ID (LIVE FROM PATHAO, SCOPED TO CITY) ==========
//     let zoneId;
//     try {
//       zoneId = await this.resolveZoneId(cityId, customer.zone);
//       console.log(`  Zone ID: ${zoneId}`);
//     } catch (error) {
//       console.error('❌ Error resolving Pathao zone ID:', error);
//       throw new Error(
//         `Could not resolve a valid Pathao delivery zone for "${customer.zone}" in city "${customer.city}": ${error.message}`
//       );
//     }

//     // Calculate total weight
//     const totalWeight = Math.max(0.5, this.calculateTotalWeight(order.items));
//     const totalQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
//     const codAmount = order.paymentMethod === 'cod' ? Math.round(order.total) : 0;

//     // ========== CLEAN PHONE NUMBER ==========
//     const cleanPhone = this.cleanPhoneNumber(customer.phone);

//     // Build full address
//     const fullAddress = [
//       customer.address,
//       customer.area || '',
//       customer.zone || '',
//       customer.city || ''
//     ].filter(Boolean).join(', ');

//     const itemDescription = order.items
//       .map(item => `${item.productName || 'Product'} x${item.quantity}`)
//       .join(', ')
//       .slice(0, 255);

//     // ========== ENSURE merchant_order_id IS UNIQUE AND VALID ==========
//     const merchantOrderId = order.orderNumber || `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;

//     const pathaoData = {
//       store_id: parseInt(storeId),
//       merchant_order_id: merchantOrderId,
//       recipient_name: customer.fullName || 'Customer',
//       recipient_phone: cleanPhone || '01700000000',
//       recipient_address: (fullAddress || customer.address || 'N/A').slice(0, 255),
//       recipient_city: cityId,
//       recipient_zone: zoneId,
//       delivery_type: 48, // Regular delivery
//       item_description: itemDescription || 'Order items',
//       item_quantity: Math.max(1, totalQuantity),
//       item_weight: Math.round(totalWeight * 100) / 100,
//       item_type: 2, // Parcel
//       amount_to_collect: codAmount || 0,
//       special_instruction: (customer.note || '').slice(0, 255),
//       parcel_value: Math.round(order.total || 0),
//     };

//     console.log('📤 Final Pathao data:', JSON.stringify(pathaoData, null, 2));
//     return pathaoData;
//   }

//   // ========== CLEAN PHONE NUMBER ==========
//   cleanPhoneNumber(phone) {
//     if (!phone) return '01700000000';
//     let cleaned = phone.replace(/\D/g, '');
//     // Handle 880 prefix
//     if (cleaned.startsWith('880')) {
//       cleaned = '0' + cleaned.slice(3);
//     }
//     // Ensure it starts with 0
//     if (!cleaned.startsWith('0')) {
//       cleaned = '0' + cleaned;
//     }
//     // Ensure exactly 11 digits (for BD numbers)
//     if (cleaned.length > 11) {
//       cleaned = cleaned.slice(0, 11);
//     }
//     while (cleaned.length < 11) {
//       cleaned = cleaned + '0';
//     }
//     return cleaned;
//   }

//   calculateTotalWeight(items) {
//     if (!items || items.length === 0) return 0.5;
//     return items.reduce((sum, item) => {
//       const weight = item.weight || item.itemWeight || 0.5;
//       return sum + (weight * (item.quantity || 1));
//     }, 0);
//   }

//   async getTracking(trackingNumber) {
//     try {
//       const token = await this.getAccessToken();

//       const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders/${trackingNumber}/tracking`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.message || 'Failed to get tracking info');
//       }

//       return {
//         success: true,
//         status: data.status,
//         location: data.location,
//         history: data.history || [],
//         estimatedDelivery: data.estimated_delivery,
//         fullResponse: data
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.message
//       };
//     }
//   }

//   async cancelOrder(courierOrderId) {
//     try {
//       const token = await this.getAccessToken();

//       const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders/${courierOrderId}/cancel`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.message || 'Failed to cancel order');
//       }

//       return {
//         success: true,
//         message: 'Order cancelled successfully with Pathao',
//         fullResponse: data
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.message
//       };
//     }
//   }

//   // ========== PUBLIC HELPERS (useful for a settings/debug UI) ==========
//   async getAvailableCities() {
//     return this.fetchCities();
//   }

//   async getAvailableZones(cityId) {
//     return this.fetchZones(cityId);
//   }
// }

// module.exports = PathaoAdapter;



const CourierAdapter = require('./CourierAdapter');

const PATHAO_API_BASE = 'https://api-hermes.pathao.com';

class PathaoAdapter extends CourierAdapter {
  constructor(creds, storeConfig) {
    super('pathao', creds, storeConfig);
    this.accessToken = null;
    this.tokenExpiry = null;

    // ========== CITY/ZONE CACHE (replaces static zoneMapping.js) ==========
    this.cityCache = null;
    this.cityCacheTime = null;
    this.zoneCache = new Map(); // cityId -> { zones, time }
    this.cacheTTL = 6 * 60 * 60 * 1000; // 6 hours
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🔑 Getting Pathao access token...');

      const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/issue-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.creds.clientId,
          client_secret: this.creds.clientSecret,
          username: this.creds.username,
          password: this.creds.password,
          grant_type: 'password',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Pathao auth error:', data);
        throw new Error(data?.message || 'Pathao authentication failed');
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;

      console.log('✅ Pathao token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Pathao token error:', error);
      throw new Error(`Pathao authentication failed: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      await this.getAccessToken();
      const storeId = this.storeConfig.pathaoStoreId || this.creds.storeId;
      if (!storeId) {
        throw new Error('Pathao store_id is required');
      }
      return {
        success: true,
        message: 'Pathao API connected successfully',
        storeId: storeId
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ========================================================================
  // ========== DYNAMIC CITY / ZONE RESOLUTION (LIVE FROM PATHAO API) ==========
  // ========================================================================

  normalize(str) {
    return (str || '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  async fetchCities() {
    const now = Date.now();
    if (this.cityCache && this.cityCacheTime && (now - this.cityCacheTime) < this.cacheTTL) {
      return this.cityCache;
    }

    try {
      const token = await this.getAccessToken();
      console.log('📡 Fetching Pathao city list...');

      const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/countries/1/city-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch Pathao city list');
      }

      const cities = data?.data?.data || [];
      if (!cities.length) {
        throw new Error('Pathao returned an empty city list');
      }

      this.cityCache = cities;
      this.cityCacheTime = now;
      console.log(`✅ Fetched ${cities.length} Pathao cities`);
      return cities;
    } catch (error) {
      console.error('❌ Fetch Pathao cities error:', error);
      if (this.cityCache) {
        console.log('⚠️ Using stale city cache due to fetch failure');
        return this.cityCache;
      }
      throw error;
    }
  }

  async fetchZones(cityId) {
    const now = Date.now();
    const cached = this.zoneCache.get(cityId);
    if (cached && (now - cached.time) < this.cacheTTL) {
      return cached.zones;
    }

    try {
      const token = await this.getAccessToken();
      console.log(`📡 Fetching Pathao zone list for city ${cityId}...`);

      const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/cities/${cityId}/zone-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || `Failed to fetch Pathao zone list for city ${cityId}`);
      }

      const zones = data?.data?.data || [];
      this.zoneCache.set(cityId, { zones, time: now });
      console.log(`✅ Fetched ${zones.length} Pathao zones for city ${cityId}`);
      return zones;
    } catch (error) {
      console.error(`❌ Fetch Pathao zones error for city ${cityId}:`, error);
      if (cached) {
        console.log('⚠️ Using stale zone cache due to fetch failure');
        return cached.zones;
      }
      throw error;
    }
  }

  /**
   * Resolve a district/city name (e.g. "Barguna") to a real Pathao city_id
   */
  async resolveCityId(districtName) {
    const cities = await this.fetchCities();
    const needle = this.normalize(districtName);

    if (!needle) {
      console.log('⚠️ No district provided, defaulting to Dhaka');
      const dhaka = cities.find(c => this.normalize(c.city_name) === 'dhaka');
      return dhaka ? dhaka.city_id : cities[0].city_id;
    }

    // Exact match first
    let match = cities.find(c => this.normalize(c.city_name) === needle);

    // Partial match fallback
    if (!match) {
      match = cities.find(c => {
        const cityName = this.normalize(c.city_name);
        return cityName.includes(needle) || needle.includes(cityName);
      });
    }

    if (!match) {
      console.log(`⚠️ Pathao city "${districtName}" not found, defaulting to Dhaka`);
      match = cities.find(c => this.normalize(c.city_name) === 'dhaka') || cities[0];
    } else {
      console.log(`📍 Pathao city resolved: "${districtName}" → "${match.city_name}" (ID: ${match.city_id})`);
    }

    return match.city_id;
  }

  /**
   * Resolve a zone/upazila name (e.g. "Amtali") to a real Pathao zone_id
   * that is guaranteed to belong to the given cityId.
   */
  async resolveZoneId(cityId, zoneName) {
    const zones = await this.fetchZones(cityId);

    if (!zones.length) {
      throw new Error(`No Pathao delivery zones available for city ID ${cityId}`);
    }

    const needle = this.normalize(zoneName);

    let match = null;
    if (needle) {
      // Exact match first
      match = zones.find(z => this.normalize(z.zone_name) === needle);

      // Partial match fallback
      if (!match) {
        match = zones.find(z => {
          const zoneNameNorm = this.normalize(z.zone_name);
          return zoneNameNorm.includes(needle) || needle.includes(zoneNameNorm);
        });
      }
    }

    if (!match) {
      console.log(`⚠️ Pathao zone "${zoneName}" not found for city ${cityId}, using first available zone: "${zones[0].zone_name}"`);
      match = zones[0];
    } else {
      console.log(`📍 Pathao zone resolved: "${zoneName}" → "${match.zone_name}" (ID: ${match.zone_id})`);
    }

    return match.zone_id;
  }

  // ========================================================================

  // async createOrder(orderData) {
  //   try {
  //     console.log('📦 Creating Pathao order...');

  //     const token = await this.getAccessToken();
  //     const storeId = this.storeConfig.pathaoStoreId || this.creds.storeId;

  //     if (!storeId) {
  //       throw new Error('Pathao store_id is required');
  //     }

  //     const pathaoOrderData = await this.formatOrderData(orderData, storeId);
  //     console.log('📤 Pathao API request:', JSON.stringify(pathaoOrderData, null, 2));

  //     const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(pathaoOrderData),
  //     });

  //     const data = await response.json();

  //     // ========== IMPROVED ERROR HANDLING ==========
  //     if (!response.ok) {
  //       console.error('❌ Pathao error response:', JSON.stringify(data, null, 2));

  //       let errorMessage = 'Pathao order creation failed';

  //       if (data.errors) {
  //         if (typeof data.errors === 'object') {
  //           const errorMessages = [];
  //           for (const [field, messages] of Object.entries(data.errors)) {
  //             if (Array.isArray(messages)) {
  //               errorMessages.push(`${field}: ${messages.join(', ')}`);
  //             } else if (typeof messages === 'string') {
  //               errorMessages.push(`${field}: ${messages}`);
  //             } else if (typeof messages === 'object') {
  //               for (const [subField, subMessages] of Object.entries(messages)) {
  //                 if (Array.isArray(subMessages)) {
  //                   errorMessages.push(`${field}.${subField}: ${subMessages.join(', ')}`);
  //                 } else {
  //                   errorMessages.push(`${field}.${subField}: ${subMessages}`);
  //                 }
  //               }
  //             }
  //           }
  //           errorMessage = `Pathao API errors: ${errorMessages.join(', ')}`;
  //         } else if (typeof data.errors === 'string') {
  //           errorMessage = `Pathao API error: ${data.errors}`;
  //         } else {
  //           errorMessage = `Pathao API error: ${JSON.stringify(data.errors)}`;
  //         }
  //       } else if (data.message) {
  //         errorMessage = `Pathao API error: ${data.message}`;
  //       } else if (data.error) {
  //         errorMessage = `Pathao API error: ${data.error}`;
  //       }

  //       if (data.code === 422 || data.status === 422) {
  //         errorMessage = `Validation Error: ${errorMessage}`;
  //       }

  //       throw new Error(errorMessage);
  //     }

  //     const orderInfo = data.data || data;
  //     return {
  //       success: true,
  //       courierOrderId: orderInfo.id || orderInfo.order_id,
  //       trackingNumber: orderInfo.tracking_number || orderInfo.consignment_id || orderInfo.id,
  //       trackingUrl: orderInfo.tracking_url || `https://pathao.com/bd/customer-tracking/?consignment_id=${orderInfo.consignment_id}`,
  //       labelUrl: orderInfo.label_url || '',
  //       invoiceUrl: orderInfo.invoice_url || '',
  //       fullResponse: data,
  //       message: 'Order created successfully with Pathao'
  //     };
  //   } catch (error) {
  //     console.error('❌ Pathao order creation error:', error);
  //     return {
  //       success: false,
  //       message: error.message
  //     };
  //   }
  // }
// PathaoAdapter.js - Update the createOrder method

async createOrder(orderData) {
  try {
    console.log('📦 Creating Pathao order...');

    const token = await this.getAccessToken();
    const storeId = this.storeConfig.pathaoStoreId || this.creds.storeId;

    if (!storeId) {
      throw new Error('Pathao store_id is required');
    }

    const pathaoOrderData = await this.formatOrderData(orderData, storeId);
    console.log('📤 Pathao API request:', JSON.stringify(pathaoOrderData, null, 2));

    const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(pathaoOrderData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Pathao error response:', JSON.stringify(data, null, 2));
      // ... error handling
    }

    const orderInfo = data.data || data;
    const consignmentId = orderInfo.consignment_id || orderInfo.id || orderInfo.order_id;
    
    // ========== GET CUSTOMER PHONE FROM ORDER DATA ==========
    const customerPhone = orderData.customerInfo?.phone || '';
    const cleanPhone = this.cleanPhoneNumber(customerPhone);

    // ========== GENERATE CORRECT TRACKING URL ==========
    const trackingUrl = consignmentId && cleanPhone
      ? `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}&phone=${cleanPhone}`
      : '';

    console.log('✅ Generated tracking URL:', trackingUrl);

    return {
      success: true,
      courierOrderId: consignmentId,
      trackingNumber: consignmentId,
      trackingUrl: trackingUrl,  // ✅ This is what gets stored in the order
      labelUrl: orderInfo.label_url || '',
      invoiceUrl: orderInfo.invoice_url || '',
      fullResponse: data,
      message: 'Order created successfully with Pathao'
    };
  } catch (error) {
    console.error('❌ Pathao order creation error:', error);
    return {
      success: false,
      message: error.message
    };
  }
}


// src/lib/couriers/adapters/PathaoAdapter.js

// Add this method to the PathaoAdapter class

/**
 * Get lifetime delivery stats for a customer phone number
 * This uses the Pathao merchant panel's customer success API
 */
async getCustomerLifetimeStats(phone) {
  try {
    console.log(`🔍 Pathao: Fetching lifetime stats for ${phone}`);
    
    const token = await this.getAccessToken();
    const cleanPhone = this.cleanPhoneNumber(phone);
    
    const response = await fetch('https://merchant.pathao.com/api/v1/user/success', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ phone: cleanPhone }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Pathao fraud check error:', data);
      return {
        success: false,
        error: data?.message || 'Pathao customer lookup failed',
        configured: true
      };
    }

    const payload = data?.data || {};

    // Check for v2 API with customer_rating
    if (payload.version === 'v2' || payload.customer_rating) {
      const rating = String(payload.customer_rating || 'unknown');
      const addressCount = Array.isArray(payload.address_book) ? payload.address_book.length : 0;
      
      // Map rating to approximate success rate
      const ratingSuccessMap = {
        new_customer: null,
        good_customer: 85,
        regular_customer: 65,
        bad_customer: 20,
        blocked: 0,
      };
      
      return {
        success: true,
        rating,
        addressCount,
        ratingBased: true,
        configured: true,
        // Return empty counts since v2 doesn't provide them
        delivered: 0,
        cancelled: 0,
        total: 0,
        successRate: ratingSuccessMap[rating] ?? 0
      };
    }

    // Legacy v1 response with numeric counts
    const customer = payload.customer || payload;
    const delivered = Number(
      customer?.successful_delivery ??
      customer?.success_delivery ??
      customer?.delivered ??
      customer?.total_delivered ??
      0
    );
    const total = Number(
      customer?.total_delivery ??
      customer?.total ??
      customer?.total_parcels ??
      0
    );
    const cancelled = Math.max(0, total - delivered);

    return {
      success: true,
      delivered,
      cancelled,
      total,
      configured: true,
      ratingBased: false
    };
    
  } catch (error) {
    console.error('❌ Pathao fraud check error:', error);
    return {
      success: false,
      error: error.message || 'Pathao request failed',
      configured: true
    };
  }
}

  async formatOrderData(order, storeId) {
    const customer = order.customerInfo;

    console.log('📍 Formatting Pathao order data:');
    console.log('  Customer:', customer.fullName);
    console.log('  Phone:', customer.phone);
    console.log('  City:', customer.city);
    console.log('  Zone:', customer.zone);
    console.log('  Address:', customer.address);

    // ========== RESOLVE CITY ID (LIVE FROM PATHAO) ==========
    let cityId;
    try {
      cityId = await this.resolveCityId(customer.city);
      console.log(`  City ID: ${cityId}`);
    } catch (error) {
      console.error('❌ Error resolving Pathao city ID:', error);
      throw new Error(`Could not resolve a valid Pathao city for "${customer.city}": ${error.message}`);
    }

    // ========== RESOLVE ZONE ID (LIVE FROM PATHAO, SCOPED TO CITY) ==========
    let zoneId;
    try {
      zoneId = await this.resolveZoneId(cityId, customer.zone);
      console.log(`  Zone ID: ${zoneId}`);
    } catch (error) {
      console.error('❌ Error resolving Pathao zone ID:', error);
      throw new Error(
        `Could not resolve a valid Pathao delivery zone for "${customer.zone}" in city "${customer.city}": ${error.message}`
      );
    }

    // Calculate total weight
    const totalWeight = Math.max(0.5, this.calculateTotalWeight(order.items));
    const totalQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const codAmount = order.paymentMethod === 'cod' ? Math.round(order.total) : 0;

    // ========== CLEAN PHONE NUMBER ==========
    const cleanPhone = this.cleanPhoneNumber(customer.phone);

    // Build full address
    const fullAddress = [
      customer.address,
      customer.area || '',
      customer.zone || '',
      customer.city || ''
    ].filter(Boolean).join(', ');

    // const itemDescription = order.items
    //   .map(item => `${item.productName || 'Product'} x${item.quantity}`)
    //   .join(', ')
    //   .slice(0, 255);

    // ✅ Compute each item's effective quantity
const getItemQuantity = (item) => {
  // 1) Top-level quantity
  if (typeof item.quantity === 'number' && item.quantity > 0) return item.quantity;

  // 2) Fall back to colors array
  if (Array.isArray(item.colors) && item.colors.length > 0) {
    const colorQty = item.colors.reduce((s, c) => s + (Number(c.quantity) || 0), 0);
    if (colorQty > 0) return colorQty;
  }

  // 3) Fall back to variants/subVariants
  if (Array.isArray(item.variantDetails) && item.variantDetails.length > 0) {
    let variantQty = 0;
    item.variantDetails.forEach(v => {
      if (Array.isArray(v.subVariants) && v.subVariants.length > 0) {
        v.subVariants.forEach(sv => {
          variantQty += Number(sv.quantity) || 0;
        });
      } else {
        variantQty += Number(v.quantity) || 0;
      }
    });
    if (variantQty > 0) return variantQty;
  }

  // 4) Last resort
  return 1;
};

// ✅ Build description with variant awareness + safe quantities
const itemDescription = order.items
  .map(item => {
    const baseName = item.productName || 'Product';
    const hasVariants = Array.isArray(item.variantDetails) && item.variantDetails.length > 0;

    if (hasVariants) {
      const parts = [];
      item.variantDetails.forEach(v => {
        const vName = v.variantName || 'Variant';
        if (Array.isArray(v.subVariants) && v.subVariants.length > 0) {
          v.subVariants.forEach(sv => {
            const svName = sv.subVariantName || 'Sub-Variant';
            const qty = Number(sv.quantity) || 0;
            if (qty > 0) parts.push(`${baseName} - ${vName} - ${svName} x${qty}`);
          });
        } else {
          const qty = Number(v.quantity) || 0;
          if (qty > 0) parts.push(`${baseName} - ${vName} x${qty}`);
        }
      });
      return parts.length > 0 ? parts.join(', ') : `${baseName} x${getItemQuantity(item)}`;
    }

    return `${baseName} x${getItemQuantity(item)}`;
  })
  .join(', ')
  .slice(0, 1000);

    // ========== ENSURE merchant_order_id IS UNIQUE AND VALID ==========
    const merchantOrderId = order.orderNumber || `ORD-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const pathaoData = {
      store_id: parseInt(storeId),
      merchant_order_id: merchantOrderId,
      recipient_name: customer.fullName || 'Customer',
      recipient_phone: cleanPhone || '01700000000',
      recipient_address: (fullAddress || customer.address || 'N/A').slice(0, 255),
      recipient_city: cityId,
      recipient_zone: zoneId,
      delivery_type: 48, // Regular delivery
      item_description: itemDescription || 'Order items',
      item_quantity: Math.max(1, totalQuantity),
      item_weight: Math.round(totalWeight * 100) / 100,
      item_type: 2, // Parcel
      amount_to_collect: codAmount || 0,
      special_instruction: (customer.note || '').slice(0, 255),
      parcel_value: Math.round(order.total || 0),
    };

    console.log('📤 Final Pathao data:', JSON.stringify(pathaoData, null, 2));
    return pathaoData;
  }

  // ========== CLEAN PHONE NUMBER ==========
  cleanPhoneNumber(phone) {
    if (!phone) return '01700000000';
    let cleaned = phone.replace(/\D/g, '');
    // Handle 880 prefix
    if (cleaned.startsWith('880')) {
      cleaned = '0' + cleaned.slice(3);
    }
    // Ensure it starts with 0
    if (!cleaned.startsWith('0')) {
      cleaned = '0' + cleaned;
    }
    // Ensure exactly 11 digits (for BD numbers)
    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }
    while (cleaned.length < 11) {
      cleaned = cleaned + '0';
    }
    return cleaned;
  }

  calculateTotalWeight(items) {
    if (!items || items.length === 0) return 0.5;
    return items.reduce((sum, item) => {
      const weight = item.weight || item.itemWeight || 0.5;
      return sum + (weight * (item.quantity || 1));
    }, 0);
  }

  // async getTracking(trackingNumber) {
  //   try {
  //     const token = await this.getAccessToken();

  //     const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders/${trackingNumber}/tracking`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //       },
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data?.message || 'Failed to get tracking info');
  //     }

  //     return {
  //       success: true,
  //       status: data.status,
  //       location: data.location,
  //       history: data.history || [],
  //       estimatedDelivery: data.estimated_delivery,
  //       fullResponse: data
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message
  //     };
  //   }
  // }

  // In PathaoAdapter.js - Update the getTracking method

async getTracking(trackingNumber) {
  try {
    console.log(`📡 Fetching Pathao tracking for: ${trackingNumber}`);
    
    const token = await this.getAccessToken();

    const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders/${trackingNumber}/tracking`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Failed to get tracking info');
    }

    // Extract data
    const trackingData = data?.data || data || {};
    
    // Build history
    let history = [];
    if (trackingData.history && Array.isArray(trackingData.history)) {
      history = trackingData.history.map(entry => ({
        status: entry.status || entry.code || 'processing',
        message: entry.message || entry.note || entry.description || '',
        location: entry.location || entry.place || '',
        timestamp: entry.timestamp || entry.date || new Date().toISOString()
      }));
    }

    return {
      success: true,
      status: trackingData.status || 'processing',
      location: trackingData.location || trackingData.current_location || null,
      estimatedDelivery: trackingData.estimated_delivery || trackingData.eta || null,
      history: history,
      message: trackingData.message || 'Tracking retrieved',
      fullResponse: data
    };
  } catch (error) {
    console.error('❌ Pathao tracking error:', error);
    return {
      success: false,
      message: error.message || 'Failed to get tracking info',
      status: 'pending',
      history: []
    };
  }
}

  async cancelOrder(courierOrderId) {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${PATHAO_API_BASE}/aladdin/api/v1/orders/${courierOrderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to cancel order');
      }

      return {
        success: true,
        message: 'Order cancelled successfully with Pathao',
        fullResponse: data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // ========== PUBLIC HELPERS (useful for a settings/debug UI) ==========
  async getAvailableCities() {
    return this.fetchCities();
  }

  async getAvailableZones(cityId) {
    return this.fetchZones(cityId);
  }
}

module.exports = PathaoAdapter;