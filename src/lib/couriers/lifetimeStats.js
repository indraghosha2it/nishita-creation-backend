// src/lib/couriers/lifetimeStats.js

const { getCourierIntegration } = require('./credentials');
const { getCustomerLifetimeStats } = require('./factory');

const BD_MOBILE_RE = /^01[3-9][0-9]{8}$/;
const LIFETIME_CACHE_TTL_MS = Number(process.env.LIFETIME_STATS_CACHE_TTL_MS || 10 * 60 * 1000);
const lifetimeCache = new Map();

// Courier display info
const COURIER_DISPLAY = [
  { key: 'pathao', name: 'Pathao', color: 'bg-red-500' },
  { key: 'steadfast', name: 'SteadFast Courier', color: 'bg-orange-500' },
  { key: 'redx', name: 'REDX', color: 'bg-rose-600' },
];

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

async function fetchCourierStats(slug, phone) {
  try {
    const integration = await getCourierIntegration(slug);
    
    if (!integration || !integration.apiEnabled || !integration.creds) {
      return {
        configured: false,
        available: false,
        delivered: 0,
        cancelled: 0,
        total: 0,
        error: 'Not configured'
      };
    }

    const result = await getCustomerLifetimeStats(
      slug,
      integration.creds,
      integration.storeConfig,
      phone
    );

    if (!result.success) {
      return {
        configured: result.configured !== false,
        available: false,
        delivered: 0,
        cancelled: 0,
        total: 0,
        error: result.error || 'Failed to fetch stats'
      };
    }

    // Handle rating-based response (Pathao v2)
    if (result.ratingBased) {
      return {
        configured: true,
        available: true,
        delivered: 0,
        cancelled: 0,
        total: 0,
        rating: result.rating,
        addressCount: result.addressCount || 0,
        ratingBased: true,
        successRate: result.successRate || 0
      };
    }

    return {
      configured: true,
      available: true,
      delivered: result.delivered || 0,
      cancelled: result.cancelled || 0,
      total: result.total || 0,
      successRate: result.total > 0 ? Math.round((result.delivered / result.total) * 100) : 0
    };

  } catch (error) {
    console.error(`❌ Error fetching ${slug} stats:`, error);
    return {
      configured: true,
      available: false,
      delivered: 0,
      cancelled: 0,
      total: 0,
      error: error.message || 'Request failed'
    };
  }
}

async function getLifetimeStats(rawPhone, { skipCache = false } = {}) {
  const phone = normalizeBdMobile(rawPhone);
  
  if (!isValidBdMobile(phone)) {
    return {
      phone,
      valid: false,
      error: 'Invalid Bangladesh mobile. Use format 01XXXXXXXXX.',
      couriers: {},
      summary: aggregateLifetimeStats({}),
      configured: {},
      anyConfigured: false,
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
    fetchCourierStats('pathao', phone),
    fetchCourierStats('steadfast', phone),
    fetchCourierStats('redx', phone),
  ]);

  const couriers = { pathao, steadfast, redx };
  
  // Get configured status
  const configured = {
    pathao: await getCourierIntegration('pathao').then(i => !!(i?.apiEnabled && i?.creds)),
    steadfast: await getCourierIntegration('steadfast').then(i => !!(i?.apiEnabled && i?.creds)),
    redx: await getCourierIntegration('redx').then(i => !!(i?.apiEnabled && i?.creds)),
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

module.exports = {
  getLifetimeStats,
  normalizeBdMobile,
  isValidBdMobile,
  aggregateLifetimeStats,
  COURIER_DISPLAY
};