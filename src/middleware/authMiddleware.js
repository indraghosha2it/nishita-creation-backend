

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify token and add user to request
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-secret-key-change-this'
      );

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }

      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};


// NEW: Enhanced role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role ${req.user.role} is not authorized to access this resource`
      });
    }

    next();
  };
};

// NEW: Permission-based authorization
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Permission '${permission}' required`
      });
    }

    next();
  };
};

// Check if user is admin (for backward compatibility)
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  if (!['super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

// Check if user is moderator or admin
const isModeratorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  if (!['super_admin', 'admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Moderator or admin access required'
    });
  }

  next();
};

// NEW: Check if user is call center agent or above
const isCallCenterOrAbove = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  const allowedRoles = ['super_admin', 'admin', 'moderator', 'call_center_agent'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Call center agent or higher access required'
    });
  }

  next();
};

// ========== NEW: AGENT MIDDLEWARE ==========
// Check if user is a call center agent (allows super_admin, admin, moderator, call_center_agent)
const isAgent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  const allowedRoles = ['super_admin', 'admin', 'moderator', 'call_center_agent'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Call center agent or higher access required'
    });
  }

  next();
};

// ========== NEW: STRICT AGENT ONLY ==========
// Check if user is strictly a call center agent (only call_center_agent)
const isAgentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  if (req.user.role !== 'call_center_agent') {
    return res.status(403).json({
      success: false,
      error: 'Call center agent access only'
    });
  }

  next();
};

// Optional protect (for guest access)
const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
      req.user = await User.findById(decoded.id).select('-password');
      console.log('Optional auth - User found:', req.user?._id);
    } catch (error) {
      console.log('Optional auth - No valid token, continuing as guest');
      req.user = null;
    }
  } else {
    req.user = null;
  }
  
  next();
};

module.exports = {
  protect,
  authorize,
  hasPermission,
  isAdmin,
  isModeratorOrAdmin,
  isCallCenterOrAbove,
  isAgent,        // NEW
  isAgentOnly,    // NEW (optional)
  optionalProtect
};