// // // D:\Smart-Gadget\Gadget-backend\src\lib\couriers\pathaoZoneMapping.js

// // /**
// //  * Complete Pathao Zone Mapping
// //  * Maps Bangladesh location data to Pathao zone IDs
// //  */

// // // ✅ Complete Pathao zone list for Dhaka (city_id: 1)
// // const PATHAO_DHAKA_ZONES = {
// //   'gulshan': 1,
// //   'banani': 2,
// //   'baridhara': 3,
// //   'mohakhali': 4,
// //   'tejgaon': 5,
// //   'farmgate': 6,
// //   'kawran bazar': 7,
// //   'dhanmondi': 8,
// //   'lalmatia': 9,
// //   'mohammadpur': 10,
// //   'shyamoli': 11,
// //   'mirpur': 12,
// //   'pallabi': 13,
// //   'uttara': 14,
// //   'tongi': 15,
// //   'savar': 16,
// //   'keraniganj': 17,
// //   'narayanganj': 18,
// //   'demra': 19,
// //   'jatrabari': 20,
// //   'badda': 21,
// //   'hatirjheel': 22,
// //   'moghbazar': 23,
// //   'shahbagh': 24,
// //   'ramna': 25,
// //   'paltan': 26,
// //   'motijheel': 27,
// //   'sadarghat': 28,
// //   'kamarpara': 29,
// //   'kallayanpur': 30,
// //   'adabar': 31,
// //   'shyampur': 32,
// //   'sayedabad': 33,
// //   'kadamtali': 34,
// //   'khilgaon': 35,
// //   'basabo': 36,
// //   'mugda': 37,
// //   'khilkhet': 38,
// //   'vashantek': 39,
// //   'dakshinkhan': 40,
// //   'uttarkhan': 41,
// //   'baishtek': 42,
// //   'ashkona': 43,
// //   'bijaynagar': 44,
// // };

// // // ✅ Map for other cities (all zones default to 0)
// // const OTHER_CITY_ZONES = {
// //   'chittagong': {},
// //   'khulna': {},
// //   'rajshahi': {},
// //   'barisal': {},
// //   'sylhet': {},
// //   'rangpur': {},
// //   'mymensingh': {},
// // };

// // // ✅ District to Pathao city ID mapping
// // const DISTRICT_TO_CITY_ID = {
// //   'dhaka': 1,
// //   'chittagong': 2,
// //   'khulna': 3,
// //   'rajshahi': 4,
// //   'barisal': 5,
// //   'sylhet': 6,
// //   'rangpur': 7,
// //   'mymensingh': 8,
// // };

// // /**
// //  * Get Pathao zone ID from upazila name for a given district
// //  */
// // function getPathaoZoneId(district, upazila) {
// //   if (!upazila) return 0;
  
// //   const normalizedUpazila = upazila.toLowerCase().trim();
// //   const normalizedDistrict = district.toLowerCase().trim();
  
// //   // Only Dhaka has specific zone mapping
// //   if (normalizedDistrict === 'dhaka') {
// //     // Direct match
// //     if (PATHAO_DHAKA_ZONES[normalizedUpazila] !== undefined) {
// //       return PATHAO_DHAKA_ZONES[normalizedUpazila];
// //     }
    
// //     // Try partial match
// //     for (const [key, value] of Object.entries(PATHAO_DHAKA_ZONES)) {
// //       if (normalizedUpazila.includes(key) || key.includes(normalizedUpazila)) {
// //         return value;
// //       }
// //     }
// //   }
  
// //   // For other cities or if not found, return 0
// //   return 0;
// // }

// // /**
// //  * Get Pathao city ID from district name
// //  */
// // function getPathaoCityId(district) {
// //   if (!district) return 1;
  
// //   const normalized = district.toLowerCase().trim();
  
// //   if (DISTRICT_TO_CITY_ID[normalized]) {
// //     return DISTRICT_TO_CITY_ID[normalized];
// //   }
  
// //   // Try partial match
// //   for (const [key, value] of Object.entries(DISTRICT_TO_CITY_ID)) {
// //     if (normalized.includes(key) || key.includes(normalized)) {
// //       return value;
// //     }
// //   }
  
// //   return 1; // Default to Dhaka
// // }

// // /**
// //  * Check if a zone is supported by Pathao
// //  */
// // function isPathaoZone(district, zoneName) {
// //   if (!zoneName) return false;
  
// //   const normalizedDistrict = district.toLowerCase().trim();
// //   const normalizedZone = zoneName.toLowerCase().trim();
  
// //   if (normalizedDistrict === 'dhaka') {
// //     return PATHAO_DHAKA_ZONES[normalizedZone] !== undefined ||
// //            Object.keys(PATHAO_DHAKA_ZONES).some(key => 
// //              normalizedZone.includes(key) || key.includes(normalizedZone)
// //            );
// //   }
  
