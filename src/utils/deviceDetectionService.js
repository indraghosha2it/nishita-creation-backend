// utils/deviceDetectionService.js

const axios = require('axios');
const UAParser = require('ua-parser-js');

/**
 * Get device info using multiple detection methods
 */
class DeviceDetectionService {
  constructor() {
    this.apiKey = process.env.DEVICE_DETECTION_API_KEY || '';
    this.apiUrl = process.env.DEVICE_DETECTION_API_URL || 'https://api.deviceatlas.com/v2/device';
    this.enableAPI = process.env.ENABLE_DEVICE_DETECTION_API === 'true';
  }

  /**
   * Detect device using API (most accurate)
   */
  async detectWithAPI(userAgent, ip) {
    if (!this.enableAPI || !this.apiKey) {
      console.log('ℹ️ Device API not enabled or no API key provided');
      return null;
    }

    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          userAgent: userAgent,
          ip: ip,
          apiKey: this.apiKey
        },
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.properties) {
        const props = response.data.properties;
        return {
          deviceName: props.model || null,
          deviceBrand: props.vendor || null,
          deviceModel: props.model || null,
          deviceType: props.category || null,
          os: props.osName || null,
          osVersion: props.osVersion || null,
          browser: props.browserName || null,
          browserVersion: props.browserVersion || null,
          screenResolution: props.screenWidth && props.screenHeight ? 
            `${props.screenWidth}x${props.screenHeight}` : null,
          isMobile: props.isMobile || false,
          isTablet: props.isTablet || false,
          isDesktop: props.isDesktop || false,
          confidence: props.confidence || 'high'
        };
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Device API error:', error.message);
      return null;
    }
  }

  /**
   * Detect device using UA Parser (fallback)
   */
  detectWithUAParser(userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    // Get device type
    let deviceType = result.device.type || 'unknown';
    if (deviceType === '') {
      if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
        deviceType = 'mobile';
      } else if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }
    }

    // Build device name
    let deviceName = '';
    const device = result.device;
    const os = result.os;
    const browser = result.browser;

    // Try to get brand and model
    const brand = device.vendor || '';
    const model = device.model || '';

    if (brand && model) {
      deviceName = `${brand} ${model}`;
    } else if (brand) {
      deviceName = brand;
    } else if (model) {
      deviceName = model;
    } else if (os.name) {
      deviceName = `${os.name} ${deviceType === 'desktop' ? 'PC' : deviceType}`;
    } else {
      deviceName = `${deviceType || 'Unknown'} Device`;
    }

    return {
      deviceName: deviceName.trim(),
      deviceBrand: brand || null,
      deviceModel: model || null,
      deviceType: deviceType,
      os: os.name || 'unknown',
      osVersion: os.version || 'unknown',
      browser: browser.name || 'unknown',
      browserVersion: browser.version || 'unknown',
      platform: os.name || 'unknown'
    };
  }

  /**
   * Get location info from IP
   */
  async getLocationFromIP(ip) {
    if (!ip || ip === '127.0.0.1' || ip === 'unknown') {
      return null;
    }

    try {
      const response = await axios.get(`http://ip-api.com/json/${ip}`, {
        timeout: 3000,
        params: {
          fields: 'status,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as'
        }
      });

      if (response.data && response.data.status === 'success') {
        return {
          country: response.data.country,
          countryCode: response.data.countryCode,
          region: response.data.regionName,
          city: response.data.city,
          latitude: response.data.lat,
          longitude: response.data.lon,
          timezone: response.data.timezone,
          isp: response.data.isp,
          organization: response.data.org,
          as: response.data.as
        };
      }
      return null;
    } catch (error) {
      console.warn('⚠️ IP Location API error:', error.message);
      return null;
    }
  }

  /**
   * Get complete device info with all methods
   */
  async getCompleteDeviceInfo(req, clientDeviceInfo = {}) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = this.getClientIP(req);

    // Try API detection first
    let apiResult = null;
    if (this.enableAPI) {
      apiResult = await this.detectWithAPI(userAgent, ip);
    }

    // Always get UA Parser result as fallback
    const uaResult = this.detectWithUAParser(userAgent);

    // Merge results (API takes priority if available)
    let mergedResult = {
      deviceName: uaResult.deviceName,
      deviceBrand: uaResult.deviceBrand,
      deviceModel: uaResult.deviceModel,
      deviceType: uaResult.deviceType,
      os: uaResult.os,
      osVersion: uaResult.osVersion,
      browser: uaResult.browser,
      browserVersion: uaResult.browserVersion,
      platform: uaResult.platform
    };

    if (apiResult) {
      mergedResult = {
        deviceName: apiResult.deviceName || mergedResult.deviceName,
        deviceBrand: apiResult.deviceBrand || mergedResult.deviceBrand,
        deviceModel: apiResult.deviceModel || mergedResult.deviceModel,
        deviceType: apiResult.deviceType || mergedResult.deviceType,
        os: apiResult.os || mergedResult.os,
        osVersion: apiResult.osVersion || mergedResult.osVersion,
        browser: apiResult.browser || mergedResult.browser,
        browserVersion: apiResult.browserVersion || mergedResult.browserVersion,
        platform: apiResult.os || mergedResult.platform,
        _apiDetected: true,
        _confidence: apiResult.confidence || 'medium'
      };
    }

    // Get location info
    const locationInfo = await this.getLocationFromIP(ip);

    // Get client-side info
    const screenResolution = clientDeviceInfo.screenResolution || null;
    const viewportSize = clientDeviceInfo.viewportSize || null;
    const colorDepth = clientDeviceInfo.colorDepth || null;
    const pixelRatio = clientDeviceInfo.pixelRatio || null;
    const timezone = clientDeviceInfo.timezone || locationInfo?.timezone || null;
    const language = clientDeviceInfo.language || req.headers['accept-language']?.split(',')[0] || null;
    const referrer = clientDeviceInfo.referrer || req.headers['referer'] || req.headers['referrer'] || null;
    const doNotTrack = clientDeviceInfo.doNotTrack || null;
    const vendor = clientDeviceInfo.vendor || null;

    // Connection info
    let connectionType = 'unknown';
    let connectionSpeed = 'unknown';
    if (clientDeviceInfo.connection) {
      connectionType = clientDeviceInfo.connection.effectiveType || 'unknown';
      connectionSpeed = clientDeviceInfo.connection.downlink ? 
                        `${clientDeviceInfo.connection.downlink} Mbps` : 'unknown';
    }

    // Final device info object
    const deviceInfo = {
      // Device identification
      deviceName: mergedResult.deviceName,
      deviceBrand: mergedResult.deviceBrand,
      deviceModel: mergedResult.deviceModel,
      
      // Device type
      deviceType: mergedResult.deviceType,
      
      // OS
      os: mergedResult.os,
      osVersion: mergedResult.osVersion,
      platform: mergedResult.platform,
      
      // Browser
      browser: mergedResult.browser,
      browserVersion: mergedResult.browserVersion,
      
      // IP and location
      ipAddress: ip,
      location: locationInfo,
      
      // Client-side info
      screenResolution: screenResolution,
      viewportSize: viewportSize,
      colorDepth: colorDepth,
      pixelRatio: pixelRatio,
      timezone: timezone,
      language: language,
      referrer: referrer,
      
      // Connection
      connectionType: connectionType,
      connectionSpeed: connectionSpeed,
      
      // Additional
      doNotTrack: doNotTrack,
      vendor: vendor,
      userAgent: userAgent,
      
      // Detection metadata
      _detectionMethod: apiResult ? 'api' : 'ua-parser',
      _apiDetected: !!apiResult,
      _confidence: mergedResult._confidence || 'low'
    };

    // Log the detected device
    console.log('📱 Device Detection Result:', {
      method: deviceInfo._detectionMethod,
      deviceName: deviceInfo.deviceName,
      deviceBrand: deviceInfo.deviceBrand,
      deviceModel: deviceInfo.deviceModel,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      ip: deviceInfo.ipAddress,
      confidence: deviceInfo._confidence
    });

    return deviceInfo;
  }

  /**
   * Get client IP address
   */
  getClientIP(req) {
    let ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.headers['x-real-ip'] ||
             req.connection?.remoteAddress ||
             req.socket?.remoteAddress ||
             req.ip ||
             'unknown';

    // Clean up IP
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    
    return ip;
  }
}

module.exports = new DeviceDetectionService();