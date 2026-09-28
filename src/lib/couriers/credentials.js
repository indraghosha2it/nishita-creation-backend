// // claude

// const Courier = require('../../models/Courier');
// const { encryptJson, decryptJson } = require('../credentialCrypto');

// const courierCredentialFields = {
//   pathao: ['clientId', 'clientSecret', 'username', 'password'],
//   steadfast: ['apiKey', 'secretKey'],
//   redx: ['phone', 'password','apiToken']
// };

// async function getCourierDocBySlug(slug) {
//   return await Courier.findOne({ slug });
// }

// function isIntegrationSlug(slug) {
//   return ['pathao', 'steadfast', 'redx'].includes(slug.toLowerCase());
// }

// function mergeCredentialUpdates(slug, existing = {}, incoming = {}) {
//   const merged = { ...existing };
//   const fields = courierCredentialFields[slug] || [];
//   for (const key of fields) {
//     if (incoming[key] !== undefined && incoming[key] !== '' && incoming[key] !== null) {
//       merged[key] = String(incoming[key]).trim();
//     }
//   }
//   return merged;
// }

// async function saveCourierCredentials(courierId, { apiEnabled, credentials, storeConfig }) {
//   const courier = await Courier.findById(courierId);
//   if (!courier) return null;

//   if (typeof apiEnabled === 'boolean') {
//     courier.apiEnabled = apiEnabled;
//   }

//   if (credentials && isIntegrationSlug(courier.slug)) {
//     const existing = decryptJson(courier.credentialsEncrypted);
//     const merged = mergeCredentialUpdates(courier.slug, existing, credentials);
//     courier.credentialsEncrypted = encryptJson(merged);
//   }

//   if (storeConfig) {
//     courier.storeConfig = { ...courier.storeConfig, ...storeConfig };
//   }

//   await courier.save();
//   return courier;
// }

// async function getCourierIntegration(slug) {
//   const doc = await getCourierDocBySlug(slug);
//   if (!doc) return null;

//   let creds = null;
//   if (doc.credentialsEncrypted) {
//     creds = decryptJson(doc.credentialsEncrypted);
//   }

//   const fields = courierCredentialFields[slug] || [];
//   const configuredFields = fields.filter(f => creds && creds[f] && creds[f].trim() !== '');
  
//   return {
//     slug: doc.slug,
//     id: doc._id,
//     creds: creds && Object.keys(creds).length > 0 ? creds : null,
//     configured: configuredFields.length > 0,
//     apiEnabled: doc.apiEnabled,
//     storeConfig: doc.storeConfig,
//     capabilities: doc.capabilities,
//     integrationStatus: doc.integrationStatus,
//     doc
//   };
// }

// module.exports = {
//   getCourierDocBySlug,
//   isIntegrationSlug,
//   mergeCredentialUpdates,
//   saveCourierCredentials,
//   getCourierIntegration,
//   courierCredentialFields
// };


// src/lib/couriers/credentials.js

// ✅ CORRECT PATH: From src/lib/couriers/ to src/models/
const Courier = require('../../models/Courier');
const { encryptJson, decryptJson } = require('../credentialCrypto');

// ✅ apiToken is included for RedX
const courierCredentialFields = {
  pathao: ['clientId', 'clientSecret', 'username', 'password'],
  steadfast: ['apiKey', 'secretKey'],
  redx: ['apiToken', 'phone', 'password', 'shopId']  // ✅ apiToken is here
};

async function getCourierDocBySlug(slug) {
  return await Courier.findOne({ slug });
}

function isIntegrationSlug(slug) {
  return ['pathao', 'steadfast', 'redx'].includes(slug.toLowerCase());
}

function mergeCredentialUpdates(slug, existing = {}, incoming = {}) {
  const merged = { ...existing };
  const fields = courierCredentialFields[slug] || [];
  for (const key of fields) {
    if (incoming[key] !== undefined && incoming[key] !== '' && incoming[key] !== null) {
      merged[key] = String(incoming[key]).trim();
    }
  }
  return merged;
}

async function saveCourierCredentials(courierId, { apiEnabled, credentials, storeConfig }) {
  const courier = await Courier.findById(courierId);
  if (!courier) return null;

  if (typeof apiEnabled === 'boolean') {
    courier.apiEnabled = apiEnabled;
  }

  if (credentials && isIntegrationSlug(courier.slug)) {
    const existing = decryptJson(courier.credentialsEncrypted);
    const merged = mergeCredentialUpdates(courier.slug, existing, credentials);
    courier.credentialsEncrypted = encryptJson(merged);
  }

  if (storeConfig) {
    courier.storeConfig = { ...courier.storeConfig, ...storeConfig };
  }

  await courier.save();
  return courier;
}

async function getCourierIntegration(slug) {
  const doc = await getCourierDocBySlug(slug);
  if (!doc) return null;

  let creds = null;
  if (doc.credentialsEncrypted) {
    creds = decryptJson(doc.credentialsEncrypted);
  }

  const fields = courierCredentialFields[slug] || [];
  const configuredFields = fields.filter(f => creds && creds[f] && creds[f].trim() !== '');
  
  return {
    slug: doc.slug,
    id: doc._id,
    creds: creds && Object.keys(creds).length > 0 ? creds : null,
    configured: configuredFields.length > 0,
    apiEnabled: doc.apiEnabled,
    storeConfig: doc.storeConfig,
    capabilities: doc.capabilities,
    integrationStatus: doc.integrationStatus,
    doc
  };
}

module.exports = {
  getCourierDocBySlug,
  isIntegrationSlug,
  mergeCredentialUpdates,
  saveCourierCredentials,
  getCourierIntegration,
  courierCredentialFields
};