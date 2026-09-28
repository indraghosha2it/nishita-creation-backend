


// // const CourierAdapter = require('./CourierAdapter');

// // const STEADFAST_API_BASE = 'https://portal.packzy.com/api/v1';

// // class SteadfastAdapter extends CourierAdapter {
// //   constructor(creds, storeConfig) {
// //     super('steadfast', creds, storeConfig);
// //   }

// //   getAuthHeaders() {
// //     return {
// //       'Content-Type': 'application/json',
// //       'Api-Key': this.creds.apiKey,
// //       'Secret-Key': this.creds.secretKey,
// //     };
// //   }

// //   // ========== HELPER: SAFE JSON PARSE - FIXED ==========
// //   async safeParseResponse(response) {
// //     // Clone the response before reading to allow multiple reads if needed
// //     const clonedResponse = response.clone();
// //     const text = await clonedResponse.text();
    
// //     console.log('📥 Response text:', text.substring(0, 500));
    
// //     // Check if response is HTML
// //     if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
// //       throw new Error('Steadfast API returned HTML instead of JSON. Please check your credentials.');
// //     }
    
// //     // Check if response is plain text (like "Account is not active")
// //     if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
// //       throw new Error(`Steadfast API Error: ${text.trim()}`);
// //     }
    
// //     try {
// //       return JSON.parse(text);
// //     } catch (parseError) {
// //       throw new Error(`Steadfast API returned invalid JSON: ${text.substring(0, 100)}`);
// //     }
// //   }

// //   // ========== HELPER: GET RESPONSE TEXT WITHOUT CONSUMING BODY ==========
// //   async getResponseText(response) {
// //     // Clone the response to avoid consuming the body
// //     const clonedResponse = response.clone();
// //     return await clonedResponse.text();
// //   }

// //   async testConnection() {
// //     console.log('🧪 Testing Steadfast connection...');
// //     console.log('🔑 API Key:', this.creds?.apiKey ? `${this.creds.apiKey.slice(0, 6)}...` : '❌ MISSING');
// //     console.log('🔑 Secret Key:', this.creds?.secretKey ? `${this.creds.secretKey.slice(0, 4)}...` : '❌ MISSING');
    
// //     try {
// //       const response = await fetch(`${STEADFAST_API_BASE}/get_balance`, {
// //         method: 'GET',
// //         headers: this.getAuthHeaders(),
// //       });

// //       console.log('📊 Response Status:', response.status);

// //       // Get the response text once
// //       const responseText = await this.getResponseText(response);
// //       console.log('📥 Response text:', responseText.substring(0, 500));

// //       // Check for common error messages in plain text
// //       if (responseText.includes('Account is not active')) {
// //         return {
// //           success: false,
// //           message: 'Steadfast account is not active. Please contact Steadfast support to activate your account.',
// //           details: responseText.trim()
// //         };
// //       }
      
// //       if (responseText.includes('Invalid API Key') || responseText.includes('Invalid Secret')) {
// //         return {
// //           success: false,
// //           message: 'Invalid API Key or Secret Key. Please check your credentials in the courier settings.',
// //           details: responseText.trim()
// //         };
// //       }

// //       // Try to parse as JSON
// //       let data = null;
// //       let parseError = null;
      
// //       try {
// //         data = JSON.parse(responseText);
// //       } catch (e) {
// //         parseError = e;
// //       }

// //       // If it's HTML or plain text, handle it
// //       if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
// //         return {
// //           success: false,
// //           message: 'Steadfast API returned HTML instead of JSON. Please check your credentials.',
// //           details: 'The API endpoint may have changed or you may need to contact Steadfast support.'
// //         };
// //       }

// //       if (parseError || !data) {
// //         return {
// //           success: false,
// //           message: `Steadfast API Error: ${responseText.trim() || 'Unknown error'}`,
// //           details: responseText.trim()
// //         };
// //       }

// //       if (response.ok) {
// //         const balance = data?.current_balance ?? data?.balance ?? 'N/A';
// //         return { 
// //           success: true, 
// //           message: `Steadfast API connected successfully. Balance: ৳${balance}`,
// //           details: `Account active with balance ৳${balance}`
// //         };
// //       }

// //       // Handle specific error codes
// //       if (response.status === 401) {
// //         const msg = data?.message || 'Unauthorized';
// //         return {
// //           success: false,
// //           message: `Steadfast API Error: ${msg}. Make sure you copied the API Key and Secret Key from portal.packzy.com → Settings → API for your active account.`,
// //           details: msg
// //         };
// //       }

// //       if (response.status === 403) {
// //         return {
// //           success: false,
// //           message: 'Steadfast account access denied. Please check your account status with Steadfast support.',
// //           details: data?.message || 'Access denied'
// //         };
// //       }

// //       return { 
// //         success: false, 
// //         message: `Steadfast API Error (${response.status}): ${data?.message || 'Unknown error'}`,
// //         details: data?.message || 'Unknown error'
// //       };
      
// //     } catch (error) {
// //       console.error('❌ Test connection error:', error);
// //       return { 
// //         success: false, 
// //         message: error.message || 'Steadfast connection failed',
// //         details: 'Network error or invalid API endpoint'
// //       };
// //     }
// //   }

// //   async createOrder(orderData) {
// //     try {
// //       console.log('📦 Creating Steadfast order...');

// //       const steadfastOrderData = this.formatOrderData(orderData);
// //       console.log('📤 Order data:', JSON.stringify(steadfastOrderData, null, 2));
// //       console.log(`📡 POST ${STEADFAST_API_BASE}/create_order`);

// //       const response = await fetch(`${STEADFAST_API_BASE}/create_order`, {
// //         method: 'POST',
// //         headers: this.getAuthHeaders(),
// //         body: JSON.stringify(steadfastOrderData),
// //       });

// //       console.log('📊 Response Status:', response.status);

// //       // Get response text once
// //       const responseText = await this.getResponseText(response);
// //       console.log('📥 Response text:', responseText.substring(0, 500));

// //       // Check for common error messages in plain text
// //       if (responseText.includes('Account is not active')) {
// //         throw new Error('Steadfast account is not active. Please contact Steadfast support to activate your account.');
// //       }
      
