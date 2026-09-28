
// const DeliverySettings = require('../models/DeliverySettings');

// // @desc    Get delivery settings
// // @route   GET /api/delivery/settings
// // @access  Public
// const getDeliverySettings = async (req, res) => {
//   try {
//     const settings = await DeliverySettings.getSettings();
//     res.json({
//       success: true,
//       data: {
//         insideDhaka: settings.insideDhaka,
//         outsideDhaka: settings.outsideDhaka,
//         subCityCharges: settings.subCityCharges || []
//       }
//     });
//   } catch (error) {
//     console.error('Get delivery settings error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Update delivery settings (Admin only)
// // @route   PUT /api/delivery/settings
// // @access  Private (Admin only)
// const updateDeliverySettings = async (req, res) => {
//   try {
//     const { insideDhaka, outsideDhaka, subCityCharges } = req.body;
    
//     let settings = await DeliverySettings.findOne();
    
//     if (!settings) {
//       settings = new DeliverySettings();
//     }
    
//     if (insideDhaka !== undefined) settings.insideDhaka = insideDhaka;
//     if (outsideDhaka !== undefined) settings.outsideDhaka = outsideDhaka;
    
//     if (subCityCharges !== undefined && Array.isArray(subCityCharges)) {
//       // Remove duplicates based on upazila name
//       const uniqueCharges = subCityCharges.reduce((acc, current) => {
//         const exists = acc.find(item => item.upazila === current.upazila);
//         if (!exists) {
//           acc.push(current);
//         }
//         return acc;
//       }, []);
//       settings.subCityCharges = uniqueCharges;
//     }
    
//     settings.updatedBy = req.user._id;
//     settings.lastUpdated = new Date();
    
//     await settings.save();
    
//     res.json({
//       success: true,
//       data: {
//         insideDhaka: settings.insideDhaka,
//         outsideDhaka: settings.outsideDhaka,
//         subCityCharges: settings.subCityCharges || []
//       },
//       message: 'Delivery settings updated successfully'
//     });
//   } catch (error) {
//     console.error('Update delivery settings error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // @desc    Calculate delivery charge based on city and zone
// // @route   POST /api/delivery/calculate
// // @access  Public
// const calculateDeliveryCharge = async (req, res) => {
//   try {
//     const { city, zone } = req.body;
    
//     if (!city) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'City is required' 
//       });
//     }
    
//     const settings = await DeliverySettings.getSettings();
//     const charge = settings.getDeliveryCharge(city, zone);
    
//     res.json({
//       success: true,
//       data: { charge }
//     });
//   } catch (error) {
//     console.error('Calculate delivery charge error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// module.exports = {
//   getDeliverySettings,
//   updateDeliverySettings,
//   calculateDeliveryCharge
// };


const DeliverySettings = require('../models/DeliverySettings');

// @desc    Get delivery settings
// @route   GET /api/delivery/settings
// @access  Public
const getDeliverySettings = async (req, res) => {
  try {
    const settings = await DeliverySettings.getSettings();
    res.json({
      success: true,
      data: {
        insideDhaka: settings.insideDhaka,
        outsideDhaka: settings.outsideDhaka,
        subCityCharges: settings.subCityCharges || [],
        unionCharges: settings.unionCharges || [] // NEW
      }
    });
  } catch (error) {
    console.error('Get delivery settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update delivery settings
// @route   PUT /api/delivery/settings
// @access  Private (Admin only)
const updateDeliverySettings = async (req, res) => {
  try {
    const { insideDhaka, outsideDhaka, subCityCharges, unionCharges } = req.body;
    
    let settings = await DeliverySettings.findOne();
    
    if (!settings) {
      settings = new DeliverySettings();
    }
    
    if (insideDhaka !== undefined) settings.insideDhaka = insideDhaka;
    if (outsideDhaka !== undefined) settings.outsideDhaka = outsideDhaka;
    
    // Update sub-city charges (Upazila level)
    if (subCityCharges !== undefined && Array.isArray(subCityCharges)) {
      const uniqueCharges = subCityCharges.reduce((acc, current) => {
        const exists = acc.find(item => item.upazila === current.upazila);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      settings.subCityCharges = uniqueCharges;
    }
    
    // NEW: Update union charges (Union/Area level)
    if (unionCharges !== undefined && Array.isArray(unionCharges)) {
      const uniqueCharges = unionCharges.reduce((acc, current) => {
        const exists = acc.find(
          item => item.upazila === current.upazila && item.union === current.union
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      settings.unionCharges = uniqueCharges;
    }
    
    settings.updatedBy = req.user._id;
    settings.lastUpdated = new Date();
    
    await settings.save();
    
    res.json({
      success: true,
      data: {
        insideDhaka: settings.insideDhaka,
        outsideDhaka: settings.outsideDhaka,
        subCityCharges: settings.subCityCharges || [],
        unionCharges: settings.unionCharges || [] // NEW
      },
      message: 'Delivery settings updated successfully'
    });
  } catch (error) {
    console.error('Update delivery settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Calculate delivery charge based on city, zone, and area
// @route   POST /api/delivery/calculate
// @access  Public
const calculateDeliveryCharge = async (req, res) => {
  try {
    const { city, zone, area } = req.body;
    
    if (!city) {
      return res.status(400).json({ 
        success: false, 
        error: 'City is required' 
      });
    }
    
    const settings = await DeliverySettings.getSettings();
    const charge = settings.getDeliveryCharge(city, zone, area);
    
    res.json({
      success: true,
      data: { charge }
    });
  } catch (error) {
    console.error('Calculate delivery charge error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDeliverySettings,
  updateDeliverySettings,
  calculateDeliveryCharge
};