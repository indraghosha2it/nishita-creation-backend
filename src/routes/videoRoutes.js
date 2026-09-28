// const express = require('express');
// const router = express.Router();
// const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
// const {
//   getPublicVideos,
//   getAdminVideos,
//   createVideo,
//   updateVideo,
//   deleteVideo,
//   toggleVideoStatus,
//   reorderVideos
// } = require('../controllers/videoController');

// // ============================================================
// // PUBLIC
// // ============================================================
// router.get('/', getPublicVideos);

// // ============================================================
// // ADMIN
// // ============================================================
// router.get('/admin', protect, isModeratorOrAdmin, getAdminVideos);
// router.post('/admin', protect, isModeratorOrAdmin, createVideo);
// router.put('/admin/reorder', protect, isModeratorOrAdmin, reorderVideos);
// router.put('/admin/:id', protect, isModeratorOrAdmin, updateVideo);
// router.delete('/admin/:id', protect, isModeratorOrAdmin, deleteVideo);
// router.patch('/admin/:id/toggle', protect, isModeratorOrAdmin, toggleVideoStatus);

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect, isModeratorOrAdmin } = require('../middleware/authMiddleware');
const {
  getPublicVideos,
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleVideoStatus,
  toggleVideoFeatured,
  reorderVideos,
  getPublicLiveSessions,
  getAdminLiveSessions,
  createLiveSession,
  updateLiveSession,
  deleteLiveSession,
  toggleLiveSessionStatus
} = require('../controllers/videoController');

// ============================================================
// PUBLIC
// ============================================================
router.get('/live-sessions', getPublicLiveSessions); // must come BEFORE /:id-style routes if any exist
router.get('/', getPublicVideos);

// ============================================================
// ADMIN — LIVE SESSIONS (must be before generic /admin/:id)
// ============================================================
router.get('/admin/live-sessions', protect, isModeratorOrAdmin, getAdminLiveSessions);
router.post('/admin/live-sessions', protect, isModeratorOrAdmin, createLiveSession);
router.put('/admin/live-sessions/:id', protect, isModeratorOrAdmin, updateLiveSession);
router.delete('/admin/live-sessions/:id', protect, isModeratorOrAdmin, deleteLiveSession);
router.patch('/admin/live-sessions/:id/toggle', protect, isModeratorOrAdmin, toggleLiveSessionStatus);

// ============================================================
// ADMIN — VIDEOS
// ============================================================
router.get('/admin', protect, isModeratorOrAdmin, getAdminVideos);
router.post('/admin', protect, isModeratorOrAdmin, createVideo);
router.put('/admin/reorder', protect, isModeratorOrAdmin, reorderVideos);
router.put('/admin/:id', protect, isModeratorOrAdmin, updateVideo);
router.delete('/admin/:id', protect, isModeratorOrAdmin, deleteVideo);
router.patch('/admin/:id/toggle', protect, isModeratorOrAdmin, toggleVideoStatus);
router.patch('/admin/:id/toggle-featured', protect, isModeratorOrAdmin, toggleVideoFeatured);

module.exports = router;