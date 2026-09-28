

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const cloudinary = require('cloudinary').v2;
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// console.log('☁️ Cloudinary Configuration:');
// console.log('  - Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
// console.log('  - API Key:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING');
// console.log('  - API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING');
// console.log('  - Folder:', process.env.CLOUDINARY_FOLDER || 'power-bank');

// // ============================================
// // HELPER FUNCTIONS
// // ============================================

// function formatCloudinaryResource(resource) {
//   return {
//     public_id: resource.public_id,
//     url: resource.secure_url || resource.url,
//     resource_type: resource.resource_type || 'image',
//     format: resource.format,
//     width: resource.width,
//     height: resource.height,
//     created_at: resource.created_at,
//     bytes: resource.bytes,
//     folder: resource.folder || '',
//     filename: resource.public_id.split('/').pop(),
//   };
// }

// // ============================================
// // MAIN ROUTES - Allow Moderators and Admins
// // ============================================

// // ✅ SINGLE ROUTE DEFINITION - Get all media
// router.get('/', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     console.log('👤 User object:', {
//       id: req.user?._id,
//       email: req.user?.email,
//       role: req.user?.role,
//       isActive: req.user?.isActive
//     });
    
//     const { folder, q, next_cursor } = req.query;
    
//     const targetFolder = folder || process.env.CLOUDINARY_FOLDER || 'power-bank';
    
//     console.log('📁 Media Library Request:');
//     console.log('  - Folder:', targetFolder);
//     console.log('  - Search:', q || 'none');
//     console.log('  - Next Cursor:', next_cursor || 'none');
//     console.log('  - User Role:', req.user?.role);
    
//     let allResources = [];
//     let nextCursor = null;
    
//     try {
//       let searchExpression = '';
//       const folderPath = targetFolder.endsWith('/') ? targetFolder : targetFolder + '/';
//       searchExpression = `folder:${folderPath}*`;
//       console.log(`  🔍 Searching in folder: ${folderPath}*`);
      
//       if (q && q.trim()) {
//         searchExpression += ` AND filename:${q}*`;
//       }
      
//       console.log(`  🔎 Search expression: ${searchExpression}`);
      
//       const searchOptions = {
//         expression: searchExpression,
//         max_results: 30,
//         resource_type: 'all',
//       };
      
//       if (next_cursor) {
//         searchOptions.next_cursor = next_cursor;
//       }
      
//       const result = await cloudinary.search
//         .expression(searchExpression)
//         .max_results(30)
//         .execute();
      
//       allResources = result.resources || [];
//       nextCursor = result.next_cursor || null;
      
//       console.log(`📊 Found ${allResources.length} items`);
      
//     } catch (searchError) {
//       console.error('❌ Search API error:', searchError.message);
      
//       console.log('⚠️ Falling back to resources API...');
      
//       const options = {
//         max_results: 30,
//         type: 'upload',
//       };
      
//       if (next_cursor) {
//         options.next_cursor = next_cursor;
//       }
      
//       const folderPrefix = targetFolder.endsWith('/') ? targetFolder : targetFolder + '/';
//       options.prefix = folderPrefix;
//       console.log(`  📂 Using prefix: ${folderPrefix}`);
      
//       try {
//         const imageResult = await cloudinary.api.resources({
//           ...options,
//           resource_type: 'image'
//         });
        
//         if (imageResult.resources && imageResult.resources.length > 0) {
//           allResources = allResources.concat(imageResult.resources);
//           nextCursor = imageResult.next_cursor || nextCursor;
//           console.log(`📸 Found ${imageResult.resources.length} images`);
//         }
//       } catch (imageError) {
//         console.log('⚠️ Error fetching images:', imageError.message);
//       }
      
//       try {
//         const videoResult = await cloudinary.api.resources({
//           ...options,
//           resource_type: 'video'
//         });
        
//         if (videoResult.resources && videoResult.resources.length > 0) {
//           allResources = allResources.concat(videoResult.resources);
//           nextCursor = videoResult.next_cursor || nextCursor;
//           console.log(`🎬 Found ${videoResult.resources.length} videos`);
//         }
//       } catch (videoError) {
//         console.log('⚠️ Error fetching videos:', videoError.message);
//       }
//     }
    
//     const formattedItems = allResources.map(formatCloudinaryResource);
    