// //       if (responseText.includes('Invalid API Key') || responseText.includes('Invalid Secret')) {
// //         throw new Error('Invalid API Key or Secret Key. Please check your credentials in the courier settings.');
// //       }
      
// //       if (responseText.includes('Insufficient balance')) {
// //         throw new Error('Insufficient balance in your Steadfast account. Please recharge your account.');
// //       }

// //       // Try to parse as JSON
// //       let data = null;
// //       let parseError = null;
      
// //       try {
// //         data = JSON.parse(responseText);
// //       } catch (e) {
// //         parseError = e;
// //       }

// //       // If it's HTML or plain text, handle it
// //       if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
// //         throw new Error('Steadfast API returned HTML instead of JSON. Please check your credentials.');
// //       }

// //       if (parseError || !data) {
// //         throw new Error(`Steadfast API Error: ${responseText.trim() || 'Unknown error'}`);
// //       }

// //       if (!response.ok) {
// //         const errMsg = data?.message || data?.error || `HTTP ${response.status}`;
// //         if (response.status === 401) {
// //           throw new Error(`Steadfast API Error: ${errMsg}. Please verify your API credentials.`);
// //         }
// //         if (response.status === 403) {
// //           throw new Error(`Steadfast API Error: ${errMsg}. Your account may not be active.`);
// //         }
// //         throw new Error(`Steadfast API Error: ${errMsg}`);
// //       }

// //       // Check if the response has the expected structure
// //       if (!data || typeof data !== 'object') {
// //         throw new Error('Steadfast API returned an invalid response format.');
// //       }

// //       const orderInfo = data.data || data;
// //       return {
// //         success: true,
// //         courierOrderId: orderInfo?.order_id || orderInfo?.id || null,
// //         trackingNumber: orderInfo?.tracking_code || orderInfo?.tracking_number || null,
// //         trackingUrl: orderInfo?.tracking_url || `https://portal.packzy.com/track/${orderInfo?.tracking_code}`,
// //         labelUrl: orderInfo?.label_url || '',
// //         invoiceUrl: orderInfo?.invoice_url || '',
// //         fullResponse: data,
// //         message: 'Order created successfully with Steadfast',
// //       };
      
// //     } catch (error) {
// //       console.error('❌ Steadfast order creation error:', error);
// //       return { 
// //         success: false, 
// //         message: error.message || 'Failed to create Steadfast order',
// //         details: error.stack
// //       };
// //     }
// //   }

// //   formatOrderData(order) {
// //     const customer = order.customerInfo;
// //     const cleanPhone = this.cleanPhoneNumber(customer.phone);
// //     const fullAddress = [customer.address, customer.area, customer.zone, customer.city]
// //       .filter(Boolean).join(', ');
// //     const totalWeight = this.calculateTotalWeight(order.items);
// //     const itemDescription = order.items
// //       .map(item => `${item.productName} x${item.quantity}`)
// //       .join(', ')
// //       .slice(0, 255);

// //     return {
// //       invoice: order.orderNumber || `INV-${Date.now()}`,
// //       recipient_name: customer.fullName || 'Customer',
// //       recipient_phone: cleanPhone || '01700000000',
// //       recipient_address: (fullAddress || customer.address || 'N/A').slice(0, 250),
// //       cod_amount: order.paymentMethod === 'cod' ? Math.round(order.total) : 0,
// //       note: (customer.note || '').slice(0, 255),
// //       item_description: itemDescription || 'Order items',
// //       total_lot: 1,
// //       delivery_type: 0,
// //     };
// //   }

// //   cleanPhoneNumber(phone) {
// //     if (!phone) return '01700000000';
// //     let cleaned = phone.replace(/\D/g, '');
// //     if (cleaned.startsWith('880')) cleaned = '0' + cleaned.slice(3);
// //     if (!cleaned.startsWith('0')) cleaned = '0' + cleaned;
// //     if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
// //     while (cleaned.length < 11) cleaned = cleaned + '0';
// //     return cleaned;
// //   }

// //   calculateTotalWeight(items) {
// //     if (!items || items.length === 0) return 0.5;
// //     return items.reduce((sum, item) => {
// //       const weight = item.weight || item.itemWeight || 0.5;
// //       return sum + (weight * (item.quantity || 1));
// //     }, 0);
// //   }

// //   async getTracking(trackingNumber) {
// //     try {
// //       console.log(`📡 Fetching tracking for: ${trackingNumber}`);
      
// //       const response = await fetch(`${STEADFAST_API_BASE}/status_by_trackingcode/${trackingNumber}`, {
// //         method: 'GET',
// //         headers: this.getAuthHeaders(),
// //       });

// //       console.log('📊 Response Status:', response.status);

// //       // Get response text once
// //       const responseText = await this.getResponseText(response);
// //       console.log('📥 Response text:', responseText.substring(0, 500));

// //       // Try to parse as JSON
// //       let data = null;
// //       try {
// //         data = JSON.parse(responseText);
// //       } catch (parseError) {
// //         throw new Error(`Steadfast tracking error: ${responseText.trim()}`);
// //       }

// //       if (!response.ok) {
// //         throw new Error(data?.message || 'Failed to get tracking info');
// //       }
      
// //       return {
// //         success: true,
// //         status: data.delivery_status || data.status || 'Unknown',
// //         history: data.history || [],
// //         fullResponse: data,
// //       };
      
// //     } catch (error) {
// //       console.error('❌ Steadfast tracking error:', error);
// //       return { 
// //         success: false, 
// //         message: error.message || 'Failed to get tracking info' 
// //       };
// //     }
// //   }

// //   async cancelOrder(courierOrderId) {
// //     try {
// //       console.log(`📡 Cancelling order: ${courierOrderId}`);
      
// //       const response = await fetch(`${STEADFAST_API_BASE}/cancel_order/${courierOrderId}`, {
// //         method: 'POST',
// //         headers: this.getAuthHeaders(),
// //       });

// //       console.log('📊 Response Status:', response.status);

// //       // Get response text once
// //       const responseText = await this.getResponseText(response);
// //       console.log('📥 Response text:', responseText.substring(0, 500));

