// // D:\power-bank\power-bank-backend\src\utils\courierLifetimeService.js
// const axios = require('axios');

// // ============================================================
// // CONFIGURATION
// // ============================================================

// const BD_MOBILE_RE = /^01[3-9][0-9]{8}$/;
// const LIFETIME_CACHE_TTL_MS = Number(process.env.LIFETIME_STATS_CACHE_TTL_MS || 10 * 60 * 1000);
// const lifetimeCache = new Map();

// // ============================================================
// // HELPER FUNCTIONS
// // ============================================================

// function normalizeBdMobile(phone) {
//   let digits = String(phone || '').replace(/\D/g, '');
//   if (digits.startsWith('880')) digits = digits.slice(3);
//   if (digits.startsWith('88') && digits.length === 13) digits = digits.slice(2);
//   if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;
//   return digits;
// }

// function isValidBdMobile(phone) {
//   return BD_MOBILE_RE.test(normalizeBdMobile(phone));
// }

// function buildCourierResult({ delivered, cancelled, total, configured, error, ratingBased = false, rating = null, addressCount = 0 }) {
//   const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
//   return {
//     delivered: delivered || 0,
//     cancelled: cancelled || 0,
//     total: total || 0,
//     successRate,
//     configured: configured || false,
//     available: !error,
//     ...(error ? { error } : {}),
//     ...(ratingBased ? { ratingBased, rating, addressCount } : {})
//   };
// }

// function emptyCourierResult() {
//   return {
//     delivered: 0,
//     cancelled: 0,
//     total: 0,
//     successRate: 0,
//     configured: false,
//     available: false,
//   };
// }

// // ============================================================
// // PATHAO IMPLEMENTATION
// // ============================================================

// let pathaoMerchantToken = null;
// let pathaoMerchantTokenKey = '';
// let pathaoMerchantTokenAt = 0;

// async function getPathaoMerchantToken(creds) {
//   const cacheKey = `${creds.username}`;
//   if (
//     pathaoMerchantToken &&
//     pathaoMerchantTokenKey === cacheKey &&
//     Date.now() - pathaoMerchantTokenAt < 50 * 60 * 1000
//   ) {
//     return pathaoMerchantToken;
//   }

//   try {
//     const response = await axios.post(
//       'https://merchant.pathao.com/api/v1/login',
//       {
//         username: creds.username,
//         password: creds.password,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//         },
//         timeout: 30000,
//       }
//     );

//     const data = response.data;
//     if (!response.status === 200 || !data.access_token) {
//       throw new Error(data?.message || 'Pathao merchant login failed');
//     }

//     pathaoMerchantToken = String(data.access_token).trim();
//     pathaoMerchantTokenKey = cacheKey;
//     pathaoMerchantTokenAt = Date.now();
//     return pathaoMerchantToken;
//   } catch (error) {
//     console.error('Pathao login error:', error.response?.data || error.message);
//     throw new Error(error.response?.data?.message || 'Pathao authentication failed');
//   }
// }

// async function fetchPathaoLifetimeStats(phone, creds) {
//   if (!creds || !creds.username || !creds.password) {
//     return emptyCourierResult();
//   }

//   try {
//     const token = await getPathaoMerchantToken(creds);
    
//     const response = await axios.post(
//       'https://merchant.pathao.com/api/v1/user/success',
//       { phone },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Accept: 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         timeout: 30000,
//       }
//     );

//     const data = response.data;
//     const payload = data?.data || {};

//     // Check if it's the v2 API with customer_rating
//     if (payload.version === 'v2' || payload.customer_rating) {
//       const rating = String(payload.customer_rating || 'unknown');
//       const addressCount = Array.isArray(payload.address_book) ? payload.address_book.length : 0;
//       const ratingSuccessMap = {
//         new_customer: null,
//         good_customer: 85,
//         regular_customer: 65,
//         bad_customer: 20,
//         blocked: 0,
//       };
//       const successRate = ratingSuccessMap[rating] ?? 0;
      
//       return {
//         delivered: 0,
//         cancelled: 0,
//         total: 0,
//         successRate: successRate || 0,
//         configured: true,
//         available: true,
//         rating,
//         addressCount,
//         ratingBased: true,
//       };
//     }