//     return res.json({
//       items: formattedItems,
//       next_cursor: nextCursor,
//       total: formattedItems.length,
//       folder: targetFolder
//     });
    
//   } catch (error) {
//     console.error('❌ Error fetching media:', error);
//     return res.status(500).json({ 
//       error: 'Failed to fetch media',
//       details: error.message 
//     });
//   }
// });

// // Get all folders
// router.get('/folders', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     console.log('📁 Fetching all folders...');
    
//     const result = await cloudinary.api.root_folders({ max_results: 50 });
    
//     const rootFolders = result.folders.map(f => f.name);
//     console.log(`📁 Found ${rootFolders.length} root folders`);
    
//     const rootFolder = process.env.CLOUDINARY_FOLDER || 'power-bank';
//     if (!rootFolders.includes(rootFolder)) {
//       rootFolders.unshift(rootFolder);
//     }
    
//     let allFolders = [...rootFolders];
//     for (const folder of rootFolders) {
//       try {
//         const subResult = await cloudinary.api.sub_folders(folder);
//         subResult.folders.forEach(sub => {
//           allFolders.push(`${folder}/${sub.name}`);
//         });
//       } catch (e) {
//         // Ignore subfolder errors
//       }
//     }
    
//     console.log(`📁 Total folders: ${allFolders.length}`);
    
//     return res.json({ 
//       folders: allFolders,
//       rootFolders: rootFolders
//     });
//   } catch (error) {
//     console.error('❌ Error fetching folders:', error);
//     return res.status(500).json({ 
//       error: 'Failed to fetch folders',
//       details: error.message 
//     });
//   }
// });

// // Get subfolders of a specific folder
// router.get('/folders/:folder', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     const { folder } = req.params;
//     console.log(`📁 Fetching subfolders for: ${folder}`);
    
//     const result = await cloudinary.api.sub_folders(folder);
    
//     return res.json({ 
//       folders: result.folders,
//       parent: folder
//     });
//   } catch (error) {
//     console.error('❌ Error fetching subfolders:', error);
//     return res.status(500).json({ 
//       error: 'Failed to fetch subfolders',
//       details: error.message 
//     });
//   }
// });

// // Delete media - Allow Moderators and Admins
// router.delete('/', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     const { public_ids, resource_type } = req.body;
    
//     if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
//       return res.status(400).json({ 
//         error: 'No public_ids provided' 
//       });
//     }
    
//     console.log(`🗑️ Deleting ${public_ids.length} items...`);
//     console.log('  - User Role:', req.user?.role);
    
//     const results = [];
//     for (const publicId of public_ids) {
//       try {
//         let type = resource_type || 'image';
//         if (publicId.includes('/video/') || publicId.startsWith('video/')) {
//           type = 'video';
//         }
        
//         const result = await cloudinary.uploader.destroy(publicId, {
//           resource_type: type,
//           invalidate: true,
//         });
//         results.push({ publicId, result });
//         console.log(`  ✅ Deleted: ${publicId}`);
//       } catch (error) {
//         console.error(`  ❌ Error deleting ${publicId}:`, error.message);
//         results.push({ publicId, error: error.message });
//       }
//     }
    
//     const successful = results.filter(r => r.result?.result === 'ok');
//     const failed = results.filter(r => r.error || r.result?.result !== 'ok');
    
//     return res.json({
//       success: true,
//       deleted: successful.length,
//       failed: failed.length,
//       results,
//     });
//   } catch (error) {
//     console.error('❌ Error deleting media:', error);
//     return res.status(500).json({ 
//       error: 'Failed to delete media',
//       details: error.message 
//     });
//   }
// });

// // ============================================
// // TEST & DEBUG ROUTES
// // ============================================

// // Config test
// router.get('/config-test', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     console.log('🔍 Testing Cloudinary configuration...');
    
//     const config = {
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
//       api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING',
//       folder: process.env.CLOUDINARY_FOLDER || 'power-bank'
//     };
    
//     const result = await cloudinary.api.ping();
    
//     console.log('✅ Cloudinary configuration test passed');
    
//     return res.json({
//       success: true,
//       message: 'Cloudinary is configured correctly',
//       config: config,
//       ping: result
//     });
//   } catch (error) {
//     console.error('❌ Cloudinary config test failed:', error.message);
//     return res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Debug endpoint
// router.get('/debug', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     console.log('🔍 DEBUG: Testing Cloudinary API calls');
    
