// const Video = require('../models/Video');

// // ============================================================
// // PUBLIC: Get all active videos
// // @route   GET /api/videos
// // @access  Public
// // ============================================================
// const getPublicVideos = async (req, res) => {
//   try {
//     const videos = await Video.find({ isActive: true })
//       .sort({ displayOrder: 1, createdAt: 1 })
//       .lean();

//     res.json({ success: true, data: videos });
//   } catch (error) {
//     console.error('❌ Get public videos error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching videos'
//     });
//   }
// };

// // ============================================================
// // ADMIN: Get all videos
// // @route   GET /api/videos/admin
// // @access  Private (Moderator/Admin)
// // ============================================================
// const getAdminVideos = async (req, res) => {
//   try {
//     const videos = await Video.find()
//       .sort({ displayOrder: 1, createdAt: 1 })
//       .lean();

//     res.json({ success: true, data: videos });
//   } catch (error) {
//     console.error('❌ Get admin videos error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while fetching videos'
//     });
//   }
// };

// // ============================================================
// // ADMIN: Create video
// // @route   POST /api/videos/admin
// // ============================================================
// const createVideo = async (req, res) => {
//   try {
//     const {
//       title,
//       type,
//       sourceType,
//       videoUrl,
//       videoPublicId,
//       embedUrl,
//       thumbnail,
//       displayOrder,
//       isActive
//     } = req.body;

//     if (!type) {
//       return res.status(400).json({ success: false, error: 'Video type is required' });
//     }

//     // Validate that either videoUrl OR embedUrl is provided based on sourceType
//     if (sourceType === 'upload' && !videoUrl) {
//       return res.status(400).json({ success: false, error: 'Video file is required' });
//     }
//     if (sourceType !== 'upload' && !embedUrl) {
//       return res.status(400).json({ success: false, error: 'Embed link is required' });
//     }

//     const video = await Video.create({
//       title: title || '',
//       type,
//       sourceType: sourceType || 'upload',
//       videoUrl: videoUrl || '',
//       videoPublicId: videoPublicId || '',
//       embedUrl: embedUrl || '',
//       thumbnail: thumbnail || '',
//       displayOrder: displayOrder !== undefined ? displayOrder : 0,
//       isActive: isActive !== undefined ? isActive : true
//     });

//     res.status(201).json({
//       success: true,
//       data: video,
//       message: 'Video created successfully'
//     });
//   } catch (error) {
//     console.error('❌ Create video error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while creating video'
//     });
//   }
// };

// // ============================================================
// // ADMIN: Update video
// // @route   PUT /api/videos/admin/:id
// // ============================================================
// const updateVideo = async (req, res) => {
//   try {
//     const video = await Video.findById(req.params.id);
//     if (!video) {
//       return res.status(404).json({ success: false, error: 'Video not found' });
//     }

//     const fields = [
//       'title',
//       'type',
//       'sourceType',
//       'videoUrl',
//       'videoPublicId',
//       'embedUrl',
//       'thumbnail',
//       'displayOrder',
//       'isActive'
//     ];

//     fields.forEach((f) => {
//       if (req.body[f] !== undefined) video[f] = req.body[f];
//     });

//     await video.save();

//     res.json({
//       success: true,
//       data: video,
//       message: 'Video updated successfully'
//     });
//   } catch (error) {
//     console.error('❌ Update video error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while updating video'
//     });
//   }
// };

// // ============================================================
// // ADMIN: Delete video
// // @route   DELETE /api/videos/admin/:id
// // ============================================================
// const deleteVideo = async (req, res) => {
//   try {
//     const video = await Video.findById(req.params.id);
//     if (!video) {
//       return res.status(404).json({ success: false, error: 'Video not found' });
//     }

//     await video.deleteOne();

//     res.json({ success: true, message: 'Video deleted successfully' });
//   } catch (error) {
//     console.error('❌ Delete video error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while deleting video'
//     });
//   }
// };

// // ============================================================
// // ADMIN: Toggle video status
// // @route   PATCH /api/videos/admin/:id/toggle
// // ============================================================
// const toggleVideoStatus = async (req, res) => {
//   try {
//     const video = await Video.findById(req.params.id);
//     if (!video) {
//       return res.status(404).json({ success: false, error: 'Video not found' });
//     }

//     video.isActive = !video.isActive;
//     await video.save();

//     res.json({
//       success: true,
//       data: video,
//       message: `Video ${video.isActive ? 'activated' : 'deactivated'}`
//     });
//   } catch (error) {
//     console.error('❌ Toggle video error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while toggling video'
//     });
//   }
// };

// // ============================================================
// // ADMIN: Reorder videos
// // @route   PUT /api/videos/admin/reorder
// // ============================================================
// const reorderVideos = async (req, res) => {
//   try {
//     const { orders } = req.body;
//     if (!Array.isArray(orders)) {
//       return res.status(400).json({ success: false, error: 'Orders array is required' });
//     }

//     const bulkOps = orders.map((item) => ({
//       updateOne: {
//         filter: { _id: item.id },
//         update: { displayOrder: item.displayOrder }
//       }
//     }));

//     if (bulkOps.length > 0) await Video.bulkWrite(bulkOps);

//     const videos = await Video.find()
//       .sort({ displayOrder: 1, createdAt: 1 })
//       .lean();

//     res.json({
//       success: true,
//       data: videos,
//       message: 'Videos reordered successfully'
//     });
//   } catch (error) {
//     console.error('❌ Reorder videos error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message || 'Server error while reordering videos'
//     });
//   }
// };

