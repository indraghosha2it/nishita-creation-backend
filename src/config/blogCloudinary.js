// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// // Configure Cloudinary (reusing the same config)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Check if Cloudinary is configured
// if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
//   console.error('❌ Cloudinary credentials missing in .env file');
// }

// // Blog Storage Configuration
// const blogStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     // Determine folder structure based on file type
//     let folder = 'blogs';
//     let transformation = [];
    
//     // Set different subfolders and transformations based on file type
//     if (file.fieldname === 'featuredImage') {
//       folder = 'blogs/featured';
//       transformation = [{ width: 1200, height: 630, crop: 'limit' }]; // Blog featured size
//     } 
//     else if (file.fieldname === 'thumbnailImages') {
//       folder = 'blogs/thumbnails';
//       transformation = [{ width: 300, height: 300, crop: 'limit' }]; // Thumbnail size
//     }
//     else if (file.fieldname === 'paragraphImages') {
//       folder = 'blogs/paragraphs';
//       transformation = [{ width: 800, height: 600, crop: 'limit' }]; // In-content images
//     }
//     else if (file.fieldname === 'video') {
//       folder = 'blogs/videos';
//       // Videos don't need image transformations
//       transformation = [];
//     }
    
//     // Set allowed formats based on file type
//     let allowedFormats;
//     if (file.fieldname === 'video') {
//       allowedFormats = ['mp4', 'mov', 'webm', 'avi', 'mpeg'];
//     } else {
//       allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];
//     }
    
//     // Generate unique filename
//     const timestamp = Date.now();
//     const safeName = file.originalname
//       .replace(/[^a-zA-Z0-9.]/g, '-')
//       .replace(/-+/g, '-');
    
//     return {
//       folder: folder,
//       allowed_formats: allowedFormats,
//       transformation: transformation,
//       public_id: `${timestamp}-${safeName.split('.')[0]}`,
//       resource_type: file.fieldname === 'video' ? 'video' : 'image'
//     };
//   }
// });

// // Configure multer for blog uploads
// const uploadBlog = multer({
//   storage: blogStorage,
//   limits: {
//     fileSize: (file) => {
//       // Different limits for videos vs images
//       if (file.fieldname === 'video') {
//         return 50 * 1024 * 1024; // 50MB for videos
//       }
//       return 5 * 1024 * 1024; // 5MB for images
//     }
//   },
//   fileFilter: (req, file, cb) => {
//     // Image files
//     if (file.fieldname !== 'video') {
//       const allowedImageTypes = /jpeg|jpg|png|webp/;
//       const extname = allowedImageTypes.test(file.originalname.toLowerCase());
//       const mimetype = allowedImageTypes.test(file.mimetype);

//       if (mimetype && extname) {
//         return cb(null, true);
//       } else {
//         return cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed for images'), false);
//       }
//     }
    
//     // Video files
//     if (file.fieldname === 'video') {
//       const allowedVideoTypes = /mp4|mov|webm|avi|mpeg/;
//       const allowedMimeTypes = [
//         'video/mp4', 
//         'video/quicktime', 
//         'video/webm', 
//         'video/x-msvideo', 
//         'video/mpeg'
//       ];
      
//       const extname = allowedVideoTypes.test(file.originalname.toLowerCase());
//       const mimetype = allowedMimeTypes.includes(file.mimetype);

//       if (mimetype && extname) {
//         return cb(null, true);
//       } else {
//         return cb(new Error('Only video files (mp4, mov, webm, avi, mpeg) are allowed for videos'), false);
//       }
//     }
    
//     cb(new Error('Unexpected file field'), false);
//   }
// });

// // Helper function for blog file uploads
// const uploadBlogFiles = (fields) => {
//   return uploadBlog.fields(fields);
// };

// // Helper function to delete blog files from Cloudinary
// const deleteBlogFile = (publicId, resourceType = 'image') => {
//   if (!publicId) return Promise.resolve(false);
  
//   return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
//     .then(result => result.result === 'ok')
//     .catch(error => {
//       console.error(`Error deleting blog ${resourceType} from Cloudinary:`, error);
//       return false;
//     });
// };

// // Helper function to delete multiple blog files
// const deleteMultipleBlogFiles = (files) => {
//   if (!files || files.length === 0) return Promise.resolve(true);
  
//   const deletePromises = files.map(file => {
//     const publicId = file.publicId || (file.url ? extractPublicIdFromUrl(file.url) : null);
//     const resourceType = file.resourceType || (file.url?.includes('/video/') ? 'video' : 'image');
    
//     if (publicId) {
//       return deleteBlogFile(publicId, resourceType);
//     }
//     return Promise.resolve(false);
//   });
  
//   return Promise.all(deletePromises)
//     .then(results => results.every(result => result === true))
//     .catch(error => {
//       console.error('Error deleting multiple blog files from Cloudinary:', error);
//       return false;
//     });
// };

// // Helper function to extract public ID from Cloudinary URL (reuse from your existing file)
// const extractPublicIdFromUrl = (url) => {
//   if (!url) return null;
  