//     const results = {
//       timestamp: new Date().toISOString(),
//       attempts: {}
//     };
    
//     try {
//       const imageResult = await cloudinary.api.resources({
//         resource_type: 'image',
//         max_results: 10,
//         type: 'upload',
//       });
//       results.attempts.images = {
//         success: true,
//         count: imageResult.resources?.length || 0,
//         sample: imageResult.resources?.slice(0, 3).map(r => ({
//           public_id: r.public_id,
//           url: r.secure_url
//         }))
//       };
//       console.log(`📸 Debug: Found ${imageResult.resources?.length || 0} images`);
//     } catch (error) {
//       results.attempts.images = {
//         success: false,
//         error: error.message
//       };
//       console.log('⚠️ Debug: Error fetching images:', error.message);
//     }
    
//     try {
//       const videoResult = await cloudinary.api.resources({
//         resource_type: 'video',
//         max_results: 10,
//         type: 'upload',
//       });
//       results.attempts.videos = {
//         success: true,
//         count: videoResult.resources?.length || 0,
//         sample: videoResult.resources?.slice(0, 3).map(r => ({
//           public_id: r.public_id,
//           url: r.secure_url
//         }))
//       };
//       console.log(`🎬 Debug: Found ${videoResult.resources?.length || 0} videos`);
//     } catch (error) {
//       results.attempts.videos = {
//         success: false,
//         error: error.message
//       };
//       console.log('⚠️ Debug: Error fetching videos:', error.message);
//     }
    
//     try {
//       const allImages = await cloudinary.api.resources({
//         resource_type: 'image',
//         max_results: 50,
//         type: 'upload',
//       });
      
//       const allVideos = await cloudinary.api.resources({
//         resource_type: 'video',
//         max_results: 50,
//         type: 'upload',
//       });
      
//       const combined = [
//         ...(allImages.resources || []),
//         ...(allVideos.resources || [])
//       ];
      
//       results.attempts.combined = {
//         success: true,
//         total: combined.length,
//         images: allImages.resources?.length || 0,
//         videos: allVideos.resources?.length || 0,
//       };
//       console.log(`📊 Debug: Total combined items: ${combined.length}`);
//     } catch (error) {
//       results.attempts.combined = {
//         success: false,
//         error: error.message
//       };
//       console.log('⚠️ Debug: Error fetching combined:', error.message);
//     }
    
//     try {
//       const searchResult = await cloudinary.search
//         .expression('*')
//         .max_results(10)
//         .execute();
      
//       results.attempts.search = {
//         success: true,
//         count: searchResult.resources?.length || 0,
//         sample: searchResult.resources?.slice(0, 3).map(r => ({
//           public_id: r.public_id,
//           resource_type: r.resource_type
//         }))
//       };
//       console.log(`🔎 Debug: Search found ${searchResult.resources?.length || 0} items`);
//     } catch (error) {
//       results.attempts.search = {
//         success: false,
//         error: error.message
//       };
//       console.log('⚠️ Debug: Search API error:', error.message);
//     }
    
//     try {
//       const folderResult = await cloudinary.api.root_folders({ max_results: 50 });
//       results.folders = folderResult.folders.map(f => f.name);
//       console.log(`📁 Debug: Found ${results.folders.length} root folders`);
//     } catch (error) {
//       results.folders = [];
//       results.folderError = error.message;
//       console.log('⚠️ Debug: Error fetching folders:', error.message);
//     }
    
//     results.config = {
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
//       api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
//       api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
//       folder: process.env.CLOUDINARY_FOLDER || 'power-bank'
//     };
    
//     console.log('✅ Debug complete');
    
//     return res.json(results);
    
//   } catch (error) {
//     console.error('❌ Debug error:', error);
//     return res.status(500).json({
//       success: false,
//       error: error.message,
//       stack: error.stack
//     });
//   }
// });

// // Get all resources without any filters
// router.get('/all', protect, isModeratorOrAdmin, async (req, res) => {
//   try {
//     console.log('📁 Fetching ALL resources from Cloudinary...');
    
//     const imageResult = await cloudinary.api.resources({
//       resource_type: 'image',
//       max_results: 50,
//       type: 'upload',
//     });
    
//     const videoResult = await cloudinary.api.resources({
//       resource_type: 'video',
//       max_results: 50,
//       type: 'upload',
//     });
    
