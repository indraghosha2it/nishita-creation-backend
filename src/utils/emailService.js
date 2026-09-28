
// utils/emailService.js
const nodemailer = require('nodemailer');
const EmailSettings = require('../models/EmailSettings');

// Cache for email settings
let emailSettingsCache = {
  order: null,
  system: null
};
let cacheTimestamp = {
  order: null,
  system: null
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get email settings from database with caching by type
 * @param {string} type - 'order' or 'system'
 */
const getEmailSettings = async (type = 'order') => {
  // Validate type
  if (!['order', 'system'].includes(type)) {
    throw new Error('Invalid email type. Must be "order" or "system"');
  }
  
  // Check cache for this type
  if (emailSettingsCache[type] && cacheTimestamp[type] && (Date.now() - cacheTimestamp[type]) < CACHE_TTL) {
    return emailSettingsCache[type];
  }
  
  try {
    const settings = await EmailSettings.getSettings(type);
    emailSettingsCache[type] = settings;
    cacheTimestamp[type] = Date.now();
    return settings;
  } catch (error) {
    console.error(`Error fetching email settings for ${type}:`, error);
    // Return null if error, will fallback to env
    return null;
  }
};

/**
 * Create email transporter using database settings
 * @param {string} type - 'order' or 'system'
 */
const createTransporter = async (type = 'order') => {
  try {
    const settings = await getEmailSettings(type);
    
    // If settings exist and are configured
    if (settings && settings.smtpUser && settings.smtpPassword && settings.fromEmail) {
      // Parse port
      let port = parseInt(settings.smtpPort) || 587;
      
      // Determine secure based on port
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
      
      return transporter;
    }
    
    // Fallback to environment variables
    console.warn(`⚠️ Using fallback email configuration for ${type}`);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
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
    
    return transporter;
  } catch (error) {
    console.error(`❌ Email transporter creation error (${type}):`, error.message);
    
    // Ultimate fallback to env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    return transporter;
  }
};

/**
 * Get from address from settings or use fallback
 * @param {string} type - 'order' or 'system'
 */
const getFromAddress = async (type = 'general') => {
  try {
    // Map 'general' to 'system'
    const emailType = type === 'general' ? 'system' : type;
    
    const settings = await getEmailSettings(emailType);
    
    if (settings && settings.fromEmail) {
      return {
        email: settings.fromEmail,
        name: settings.fromName || 'HyperVolt'
      };
    }
    
    // Fallback to environment variables
    return {
      email: process.env.SMTP_USER || 'noreply@hypervolt.com',
      name: process.env.FROM_NAME || 'HyperVolt'
    };
  } catch (error) {
    console.error('Error getting from address:', error);
    return {
      email: process.env.SMTP_USER || 'noreply@hypervolt.com',
      name: process.env.FROM_NAME || 'HyperVolt'
    };
  }
};

/**
 * Get owner email from settings or use fallback
 * @param {string} type - 'order' or 'system'
 */
const getOwnerEmail = async (type = 'general') => {
  try {
    // Map 'general' to 'system'
    const emailType = type === 'general' ? 'system' : type;
    
    const settings = await getEmailSettings(emailType);
    
    if (settings && settings.ownerEmail) {
      return settings.ownerEmail;
    }
    
    // Fallback to environment variable
    return process.env.OWNER_EMAIL || process.env.SMTP_USER || 'admin@hypervolt.com';
  } catch (error) {
    console.error('Error getting owner email:', error);
    return process.env.OWNER_EMAIL || process.env.SMTP_USER || 'admin@hypervolt.com';
  }
};

/**
 * Send email with optional BCC
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content (optional)
 * @param {string} type - Email type (order, contact, etc.)
 * @param {boolean} includeBcc - Whether to include owner in BCC (default: false)
 */
const sendEmail = async (to, subject, html, text = null, type = 'general', includeBcc = false) => {
  console.log(`📧 Sending email to: ${to}, Type: ${type}, BCC: ${includeBcc}`);
  
  try {
    const from = await getFromAddress(type);
    const ownerEmail = includeBcc ? await getOwnerEmail(type) : null;
    
    const transporter = await createTransporter(type === 'general' ? 'system' : type);
    
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to: to,
      subject: subject,
      html: html
    };
    
    // Add text if provided
    if (text) {
      mailOptions.text = text;
    }
    
    // Add BCC if requested and owner email exists
    if (includeBcc && ownerEmail) {
      mailOptions.bcc = ownerEmail;
      console.log(`📎 BCC added: ${ownerEmail}`);
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email with attachments and optional BCC
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {Array} attachments - Array of attachment objects
 * @param {string} type - Email type (order, contact, etc.)
 * @param {boolean} includeBcc - Whether to include owner in BCC (default: false)
 */
const sendEmailWithAttachment = async (to, subject, html, attachments = [], type = 'general', includeBcc = false) => {
  console.log(`📧 Sending email with attachment to: ${to}, Type: ${type}, BCC: ${includeBcc}`);
  console.log(`📎 Attachments: ${attachments.length} file(s)`);
  
  try {
    const from = await getFromAddress(type);
    const ownerEmail = includeBcc ? await getOwnerEmail(type) : null;
    
    const transporter = await createTransporter(type === 'general' ? 'system' : type);
    
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments || []
    };
    
    // Add BCC if requested and owner email exists
    if (includeBcc && ownerEmail) {
      mailOptions.bcc = ownerEmail;
      console.log(`📎 BCC added: ${ownerEmail}`);
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email with attachment sent successfully: ${info.messageId}`);
    
    // Log attachment details
    if (attachments && attachments.length > 0) {
      attachments.forEach((att, index) => {
        console.log(`📎 Attachment ${index + 1}: ${att.filename} (${att.content ? att.content.length : 'unknown'} bytes)`);
      });
    }
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email with attachment send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email to multiple recipients
 */
const sendEmailToMultiple = async (recipients, subject, html, type = 'general', includeBcc = false) => {
  console.log(`📧 Sending email to multiple recipients: ${recipients.length} recipients`);
  
  try {
    const from = await getFromAddress(type);
    const ownerEmail = includeBcc ? await getOwnerEmail(type) : null;
    
    const transporter = await createTransporter(type === 'general' ? 'system' : type);
    
    const mailOptions = {
      from: `"${from.name}" <${from.email}>`,
      to: recipients.join(', '),
      subject: subject,
      html: html
    };
    
    // Add BCC if requested and owner email exists
    if (includeBcc && ownerEmail) {
      mailOptions.bcc = ownerEmail;
      console.log(`📎 BCC added: ${ownerEmail}`);
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to multiple recipients: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Multiple email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear cache for specific type or all
 * @param {string} type - 'order', 'system', or 'all'
 */
const clearCache = (type = 'all') => {
  if (type === 'all') {
    emailSettingsCache = { order: null, system: null };
    cacheTimestamp = { order: null, system: null };
    console.log('🗑️ All email settings cache cleared');
  } else if (['order', 'system'].includes(type)) {
    emailSettingsCache[type] = null;
    cacheTimestamp[type] = null;
    console.log(`🗑️ Email settings cache cleared for ${type}`);
  }
};

/**
 * Test email configuration
 */
const testEmailConfig = async () => {
  console.log('🔧 Testing email configuration...');
  
  try {
    const from = await getFromAddress('test');
    const ownerEmail = await getOwnerEmail('test');
    
    console.log(`📧 From: ${from.name} <${from.email}>`);
    console.log(`📧 Owner: ${ownerEmail}`);
    
    const transporter = await createTransporter('system');
    await transporter.verify();
    
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
    
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    return { success: false, error: error.message };
  }
};

// Export all functions
module.exports = {
  createTransporter,
  getFromAddress,
  getOwnerEmail,
  getEmailSettings,
  sendEmail,
  sendEmailWithAttachment,
  sendEmailToMultiple,
  clearCache,
  testEmailConfig
};