// //       // Try to parse as JSON
// //       let data = null;
// //       try {
// //         data = JSON.parse(responseText);
// //       } catch (parseError) {
// //         throw new Error(`Steadfast cancel error: ${responseText.trim()}`);
// //       }

// //       if (!response.ok) {
// //         throw new Error(data?.message || 'Failed to cancel order');
// //       }
      
// //       return { 
// //         success: true, 
// //         message: 'Order cancelled successfully with Steadfast',
// //         fullResponse: data 
// //       };
      
// //     } catch (error) {
// //       console.error('❌ Steadfast cancel error:', error);
// //       return { 
// //         success: false, 
// //         message: error.message || 'Failed to cancel order' 
// //       };
// //     }
// //   }
// // }

// // module.exports = SteadfastAdapter;

// // src/lib/couriers/adapters/SteadfastAdapter.js

// const CourierAdapter = require('./CourierAdapter');

// const STEADFAST_API_BASE = 'https://portal.packzy.com/api/v1';

// // ============================================================
// // ✅ CookieJar class - MUST BE DEFINED AT THE TOP LEVEL
// // ============================================================
// class CookieJar {
//   constructor() {
//     this.cookies = new Map();
//   }

//   ingest(response) {
//     const cookies = response.headers.get('set-cookie') || '';
//     const parts = cookies.split(',').map(c => c.trim());
//     for (const raw of parts) {
//       const [pair] = raw.split(';');
//       const eq = pair.indexOf('=');
//       if (eq <= 0) continue;
//       const name = pair.slice(0, eq).trim();
//       const value = pair.slice(eq + 1).trim();
//       if (name) this.cookies.set(name, value);
//     }
//   }

//   header() {
//     return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
//   }
// }

// class SteadfastAdapter extends CourierAdapter {
//   constructor(creds, storeConfig) {
//     super('steadfast', creds, storeConfig);
//   }

//   getAuthHeaders() {
//     return {
//       'Content-Type': 'application/json',
//       'Api-Key': this.creds.apiKey,
//       'Secret-Key': this.creds.secretKey,
//     };
//   }

//   // ========== HELPER: SAFE JSON PARSE ==========
//   async safeParseResponse(response) {
//     const clonedResponse = response.clone();
//     const text = await clonedResponse.text();
    
//     console.log('📥 Response text:', text.substring(0, 500));
    
//     if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
//       throw new Error('Steadfast API returned HTML instead of JSON. Please check your credentials.');
//     }
    
//     if (!text.trim().startsWith('{') && !text.trim().startsWith('[')) {
//       throw new Error(`Steadfast API Error: ${text.trim()}`);
//     }
    
//     try {
//       return JSON.parse(text);
//     } catch (parseError) {
//       throw new Error(`Steadfast API returned invalid JSON: ${text.substring(0, 100)}`);
//     }
//   }

//   async getResponseText(response) {
//     const clonedResponse = response.clone();
//     return await clonedResponse.text();
//   }

//   async testConnection() {
//     console.log('🧪 Testing Steadfast connection...');
//     console.log('🔑 API Key:', this.creds?.apiKey ? `${this.creds.apiKey.slice(0, 6)}...` : '❌ MISSING');
//     console.log('🔑 Secret Key:', this.creds?.secretKey ? `${this.creds.secretKey.slice(0, 4)}...` : '❌ MISSING');
    
//     try {
//       const response = await fetch(`${STEADFAST_API_BASE}/get_balance`, {
//         method: 'GET',
//         headers: this.getAuthHeaders(),
//       });

//       console.log('📊 Response Status:', response.status);

//       const responseText = await this.getResponseText(response);
//       console.log('📥 Response text:', responseText.substring(0, 500));

//       if (responseText.includes('Account is not active')) {
//         return {
//           success: false,
//           message: 'Steadfast account is not active. Please contact Steadfast support to activate your account.',
//           details: responseText.trim()
//         };
//       }
      
//       if (responseText.includes('Invalid API Key') || responseText.includes('Invalid Secret')) {
//         return {
//           success: false,
//           message: 'Invalid API Key or Secret Key. Please check your credentials in the courier settings.',
//           details: responseText.trim()
//         };
//       }

//       let data = null;
//       try {
//         data = JSON.parse(responseText);
//       } catch (e) {
//         // Not JSON
//       }

//       if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
//         return {
//           success: false,
//           message: 'Steadfast API returned HTML instead of JSON. Please check your credentials.',
//           details: 'The API endpoint may have changed or you may need to contact Steadfast support.'
//         };
//       }

//       if (!data) {
//         return {
//           success: false,
//           message: `Steadfast API Error: ${responseText.trim() || 'Unknown error'}`,
//           details: responseText.trim()
//         };
//       }

//       if (response.ok) {
//         const balance = data?.current_balance ?? data?.balance ?? 'N/A';
//         return { 
//           success: true, 
//           message: `Steadfast API connected successfully. Balance: ৳${balance}`,
//           details: `Account active with balance ৳${balance}`
//         };
//       }

//       if (response.status === 401) {
//         return {
//           success: false,
//           message: `Steadfast API Error: Unauthorized. Make sure you copied the API Key and Secret Key from portal.packzy.com`,
//           details: data?.message || 'Unauthorized'
//         };
//       }

//       return { 
//         success: false, 
//         message: `Steadfast API Error (${response.status}): ${data?.message || 'Unknown error'}`,
//         details: data?.message || 'Unknown error'
//       };
      
//     } catch (error) {
//       console.error('❌ Test connection error:', error);
//       return { 
//         success: false, 
//         message: error.message || 'Steadfast connection failed',
//         details: 'Network error or invalid API endpoint'
//       };
//     }
//   }

//   async createOrder(orderData) {
//     try {
//       console.log('📦 Creating Steadfast order...');

//       const steadfastOrderData = this.formatOrderData(orderData);
//       console.log('📤 Order data:', JSON.stringify(steadfastOrderData, null, 2));
//       console.log(`📡 POST ${STEADFAST_API_BASE}/create_order`);

//       const response = await fetch(`${STEADFAST_API_BASE}/create_order`, {
//         method: 'POST',
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(steadfastOrderData),
//       });

//       console.log('📊 Response Status:', response.status);