//     const allItems = [
//       ...(imageResult.resources || []),
//       ...(videoResult.resources || [])
//     ];
    
//     console.log(`📊 Found ${allItems.length} total items (${imageResult.resources?.length || 0} images, ${videoResult.resources?.length || 0} videos)`);
    
//     return res.json({
//       success: true,
//       total: allItems.length,
//       images: imageResult.resources?.length || 0,
//       videos: videoResult.resources?.length || 0,
//       items: allItems.map(formatCloudinaryResource),
//       next_cursor: imageResult.next_cursor || videoResult.next_cursor || null,
//     });
//   } catch (error) {
//     console.error('❌ Error fetching all resources:', error);
//     return res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// module.exports = router;


// module.exports = router;
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary Configuration:');
console.log('  - Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('  - API Key:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING');
console.log('  - API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING');
console.log('  - Folder:', process.env.CLOUDINARY_FOLDER || 'power-bank');

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCloudinaryResource(resource) {
  return {
    public_id: resource.public_id,
    url: resource.secure_url || resource.url,
    resource_type: resource.resource_type || 'image',
    format: resource.format,
    width: resource.width,
    height: resource.height,
    created_at: resource.created_at,
    bytes: resource.bytes,
    folder: resource.folder || '',
    filename: resource.public_id.split('/').pop(),
  };
}

// ============================================
// MAIN ROUTES - Allow Moderators and Admins
// ============================================

// ✅ FIXED: Get ALL media - loops through every Cloudinary page internally
router.get('/', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const { folder, q } = req.query;
    const targetFolder = folder || process.env.CLOUDINARY_FOLDER || 'power-bank';

    console.log('📁 Media Library Request (fetch-all mode):');
    console.log('  - Folder:', targetFolder);
    console.log('  - Search:', q || 'none');
    console.log('  - User Role:', req.user?.role);

    const PAGE_SIZE = 500; // Cloudinary's hard max per call
    const MAX_PAGES = 50;  // safety cap: 25,000 items — raise if you have more

    let allResources = [];
    let usedSearchApi = true;

    try {
      const folderPath = targetFolder.endsWith('/') ? targetFolder : targetFolder + '/';
      let searchExpression = `folder:${folderPath}*`;
      if (q && q.trim()) {
        searchExpression += ` AND filename:${q}*`;
      }
      console.log(`  🔎 Search expression: ${searchExpression}`);

      let cursor = undefined;
      let page = 0;

      do {
        let query = cloudinary.search
          .expression(searchExpression)
          .max_results(PAGE_SIZE)
          .sort_by('created_at', 'desc');

        // ✅ FIX: Actually pass next_cursor to the builder
        if (cursor) {
          query = query.next_cursor(cursor);
        }

        const result = await query.execute();
        allResources = allResources.concat(result.resources || []);
        cursor = result.next_cursor || null;
        page++;

        console.log(`  📄 Page ${page}: +${result.resources?.length || 0} items (running total: ${allResources.length})`);
      } while (cursor && page < MAX_PAGES);

      if (cursor && page >= MAX_PAGES) {
        console.warn(`⚠️ Hit MAX_PAGES safety cap (${MAX_PAGES}) — some items may be missing. Raise MAX_PAGES if needed.`);
      }

    } catch (searchError) {
      usedSearchApi = false;
      console.error('❌ Search API error:', searchError.message);
      console.log('⚠️ Falling back to resources API (images + videos, each fully paginated)...');

      const folderPrefix = targetFolder.endsWith('/') ? targetFolder : targetFolder + '/';

      const fetchAllOfType = async (resourceType) => {
        let items = [];
        let cursor = undefined;
        let page = 0;
        do {
          const options = {
            max_results: PAGE_SIZE,
            type: 'upload',
            resource_type: resourceType,
            prefix: folderPrefix,
          };
          if (cursor) options.next_cursor = cursor;

          const result = await cloudinary.api.resources(options);
          items = items.concat(result.resources || []);
          cursor = result.next_cursor || null;
          page++;
        } while (cursor && page < MAX_PAGES);
        return items;
      };

      try {
        const images = await fetchAllOfType('image');
        console.log(`📸 Found ${images.length} images (all pages)`);
        allResources = allResources.concat(images);
      } catch (e) {
        console.log('⚠️ Error fetching images:', e.message);
      }

      try {
        const videos = await fetchAllOfType('video');
        console.log(`🎬 Found ${videos.length} videos (all pages)`);
        allResources = allResources.concat(videos);
      } catch (e) {
        console.log('⚠️ Error fetching videos:', e.message);
      }
    }

    const formattedItems = allResources.map(formatCloudinaryResource);
    console.log(`✅ Returning ALL ${formattedItems.length} items (via ${usedSearchApi ? 'Search API' : 'fallback Resources API'})`);

    return res.json({
      items: formattedItems,
      total: formattedItems.length,
      folder: targetFolder,
      next_cursor: null, // nothing left to paginate — everything is already included
    });

  } catch (error) {
    console.error('❌ Error fetching media:', error);
    return res.status(500).json({
      error: 'Failed to fetch media',
      details: error.message
    });
  }
});

