// // controllers/popupSettingsController.js
// const PopupSettings = require('../models/PopupSettings');

// // @desc    Get popup settings
// // @route   GET /api/popup-settings
// // @access  Private (Admin/Moderator)
// const getPopupSettings = async (req, res) => {
//   try {
//     const settings = await PopupSettings.getInstance()
//       .populate('updatedBy', 'name email role');
    
//     res.status(200).json({
//       success: true,
//       data: settings
//     });
//   } catch (error) {
//     console.error('Error fetching popup settings:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Update popup settings
// // @route   PUT /api/popup-settings
// // @access  Private (Admin/Moderator)
// const updatePopupSettings = async (req, res) => {
//   try {
//     const {
//       activePopup,
//       priority,
//       newsletter,
//       promotional,
//       globalSettings
//     } = req.body;
    
//     let settings = await PopupSettings.getInstance();
    
//     // Update fields
//     if (activePopup !== undefined) settings.activePopup = activePopup;
//     if (priority !== undefined) settings.priority = priority;
//     if (newsletter !== undefined) {
//       settings.newsletter = {
//         ...settings.newsletter,
//         ...newsletter
//       };
//     }
//     if (promotional !== undefined) {
//       settings.promotional = {
//         ...settings.promotional,
//         ...promotional
//       };
//     }
//     if (globalSettings !== undefined) {
//       settings.globalSettings = {
//         ...settings.globalSettings,
//         ...globalSettings
//       };
//     }
    
//     settings.updatedBy = req.user.id;
//     await settings.save();
    
//     const updatedSettings = await PopupSettings.findById(settings._id)
//       .populate('updatedBy', 'name email role');
    
//     res.status(200).json({
//       success: true,
//       data: updatedSettings,
//       message: 'Popup settings updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating popup settings:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// // @desc    Get public popup configuration for frontend
// // @route   GET /api/popup-config
// // @access  Public
// const getPublicPopupConfig = async (req, res) => {
//   try {
//     const settings = await PopupSettings.getInstance();
    
//     // Return only necessary config for frontend
//     res.status(200).json({
//       success: true,
//       data: {
//         activePopup: settings.activePopup,
//         priority: settings.priority,
//         newsletter: {
//           isActive: settings.newsletter.isActive,
//           intervals: settings.newsletter.intervals,
//           maxShows: settings.newsletter.maxShows
//         },
//         promotional: {
//           isActive: settings.promotional.isActive
//         },
//         globalSettings: settings.globalSettings
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching popup config:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   getPopupSettings,
//   updatePopupSettings,
//   getPublicPopupConfig
// };

// controllers/popupSettingsController.js
const PopupSettings = require('../models/PopupSettings');

// @desc    Get popup settings
// @route   GET /api/popup-settings
// @access  Private (Admin/Moderator)
const getPopupSettings = async (req, res) => {
  try {
    // First get the settings instance
    let settings = await PopupSettings.getInstance();
    
    // Then populate the updatedBy field separately
    if (settings && settings.updatedBy) {
      await settings.populate('updatedBy', 'name email role');
    }
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching popup settings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update popup settings
// @route   PUT /api/popup-settings
// @access  Private (Admin/Moderator)
const updatePopupSettings = async (req, res) => {
  try {
    const {
      activePopup,
      priority,
      newsletter,
      promotional,
      globalSettings
    } = req.body;
    
    let settings = await PopupSettings.getInstance();
    
    // Update fields
    if (activePopup !== undefined) settings.activePopup = activePopup;
    if (priority !== undefined) settings.priority = priority;
    if (newsletter !== undefined) {
      settings.newsletter = {
        ...settings.newsletter,
        ...newsletter
      };
    }
    if (promotional !== undefined) {
      settings.promotional = {
        ...settings.promotional,
        ...promotional
      };
    }
    if (globalSettings !== undefined) {
      settings.globalSettings = {
        ...settings.globalSettings,
        ...globalSettings
      };
    }
    
    settings.updatedBy = req.user.id;
    await settings.save();
    
    // Populate the updatedBy field
    await settings.populate('updatedBy', 'name email role');
    
    res.status(200).json({
      success: true,
      data: settings,
      message: 'Popup settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating popup settings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get public popup configuration for frontend
// @route   GET /api/popup-config
// @access  Public
const getPublicPopupConfig = async (req, res) => {
  try {
    const settings = await PopupSettings.getInstance();
    
    // Return only necessary config for frontend
    res.status(200).json({
      success: true,
      data: {
        activePopup: settings.activePopup,
        priority: settings.priority,
        newsletter: {
          isActive: settings.newsletter.isActive,
          intervals: settings.newsletter.intervals,
          maxShows: settings.newsletter.maxShows
        },
        promotional: {
          isActive: settings.promotional.isActive
        },
        globalSettings: settings.globalSettings
      }
    });
  } catch (error) {
    console.error('Error fetching popup config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getPopupSettings,
  updatePopupSettings,
  getPublicPopupConfig
};