//       const responseText = await this.getResponseText(response);
//       console.log('📥 Response text:', responseText.substring(0, 500));

//       if (responseText.includes('Account is not active')) {
//         throw new Error('Steadfast account is not active. Please contact Steadfast support to activate your account.');
//       }
      
//       if (responseText.includes('Invalid API Key') || responseText.includes('Invalid Secret')) {
//         throw new Error('Invalid API Key or Secret Key. Please check your credentials in the courier settings.');
//       }
      
//       if (responseText.includes('Insufficient balance')) {
//         throw new Error('Insufficient balance in your Steadfast account. Please recharge your account.');
//       }

//       let data = null;
//       try {
//         data = JSON.parse(responseText);
//       } catch (e) {
//         // Not JSON
//       }

//       if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
//         throw new Error('Steadfast API returned HTML instead of JSON. Please check your credentials.');
//       }

//       if (!data) {
//         throw new Error(`Steadfast API Error: ${responseText.trim() || 'Unknown error'}`);
//       }

//       if (!response.ok) {
//         const errMsg = data?.message || data?.error || `HTTP ${response.status}`;
//         throw new Error(`Steadfast API Error: ${errMsg}`);
//       }

//       const orderInfo = data.data || data;
//       return {
//         success: true,
//         courierOrderId: orderInfo?.order_id || orderInfo?.id || null,
//         trackingNumber: orderInfo?.tracking_code || orderInfo?.tracking_number || null,
//         trackingUrl: orderInfo?.tracking_url || `https://portal.packzy.com/track/${orderInfo?.tracking_code}`,
//         labelUrl: orderInfo?.label_url || '',
//         invoiceUrl: orderInfo?.invoice_url || '',
//         fullResponse: data,
//         message: 'Order created successfully with Steadfast',
//       };
      
//     } catch (error) {
//       console.error('❌ Steadfast order creation error:', error);
//       return { 
//         success: false, 
//         message: error.message || 'Failed to create Steadfast order',
//         details: error.stack
//       };
//     }
//   }

//   // ============================================================
//   // ✅ ADD getCustomerLifetimeStats HERE
//   // ============================================================

//   /**
//    * Get lifetime delivery stats for a customer phone number
//    * Uses Steadfast's fraud check API
//    */
//   async getCustomerLifetimeStats(phone) {
//     try {
//       console.log(`🔍 Steadfast: Fetching lifetime stats for ${phone}`);
      
//       const cleanPhone = this.cleanPhoneNumber(phone);
      
//       // Try API Key method first
//       if (this.creds.apiKey && this.creds.secretKey) {
//         try {
//           const response = await fetch(`https://portal.packzy.com/api/v1/fraud-check/${cleanPhone}`, {
//             method: 'GET',
//             headers: this.getAuthHeaders(),
//           });

//           const data = await response.json();

//           if (!response.ok) {
//             throw new Error(data?.message || 'Steadfast fraud check failed');
//           }

//           const delivered = Number(data?.total_delivered || 0);
//           const cancelled = Number(data?.total_cancelled || 0);
//           const total = delivered + cancelled;

//           return {
//             success: true,
//             delivered,
//             cancelled,
//             total,
//             configured: true
//           };
//         } catch (apiError) {
//           console.log('⚠️ Steadfast API fraud check failed, trying fallback...');
//           // Fall through to web scraping method
//         }
//       }

//       // Web scraping fallback (email + password)
//       if (this.creds.email && this.creds.password) {
//         try {
//           const jar = new CookieJar();
          
//           // Get login page with CSRF token
//           const loginPage = await fetch('https://steadfast.com.bd/login', {
//             headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
//           });
//           const html = await loginPage.text();
          
//           const tokenMatch = html.match(/<input type="hidden" name="_token" value="(.*?)"/);
//           const csrfToken = tokenMatch?.[1];
          
//           if (!csrfToken) {
//             throw new Error('Steadfast login CSRF token not found');
//           }

//           // Login
//           const loginRes = await fetch('https://steadfast.com.bd/login', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/x-www-form-urlencoded',
//               Cookie: jar.header(),
//               'User-Agent': 'Mozilla/5.0',
//               Accept: 'text/html,application/json',
//             },
//             body: new URLSearchParams({
//               _token: csrfToken,
//               email: this.creds.email,
//               password: this.creds.password,
//             }),
//             redirect: 'manual',
//           });

//           if (loginRes.status !== 302) {
//             throw new Error('Steadfast login failed');
//           }

//           // Get fraud data
//           const fraudRes = await fetch(`https://steadfast.com.bd/user/frauds/check/${cleanPhone}`, {
//             headers: {
//               Cookie: jar.header(),
//               Accept: 'application/json',
//               'User-Agent': 'Mozilla/5.0',
//             },
//           });

//           const data = await fraudRes.json();

//           if (!fraudRes.ok) {
//             throw new Error(data?.message || 'Steadfast fraud check failed');
//           }

//           const delivered = Number(data.total_delivered || 0);
//           const cancelled = Number(data.total_cancelled || 0);
//           const total = delivered + cancelled;

//           return {
//             success: true,
//             delivered,
//             cancelled,
//             total,
//             configured: true
//           };
//         } catch (scrapeError) {
//           console.error('❌ Steadfast scraping error:', scrapeError);
//           return {
//             success: false,
//             error: scrapeError.message || 'Steadfast request failed',
//             configured: true
//           };
//         }
//       }

//       return {
//         success: false,
//         error: 'Steadfast credentials not configured properly',
//         configured: false
//       };
      
//     } catch (error) {
//       console.error('❌ Steadfast fraud check error:', error);
//       return {
//         success: false,
//         error: error.message || 'Steadfast request failed',
//         configured: true
//       };
//     }
//   }

//   // ============================================================
//   // ⬆️ END OF getCustomerLifetimeStats
//   // ============================================================

//   formatOrderData(order) {
//     const customer = order.customerInfo;
//     const cleanPhone = this.cleanPhoneNumber(customer.phone);
//     const fullAddress = [customer.address, customer.area, customer.zone, customer.city]
//       .filter(Boolean).join(', ');
//     const totalWeight = this.calculateTotalWeight(order.items);
//     const itemDescription = order.items
//       .map(item => `${item.productName} x${item.quantity}`)
//       .join(', ')
//       .slice(0, 255);