// Get all folders
router.get('/folders', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    console.log('📁 Fetching all folders...');
    
    const result = await cloudinary.api.root_folders({ max_results: 50 });
    
    const rootFolders = result.folders.map(f => f.name);
    console.log(`📁 Found ${rootFolders.length} root folders`);
    
    const rootFolder = process.env.CLOUDINARY_FOLDER || 'power-bank';
    if (!rootFolders.includes(rootFolder)) {
      rootFolders.unshift(rootFolder);
    }
    
    let allFolders = [...rootFolders];
    for (const folder of rootFolders) {
      try {
        const subResult = await cloudinary.api.sub_folders(folder);
        subResult.folders.forEach(sub => {
          allFolders.push(`${folder}/${sub.name}`);
        });
      } catch (e) {
        // Ignore subfolder errors
      }
    }
    
    console.log(`📁 Total folders: ${allFolders.length}`);
    
    return res.json({ 
      folders: allFolders,
      rootFolders: rootFolders
    });
  } catch (error) {
    console.error('❌ Error fetching folders:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch folders',
      details: error.message 
    });
  }
});

// Get subfolders of a specific folder
router.get('/folders/:folder', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const { folder } = req.params;
    console.log(`📁 Fetching subfolders for: ${folder}`);
    
    const result = await cloudinary.api.sub_folders(folder);
    
    return res.json({ 
      folders: result.folders,
      parent: folder
    });
  } catch (error) {
    console.error('❌ Error fetching subfolders:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch subfolders',
      details: error.message 
    });
  }
});

// Delete media - Allow Moderators and Admins
router.delete('/', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    const { public_ids, resource_type } = req.body;
    
    if (!public_ids || !Array.isArray(public_ids) || public_ids.length === 0) {
      return res.status(400).json({ 
        error: 'No public_ids provided' 
      });
    }
    
    console.log(`🗑️ Deleting ${public_ids.length} items...`);
    console.log('  - User Role:', req.user?.role);
    
    const results = [];
    for (const publicId of public_ids) {
      try {
        let type = resource_type || 'image';
        if (publicId.includes('/video/') || publicId.startsWith('video/')) {
          type = 'video';
        }
        
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: type,
          invalidate: true,
        });
        results.push({ publicId, result });
        console.log(`  ✅ Deleted: ${publicId}`);
      } catch (error) {
        console.error(`  ❌ Error deleting ${publicId}:`, error.message);
        results.push({ publicId, error: error.message });
      }
    }
    
    const successful = results.filter(r => r.result?.result === 'ok');
    const failed = results.filter(r => r.error || r.result?.result !== 'ok');
    
    return res.json({
      success: true,
      deleted: successful.length,
      failed: failed.length,
      results,
    });
  } catch (error) {
    console.error('❌ Error deleting media:', error);
    return res.status(500).json({ 
      error: 'Failed to delete media',
      details: error.message 
    });
  }
});

// ============================================
// TEST & DEBUG ROUTES
// ============================================

