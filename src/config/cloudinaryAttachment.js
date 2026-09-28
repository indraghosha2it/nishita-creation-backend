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

// Storage for inquiry attachments - with exact allowed types
const attachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on mimetype
    let resourceType = 'auto';
    let format = '';
    
    if (file.mimetype === 'application/pdf') {
      resourceType = 'raw';
      format = 'pdf';
    } else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      resourceType = 'image';
      format = 'jpg';
    } else if (file.mimetype === 'image/png') {
      resourceType = 'image';
      format = 'png';
    }
    
    return {
      folder: 'b2b-inquiry-attachments',
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      format: format,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    };
  }
});

// Configure multer for attachments with exact allowed types
const uploadAttachment = multer({
  storage: attachmentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Exact allowed types from requirement
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG images and PDF files are allowed.'), false);
    }
  }
});

// Helper function to delete attachment from Cloudinary
const deleteAttachment = (publicId, resourceType = 'auto') => {
  if (!publicId) return Promise.resolve(false);
  
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    .then(result => result.result === 'ok')
    .catch(error => {
      console.error('Error deleting attachment from Cloudinary:', error);
      return false;
    });
};

// Helper function to delete multiple attachments
const deleteMultipleAttachments = (attachments) => {
  if (!attachments || attachments.length === 0) return Promise.resolve(true);
  
  const deletePromises = attachments.map(att => {
    const publicId = extractAttachmentPublicId(att.fileUrl);
    const resourceType = att.fileType === 'application/pdf' ? 'raw' : 'image';
    return deleteAttachment(publicId, resourceType);
  });
  
  return Promise.all(deletePromises)
    .then(results => results.every(result => result === true))
    .catch(error => {
      console.error('Error deleting multiple attachments from Cloudinary:', error);
      return false;
    });
};

// Helper function to extract public ID from Cloudinary URL
const extractAttachmentPublicId = (url) => {
  if (!url) return null;
  
  try {
    // For raw files (PDFs)
    if (url.includes('/raw/upload/')) {
      const parts = url.split('/raw/upload/');
      if (parts.length > 1) {
        let afterUpload = parts[1];
        // Remove version if present (e.g., v1234567890/)
        const versionMatch = afterUpload.match(/^v\d+\//);
        if (versionMatch) {
          afterUpload = afterUpload.substring(versionMatch[0].length);
        }
        // Remove file extension
        return afterUpload.replace(/\.[^/.]+$/, "");
      }
    }
    
    // For images
    if (url.includes('/image/upload/')) {
      const parts = url.split('/image/upload/');
      if (parts.length > 1) {
        let afterUpload = parts[1];
        // Remove version if present
        const versionMatch = afterUpload.match(/^v\d+\//);
        if (versionMatch) {
          afterUpload = afterUpload.substring(versionMatch[0].length);
        }
        // Remove file extension
        return afterUpload.replace(/\.[^/.]+$/, "");
      }
    }
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
  }
  
  return null;
};

module.exports = {
  cloudinary,
  uploadAttachment,
  deleteAttachment,
  deleteMultipleAttachments,
  extractAttachmentPublicId
};