//     return {
//       invoice: order.orderNumber || `INV-${Date.now()}`,
//       recipient_name: customer.fullName || 'Customer',
//       recipient_phone: cleanPhone || '01700000000',
//       recipient_address: (fullAddress || customer.address || 'N/A').slice(0, 250),
//       cod_amount: order.paymentMethod === 'cod' ? Math.round(order.total) : 0,
//       note: (customer.note || '').slice(0, 255),
//       item_description: itemDescription || 'Order items',
//       total_lot: 1,
//       delivery_type: 0,
//     };
//   }

//   cleanPhoneNumber(phone) {
//     if (!phone) return '01700000000';
//     let cleaned = phone.replace(/\D/g, '');
//     if (cleaned.startsWith('880')) cleaned = '0' + cleaned.slice(3);
//     if (!cleaned.startsWith('0')) cleaned = '0' + cleaned;
//     if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
//     while (cleaned.length < 11) cleaned = cleaned + '0';
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
//       console.log(`📡 Fetching tracking for: ${trackingNumber}`);
      
//       const response = await fetch(`${STEADFAST_API_BASE}/status_by_trackingcode/${trackingNumber}`, {
//         method: 'GET',
//         headers: this.getAuthHeaders(),
//       });

//       console.log('📊 Response Status:', response.status);

//       const responseText = await this.getResponseText(response);
//       console.log('📥 Response text:', responseText.substring(0, 500));

//       let data = null;
//       try {
//         data = JSON.parse(responseText);
//       } catch (parseError) {
//         throw new Error(`Steadfast tracking error: ${responseText.trim()}`);
//       }

//       if (!response.ok) {
//         throw new Error(data?.message || 'Failed to get tracking info');
//       }
      
//       return {
//         success: true,
//         status: data.delivery_status || data.status || 'Unknown',
//         history: data.history || [],
//         fullResponse: data,
//       };
      
//     } catch (error) {
//       console.error('❌ Steadfast tracking error:', error);
//       return { 
//         success: false, 
//         message: error.message || 'Failed to get tracking info' 
//       };
//     }
//   }

//   async cancelOrder(courierOrderId) {
//     try {
//       console.log(`📡 Cancelling order: ${courierOrderId}`);
      
//       const response = await fetch(`${STEADFAST_API_BASE}/cancel_order/${courierOrderId}`, {
//         method: 'POST',
//         headers: this.getAuthHeaders(),
//       });

//       console.log('📊 Response Status:', response.status);

//       const responseText = await this.getResponseText(response);
//       console.log('📥 Response text:', responseText.substring(0, 500));

//       let data = null;
//       try {
//         data = JSON.parse(responseText);
//       } catch (parseError) {
//         throw new Error(`Steadfast cancel error: ${responseText.trim()}`);
//       }

//       if (!response.ok) {
//         throw new Error(data?.message || 'Failed to cancel order');
//       }
      
//       return { 
//         success: true, 
//         message: 'Order cancelled successfully with Steadfast',
//         fullResponse: data 
//       };
      
//     } catch (error) {
//       console.error('❌ Steadfast cancel error:', error);
//       return { 
//         success: false, 
//         message: error.message || 'Failed to cancel order' 
//       };
//     }
//   }
// }

// module.exports = SteadfastAdapter;



const CourierAdapter = require('./CourierAdapter');

// ============================================================
// ✅ STEADFAST CONSTANTS
// ============================================================
const STEADFAST_ORIGIN = "https://steadfast.com.bd";
const STEADFAST_API_BASE = "https://portal.packzy.com/api/v1";
const USER_AGENT = "Mozilla/5.0 (compatible; Pickob-Tracker/1.0)";

// ============================================================
// ✅ COOKIE JAR FOR PUBLIC TRACKING
// ============================================================
class CookieJar {
  constructor() {
    this.cookies = {};
  }

  ingest(setCookieHeaders) {
    if (!setCookieHeaders) return;
    const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    for (const line of headers) {
      if (!line) continue;
      const part = String(line).split(";")[0];
      const eq = part.indexOf("=");
      if (eq > 0) {
        this.cookies[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
      }
    }
  }

  header() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  getXsrfToken() {
    const raw = this.cookies["XSRF-TOKEN"];
    if (!raw) return "";
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
}

// ============================================================
// ✅ TRACKING HELPERS
// ============================================================
function mapTrackingRow(row) {
  const message = row?.text ||
    row?.message ||
    row?.description ||
    row?.note ||
    row?.status_text ||
    row?.status ||
    "Status update";

  const atRaw = row?.created_at ||
    row?.updated_at ||
    row?.time ||
    row?.timestamp ||
    row?.at ||
    null;

  return {
    status: String(row?.status || row?.type || "update"),
    message: String(message).trim(),
    at: atRaw ? new Date(atRaw) : new Date(),
    source: "courier",
  };
}

function eventsFromPayload(data) {
  const candidates = [
    data?.trackings,
    data?.tracking_history,
    data?.logs,
    data?.activities,
    data?.result?.trackings,
    data?.consignment?.trackings,
    data?.data?.trackings,
  ];

  const events = [];
  for (const arr of candidates) {
    if (!Array.isArray(arr)) continue;
    for (const row of arr) {
      const mapped = mapTrackingRow(row);
      if (mapped.message) events.push(mapped);
    }
  }

  events.sort((a, b) => new Date(a.at) - new Date(b.at));
  return events;
}

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": USER_AGENT,
      ...headers,
    },
  });
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json().catch(() => null);
}

async function fetchSteadfastTl(trackingCode) {
  const data = await fetchJson(
    `${STEADFAST_ORIGIN}/tl/${encodeURIComponent(trackingCode)}`,
  );
  if (!data) return null;

  const events = eventsFromPayload(data);
  if (!events.length) return null;

  const latest = events[events.length - 1];
  return {
    configured: true,
    courierStatus: latest.message,
    events,
    raw: data,
  };
}