// module.exports = {
//   getPublicVideos,
//   getAdminVideos,
//   createVideo,
//   updateVideo,
//   deleteVideo,
//   toggleVideoStatus,
//   reorderVideos
// };


const { Video, LiveSession } = require('../models/Video');

// ============================================================
// VIDEO — PUBLIC
// ============================================================
const getPublicVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    res.json({ success: true, data: videos });
  } catch (error) {
    console.error('❌ Get public videos error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching videos'
    });
  }
};

// ============================================================
// VIDEO — ADMIN
// ============================================================
const getAdminVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    res.json({ success: true, data: videos });
  } catch (error) {
    console.error('❌ Get admin videos error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching videos'
    });
  }
};

const createVideo = async (req, res) => {
  try {
    const {
      title, type, sourceType, videoUrl, videoPublicId,
      embedUrl, thumbnail, isFeatured, displayOrder, isActive
    } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, error: 'Video type is required' });
    }
    if (sourceType === 'upload' && !videoUrl) {
      return res.status(400).json({ success: false, error: 'Video file is required' });
    }
    if (sourceType !== 'upload' && !embedUrl) {
      return res.status(400).json({ success: false, error: 'Embed link is required' });
    }

    const video = await Video.create({
      title: title || '',
      type,
      sourceType: sourceType || 'upload',
      videoUrl: videoUrl || '',
      videoPublicId: videoPublicId || '',
      embedUrl: embedUrl || '',
      thumbnail: thumbnail || '',
      isFeatured: !!isFeatured,
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      data: video,
      message: 'Video created successfully'
    });
  } catch (error) {
    console.error('❌ Create video error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating video'
    });
  }
};

const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const fields = [
      'title', 'type', 'sourceType', 'videoUrl', 'videoPublicId',
      'embedUrl', 'thumbnail', 'isFeatured', 'displayOrder', 'isActive'
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) video[f] = req.body[f];
    });

    await video.save();
    res.json({
      success: true,
      data: video,
      message: 'Video updated successfully'
    });
  } catch (error) {
    console.error('❌ Update video error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating video'
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    await video.deleteOne();
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('❌ Delete video error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting video'
    });
  }
};

const toggleVideoStatus = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    video.isActive = !video.isActive;
    await video.save();
    res.json({
      success: true,
      data: video,
      message: `Video ${video.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    console.error('❌ Toggle video error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling video'
    });
  }
};

const toggleVideoFeatured = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    video.isFeatured = !video.isFeatured;
    await video.save();
    res.json({
      success: true,
      data: video,
      message: `Video ${video.isFeatured ? 'marked as featured' : 'removed from featured'}`
    });
  } catch (error) {
    console.error('❌ Toggle featured error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling featured'
    });
  }
};

const reorderVideos = async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, error: 'Orders array is required' });
    }
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { displayOrder: item.displayOrder }
      }
    }));
    if (bulkOps.length > 0) await Video.bulkWrite(bulkOps);
    const videos = await Video.find()
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    res.json({
      success: true,
      data: videos,
      message: 'Videos reordered successfully'
    });
  } catch (error) {
    console.error('❌ Reorder videos error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while reordering videos'
    });
  }
};

// ============================================================
// LIVE SESSIONS — PUBLIC
// ============================================================
const getPublicLiveSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find({ isActive: true })
      .sort({ scheduledAt: 1, displayOrder: 1 })
      .lean();
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('❌ Get public live sessions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching live sessions'
    });
  }
};

// ============================================================
// LIVE SESSIONS — ADMIN
// ============================================================
const getAdminLiveSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find()
      .sort({ scheduledAt: 1, displayOrder: 1 })
      .lean();
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('❌ Get admin live sessions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching live sessions'
    });
  }
};

const createLiveSession = async (req, res) => {
  try {
    const { title, scheduledAt, link, displayOrder, isActive } = req.body;
    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        error: 'Date & time is required'
      });
    }
    const session = await LiveSession.create({
      title: (title || '').trim(),
      scheduledAt: new Date(scheduledAt),
      link: (link || '').trim(),
      displayOrder: displayOrder !== undefined ? displayOrder : 0,
      isActive: isActive !== undefined ? isActive : true
    });
    res.status(201).json({
      success: true,
      data: session,
      message: 'Live session created successfully'
    });
  } catch (error) {
    console.error('❌ Create live session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while creating live session'
    });
  }
};

const updateLiveSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Live session not found' });
    }
    const fields = ['title', 'link', 'displayOrder', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) session[f] = req.body[f];
    });
    if (req.body.scheduledAt !== undefined) {
      session.scheduledAt = new Date(req.body.scheduledAt);
    }
    await session.save();
    res.json({
      success: true,
      data: session,
      message: 'Live session updated successfully'
    });
  } catch (error) {
    console.error('❌ Update live session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while updating live session'
    });
  }
};

const deleteLiveSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Live session not found' });
    }
    await session.deleteOne();
    res.json({ success: true, message: 'Live session deleted successfully' });
  } catch (error) {
    console.error('❌ Delete live session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while deleting live session'
    });
  }
};

const toggleLiveSessionStatus = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Live session not found' });
    }
    session.isActive = !session.isActive;
    await session.save();
    res.json({
      success: true,
      data: session,
      message: `Live session ${session.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    console.error('❌ Toggle live session error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while toggling live session'
    });
  }
};

module.exports = {
  // videos
  getPublicVideos,
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleVideoStatus,
  toggleVideoFeatured,
  reorderVideos,
  // live sessions
  getPublicLiveSessions,
  getAdminLiveSessions,
  createLiveSession,
  updateLiveSession,
  deleteLiveSession,
  toggleLiveSessionStatus
};