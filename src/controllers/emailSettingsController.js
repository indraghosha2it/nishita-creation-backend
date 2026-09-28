// controllers/emailSettingsController.js
const EmailSettings = require('../models/EmailSettings');
const nodemailer = require('nodemailer');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

// @desc    Get email settings by type
// @route   GET /api/admin/email-settings/:type
// @access  Private (Admin/Super Admin)
const getEmailSettings = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['order', 'system'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email type. Must be "order" or "system"'
      });
    }
    
    const settings = await EmailSettings.getSettings(type);
    
    // ✅ Return the full settings including password
    // For security, you could add a flag to include password only for admins
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get email settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update email settings
// @route   PUT /api/admin/email-settings/:type
// @access  Private (Admin/Super Admin)
const updateEmailSettings = async (req, res) => {
  try {
    const { type } = req.params;
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpSecure,
      fromEmail,
      fromName,
      ownerEmail
    } = req.body;

    if (!['order', 'system'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email type. Must be "order" or "system"'
      });
    }

    // Validate required fields
    if (!smtpHost) {
      return res.status(400).json({
        success: false,
        error: 'SMTP Host is required'
      });
    }
    if (!smtpUser) {
      return res.status(400).json({
        success: false,
        error: 'SMTP Username is required'
      });
    }
    if (!smtpPassword) {
      return res.status(400).json({
        success: false,
        error: 'SMTP Password is required'
      });
    }
    if (!fromEmail) {
      return res.status(400).json({
        success: false,
        error: 'From Email is required'
      });
    }
    if (!ownerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Owner Email is required'
      });
    }

    let settings = await EmailSettings.findOne({ type });
    
    if (!settings) {
      settings = new EmailSettings({ type });
    }

    // Update all fields
    settings.smtpHost = smtpHost;
    settings.smtpPort = smtpPort || '';
    settings.smtpUser = smtpUser;
    settings.smtpPassword = smtpPassword; // ✅ Save the password
    settings.smtpSecure = smtpSecure !== undefined ? smtpSecure : false;
    settings.fromEmail = fromEmail;
    settings.fromName = fromName || 'HyperVolt';
    settings.ownerEmail = ownerEmail;
    settings.updatedBy = req.user.id;
    settings.isConfigured = false;

    await settings.save();

    // Clear cache
    const { clearCache } = require('../utils/emailService');
    clearCache(type);

    // ✅ Return the updated settings including password
    res.json({
      success: true,
      data: settings,
      message: 'Email settings updated successfully'
    });
  } catch (error) {
    console.error('Update email settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Test email configuration
// @route   POST /api/admin/email-settings/:type/test
// @access  Private (Admin/Super Admin)
const testEmailSettings = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['order', 'system'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email type. Must be "order" or "system"'
      });
    }
    
    let settings = await EmailSettings.findOne({ type });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Email settings not configured for this type'
      });
    }

    // Parse port
    let port = parseInt(settings.smtpPort);
    if (isNaN(port) || port <= 0) {
      port = 587;
    }

    let secure = settings.smtpSecure !== undefined ? settings.smtpSecure : false;
    if (port === 465) {
      secure = true;
    } else if (port === 587) {
      secure = false;
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: port,
      secure: secure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPassword
      },
      family: 4,
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000
    });

    await transporter.verify();

    const testResult = await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: settings.ownerEmail,
      subject: `✅ ${type.charAt(0).toUpperCase() + type.slice(1)} Email Test - HyperVolt`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1A1A2E; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #0D506F30; border-radius: 12px; }
            .header { background: linear-gradient(135deg, #0D506F, #06B6D4); padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { color: #FFFFFF; margin: 0; }
            .content { padding: 20px; background: #F0F7FA; border-radius: 0 0 8px 8px; }
            .status { background: #22C55E20; border-left: 4px solid #22C55E; padding: 15px; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #94A3B8; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ ${type.charAt(0).toUpperCase() + type.slice(1)} Email Test</h1>
            </div>
            <div class="content">
              <div class="status">
                <p style="margin: 0; color: #1A1A2E; font-weight: 600;">
                  🎉 Your ${type} email configuration is working perfectly!
                </p>
              </div>
              <div style="margin-top: 20px; padding: 15px; background: #FFFFFF; border-radius: 8px; border: 1px solid #0D506F30;">
                <p style="margin: 5px 0;"><strong>Type:</strong> ${type}</p>
                <p style="margin: 5px 0;"><strong>From:</strong> ${settings.fromEmail}</p>
                <p style="margin: 5px 0;"><strong>To:</strong> ${settings.ownerEmail}</p>
                <p style="margin: 5px 0;"><strong>SMTP:</strong> ${settings.smtpHost}:${port}</p>
              </div>
              <div style="margin-top: 20px; text-align: center; color: #64748B; font-size: 14px;">
                ⚡ Powering Your Digital Life
              </div>
            </div>
            <div class="footer">
              <p>This is an automated test email from HyperVolt.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    settings.isConfigured = true;
    settings.lastTestedAt = new Date();
    settings.lastTestResult = true;
    settings.lastTestMessage = 'Test email sent successfully';
    await settings.save();

    const { clearCache } = require('../utils/emailService');
    clearCache(type);

    res.json({
      success: true,
      data: {
        messageId: testResult.messageId,
        configured: true
      },
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Test email error:', error);
    
    try {
      const settings = await EmailSettings.findOne({ type });
      if (settings) {
        settings.lastTestedAt = new Date();
        settings.lastTestResult = false;
        settings.lastTestMessage = error.message;
        settings.isConfigured = false;
        await settings.save();
      }
    } catch (e) {
      console.error('Error updating test status:', e);
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Failed to send test email'
    });
  }
};

// @desc    Get email settings status
// @route   GET /api/admin/email-settings/:type/status
// @access  Private (Admin/Super Admin)
const getEmailStatus = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['order', 'system'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email type. Must be "order" or "system"'
      });
    }
    
    const settings = await EmailSettings.findOne({ type });
    
    if (!settings) {
      return res.json({
        success: true,
        data: {
          isConfigured: false,
          hasCredentials: false,
          lastTestedAt: null,
          lastTestResult: false,
          lastTestMessage: ''
        }
      });
    }

    const hasCredentials = !!(settings.smtpUser && settings.smtpPassword && settings.fromEmail);
    
    res.json({
      success: true,
      data: {
        isConfigured: settings.isConfigured || false,
        hasCredentials: hasCredentials,
        lastTestedAt: settings.lastTestedAt,
        lastTestResult: settings.lastTestResult,
        lastTestMessage: settings.lastTestMessage
      }
    });
  } catch (error) {
    console.error('Get email status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getEmailSettings,
  updateEmailSettings,
  testEmailSettings,
  getEmailStatus
};