async function fetchSteadfastBypass(trackingCode) {
  const jar = new CookieJar();

  const visit = await fetch(`${STEADFAST_ORIGIN}/t/${encodeURIComponent(trackingCode)}`, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "follow",
  });
  
  jar.ingest(visit.headers.getSetCookie?.() || []);

  const data = await fetchJson(
    `${STEADFAST_ORIGIN}/user/tracking/bypass/${encodeURIComponent(trackingCode)}`,
    {
      Referer: `${STEADFAST_ORIGIN}/t/${trackingCode}`,
      Cookie: jar.header(),
      "X-XSRF-TOKEN": jar.getXsrfToken(),
    },
  );

  if (!data) return null;
  if (data?.status === "otp_required") return { otpRequired: true };

  const events = eventsFromPayload(data);
  if (!events.length && Number(data?.status) === 0) return null;

  const latest = events[events.length - 1];
  const consignmentStatus = data?.result?.status ||
    data?.result?.delivery_status ||
    latest?.message ||
    null;

  return {
    configured: true,
    courierStatus: consignmentStatus ? String(consignmentStatus) : null,
    events,
    raw: data,
  };
}

async function fetchSteadfastPublicTracking(trackingCode) {
  const code = String(trackingCode || "").trim();
  if (!code) {
    return { configured: true, courierStatus: null, events: [] };
  }

  const bypass = await fetchSteadfastBypass(code);
  if (bypass?.events?.length) return bypass;

  const tl = await fetchSteadfastTl(code);
  if (tl?.events?.length) return tl;

  return {
    configured: true,
    courierStatus: bypass?.courierStatus || tl?.courierStatus || null,
    events: [],
    otpRequired: bypass?.otpRequired || false,
  };
}

// ============================================================
// ✅ MAIN STEADFAST ADAPTER CLASS
// ============================================================
class SteadfastAdapter extends CourierAdapter {
  constructor(creds, storeConfig) {
    super('steadfast', creds, storeConfig);
    
    this.storeConfig = storeConfig || {};
    this.apiBaseUrl = this.storeConfig?.steadfastBaseUrl || 
                      creds?.baseUrl || 
                      STEADFAST_API_BASE;
    
    // Remove trailing slash
    this.apiBaseUrl = this.apiBaseUrl.replace(/\/$/, '');
    
    console.log(`🔧 SteadfastAdapter initialized with API base: ${this.apiBaseUrl}`);
  }