//   try {
//     // Handle both image and video URLs
//     const parts = url.split('/');
//     const versionIndex = parts.findIndex(part => part.startsWith('v') && /^\d+$/.test(part.substring(1)));
    
//     if (versionIndex !== -1) {
//       const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
//       const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
//       return publicId;
//     } else {
//       const matches = url.match(/\/v\d+\/(.+)\./);
//       if (matches && matches[1]) {
//         return matches[1];
//       }
//     }
//   } catch (error) {
//     console.error('Error extracting public ID from URL:', error);
//   }
  
//   return null;
// };

// module.exports = {
//   cloudinary, // Export the same cloudinary instance
//   uploadBlog,
//   uploadBlogFiles,
//   deleteBlogFile,
//   deleteMultipleBlogFiles,
//   extractPublicIdFromUrl
// };


const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary credentials missing in .env file');
}

// Blog Storage Configuration
const blogStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder and resource type based on file type
    let folder = 'blogs';
    let resourceType = 'auto';
    let format;
    
    if (file.fieldname === 'video') {
      folder = 'blogs/videos';
      resourceType = 'video';
      // Get the file extension
      const ext = file.originalname.split('.').pop().toLowerCase();
      format = ext;
    } else if (file.fieldname === 'featuredImage') {
      folder = 'blogs/featured';
      resourceType = 'image';
    } else if (file.fieldname === 'thumbnailImages') {
      folder = 'blogs/thumbnails';
      resourceType = 'image';
    } else if (file.fieldname === 'paragraphImages') {
      folder = 'blogs/paragraphs';
      resourceType = 'image';
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9.]/g, '-')
      .replace(/-+/g, '-');
    const publicId = `${folder}/${timestamp}-${safeName.split('.')[0]}`;
    
    return {
      folder: folder,
      public_id: publicId,
      resource_type: resourceType,
      format: format
    };
  }
});

// Configure multer for blog uploads with increased limits
const uploadBlog = multer({
  storage: blogStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Increase to 100MB for videos
  },
  fileFilter: (req, file, cb) => {
    console.log('File upload attempt:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Video files
    if (file.fieldname === 'video') {
      const allowedVideoTypes = [
        'video/mp4', 
        'video/webm', 
        'video/quicktime', 
        'video/x-msvideo', 
        'video/mpeg',
        'video/x-matroska'
      ];
      const allowedExtensions = /mp4|webm|mov|avi|mpeg|mkv/i;
      
      const extname = allowedExtensions.test(file.originalname.toLowerCase());
      const mimetype = allowedVideoTypes.includes(file.mimetype) || file.mimetype.startsWith('video/');

      if (mimetype || extname) {
        return cb(null, true);
      } else {
        return cb(new Error('Only video files (mp4, webm, mov, avi, mpeg) are allowed for videos'), false);
      }
    }
    
    // Image files
    else {
      const allowedImageTypes = /jpeg|jpg|png|webp/i;
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      const extname = allowedImageTypes.test(file.originalname.toLowerCase());
      const mimetype = allowedMimeTypes.includes(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        return cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed for images'), false);
      }
    }
  }
});

// Helper function for blog file uploads
const uploadBlogFiles = (fields) => {
  return uploadBlog.fields(fields);
};

// Helper function to delete blog files from Cloudinary
const deleteBlogFile = (publicId, resourceType = 'image') => {
  if (!publicId) return Promise.resolve(false);
  
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    .then(result => {
      console.log(`Deleted ${resourceType}: ${publicId}`, result);
      return result.result === 'ok';
    })
    .catch(error => {
      console.error(`Error deleting blog ${resourceType} from Cloudinary:`, error);
      return false;
    });
};

// Helper function to delete multiple blog files
const deleteMultipleBlogFiles = (files) => {
  if (!files || files.length === 0) return Promise.resolve(true);
  
  const deletePromises = files.map(file => {
    const publicId = file.publicId || (file.url ? extractPublicIdFromUrl(file.url) : null);
    const resourceType = file.resourceType || (file.url?.includes('/video/') ? 'video' : 'image');
    
    if (publicId) {
      return deleteBlogFile(publicId, resourceType);
    }
    return Promise.resolve(false);
  });
  
  return Promise.all(deletePromises)
    .then(results => results.every(result => result === true))
    .catch(error => {
      console.error('Error deleting multiple blog files from Cloudinary:', error);
      return false;
    });
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Handle both image and video URLs
    const parts = url.split('/');
    const versionIndex = parts.findIndex(part => part.startsWith('v') && /^\d+$/.test(part.substring(1)));
    
    if (versionIndex !== -1) {
      const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      return publicId;
    } else {
      const matches = url.match(/\/v\d+\/(.+)\./);
      if (matches && matches[1]) {
        return matches[1];
      }
    }
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
  }
  
  return null;
};

module.exports = {
  cloudinary,
  uploadBlog,
  uploadBlogFiles,
  deleteBlogFile,
  deleteMultipleBlogFiles,
  extractPublicIdFromUrl
};