// utils/subscriptionEmailService.js
const nodemailer = require('nodemailer');

// Jute Craftify Brand Colors
const JUTE_COLORS = {
  primary: '#6B4F3A',    // Earthy Brown
  secondary: '#F5E6D3',  // Natural Beige
  accent: '#3A7D44',     // Green
  textDark: '#2C2420',   // Dark Text
  textLight: '#8B7355',  // Light Text
  white: '#FFFFFF',
  lightBg: '#FAF7F2',
  border: '#E5D5C0'
};

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.INFO_SMTP_HOST,
  port: parseInt(process.env.INFO_SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.INFO_SMTP_USER,
    pass: process.env.INFO_SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Subscription Email Service - Configuration error:', error.message);
  } else {
    console.log('✅ Subscription Email Service is ready');
  }
});

/**
 * Send subscription confirmation email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name (companyName or contactPerson)
 */
const sendSubscriptionConfirmationEmail = async (email, name) => {
  console.log('📧 Sending subscription confirmation email to:', email);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const currentYear = new Date().getFullYear();
  const unsubscribeUrl = `${frontendUrl}/api/auth/unsubscribe?email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          line-height: 1.6; 
          color: ${JUTE_COLORS.textDark}; 
          margin: 0;
          padding: 0;
          background-color: ${JUTE_COLORS.lightBg};
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: ${JUTE_COLORS.white};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, ${JUTE_COLORS.primary} 0%, #8B6B51 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: ${JUTE_COLORS.white};
          margin: 0;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .header h1 span:first-child {
          font-size: 36px;
        }
        .content {
          padding: 30px;
          text-align: left;
        }
        .welcome-message {
          font-size: 16px;
          margin-bottom: 25px;
        }
        .benefits-box {
          background: ${JUTE_COLORS.secondary};
          border-left: 4px solid ${JUTE_COLORS.accent};
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .benefits-box h3 {
          margin: 0 0 15px 0;
          color: ${JUTE_COLORS.primary};
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .benefits-list li {
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid ${JUTE_COLORS.border};
        }
        .benefits-list li:last-child {
          border-bottom: none;
        }
        .benefits-list li span:first-child {
          font-size: 20px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, ${JUTE_COLORS.primary} 0%, #8B6B51 100%);
          color: ${JUTE_COLORS.white};
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .button-small {
          display: inline-block;
          background: transparent;
          color: ${JUTE_COLORS.primary};
          padding: 8px 20px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 10px 0;
          text-align: center;
          border: 1px solid ${JUTE_COLORS.primary};
        }
        .footer {
          background: ${JUTE_COLORS.lightBg};
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: ${JUTE_COLORS.textLight};
          border-top: 1px solid ${JUTE_COLORS.border};
        }
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          color: ${JUTE_COLORS.primary};
          text-decoration: none;
          margin: 0 10px;
        }
        .highlight {
          color: ${JUTE_COLORS.accent};
          font-weight: bold;
        }
        .unsubscribe {
          color: ${JUTE_COLORS.textLight};
          text-decoration: none;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>
            <span>📧</span>
            <span>You're Subscribed!</span>
          </h1>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for subscribing to the <span class="highlight">Jute Craftify Newsletter</span>! You'll now receive the latest updates, exclusive offers, and industry news directly in your inbox.</p>
            <p>As a valued subscriber, you'll get first access to:</p>
          </div>
          
          <div class="benefits-box">
            <h3>
              <span>🎁</span>
              <span>What You'll Receive</span>
            </h3>
            <ul class="benefits-list">
              <li><span>🚀</span> <span><strong>Exclusive Offers</strong> - Special wholesale discounts</span></li>
              <li><span>✨</span> <span><strong>New Product Launches</strong> - Be the first to know</span></li>
              <li><span>🌍</span> <span><strong>Export Updates</strong> - Shipping & logistics news</span></li>
              <li><span>🌿</span> <span><strong>Sustainability Insights</strong> - Eco-friendly innovations</span></li>
              <li><span>🏷️</span> <span><strong>Seasonal Promotions</strong> - Holiday special offers</span></li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${frontendUrl}/products" class="button">
              Browse Our Products →
            </a>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background: ${JUTE_COLORS.secondary}; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>📞 Need a Bulk Quote?</strong></p>
            <p style="margin: 0; font-size: 14px;">Contact our wholesale team directly:</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">
              📧 <a href="mailto:info@jutecraftify.com" style="color: ${JUTE_COLORS.primary};">info@jutecraftify.com</a><br>
              📞 +8801305-785685
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: ${JUTE_COLORS.textLight};">
            <a href="${unsubscribeUrl}" class="unsubscribe">Click here to unsubscribe</a> at any time.
          </div>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="#">Facebook</a> | 
            <a href="#">Instagram</a> | 
            <a href="#">LinkedIn</a>
          </div>
          <p>&copy; ${currentYear} Jute Craftify. All rights reserved.</p>
          <p>34/6, Mongla, Khulna, Bangladesh</p>
          <p>
            <a href="${frontendUrl}/privacy" style="color: ${JUTE_COLORS.textLight};">Privacy Policy</a> | 
            <a href="${frontendUrl}/terms" style="color: ${JUTE_COLORS.textLight};">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"Jute Craftify Newsletter" <${process.env.INFO_SMTP_USER}>`,
      to: email,
      subject: `📧 You're Subscribed to Jute Craftify Newsletter!`,
      html: htmlContent
    });
    
    console.log('✅ Subscription confirmation email sent to:', email, 'Message ID:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Subscription email error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send unsubscribe confirmation email to user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 */
const sendUnsubscribeConfirmationEmail = async (email, name) => {
  console.log('📧 Sending unsubscribe confirmation email to:', email);
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const currentYear = new Date().getFullYear();
  const subscribeUrl = `${frontendUrl}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          line-height: 1.6; 
          color: ${JUTE_COLORS.textDark}; 
          margin: 0;
          padding: 0;
          background-color: ${JUTE_COLORS.lightBg};
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: ${JUTE_COLORS.white};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, ${JUTE_COLORS.primary} 0%, #8B6B51 100%);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: ${JUTE_COLORS.white};
          margin: 0;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .content {
          padding: 30px;
          text-align: left;
        }
        .message {
          font-size: 16px;
          margin-bottom: 25px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, ${JUTE_COLORS.primary} 0%, #8B6B51 100%);
          color: ${JUTE_COLORS.white};
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background: ${JUTE_COLORS.lightBg};
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: ${JUTE_COLORS.textLight};
          border-top: 1px solid ${JUTE_COLORS.border};
        }
        .highlight {
          color: ${JUTE_COLORS.accent};
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>
            <span>👋</span>
            <span>You've Been Unsubscribed</span>
          </h1>
        </div>
        
        <div class="content">
          <div class="message">
            <p>Dear <strong>${name}</strong>,</p>
            <p>You have successfully been unsubscribed from the <span class="highlight">Jute Craftify Newsletter</span>.</p>
            <p>We're sorry to see you go! You will no longer receive emails from us.</p>
            <p>If you unsubscribed by mistake or change your mind in the future, you can always resubscribe by visiting our website or clicking the button below.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${subscribeUrl}" class="button">
              Resubscribe to Newsletter →
            </a>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background: ${JUTE_COLORS.secondary}; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>📞 Need Help?</strong></p>
            <p style="margin: 0; font-size: 14px;">Contact our support team:</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">
              📧 <a href="mailto:${process.env.INFO_SMTP_USER}" style="color: ${JUTE_COLORS.primary};">${process.env.INFO_SMTP_USER}</a><br>
              📞 +8801305-785685
            </p>
          </div>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="#">Facebook</a> | 
            <a href="#">Instagram</a> | 
            <a href="#">LinkedIn</a>
          </div>
          <p>&copy; ${currentYear} Jute Craftify. All rights reserved.</p>
          <p>34/6, Mongla, Khulna, Bangladesh</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await transporter.sendMail({
      from: `"Jute Craftify Newsletter" <${process.env.INFO_SMTP_USER}>`,
      to: email,
      subject: `👋 You've Been Unsubscribed from Jute Craftify Newsletter`,
      html: htmlContent
    });
    
    console.log('✅ Unsubscribe confirmation email sent to:', email, 'Message ID:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Unsubscribe email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSubscriptionConfirmationEmail,
  sendUnsubscribeConfirmationEmail
};