  // ========== GET AUTH HEADERS ==========
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.creds.apiKey && this.creds.secretKey) {
      headers['Api-Key'] = String(this.creds.apiKey).trim();
      headers['Secret-Key'] = String(this.creds.secretKey).trim();
    } else if (this.creds.apiToken) {
      headers['Authorization'] = `Bearer ${String(this.creds.apiToken).trim()}`;
    }

    return headers;
  }

  // ========== GENERATE UNIQUE INVOICE - FIXED ==========
  generateInvoice(orderData) {
    // Use order ID if available and unique
    if (orderData._id) {
      const id = String(orderData._id).slice(-8);
      return `INV${id}`;
    }
    
    // Use order number if available
    if (orderData.orderNumber) {
      const clean = String(orderData.orderNumber)
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 30);
      if (clean) {
        // Add timestamp to ensure uniqueness
        const ts = Date.now().toString().slice(-6);
        return `${clean}${ts}`;
      }
    }
    
    // Generate completely unique invoice
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = 'INV';
    
    return `${prefix}${timestamp}${random}`;
  }

  // ========== BUILD ADDRESS ==========
  buildAddress(customer) {
    if (!customer) return '';
    const parts = [
      customer.address || '',
      customer.area || '',
      customer.zone || '',
      customer.city || '',
      customer.division || ''
    ].filter(Boolean);
    return parts.join(', ').slice(0, 250);
  }

  // ========== FORMAT ORDER DATA - UPDATED ==========
  formatOrderData(orderData) {
    const customer = orderData.customerInfo || {};
    const cleanPhone = this.cleanPhoneNumber(customer.phone);
    const address = this.buildAddress(customer);
    
    // ✅ Generate UNIQUE invoice
    const invoice = this.generateInvoice(orderData);
    
    // Item description
    // const itemDescription = orderData.items
    //   ?.map(item => `${item.productName || 'Product'} x${item.quantity || 1}`)
    //   .join(', ')
    //   .slice(0, 600) || 'Order items';

    const getItemQuantity = (item) => {
  if (typeof item.quantity === 'number' && item.quantity > 0) return item.quantity;

  if (Array.isArray(item.colors) && item.colors.length > 0) {
    const colorQty = item.colors.reduce((s, c) => s + (Number(c.quantity) || 0), 0);
    if (colorQty > 0) return colorQty;
  }

  if (Array.isArray(item.variantDetails) && item.variantDetails.length > 0) {
    let variantQty = 0;
    item.variantDetails.forEach(v => {
      if (Array.isArray(v.subVariants) && v.subVariants.length > 0) {
        v.subVariants.forEach(sv => { variantQty += Number(sv.quantity) || 0; });
      } else {
        variantQty += Number(v.quantity) || 0;
      }
    });
    if (variantQty > 0) return variantQty;
  }

  return 1;
};

const itemDescription = orderData.items
  ?.map(item => {
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
  .slice(0, 250) || 'Order items';
    
    // Total lot
    const totalLot = orderData.items
      ?.reduce((sum, item) => sum + (item.quantity || 1), 1) || 1;
    
    // COD amount
    const codAmount = orderData.paymentMethod === 'cod' 
      ? Math.round(orderData.total || 0) 
      : 0;

    return {
      invoice: invoice,
      recipient_name: (customer.fullName || 'Customer').slice(0, 100),
      recipient_phone: cleanPhone || '01700000000',
      recipient_address: address || 'N/A',
      cod_amount: codAmount,
      note: (customer.note || orderData.deliveryNote || '').slice(0, 250),
      item_description: itemDescription,
      total_lot: Math.max(1, totalLot),
      delivery_type: 0,
    };
  }

  // ========== TEST CONNECTION ==========
  async testConnection() {
    console.log('🧪 Testing Steadfast connection...');
    console.log('📡 Using endpoint:', this.apiBaseUrl);
    console.log('🔑 API Key:', this.creds?.apiKey ? `${this.creds.apiKey.slice(0, 6)}...` : '❌ MISSING');
    console.log('🔑 Secret Key:', this.creds?.secretKey ? `${this.creds.secretKey.slice(0, 4)}...` : '❌ MISSING');

    try {
      const authHeaders = this.getAuthHeaders();
      
      if (!authHeaders['Api-Key'] || !authHeaders['Secret-Key']) {
        return {
          success: false,
          message: 'Steadfast API Key and Secret Key are required',
          details: 'Please add both API Key and Secret Key in the courier settings.'
        };
      }

      const url = `${this.apiBaseUrl}/get_balance`;
      console.log(`📡 GET ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: authHeaders,
      });

      const text = await response.text();
      console.log('📥 Response preview:', text.substring(0, 200));

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Not JSON
      }

      if (!response.ok) {
        const errorMsg = data?.message || data?.error || `HTTP ${response.status}`;
        return {
          success: false,
          message: `Steadfast API error: ${errorMsg}`,
          details: response.status === 401 ? 'Invalid API Key or Secret Key.' : 'Please check your credentials.'
        };
      }

      const balance = data?.current_balance ?? data?.balance ?? 'N/A';
      return {
        success: true,
        message: `Steadfast API connected successfully. Balance: ৳${balance}`,
        details: `Account active with balance ৳${balance}`,
        balance: balance
      };

    } catch (error) {
      console.error('❌ Test connection error:', error);
      return {
        success: false,
        message: error.message || 'Steadfast connection failed',
        details: 'Network error - please check your internet connection.'
      };
    }
  }

  // ========== CREATE ORDER - FIXED ==========
  async createOrder(orderData) {
    try {
      console.log('📦 Creating Steadfast order...');
      
      // ✅ Format the payload with UNIQUE invoice
      const payload = this.formatOrderData(orderData);
      
      console.log('📤 Steadfast Payload:', JSON.stringify(payload, null, 2));
      console.log('📱 Phone:', payload.recipient_phone, 'Length:', payload.recipient_phone.length);
      console.log('📍 Address:', payload.recipient_address, 'Length:', payload.recipient_address.length);
      console.log('🧾 Invoice:', payload.invoice);

      const authHeaders = this.getAuthHeaders();
      
      if (!authHeaders['Api-Key'] || !authHeaders['Secret-Key']) {
        throw new Error('Steadfast API Key and Secret Key are missing');
      }

      const url = `${this.apiBaseUrl}/create_order`;
      console.log(`📡 POST ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // ✅ Get raw response
      const responseText = await response.text();
      console.log('📥 Raw Response:', responseText);

      // ✅ TRY TO PARSE AS JSON FIRST
      let data = {};
      let isJson = false;
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
        isJson = true;
        console.log('📊 Parsed JSON:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.log('⚠️ Response is not JSON, treating as plain text');
      }

      // ✅ If it's plain text "Account is not active!" - check for invoice duplication
      if (!isJson && responseText.includes('Account is not active')) {
        console.error('❌ Received "Account is not active" - Checking for issues...');
        
        // Check if invoice might be duplicate
        const issues = [];
        
        // Check phone
        if (payload.recipient_phone.length !== 11) {
          issues.push(`Phone must be 11 digits (got ${payload.recipient_phone.length})`);
        }
        if (!payload.recipient_phone.startsWith('0')) {
          issues.push('Phone must start with 0');
        }
        
        // Check address
        if (payload.recipient_address.length < 10) {
          issues.push(`Address must be at least 10 characters (got ${payload.recipient_address.length})`);
        }
        
        // Check name
        if (payload.recipient_name.length < 2) {
          issues.push('Name must be at least 2 characters');
        }
        
        // ⭐ Invoice might be duplicate - this is likely the issue!
        issues.push(`Invoice "${payload.invoice}" might already exist or be invalid. Make sure each invoice is unique.`);
        
        if (issues.length > 0) {
          return {
            success: false,
            message: `Steadfast validation failed: ${issues.join('; ')}`,
            details: 'Please check the following fields: ' + issues.join(', '),
            errorType: 'validation_error',
            payload: payload,
            issues: issues
          };
        }

        return {
          success: false,
          message: 'Steadfast order creation failed. The API returned "Account is not active".',
          details: 'This could mean: 1) Duplicate invoice number, 2) Invalid phone format, or 3) Invalid address format. Please check the logs.',
          errorType: 'account_inactive'
        };
      }

      // ✅ If it's JSON, process normally
      if (isJson) {
        const statusCode = data?.status;
        console.log('📊 Status Code:', statusCode);

        // ✅ SUCCESS
        if (response.ok && (statusCode === 200 || statusCode === 201 || statusCode === undefined)) {
          const consignment = data?.consignment || data?.data?.consignment || data?.data || {};
          const trackingCode = consignment.tracking_code || consignment.trackingCode || data?.tracking_code;
          
          console.log('✅ Tracking Code:', trackingCode);
          
          if (!trackingCode) {
            return {
              success: true,
              courierOrderId: data?.order_id || data?.id || 'unknown',
              trackingNumber: null,
              trackingUrl: null,
              fullResponse: data,
              message: 'Order created but no tracking code returned.'
            };
          }

          return {
            success: true,
            courierOrderId: String(trackingCode),
            trackingNumber: String(trackingCode),
            trackingUrl: `https://steadfast.com.bd/t/${trackingCode}`,
            labelUrl: consignment?.label_url || '',
            invoiceUrl: consignment?.invoice_url || '',
            fullResponse: data,
            message: 'Order created successfully with Steadfast',
          };
        }

        // ❌ JSON ERROR
        const errorMessage = data?.message || data?.error || 'Unknown error';
        return {
          success: false,
          message: `Steadfast API error: ${errorMessage}`,
          details: `HTTP ${response.status}`,
          fullResponse: data
        };
      }

      // ✅ If we got here, it's an unknown response
      return {
        success: false,
        message: `Steadfast returned unexpected response: ${responseText.substring(0, 200)}`,
        details: 'The API returned a non-JSON, non-standard response.',
        errorType: 'unknown_response'
      };

    } catch (error) {
      console.error('❌ Steadfast order creation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create Steadfast order',
        details: error.stack
      };
    }
  }

  // ========== CLEAN PHONE NUMBER ==========
  cleanPhoneNumber(phone) {
    if (!phone) return '01700000000';
    
    // Remove all non-digit characters
    let cleaned = String(phone).replace(/\D/g, '');
    
    // Handle 880 prefix
    if (cleaned.startsWith('880')) {
      cleaned = cleaned.slice(3);
    }
    
    // Ensure it starts with 0
    if (!cleaned.startsWith('0')) {
      cleaned = '0' + cleaned;
    }
    
    // Ensure exactly 11 digits
    if (cleaned.length > 11) {
      cleaned = cleaned.slice(0, 11);
    }
    
    // Pad if too short
    while (cleaned.length < 11) {
      cleaned = cleaned + '0';
    }
    
    return cleaned;
  }

  // ========== CALCULATE TOTAL WEIGHT ==========
  calculateTotalWeight(items) {
    if (!items || items.length === 0) return 0.5;
    return items.reduce((sum, item) => {
      const weight = item.weight || item.itemWeight || 0.5;
      return sum + (weight * (item.quantity || 1));
    }, 0);
  }

  // ========== GET TRACKING ==========
  async getTracking(trackingNumber) {
    try {
      console.log(`📡 Fetching tracking for: ${trackingNumber}`);
      
      const trackingResult = await fetchSteadfastPublicTracking(trackingNumber);
      
      if (trackingResult.events && trackingResult.events.length > 0) {
        const latest = trackingResult.events[trackingResult.events.length - 1];
        return {
          success: true,
          status: latest.message || trackingResult.courierStatus || 'In transit',
          history: trackingResult.events,
          fullResponse: trackingResult.raw,
        };
      }

      const authHeaders = this.getAuthHeaders();
      const response = await fetch(`${this.apiBaseUrl}/status_by_trackingcode/${trackingNumber}`, {
        method: 'GET',
        headers: authHeaders,
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Not JSON
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to get tracking info');
      }

      const events = eventsFromPayload(data);
      
      return {
        success: true,
        status: data.delivery_status || data.status || 'Unknown',
        history: events.length > 0 ? events : data.history || [],
        fullResponse: data,
      };

    } catch (error) {
      console.error('❌ Steadfast tracking error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get tracking info'
      };
    }
  }

  // ========== CANCEL ORDER ==========
  async cancelOrder(courierOrderId) {
    try {
      console.log(`📡 Cancelling order: ${courierOrderId}`);

      const authHeaders = this.getAuthHeaders();
      const response = await fetch(`${this.apiBaseUrl}/cancel_order/${courierOrderId}`, {
        method: 'POST',
        headers: authHeaders,
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Not JSON
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to cancel order');
      }

      return {
        success: true,
        message: 'Order cancelled successfully with Steadfast',
        fullResponse: data
      };

    } catch (error) {
      console.error('❌ Steadfast cancel error:', error);
      return {
        success: false,
        message: error.message || 'Failed to cancel order'
      };
    }
  }

  // ========== GET CUSTOMER LIFETIME STATS ==========
  // async getCustomerLifetimeStats(phone) {
  //   try {
  //     console.log(`🔍 Steadfast: Fetching lifetime stats for ${phone}`);

  //     const cleanPhone = this.cleanPhoneNumber(phone);
  //     const authHeaders = this.getAuthHeaders();

  //     if (!authHeaders['Api-Key'] || !authHeaders['Secret-Key']) {
  //       return {
  //         success: false,
  //         error: 'Steadfast API credentials not configured',
  //         configured: false
  //       };
  //     }

  //     const response = await fetch(`${this.apiBaseUrl}/fraud_check/${cleanPhone}`, {
  //       method: 'GET',
  //       headers: authHeaders,
  //     });

  //     const text = await response.text();
  //     let data = {};
  //     try {
  //       data = text ? JSON.parse(text) : {};
  //     } catch {
  //       // Not JSON
  //     }

  //     if (!response.ok) {
  //       throw new Error(data?.message || 'Steadfast fraud check failed');
  //     }

  //     const delivered = Number(data.total_delivered ?? data.success ?? 0);
  //     const cancelled = Number(data.total_cancelled ?? data.cancel ?? 0);
  //     const total = Number(data.total_parcels ?? data.total ?? delivered + cancelled);

  //     return {
  //       success: true,
  //       delivered,
  //       cancelled,
  //       total,
  //       configured: true,
  //       raw: data
  //     };

  //   } catch (error) {
  //     console.error('❌ Steadfast fraud check error:', error);
  //     return {
  //       success: false,
  //       error: error.message || 'Steadfast request failed',
  //       configured: true
  //     };
  //   }
  // }

  // In SteadfastAdapter.js - Add this method

// ========== GET CUSTOMER LIFETIME STATS ==========
async getCustomerLifetimeStats(phone) {
  try {
    console.log(`🔍 Steadfast: Fetching lifetime stats for ${phone}`);

    const cleanPhone = this.cleanPhoneNumber(phone);
    const authHeaders = this.getAuthHeaders();

    if (!authHeaders['Api-Key'] || !authHeaders['Secret-Key']) {
      return {
        success: false,
        error: 'Steadfast API credentials not configured',
        configured: false
      };
    }

    // Steadfast fraud check API
    const response = await fetch(`${this.apiBaseUrl}/fraud_check/${cleanPhone}`, {
      method: 'GET',
      headers: authHeaders,
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      // Not JSON
    }

    if (!response.ok) {
      throw new Error(data?.message || 'Steadfast fraud check failed');
    }

    // Parse response
    const delivered = Number(data.total_delivered ?? data.success ?? 0);
    const cancelled = Number(data.total_cancelled ?? data.cancel ?? 0);
    const total = Number(data.total_parcels ?? data.total ?? delivered + cancelled);

    return {
      success: true,
      delivered,
      cancelled,
      total,
      configured: true,
      raw: data
    };

  } catch (error) {
    console.error('❌ Steadfast fraud check error:', error);
    return {
      success: false,
      error: error.message || 'Steadfast request failed',
      configured: true
    };
  }
}
}

module.exports = SteadfastAdapter;