//     // Legacy v1 response with numeric counts
//     const customer = payload.customer || payload;
//     const delivered = Number(
//       customer?.successful_delivery ||
//       customer?.success_delivery ||
//       customer?.delivered ||
//       customer?.total_delivered ||
//       0
//     );
//     const total = Number(
//       customer?.total_delivery ||
//       customer?.total ||
//       customer?.total_parcels ||
//       0
//     );
//     const cancelled = Math.max(0, total - delivered);

//     return buildCourierResult({
//       delivered,
//       cancelled,
//       total,
//       configured: true,
//     });
//   } catch (error) {
//     console.error('Pathao fetch error:', error.message);
//     return buildCourierResult({
//       delivered: 0,
//       cancelled: 0,
//       total: 0,
//       configured: true,
//       error: error.message || 'Pathao request failed',
//     });
//   }
// }

// // ============================================================
// // STEADFAST IMPLEMENTATION
// // ============================================================

// class CookieJar {
//   constructor() {
//     this.cookies = new Map();
//   }

//   ingest(response) {
//     const cookies = response.headers['set-cookie'] || [];
//     for (const raw of cookies) {
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

// async function fetchSteadfastLifetimeStats(phone, creds) {
//   if (!creds) {
//     return emptyCourierResult();
//   }

//   // If using API key
//   if (creds.apiKey && creds.secretKey) {
//     try {
//       const response = await axios.get(
//         `https://api.steadfast.com.bd/v1.0.0-beta/fraud-check/${phone}`,
//         {
//           headers: {
//             'API-KEY': creds.apiKey,
//             'SECRET-KEY': creds.secretKey,
//             Accept: 'application/json',
//           },
//           timeout: 30000,
//         }
//       );

//       const data = response.data;
//       const delivered = Number(data?.data?.total_delivered || data?.total_delivered || 0);
//       const cancelled = Number(data?.data?.total_cancelled || data?.total_cancelled || 0);
//       const total = delivered + cancelled;

//       return buildCourierResult({
//         delivered,
//         cancelled,
//         total,
//         configured: true,
//       });
//     } catch (error) {
//       console.error('Steadfast API error:', error.message);
//       return buildCourierResult({
//         delivered: 0,
//         cancelled: 0,
//         total: 0,
//         configured: true,
//         error: error.message || 'Steadfast API request failed',
//       });
//     }
//   }

//   // Web scraping fallback (email + password)
//   if (creds.email && creds.password) {
//     try {
//       const jar = new CookieJar();
      
//       // Get login page with CSRF token
//       const loginPage = await axios.get('https://steadfast.com.bd/login', {
//         headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
//         timeout: 30000,
//       });
      
//       const html = loginPage.data;
//       const tokenMatch = html.match(/<input type="hidden" name="_token" value="(.*?)"/);
//       const csrfToken = tokenMatch?.[1];
      
//       if (!csrfToken) {
//         return buildCourierResult({
//           delivered: 0,
//           cancelled: 0,
//           total: 0,
//           configured: true,
//           error: 'Steadfast login CSRF token not found',
//         });
//       }

//       // Login
//       const loginRes = await axios.post(
//         'https://steadfast.com.bd/login',
//         new URLSearchParams({
//           _token: csrfToken,
//           email: creds.email,
//           password: creds.password,
//         }),
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             Cookie: jar.header(),
//             'User-Agent': 'Mozilla/5.0',
//             Accept: 'text/html,application/json',
//           },
//           maxRedirects: 0,
//           validateStatus: (status) => status === 302,
//           timeout: 30000,
//         }
//       );

//       // Check if login succeeded
//       if (loginRes.status !== 302) {
//         return buildCourierResult({
//           delivered: 0,
//           cancelled: 0,
//           total: 0,
//           configured: true,
//           error: 'Steadfast login failed - check credentials',
//         });
//       }

//       // Get fraud data
//       const fraudRes = await axios.get(
//         `https://steadfast.com.bd/user/frauds/check/${phone}`,
//         {
//           headers: {
//             Cookie: jar.header(),
//             Accept: 'application/json',
//             'User-Agent': 'Mozilla/5.0',
//           },
//           timeout: 30000,
//         }
//       );

