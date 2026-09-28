const OrderRestriction = require('../models/OrderRestriction');
const Order = require('../models/Order');
const { getAccurateDeviceInfo } = require('./orderController');

// ========== GET RESTRICTIONS ==========
const getRestrictions = async (req, res) => {
  try {
    const restrictions = await OrderRestriction.getRestrictions();
    res.json({ success: true, data: restrictions });
  } catch (error) {
    console.error('Get restrictions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE IP RESTRICTIONS ==========
const updateIPRestrictions = async (req, res) => {
  try {
    const { timeInterval, blockedIPs } = req.body;
    const userId = req.user?._id;

    let restrictions = await OrderRestriction.getRestrictions();

    if (timeInterval) {
      restrictions.ipRestrictions.timeInterval = {
        enabled: timeInterval.enabled !== undefined ? timeInterval.enabled : restrictions.ipRestrictions.timeInterval.enabled,
        value: timeInterval.value || restrictions.ipRestrictions.timeInterval.value,
        unit: timeInterval.unit || restrictions.ipRestrictions.timeInterval.unit
      };
    }

    if (blockedIPs !== undefined) {
      restrictions.ipRestrictions.blockedIPs = blockedIPs.map(ip => ({
        ip: ip.ip,
        reason: ip.reason || '',
        addedBy: userId,
        addedAt: new Date()
      }));
    }

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'IP restrictions updated successfully' });
  } catch (error) {
    console.error('Update IP restrictions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE PHONE RESTRICTIONS ==========
const updatePhoneRestrictions = async (req, res) => {
  try {
    const { timeInterval, blockedPhones } = req.body;
    const userId = req.user?._id;

    let restrictions = await OrderRestriction.getRestrictions();

    if (timeInterval) {
      restrictions.phoneRestrictions.timeInterval = {
        enabled: timeInterval.enabled !== undefined ? timeInterval.enabled : restrictions.phoneRestrictions.timeInterval.enabled,
        value: timeInterval.value || restrictions.phoneRestrictions.timeInterval.value,
        unit: timeInterval.unit || restrictions.phoneRestrictions.timeInterval.unit
      };
    }

    if (blockedPhones !== undefined) {
      restrictions.phoneRestrictions.blockedPhones = blockedPhones.map(phone => ({
        phone: phone.phone,
        reason: phone.reason || '',
        addedBy: userId,
        addedAt: new Date()
      }));
    }

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'Phone restrictions updated successfully' });
  } catch (error) {
    console.error('Update phone restrictions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== UPDATE EMAIL RESTRICTIONS ==========
const updateEmailRestrictions = async (req, res) => {
  try {
    const { blockedEmails } = req.body;
    const userId = req.user?._id;

    let restrictions = await OrderRestriction.getRestrictions();

    if (blockedEmails !== undefined) {
      restrictions.emailRestrictions.blockedEmails = blockedEmails.map(email => ({
        email: email.email,
        reason: email.reason || '',
        addedBy: userId,
        addedAt: new Date()
      }));
    }

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'Email restrictions updated successfully' });
  } catch (error) {
    console.error('Update email restrictions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== ADD BLOCKED IP ==========
const addBlockedIP = async (req, res) => {
  try {
    const { ip, reason } = req.body;
    const userId = req.user?._id;

    if (!ip) {
      return res.status(400).json({ success: false, error: 'IP address is required' });
    }

    let restrictions = await OrderRestriction.getRestrictions();

    // Check if IP already exists
    const exists = restrictions.ipRestrictions.blockedIPs.some(b => b.ip === ip);
    if (exists) {
      return res.status(400).json({ success: false, error: 'IP already blocked' });
    }

    restrictions.ipRestrictions.blockedIPs.push({
      ip,
      reason: reason || '',
      addedBy: userId,
      addedAt: new Date()
    });

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'IP blocked successfully' });
  } catch (error) {
    console.error('Add blocked IP error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== REMOVE BLOCKED IP ==========
const removeBlockedIP = async (req, res) => {
  try {
    const { ip } = req.params;
    const userId = req.user?._id;

    let restrictions = await OrderRestriction.getRestrictions();

    restrictions.ipRestrictions.blockedIPs = restrictions.ipRestrictions.blockedIPs.filter(b => b.ip !== ip);

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'IP removed from blocklist' });
  } catch (error) {
    console.error('Remove blocked IP error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== ADD BLOCKED PHONE ==========
const addBlockedPhone = async (req, res) => {
  try {
    const { phone, reason } = req.body;
    const userId = req.user?._id;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Phone number is required' });
    }

    let restrictions = await OrderRestriction.getRestrictions();

    // Check if phone already exists
    const exists = restrictions.phoneRestrictions.blockedPhones.some(b => b.phone === phone);
    if (exists) {
      return res.status(400).json({ success: false, error: 'Phone number already blocked' });
    }

    restrictions.phoneRestrictions.blockedPhones.push({
      phone,
      reason: reason || '',
      addedBy: userId,
      addedAt: new Date()
    });

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'Phone blocked successfully' });
  } catch (error) {
    console.error('Add blocked phone error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== REMOVE BLOCKED PHONE ==========
const removeBlockedPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const userId = req.user?._id;

    let restrictions = await OrderRestriction.getRestrictions();

    restrictions.phoneRestrictions.blockedPhones = restrictions.phoneRestrictions.blockedPhones.filter(b => b.phone !== phone);

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'Phone removed from blocklist' });
  } catch (error) {
    console.error('Remove blocked phone error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== ADD BLOCKED EMAIL ==========
const addBlockedEmail = async (req, res) => {
  try {
    const { email, reason } = req.body;
    const userId = req.user?._id;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    let restrictions = await OrderRestriction.getRestrictions();

    // Check if email already exists
    const exists = restrictions.emailRestrictions.blockedEmails.some(b => b.email === email);
    if (exists) {
      return res.status(400).json({ success: false, error: 'Email already blocked' });
    }

    restrictions.emailRestrictions.blockedEmails.push({
      email,
      reason: reason || '',
      addedBy: userId,
      addedAt: new Date()
    });

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'Email blocked successfully' });
  } catch (error) {
    console.error('Add blocked email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== REMOVE BLOCKED EMAIL ==========
const removeBlockedEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const userId = req.user?._id;

    let restrictions = await OrderRestriction.getRestrictions();

    restrictions.emailRestrictions.blockedEmails = restrictions.emailRestrictions.blockedEmails.filter(b => b.email !== email);

    restrictions.lastUpdatedBy = userId;
    restrictions.lastUpdatedAt = new Date();
    await restrictions.save();

    res.json({ success: true, data: restrictions, message: 'Email removed from blocklist' });
  } catch (error) {
    console.error('Remove blocked email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== CHECK ORDER RESTRICTIONS ==========
const checkOrderRestrictions = async (req, res) => {
  try {
    const { phone, email } = req.body;
    const ipAddress = req.clientIP || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    
    const restrictions = await OrderRestriction.getRestrictions();
    const violations = [];

    // Check IP blocking
    const isIPBlocked = restrictions.ipRestrictions.blockedIPs.some(b => b.ip === ipAddress);
    if (isIPBlocked) {
      violations.push({
        type: 'ip_blocked',
        message: 'Your IP address has been blocked from placing orders'
      });
    }

    // Check IP time interval
    if (restrictions.ipRestrictions.timeInterval.enabled) {
      const timeValue = restrictions.ipRestrictions.timeInterval.value;
      const timeUnit = restrictions.ipRestrictions.timeInterval.unit;
      const timeInMs = timeUnit === 'min' ? timeValue * 60 * 1000 : timeValue * 60 * 60 * 1000;
      
      const recentOrder = await Order.findOne({
        'deviceInfo.ipAddress': ipAddress,
        createdAt: { $gte: new Date(Date.now() - timeInMs) }
      }).sort({ createdAt: -1 });

      if (recentOrder) {
        const timeLeft = Math.ceil((timeInMs - (Date.now() - new Date(recentOrder.createdAt).getTime())) / (timeUnit === 'min' ? 60 * 1000 : 60 * 60 * 1000));
        violations.push({
          type: 'ip_time_interval',
          message: `You must wait ${timeLeft} more ${timeUnit === 'min' ? 'minute(s)' : 'hour(s)'} before placing another order from this IP`
        });
      }
    }

    // Check phone blocking
    if (phone) {
      const isPhoneBlocked = restrictions.phoneRestrictions.blockedPhones.some(b => b.phone === phone);
      if (isPhoneBlocked) {
        violations.push({
          type: 'phone_blocked',
          message: 'This phone number has been blocked from placing orders'
        });
      }

      // Check phone time interval
      if (restrictions.phoneRestrictions.timeInterval.enabled) {
        const timeValue = restrictions.phoneRestrictions.timeInterval.value;
        const timeUnit = restrictions.phoneRestrictions.timeInterval.unit;
        const timeInMs = timeUnit === 'min' ? timeValue * 60 * 1000 : timeValue * 60 * 60 * 1000;
        
        const recentOrder = await Order.findOne({
          'customerInfo.phone': phone,
          createdAt: { $gte: new Date(Date.now() - timeInMs) }
        }).sort({ createdAt: -1 });

        if (recentOrder) {
          const timeLeft = Math.ceil((timeInMs - (Date.now() - new Date(recentOrder.createdAt).getTime())) / (timeUnit === 'min' ? 60 * 1000 : 60 * 60 * 1000));
          violations.push({
            type: 'phone_time_interval',
            message: `You must wait ${timeLeft} more ${timeUnit === 'min' ? 'minute(s)' : 'hour(s)'} before placing another order with this phone number`
          });
        }
      }
    }

    // Check email blocking
    if (email) {
      const isEmailBlocked = restrictions.emailRestrictions.blockedEmails.some(b => b.email === email);
      if (isEmailBlocked) {
        violations.push({
          type: 'email_blocked',
          message: 'This email address has been blocked from placing orders'
        });
      }
    }

    res.json({
      success: true,
      data: {
        allowed: violations.length === 0,
        violations,
        ipAddress,
        restrictions: {
          ipBlocked: isIPBlocked,
          phoneBlocked: phone ? restrictions.phoneRestrictions.blockedPhones.some(b => b.phone === phone) : false,
          emailBlocked: email ? restrictions.emailRestrictions.blockedEmails.some(b => b.email === email) : false
        }
      }
    });
  } catch (error) {
    console.error('Check order restrictions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========== GET BLOCKED LISTS ==========
const getBlockedLists = async (req, res) => {
  try {
    const restrictions = await OrderRestriction.getRestrictions();
    res.json({
      success: true,
      data: {
        blockedIPs: restrictions.ipRestrictions.blockedIPs,
        blockedPhones: restrictions.phoneRestrictions.blockedPhones,
        blockedEmails: restrictions.emailRestrictions.blockedEmails
      }
    });
  } catch (error) {
    console.error('Get blocked lists error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getRestrictions,
  updateIPRestrictions,
  updatePhoneRestrictions,
  updateEmailRestrictions,
  addBlockedIP,
  removeBlockedIP,
  addBlockedPhone,
  removeBlockedPhone,
  addBlockedEmail,
  removeBlockedEmail,
  checkOrderRestrictions,
  getBlockedLists
};