// Config test
router.get('/config-test', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    console.log('🔍 Testing Cloudinary configuration...');
    
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING',
      folder: process.env.CLOUDINARY_FOLDER || 'power-bank'
    };
    
    const result = await cloudinary.api.ping();
    
    console.log('✅ Cloudinary configuration test passed');
    
    return res.json({
      success: true,
      message: 'Cloudinary is configured correctly',
      config: config,
      ping: result
    });
  } catch (error) {
    console.error('❌ Cloudinary config test failed:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint
router.get('/debug', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    console.log('🔍 DEBUG: Testing Cloudinary API calls');
    
    const results = {
      timestamp: new Date().toISOString(),
      attempts: {}
    };
    
    try {
      const imageResult = await cloudinary.api.resources({
        resource_type: 'image',
        max_results: 10,
        type: 'upload',
      });
      results.attempts.images = {
        success: true,
        count: imageResult.resources?.length || 0,
        sample: imageResult.resources?.slice(0, 3).map(r => ({
          public_id: r.public_id,
          url: r.secure_url
        }))
      };
      console.log(`📸 Debug: Found ${imageResult.resources?.length || 0} images`);
    } catch (error) {
      results.attempts.images = {
        success: false,
        error: error.message
      };
      console.log('⚠️ Debug: Error fetching images:', error.message);
    }
    
    try {
      const videoResult = await cloudinary.api.resources({
        resource_type: 'video',
        max_results: 10,
        type: 'upload',
      });
      results.attempts.videos = {
        success: true,
        count: videoResult.resources?.length || 0,
        sample: videoResult.resources?.slice(0, 3).map(r => ({
          public_id: r.public_id,
          url: r.secure_url
        }))
      };
      console.log(`🎬 Debug: Found ${videoResult.resources?.length || 0} videos`);
    } catch (error) {
      results.attempts.videos = {
        success: false,
        error: error.message
      };
      console.log('⚠️ Debug: Error fetching videos:', error.message);
    }
    
    try {
      const allImages = await cloudinary.api.resources({
        resource_type: 'image',
        max_results: 50,
        type: 'upload',
      });
      
      const allVideos = await cloudinary.api.resources({
        resource_type: 'video',
        max_results: 50,
        type: 'upload',
      });
      
      const combined = [
        ...(allImages.resources || []),
        ...(allVideos.resources || [])
      ];
      
      results.attempts.combined = {
        success: true,
        total: combined.length,
        images: allImages.resources?.length || 0,
        videos: allVideos.resources?.length || 0,
      };
      console.log(`📊 Debug: Total combined items: ${combined.length}`);
    } catch (error) {
      results.attempts.combined = {
        success: false,
        error: error.message
      };
      console.log('⚠️ Debug: Error fetching combined:', error.message);
    }
    
    try {
      const searchResult = await cloudinary.search
        .expression('*')
        .max_results(10)
        .execute();
      
      results.attempts.search = {
        success: true,
        count: searchResult.resources?.length || 0,
        sample: searchResult.resources?.slice(0, 3).map(r => ({
          public_id: r.public_id,
          resource_type: r.resource_type
        }))
      };
      console.log(`🔎 Debug: Search found ${searchResult.resources?.length || 0} items`);
    } catch (error) {
      results.attempts.search = {
        success: false,
        error: error.message
      };
      console.log('⚠️ Debug: Search API error:', error.message);
    }
    
    try {
      const folderResult = await cloudinary.api.root_folders({ max_results: 50 });
      results.folders = folderResult.folders.map(f => f.name);
      console.log(`📁 Debug: Found ${results.folders.length} root folders`);
    } catch (error) {
      results.folders = [];
      results.folderError = error.message;
      console.log('⚠️ Debug: Error fetching folders:', error.message);
    }
    
    results.config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
      folder: process.env.CLOUDINARY_FOLDER || 'power-bank'
    };
    
    console.log('✅ Debug complete');
    
    return res.json(results);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Get all resources without any filters
router.get('/all', protect, isModeratorOrAdmin, async (req, res) => {
  try {
    console.log('📁 Fetching ALL resources from Cloudinary...');
    
    const imageResult = await cloudinary.api.resources({
      resource_type: 'image',
      max_results: 50,
      type: 'upload',
    });
    
    const videoResult = await cloudinary.api.resources({
      resource_type: 'video',
      max_results: 50,
      type: 'upload',
    });
    
    const allItems = [
      ...(imageResult.resources || []),
      ...(videoResult.resources || [])
    ];
    
    console.log(`📊 Found ${allItems.length} total items (${imageResult.resources?.length || 0} images, ${videoResult.resources?.length || 0} videos)`);
    
    return res.json({
      success: true,
      total: allItems.length,
      images: imageResult.resources?.length || 0,
      videos: videoResult.resources?.length || 0,
      items: allItems.map(formatCloudinaryResource),
      next_cursor: imageResult.next_cursor || videoResult.next_cursor || null,
    });
  } catch (error) {
    console.error('❌ Error fetching all resources:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;