//       const data = fraudRes.data;
//       const delivered = Number(data?.total_delivered || 0);
//       const cancelled = Number(data?.total_cancelled || 0);
//       const total = delivered + cancelled;

//       return buildCourierResult({
//         delivered,
//         cancelled,
//         total,
//         configured: true,
//       });
//     } catch (error) {
//       console.error('Steadfast scraping error:', error.message);
//       return buildCourierResult({
//         delivered: 0,
//         cancelled: 0,
//         total: 0,
//         configured: true,
//         error: error.message || 'Steadfast scraping failed',
//       });
//     }
//   }

//   return emptyCourierResult();
// }

// // ============================================================
// // REDX IMPLEMENTATION
// // ============================================================

// async function getRedxToken(creds) {
//   // If API token is provided directly
//   if (creds.apiToken) return creds.apiToken;

//   // Login with phone + password
//   const phone = String(creds.phone || '').replace(/\D/g, '');
//   const normalized = phone.startsWith('880') ? phone : phone.startsWith('0') ? `88${phone}` : `880${phone}`;

//   try {
//     const response = await axios.post(
//       'https://api.redx.com.bd/v4/auth/login',
//       {
//         phone: normalized,
//         password: creds.password,
//       },
//       {
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//           'User-Agent': 'Mozilla/5.0',
//         },
//         timeout: 30000,
//       }
//     );

//     const data = response.data;
//     const token = data?.data?.accessToken;
//     if (!response.status === 200 || !token) {
//       throw new Error(data?.message || 'RedX login failed');
//     }
//     return token;
//   } catch (error) {
//     console.error('RedX login error:', error.response?.data || error.message);
//     throw new Error(error.response?.data?.message || 'RedX authentication failed');
//   }
// }

// async function fetchRedxLifetimeStats(phone, creds) {
//   if (!creds) {
//     return emptyCourierResult();
//   }

//   try {
//     const token = await getRedxToken(creds);
    
//     const response = await axios.get(
//       `https://redx.com.bd/api/redx_se/admin/parcel/customer-success-return-rate?phoneNumber=88${phone}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: 'application/json',
//           'User-Agent': 'Mozilla/5.0',
//         },
//         timeout: 30000,
//       }
//     );

//     const data = response.data;
    
//     if (response.status === 401 || response.status === 403) {
//       return buildCourierResult({
//         delivered: 0,
//         cancelled: 0,
//         total: 0,
//         configured: true,
//         error: 'RedX - merchant account access required',
//       });
//     }

//     if (!response.status === 200) {
//       return buildCourierResult({
//         delivered: 0,
//         cancelled: 0,
//         total: 0,
//         configured: true,
//         error: data?.message || `RedX lookup failed (HTTP ${response.status})`,
//       });
//     }

//     const delivered = Number(data?.data?.deliveredParcels || 0);
//     const total = Number(data?.data?.totalParcels || 0);
//     const cancelled = Math.max(0, total - delivered);

//     return buildCourierResult({
//       delivered,
//       cancelled,
//       total,
//       configured: true,
//     });
//   } catch (error) {
//     console.error('RedX fetch error:', error.message);
//     return buildCourierResult({
//       delivered: 0,
//       cancelled: 0,
//       total: 0,
//       configured: true,
//       error: error.message || 'RedX request failed',
//     });
//   }
// }

// // ============================================================
// // AGGREGATION & MAIN EXPORT
// // ============================================================

// function aggregateLifetimeStats(couriers = {}) {
//   let totalDelivered = 0;
//   let totalCancelled = 0;
//   let totalParcels = 0;
//   let configuredCount = 0;
//   let availableCount = 0;

//   for (const row of Object.values(couriers)) {
//     if (row.configured) configuredCount += 1;
//     if (row.available) availableCount += 1;
//     totalDelivered += row.delivered || 0;
//     totalCancelled += row.cancelled || 0;
//     totalParcels += row.total || 0;
//   }

//   const completed = totalDelivered + totalCancelled;
//   const deliverySuccessRate =
//     completed > 0
//       ? Math.round((totalDelivered / completed) * 100)
//       : totalParcels > 0
//         ? Math.round((totalDelivered / totalParcels) * 100)
//         : 0;

