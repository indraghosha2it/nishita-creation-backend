// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Check if Cloudinary is configured
// if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
//   console.error('❌ Cloudinary credentials missing in .env file');
// }

// // Configure storage
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'b2b-categories',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [{ width: 500, height: 500, crop: 'limit' }]
//   }
// });

// // Configure multer
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|webp/;
//     const extname = allowedTypes.test(file.originalname.toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
//     }
//   }
// });

// module.exports = { cloudinary, upload };






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

// Storage for categories (your existing)
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jute-categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Storage for products (new)
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'toys-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
  }
});

// Configure multer for categories
const upload = multer({
  storage: categoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  }
});

// Configure multer for products
const uploadProduct = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  }
});

// Helper function for multiple image upload
const uploadMultiple = (fieldName, maxCount) => {
  return uploadProduct.array(fieldName, maxCount);
};

// Helper functions for deleting images (these are synchronous wrappers, not using await here)
const deleteImage = (publicId) => {
  // Return a promise, don't await here
  return cloudinary.uploader.destroy(publicId)
    .then(result => result.result === 'ok')
    .catch(error => {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    });
};

const deleteMultipleImages = (publicIds) => {
  if (!publicIds || publicIds.length === 0) return Promise.resolve(true);
  
  const deletePromises = publicIds.map(publicId => deleteImage(publicId));
  return Promise.all(deletePromises)
    .then(results => results.every(result => result === true))
    .catch(error => {
      console.error('Error deleting multiple images from Cloudinary:', error);
      return false;
    });
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
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
  upload, 
  uploadProduct,
  uploadMultiple,
  deleteImage,
  deleteMultipleImages,
  extractPublicIdFromUrl
};