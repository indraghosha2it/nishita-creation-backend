


const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin, isAdmin } = require('../middleware/authMiddleware');
const { uploadBlogFiles } = require('../config/blogCloudinary'); // Import from new file
const {
  createBlog,
  getBlogs,
  getAllBlogsAdmin,
  getBlogById,
  getBlogForEdit,
  updateBlog,
  deleteBlog,
  toggleBlogStatus
} = require('../controllers/blogController');

// ========== PUBLIC ROUTES ==========
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// ========== PROTECTED ROUTES (All require authentication) ==========
router.use(protect);

// ========== ADMIN/MODERATOR ROUTES ==========
router.get('/admin/all', isModeratorOrAdmin, getAllBlogsAdmin);
router.get('/admin/:id', isModeratorOrAdmin, getBlogForEdit);

// Create blog - with file uploads using blogCloudinary
router.post('/',
  isModeratorOrAdmin,
 
  createBlog
);

// Update blog - with increased limits
// router.put('/admin/:id',
//   isModeratorOrAdmin,
//   (req, res, next) => {
//     // Log the request
//     console.log('PUT request received for blog update');
//     next();
//   },
//   uploadBlogFiles([
//     { name: 'featuredImage', maxCount: 1 },
//     { name: 'thumbnailImages', maxCount: 10 },
//     { name: 'paragraphImages', maxCount: 20 },
//     { name: 'video', maxCount: 1 }
//   ]),
//   (err, req, res, next) => {
//     // Handle multer errors
//     if (err) {
//       console.error('Multer error:', err);
//       return res.status(400).json({
//         success: false,
//         error: err.message || 'File upload error'
//       });
//     }
//     next();
//   },
//   updateBlog
// );


router.put('/admin/:id',
  isModeratorOrAdmin,
  updateBlog
);

// ========== ADMIN ONLY ROUTES ==========
router.delete('/admin/:id', isAdmin, deleteBlog);
router.put('/admin/:id/toggle', isAdmin, toggleBlogStatus);

module.exports = router;