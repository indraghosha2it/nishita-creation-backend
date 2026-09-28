// middleware/ipMiddleware.js

const axios = require('axios');

/**
 * Get public IP address from external service
 */
const getPublicIP = async () => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json', {
      timeout: 3000
    });
    return response.data.ip;
  } catch (error) {
    console.warn('Could not fetch public IP from ipify:', error.message);
    return null;
  }
};

/**
 * Get public IP from ipapi.co (alternative)
 */
const getPublicIPAlternative = async () => {
  try {
    const response = await axios.get('https://ipapi.co/json/', {
      timeout: 3000
    });
    return response.data.ip;
  } catch (error) {
    console.warn('Could not fetch public IP from ipapi:', error.message);
    return null;
  }
};

/**
 * IP Middleware - Gets real IP address from various sources
 */
const ipMiddleware = async (req, res, next) => {
  try {
    // Check for IP in headers (for proxied requests)
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip']; // Cloudflare
    const trueClientIp = req.headers['true-client-ip']; // AWS
    
    let ip = null;
    
    // Priority order for IP detection
    if (cfConnectingIp) {
      ip = cfConnectingIp;
    } else if (trueClientIp) {
      ip = trueClientIp;
    } else if (realIp) {
      ip = realIp;
    } else if (forwardedFor) {
      // Get the first IP from forwarded-for (client IP)
      ip = forwardedFor.split(',')[0].trim();
    } else {
      // Fallback to connection remote address
      ip = req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.ip || 
           null;
    }
    
    // Clean up IPv6 localhost
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }
    
    // Remove IPv6 prefix if present
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    
    // If IP is localhost or private, try to get public IP
    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || 
        ip === '0:0:0:0:0:0:0:1' || ip.startsWith('192.168.') || 
        ip.startsWith('10.') || ip.startsWith('172.')) {
      
      // Try to get public IP from external service
      const publicIP = await getPublicIP() || await getPublicIPAlternative();
      if (publicIP) {
        ip = publicIP;
      }
    }
    
    // Store IP in request for later use
    req.clientIP = ip;
    req.publicIP = ip;
    
    // Also store all detected IPs for debugging
    req.detectedIPs = {
      forwardedFor,
      realIp,
      cfConnectingIp,
      trueClientIp,
      remoteAddress: req.connection?.remoteAddress,
      finalIP: ip
    };
    
    console.log('📍 IP Detection:', {
      finalIP: ip,
      source: forwardedFor ? 'x-forwarded-for' : 
              realIp ? 'x-real-ip' : 
              cfConnectingIp ? 'cf-connecting-ip' : 
              'remote-address'
    });
    
    next();
  } catch (error) {
    console.error('IP middleware error:', error);
    req.clientIP = req.ip || 'unknown';
    next();
  }
};

module.exports = ipMiddleware;