//   const cancellationRate =
//     totalParcels > 0 ? Math.round((totalCancelled / totalParcels) * 100) : 0;

//   let riskScore = 0;
//   let riskLevel = 'low';
//   let riskLabel = 'No courier data yet';
//   const riskFactors = [];

//   if (totalParcels > 0) {
//     riskScore += cancellationRate * 0.45;
//     riskScore += Math.max(0, 100 - deliverySuccessRate) * 0.35;
//     if (totalParcels >= 5 && deliverySuccessRate < 40) riskScore += 15;
//     if (totalCancelled >= 3 && totalDelivered === 0) riskScore += 20;
//     riskScore = Math.min(100, Math.round(riskScore));

//     riskLabel = 'Trusted — good delivery history';
//     if (riskScore >= 65) {
//       riskLevel = 'high';
//       riskLabel = 'High risk — frequent cancellations';
//     } else if (riskScore >= 35) {
//       riskLevel = 'medium';
//       riskLabel = 'Moderate risk — review before COD';
//     }

//     if (cancellationRate >= 30) {
//       riskFactors.push(`High cancellation rate across couriers (${cancellationRate}%)`);
//     }
//     if (deliverySuccessRate < 50 && completed >= 3) {
//       riskFactors.push(`Low lifetime delivery success (${deliverySuccessRate}%)`);
//     }
//     if (totalCancelled >= 5 && totalDelivered < totalCancelled) {
//       riskFactors.push('More cancelled than delivered parcels');
//     }
//     if (!riskFactors.length) {
//       riskFactors.push('No major risk signals from courier panels');
//     }
//   } else if (configuredCount > 0) {
//     riskFactors.push('No parcel history found on configured courier panels');
//   } else {
//     riskFactors.push('No courier panels configured — add merchant credentials');
//   }

//   return {
//     totalDelivered,
//     totalCancelled,
//     totalParcels,
//     deliverySuccessRate,
//     cancellationRate,
//     risk: {
//       score: riskScore,
//       level: riskLevel,
//       label: riskLabel,
//       factors: riskFactors,
//     },
//     configuredCount,
//     availableCount,
//   };
// }

// // ============================================================
// // MAIN EXPORT FUNCTION
// // ============================================================

// class CourierLifetimeService {
//   constructor() {
//     this.pathaoCreds = null;
//     this.steadfastCreds = null;
//     this.redxCreds = null;
//   }

//   setCredentials(pathao, steadfast, redx) {
//     this.pathaoCreds = pathao;
//     this.steadfastCreds = steadfast;
//     this.redxCreds = redx;
//   }

//   async fetchLifetimeStats(rawPhone, { skipCache = false } = {}) {
//     const phone = normalizeBdMobile(rawPhone);
    
//     if (!isValidBdMobile(phone)) {
//       return {
//         phone,
//         valid: false,
//         error: 'Invalid Bangladesh mobile. Use format 01XXXXXXXXX.',
//         couriers: {},
//         summary: aggregateLifetimeStats({}),
//         fetchedAt: new Date().toISOString(),
//       };
//     }

//     const cacheKey = phone;
//     if (!skipCache) {
//       const cached = lifetimeCache.get(cacheKey);
//       if (cached && Date.now() - cached.at < LIFETIME_CACHE_TTL_MS) {
//         return { ...cached.data, cached: true };
//       }
//     }

//     // Fetch from all couriers in parallel
//     const [pathao, steadfast, redx] = await Promise.all([
//       fetchPathaoLifetimeStats(phone, this.pathaoCreds),
//       fetchSteadfastLifetimeStats(phone, this.steadfastCreds),
//       fetchRedxLifetimeStats(phone, this.redxCreds),
//     ]);

//     const couriers = { pathao, steadfast, redx };
//     const configured = {
//       pathao: !!this.pathaoCreds,
//       steadfast: !!this.steadfastCreds,
//       redx: !!this.redxCreds,
//     };
//     const anyConfigured = Object.values(configured).some(Boolean);