// //   // For other cities, all zones are supported (will use zone 0)
// //   return true;
// // }

// // module.exports = {
// //   PATHAO_DHAKA_ZONES,
// //   OTHER_CITY_ZONES,
// //   DISTRICT_TO_CITY_ID,
// //   getPathaoZoneId,
// //   getPathaoCityId,
// //   isPathaoZone,
// // };


// // District to Pathao City ID mapping
// const DISTRICT_TO_CITY_ID = {
//   'dhaka': 1, 'gazipur': 1, 'narayanganj': 1, 'tangail': 1,
//   'kishoreganj': 1, 'manikganj': 1, 'munshiganj': 1, 'narsingdi': 1,
//   'faridpur': 1, 'madaripur': 1, 'shariatpur': 1, 'rajbari': 1, 'gopalganj': 1,
//   'chittagong': 2, 'comilla': 2, 'chandpur': 2, 'feni': 2,
//   'noakhali': 2, 'lakshmipur': 2, 'brahmanbaria': 2, "cox's bazar": 2,
//   'khagrachhari': 2, 'rangamati': 2, 'bandarban': 2,
//   'khulna': 3, 'jessore': 3, 'satkhira': 3, 'bagerhat': 3,
//   'jhenaidah': 3, 'kushtia': 3, 'chuadanga': 3, 'meherpur': 3,
//   'magura': 3, 'narail': 3,
//   'rajshahi': 4, 'sirajganj': 4, 'pabna': 4, 'bogura': 4,
//   'naogaon': 4, 'natore': 4, 'joypurhat': 48, 'chapainawabganj': 4,
//   'barisal': 5, 'bhola': 5, 'patuakhali': 5, 'barguna': 5,
//   'jhalokati': 5, 'pirojpur': 5,
//   'sylhet': 6, 'moulvibazar': 6, 'habiganj': 6, 'sunamganj': 6,
//   'rangpur': 7, 'dinajpur': 7, 'nilphamari': 7, 'lalmonirhat': 7,
//   'kurigram': 7, 'gaibandha': 7, 'thakurgaon': 7, 'panchagarh': 7,
//   'mymensingh': 8, 'jamalpur': 8, 'netrokona': 8, 'sherpur': 8
// };

// function getPathaoCityId(district) {
//   if (!district) return 1;
//   const normalized = district.toLowerCase().trim();
//   if (DISTRICT_TO_CITY_ID[normalized]) {
//     return DISTRICT_TO_CITY_ID[normalized];
//   }
//   for (const [key, value] of Object.entries(DISTRICT_TO_CITY_ID)) {
//     if (normalized.includes(key) || key.includes(normalized)) {
//       return value;
//     }
//   }
//   return 1;
// }

// function getPathaoZoneId(cityId, zoneName) {
//   // Static zone mapping (you can expand this based on Pathao's API)
//   const CITY_ZONES = {
//     1: { 'gulshan': 1, 'banani': 2, 'dhanmondi': 8, 'mirpur': 12, 'uttara': 14 },
//     2: { 'agrabad': 1, 'panchlaish': 2, 'chawkbazar': 3 },
//     3: { 'khulna sadar': 1, 'sonadanga': 2 },
//     4: { 'rajshahi sadar': 1, 'boalia': 2 }
//   };

//   const cityZones = CITY_ZONES[cityId] || {};
//   const needle = zoneName?.toLowerCase().trim() || '';
  
//   if (cityZones[needle] !== undefined) return cityZones[needle];
//   for (const [key, value] of Object.entries(cityZones)) {
//     if (needle.includes(key) || key.includes(needle)) return value;
//   }
//   return Object.values(cityZones)[0] || 0;
// }

// module.exports = { getPathaoCityId, getPathaoZoneId };


// District to Pathao City ID mapping
const DISTRICT_TO_CITY_ID = {
  'dhaka': 1, 'gazipur': 1, 'narayanganj': 1, 'tangail': 1,
  'kishoreganj': 1, 'manikganj': 1, 'munshiganj': 1, 'narsingdi': 1,
  'faridpur': 1, 'madaripur': 1, 'shariatpur': 1, 'rajbari': 1, 'gopalganj': 1,
  'chittagong': 2, 'comilla': 2, 'chandpur': 2, 'feni': 2,
  'noakhali': 2, 'lakshmipur': 2, 'brahmanbaria': 2, "cox's bazar": 2,
  'khagrachhari': 2, 'rangamati': 2, 'bandarban': 2,
  'khulna': 3, 'jessore': 3, 'satkhira': 3, 'bagerhat': 3,
  'jhenaidah': 3, 'kushtia': 3, 'chuadanga': 3, 'meherpur': 3,
  'magura': 3, 'narail': 3,
  'rajshahi': 4, 'sirajganj': 4, 'pabna': 4, 'bogura': 4,
  'naogaon': 4, 'natore': 4, 'joypurhat': 48, 'chapainawabganj': 4,
  'barisal': 5, 'bhola': 5, 'patuakhali': 5, 'barguna': 5,
  'jhalokati': 5, 'pirojpur': 5,
  'sylhet': 6, 'moulvibazar': 6, 'habiganj': 6, 'sunamganj': 6,
  'rangpur': 7, 'dinajpur': 7, 'nilphamari': 7, 'lalmonirhat': 7,
  'kurigram': 7, 'gaibandha': 7, 'thakurgaon': 7, 'panchagarh': 7,
  'mymensingh': 8, 'jamalpur': 8, 'netrokona': 8, 'sherpur': 8
};