//     const result = {
//       phone,
//       valid: true,
//       source: 'courier_panels',
//       description: 'Lifetime parcel history for this mobile on Pathao, Steadfast, and RedX networks',
//       configured,
//       anyConfigured,
//       couriers,
//       summary: aggregateLifetimeStats(couriers),
//       fetchedAt: new Date().toISOString(),
//       cached: false,
//     };

//     lifetimeCache.set(cacheKey, { at: Date.now(), data: result });
//     return result;
//   }
// }

// module.exports = new CourierLifetimeService();


// D:\power-bank\power-bank-backend\src\utils\courierLifetimeService.js
const axios = require('axios');

// ============================================================
// CONFIGURATION
// ============================================================

const BD_MOBILE_RE = /^01[3-9][0-9]{8}$/;
const LIFETIME_CACHE_TTL_MS = Number(process.env.LIFETIME_STATS_CACHE_TTL_MS || 10 * 60 * 1000);
const lifetimeCache = new Map();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalizeBdMobile(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('880')) digits = digits.slice(3);
  if (digits.startsWith('88') && digits.length === 13) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;
  return digits;
}

function isValidBdMobile(phone) {
  return BD_MOBILE_RE.test(normalizeBdMobile(phone));
}

function buildCourierResult({ delivered, cancelled, total, configured, error, ratingBased = false, rating = null, addressCount = 0 }) {
  const successRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
  return {
    delivered: delivered || 0,
    cancelled: cancelled || 0,
    total: total || 0,
    successRate,
    configured: configured || false,
    available: !error,
    ...(error ? { error } : {}),
    ...(ratingBased ? { ratingBased, rating, addressCount } : {})
  };
}

function emptyCourierResult() {
  return {
    delivered: 0,
    cancelled: 0,
    total: 0,
    successRate: 0,
    configured: false,
    available: false,
  };
}

// ============================================================
// PATHAO IMPLEMENTATION
// ============================================================

let pathaoMerchantToken = null;
let pathaoMerchantTokenKey = '';
let pathaoMerchantTokenAt = 0;

async function getPathaoMerchantToken(creds) {
  const cacheKey = `${creds.username}`;
  if (
    pathaoMerchantToken &&
    pathaoMerchantTokenKey === cacheKey &&
    Date.now() - pathaoMerchantTokenAt < 50 * 60 * 1000
  ) {
    return pathaoMerchantToken;
  }

  try {
    const response = await axios.post(
      'https://merchant.pathao.com/api/v1/login',
      {
        username: creds.username,
        password: creds.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    if (!response.status === 200 || !data.access_token) {
      throw new Error(data?.message || 'Pathao merchant login failed');
    }

    pathaoMerchantToken = String(data.access_token).trim();
    pathaoMerchantTokenKey = cacheKey;
    pathaoMerchantTokenAt = Date.now();
    return pathaoMerchantToken;
  } catch (error) {
    console.error('Pathao login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Pathao authentication failed');
  }
}

async function fetchPathaoLifetimeStats(phone, creds) {
  if (!creds || !creds.username || !creds.password) {
    return emptyCourierResult();
  }

  try {
    const token = await getPathaoMerchantToken(creds);

    const response = await axios.post(
      'https://merchant.pathao.com/api/v1/user/success',
      { phone },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    const payload = data?.data || {};

    // Check if it's the v2 API with customer_rating
    if (payload.version === 'v2' || payload.customer_rating) {
      const rating = String(payload.customer_rating || 'unknown');
      const addressCount = Array.isArray(payload.address_book) ? payload.address_book.length : 0;
      const ratingSuccessMap = {
        new_customer: null,
        good_customer: 85,
        regular_customer: 65,
        bad_customer: 20,
        blocked: 0,
      };
      const successRate = ratingSuccessMap[rating] ?? 0;

      return {
        delivered: 0,
        cancelled: 0,
        total: 0,
        successRate: successRate || 0,
        configured: true,
        available: true,
        rating,
        addressCount,
        ratingBased: true,
      };
    }

    // Legacy v1 response with numeric counts
    const customer = payload.customer || payload;
    const delivered = Number(
      customer?.successful_delivery ||
      customer?.success_delivery ||
      customer?.delivered ||
      customer?.total_delivered ||
      0
    );
    const total = Number(
      customer?.total_delivery ||
      customer?.total ||
      customer?.total_parcels ||
      0
    );
    const cancelled = Math.max(0, total - delivered);

    return buildCourierResult({
      delivered,
      cancelled,
      total,
      configured: true,
    });
  } catch (error) {
    console.error('Pathao fetch error:', error.message);
    return buildCourierResult({
      delivered: 0,
      cancelled: 0,
      total: 0,
      configured: true,
      error: error.message || 'Pathao request failed',
    });
  }
}

// ============================================================
// STEADFAST IMPLEMENTATION
// ============================================================

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  ingest(response) {
    const cookies = response.headers['set-cookie'] || [];
    for (const raw of cookies) {
      const [pair] = raw.split(';');
      const eq = pair.indexOf('=');
      if (eq <= 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (name) this.cookies.set(name, value);
    }
  }

  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

async function fetchSteadfastLifetimeStats(phone, creds) {
  if (!creds) {
    return emptyCourierResult();
  }

  // If using API key
  if (creds.apiKey && creds.secretKey) {
    try {
      const response = await axios.get(
        `https://api.steadfast.com.bd/v1.0.0-beta/fraud-check/${phone}`,
        {
          headers: {
            'API-KEY': creds.apiKey,
            'SECRET-KEY': creds.secretKey,
            Accept: 'application/json',
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      const delivered = Number(data?.data?.total_delivered || data?.total_delivered || 0);
      const cancelled = Number(data?.data?.total_cancelled || data?.total_cancelled || 0);
      const total = delivered + cancelled;

      return buildCourierResult({
        delivered,
        cancelled,
        total,
        configured: true,
      });
    } catch (error) {
      console.error('Steadfast API error:', error.message);
      return buildCourierResult({
        delivered: 0,
        cancelled: 0,
        total: 0,
        configured: true,
        error: error.message || 'Steadfast API request failed',
      });
    }
  }

  // Web scraping fallback (email + password)
  if (creds.email && creds.password) {
    try {
      const jar = new CookieJar();

      // Get login page with CSRF token
      const loginPage = await axios.get('https://steadfast.com.bd/login', {
        headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' },
        timeout: 30000,
      });

      const html = loginPage.data;
      const tokenMatch = html.match(/<input type="hidden" name="_token" value="(.*?)"/);
      const csrfToken = tokenMatch?.[1];

      if (!csrfToken) {
        return buildCourierResult({
          delivered: 0,
          cancelled: 0,
          total: 0,
          configured: true,
          error: 'Steadfast login CSRF token not found',
        });
      }

      // Login
      const loginRes = await axios.post(
        'https://steadfast.com.bd/login',
        new URLSearchParams({
          _token: csrfToken,
          email: creds.email,
          password: creds.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: jar.header(),
            'User-Agent': 'Mozilla/5.0',
            Accept: 'text/html,application/json',
          },
          maxRedirects: 0,
          validateStatus: (status) => status === 302,
          timeout: 30000,
        }
      );

      // Check if login succeeded
      if (loginRes.status !== 302) {
        return buildCourierResult({
          delivered: 0,
          cancelled: 0,
          total: 0,
          configured: true,
          error: 'Steadfast login failed - check credentials',
        });
      }

      // Get fraud data
      const fraudRes = await axios.get(
        `https://steadfast.com.bd/user/frauds/check/${phone}`,
        {
          headers: {
            Cookie: jar.header(),
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          timeout: 30000,
        }
      );

      const data = fraudRes.data;
      const delivered = Number(data?.total_delivered || 0);
      const cancelled = Number(data?.total_cancelled || 0);
      const total = delivered + cancelled;

      return buildCourierResult({
        delivered,
        cancelled,
        total,
        configured: true,
      });
    } catch (error) {
      console.error('Steadfast scraping error:', error.message);
      return buildCourierResult({
        delivered: 0,
        cancelled: 0,
        total: 0,
        configured: true,
        error: error.message || 'Steadfast scraping failed',
      });
    }
  }

  return emptyCourierResult();
}

// ============================================================
// REDX IMPLEMENTATION
// ============================================================

let redxToken = null;
let redxTokenAt = 0;
const REDX_TOKEN_TTL_MS = 55 * 60 * 1000; // refresh before it expires (~1hr)

async function loginRedx(creds) {
  const phone = String(creds.phone || '').replace(/\D/g, '');
  const normalized = phone.startsWith('880') ? phone : `880${phone.replace(/^0/, '')}`;

  const response = await axios.post(
    'https://api.redx.com.bd/v4/auth/login',
    { phone: normalized, password: creds.password },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      timeout: 30000,
    }
  );

  const token = response.data?.data?.accessToken;
  if (!token) throw new Error(response.data?.message || 'RedX login failed');
  return token;
}

async function getRedxToken(creds, forceRefresh = false) {
  if (!forceRefresh && redxToken && Date.now() - redxTokenAt < REDX_TOKEN_TTL_MS) {
    return redxToken;
  }

  if (!creds.phone || !creds.password) {
    // Static apiToken has no refresh path — it'll break again when it expires.
    if (creds.apiToken) return creds.apiToken;
    throw new Error('RedX requires phone+password to obtain or refresh a token');
  }

  const token = await loginRedx(creds);
  redxToken = token;
  redxTokenAt = Date.now();
  return token;
}

async function fetchRedxLifetimeStats(phone, creds) {
  if (!creds) {
    return emptyCourierResult();
  }

  const normalizedPhone = phone.startsWith('880') ? phone : `880${phone.replace(/^0/, '')}`;

  const attempt = async (forceRefresh) => {
    const token = await getRedxToken(creds, forceRefresh);
    return axios.get(
      `https://redx.com.bd/api/redx_se/admin/parcel/customer-success-return-rate?phoneNumber=${normalizedPhone}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 30000,
        validateStatus: () => true, // let us inspect non-2xx instead of throwing
      }
    );
  };

  try {
    let response = await attempt(false);

    // On "Invalid Token!", force exactly one fresh login and retry —
    // instead of cycling through phone number formats.
    if (response.status === 400 && /invalid token/i.test(JSON.stringify(response.data))) {
      if (!creds.phone || !creds.password) {
        return buildCourierResult({
          delivered: 0,
          cancelled: 0,
          total: 0,
          configured: true,
          error: 'RedX token expired and no phone+password configured to refresh it',
        });
      }
      response = await attempt(true);
    }

    if (response.status === 401 || response.status === 403) {
      return buildCourierResult({
        delivered: 0,
        cancelled: 0,
        total: 0,
        configured: true,
        error: 'RedX - merchant account access required',
      });
    }

    if (response.status !== 200) {
      return buildCourierResult({
        delivered: 0,
        cancelled: 0,
        total: 0,
        configured: true,
        error: response.data?.error?.message || response.data?.message || `RedX lookup failed (HTTP ${response.status})`,
      });
    }

    const delivered = Number(response.data?.data?.deliveredParcels || 0);
    const total = Number(response.data?.data?.totalParcels || 0);
    const cancelled = Math.max(0, total - delivered);

    return buildCourierResult({
      delivered,
      cancelled,
      total,
      configured: true,
    });
  } catch (error) {
    console.error('RedX fetch error:', error.message);
    return buildCourierResult({
      delivered: 0,
      cancelled: 0,
      total: 0,
      configured: true,
      error: error.message || 'RedX request failed',
    });
  }
}

// ============================================================
// AGGREGATION & MAIN EXPORT
// ============================================================

function aggregateLifetimeStats(couriers = {}) {
  let totalDelivered = 0;
  let totalCancelled = 0;
  let totalParcels = 0;
  let configuredCount = 0;
  let availableCount = 0;

  for (const row of Object.values(couriers)) {
    if (row.configured) configuredCount += 1;
    if (row.available) availableCount += 1;
    totalDelivered += row.delivered || 0;
    totalCancelled += row.cancelled || 0;
    totalParcels += row.total || 0;
  }

  const completed = totalDelivered + totalCancelled;
  const deliverySuccessRate =
    completed > 0
      ? Math.round((totalDelivered / completed) * 100)
      : totalParcels > 0
        ? Math.round((totalDelivered / totalParcels) * 100)
        : 0;

  const cancellationRate =
    totalParcels > 0 ? Math.round((totalCancelled / totalParcels) * 100) : 0;

  let riskScore = 0;
  let riskLevel = 'low';
  let riskLabel = 'No courier data yet';
  const riskFactors = [];

  if (totalParcels > 0) {
    riskScore += cancellationRate * 0.45;
    riskScore += Math.max(0, 100 - deliverySuccessRate) * 0.35;
    if (totalParcels >= 5 && deliverySuccessRate < 40) riskScore += 15;
    if (totalCancelled >= 3 && totalDelivered === 0) riskScore += 20;
    riskScore = Math.min(100, Math.round(riskScore));

    riskLabel = 'Trusted — good delivery history';
    if (riskScore >= 65) {
      riskLevel = 'high';
      riskLabel = 'High risk — frequent cancellations';
    } else if (riskScore >= 35) {
      riskLevel = 'medium';
      riskLabel = 'Moderate risk — review before COD';
    }

    if (cancellationRate >= 30) {
      riskFactors.push(`High cancellation rate across couriers (${cancellationRate}%)`);
    }
    if (deliverySuccessRate < 50 && completed >= 3) {
      riskFactors.push(`Low lifetime delivery success (${deliverySuccessRate}%)`);
    }
    if (totalCancelled >= 5 && totalDelivered < totalCancelled) {
      riskFactors.push('More cancelled than delivered parcels');
    }
    if (!riskFactors.length) {
      riskFactors.push('No major risk signals from courier panels');
    }
  } else if (configuredCount > 0) {
    riskFactors.push('No parcel history found on configured courier panels');
  } else {
    riskFactors.push('No courier panels configured — add merchant credentials');
  }

  return {
    totalDelivered,
    totalCancelled,
    totalParcels,
    deliverySuccessRate,
    cancellationRate,
    risk: {
      score: riskScore,
      level: riskLevel,
      label: riskLabel,
      factors: riskFactors,
    },
    configuredCount,
    availableCount,
  };
}

// ============================================================
// MAIN EXPORT FUNCTION
// ============================================================

class CourierLifetimeService {
  constructor() {
    this.pathaoCreds = null;
    this.steadfastCreds = null;
    this.redxCreds = null;
  }

  setCredentials(pathao, steadfast, redx) {
    this.pathaoCreds = pathao;
    this.steadfastCreds = steadfast;
    this.redxCreds = redx;
  }

  async fetchLifetimeStats(rawPhone, { skipCache = false } = {}) {
    const phone = normalizeBdMobile(rawPhone);

    if (!isValidBdMobile(phone)) {
      return {
        phone,
        valid: false,
        error: 'Invalid Bangladesh mobile. Use format 01XXXXXXXXX.',
        couriers: {},
        summary: aggregateLifetimeStats({}),
        fetchedAt: new Date().toISOString(),
      };
    }

    const cacheKey = phone;
    if (!skipCache) {
      const cached = lifetimeCache.get(cacheKey);
      if (cached && Date.now() - cached.at < LIFETIME_CACHE_TTL_MS) {
        return { ...cached.data, cached: true };
      }
    }

    // Fetch from all couriers in parallel
    const [pathao, steadfast, redx] = await Promise.all([
      fetchPathaoLifetimeStats(phone, this.pathaoCreds),
      fetchSteadfastLifetimeStats(phone, this.steadfastCreds),
      fetchRedxLifetimeStats(phone, this.redxCreds),
    ]);

    const couriers = { pathao, steadfast, redx };
    const configured = {
      pathao: !!this.pathaoCreds,
      steadfast: !!this.steadfastCreds,
      redx: !!this.redxCreds,
    };
    const anyConfigured = Object.values(configured).some(Boolean);

    const result = {
      phone,
      valid: true,
      source: 'courier_panels',
      description: 'Lifetime parcel history for this mobile on Pathao, Steadfast, and RedX networks',
      configured,
      anyConfigured,
      couriers,
      summary: aggregateLifetimeStats(couriers),
      fetchedAt: new Date().toISOString(),
      cached: false,
    };

    lifetimeCache.set(cacheKey, { at: Date.now(), data: result });
    return result;
  }
}

module.exports = new CourierLifetimeService();