function getPathaoCityId(district) {
  if (!district) {
    console.log('⚠️ No district provided, defaulting to Dhaka (ID: 1)');
    return 1;
  }
  const normalized = district.toLowerCase().trim();
  
  // Direct match
  if (DISTRICT_TO_CITY_ID[normalized]) {
    return DISTRICT_TO_CITY_ID[normalized];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(DISTRICT_TO_CITY_ID)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      console.log(`📍 City mapped: "${district}" → "${key}" (ID: ${value})`);
      return value;
    }
  }
  
  console.log(`⚠️ City "${district}" not found, defaulting to Dhaka (ID: 1)`);
  return 1;
}

function getPathaoZoneId(cityId, zoneName) {
  // Expanded zone mapping
  const CITY_ZONES = {
    1: { 
      'gulshan': 1, 'banani': 2, 'baridhara': 3, 'mohakhali': 4, 
      'tejgaon': 5, 'farmgate': 6, 'dhanmondi': 8, 'mirpur': 12, 
      'uttara': 14, 'tongi': 15, 'savar': 16, 'keraniganj': 17,
      'demra': 19, 'jatrabari': 20, 'badda': 21, 'hatirjheel': 22,
      'moghbazar': 23, 'shahbagh': 24, 'ramna': 25, 'paltan': 26,
      'motijheel': 27, 'sadarghat': 28, 'kallayanpur': 30,
      'adabar': 31, 'shyampur': 32, 'sayedabad': 33, 'kadamtali': 34,
      'khilgaon': 35, 'basabo': 36, 'mugda': 37, 'khilkhet': 38,
      'dakshinkhan': 40, 'uttarkhan': 41, 'ashkona': 43,
      'lalmatia': 9, 'mohammadpur': 10, 'shyamoli': 11, 'pallabi': 13,
    },
    2: { 
      'agrabad': 1, 'panchlaish': 2, 'chawkbazar': 3, 'khulshi': 4,
      'halishahar': 5, 'pahartali': 6, 'bayazid': 7,
      'chittagong sadar': 1,
    },
    3: { 
      'khulna sadar': 1, 'sonadanga': 2, 'khalishpur': 3,
    },
    4: { 
      'rajshahi sadar': 1, 'boalia': 2, 'motihar': 3,
    },
    5: { 
      'barisal sadar': 1, 'kashipur': 2, 'airport': 3,
    },
    6: { 
      'sylhet sadar': 1, 'shahporan': 2, 'dakshin surma': 3,
    },
    7: { 
      'rangpur sadar': 1,
    },
    8: { 
      'mymensingh sadar': 1,
    },
    48: { 
      'joypurhat sadar': 1, 'akkelpur': 2, 'kalai': 3,
    }
  };

  const cityZones = CITY_ZONES[cityId] || {};
  const needle = zoneName?.toLowerCase().trim() || '';
  
  // Try exact match
  if (cityZones[needle] !== undefined) {
    console.log(`📍 Zone mapped: "${zoneName}" → ID: ${cityZones[needle]}`);
    return cityZones[needle];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(cityZones)) {
    if (needle.includes(key) || key.includes(needle) || 
        needle.startsWith(key) || key.startsWith(needle)) {
      console.log(`📍 Zone mapped (partial): "${zoneName}" → "${key}" (ID: ${value})`);
      return value;
    }
  }
  
  // Try removing common suffixes
  const suffixes = [' upazila', ' thana', ' sadar', ' model', ' pur', ' para', ' bazar'];
  for (const suffix of suffixes) {
    if (needle.endsWith(suffix)) {
      const withoutSuffix = needle.slice(0, -suffix.length);
      if (cityZones[withoutSuffix] !== undefined) {
        console.log(`📍 Zone mapped (suffix removed): "${zoneName}" → "${withoutSuffix}" (ID: ${cityZones[withoutSuffix]})`);
        return cityZones[withoutSuffix];
      }
    }
  }
  
  // Default to first zone or 0
  const defaultZone = Object.values(cityZones)[0] || 0;
  console.log(`⚠️ Zone "${zoneName}" not found for city ${cityId}, using default zone: ${defaultZone}`);
  return defaultZone;
}

module.exports = { getPathaoCityId, getPathaoZoneId };