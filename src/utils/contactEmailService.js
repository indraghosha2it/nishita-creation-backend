

// // utils/contactEmailService.js
// const { sendEmail, sendEmailWithOwnerBCC, getFromAddress, getOwnerEmail } = require('./emailService');

// // BeautyBucket Brand Colors - Sage Green Beauty Theme
// const BEAUTY_BUCKET_COLORS = {
//   primary: '#52665a',        // Sage Green
//   secondary: '#71816F',      // Light Sage Green
//   accent: '#71816F',         // Sage accent
//   darkPink: '#405347',       // Darker Sage
//   textDark: '#29362f',       // Deep Green-Black
//   textLight: '#85827B',      // Muted Green-Gray
//   white: '#FFFFFF',          // White
//   lightBg: '#f7f4ef',        // Very Light Cream background
//   border: '#e2e3dd',         // Light Green-Gray border
//   success: '#4CAF50',        // Green for success
//   warning: '#FF8C00',        // Orange for warnings
//   gold: '#B88C8D'            // Muted Rose for accent
// };

// const TIMEZONE = 'Asia/Dhaka';

// /**
//  * Format date
//  */
// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true,
//     timeZone: TIMEZONE
//   });
// };

// /**
//  * Send contact form submission emails (customer + admin)
//  * Uses database-stored email settings
//  */
// const sendContactFormEmails = async (formData) => {
//   console.log('📧 Sending contact form emails...');
//   console.log('📧 Customer email:', formData.email);

//   try {
//     const {
//       name,
//       email,
//       phone,
//       subject,
//       message
//     } = formData;

//     if (!email) {
//       throw new Error('Customer email is required');
//     }

//     // Get from address and owner email from database
//     const from = await getFromAddress('system');
//     const ownerEmail = await getOwnerEmail('system');

//     if (!from.email) {
//       throw new Error('System email not configured. Please set up email settings in admin panel.');
//     }

//     const currentDate = formatDate(new Date());
//     const productInterest = subject || 'General Inquiry';

//     // 1. Send confirmation email to CUSTOMER
//     const customerSubject = `💖 Thank You for Contacting BeautyBucket - ${productInterest}`;
//     const customerHTML = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { 
//             font-family: 'Playfair Display', 'Georgia', 'Segoe UI', Arial, sans-serif; 
//             line-height: 1.6; 
//             color: ${BEAUTY_BUCKET_COLORS.textDark}; 
//             margin: 0;
//             padding: 0;
//             background-color: ${BEAUTY_BUCKET_COLORS.lightBg};
//           }
//           .container {
//             max-width: 600px;
//             margin: 20px auto;
//             background-color: ${BEAUTY_BUCKET_COLORS.white};
//             border-radius: 20px;
//             overflow: hidden;
//             box-shadow: 0 8px 40px rgba(82, 102, 90, 0.12);
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .header {
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
//             padding: 35px 20px;
//             text-align: center;
//             position: relative;
//           }
//           .header::after {
//             content: '';
//             position: absolute;
//             bottom: 0;
//             left: 0;
//             right: 0;
//             height: 4px;
//             background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});
//           }
//           .header h1 {
//             color: ${BEAUTY_BUCKET_COLORS.white};
//             margin: 0;
//             font-size: 28px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 12px;
//             font-weight: 700;
//             font-family: 'Playfair Display', 'Georgia', serif;
//           }
//           .header p {
//             color: ${BEAUTY_BUCKET_COLORS.white};
//             margin: 10px 0 0 0;
//             opacity: 0.95;
//             font-size: 14px;
//             font-family: 'Playfair Display', 'Georgia', serif;
//             letter-spacing: 2px;
//           }
//           .content {
//             padding: 30px;
//             text-align: left;
//           }
//           .section-title {
//             font-size: 18px;
//             font-weight: 700;
//             margin: 25px 0 15px 0;
//             display: flex;
//             align-items: center;
//             gap: 8px;
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//             border-bottom: 2px solid ${BEAUTY_BUCKET_COLORS.border};
//             padding-bottom: 10px;
//             font-family: 'Playfair Display', 'Georgia', serif;
//           }
//           .section-title span:first-child {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//           }
//           .info-box {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             padding: 20px;
//             border-radius: 14px;
//             margin: 15px 0;
//             border-left: 4px solid ${BEAUTY_BUCKET_COLORS.primary};
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .info-row {
//             display: flex;
//             margin-bottom: 12px;
//             border-bottom: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//             padding-bottom: 8px;
//           }
//           .info-row:last-child {
//             border-bottom: none;
//             margin-bottom: 0;
//             padding-bottom: 0;
//           }
//           .info-label {
//             width: 100px;
//             font-weight: 600;
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//           }
//           .info-value {
//             flex: 1;
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .message-box {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             padding: 20px;
//             border-radius: 14px;
//             margin: 15px 0;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .footer {
//             margin-top: 30px;
//             padding-top: 20px;
//             border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//             text-align: left;
//           }
//           .signature {
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.lightBg}, #F8F5F0);
//             padding: 15px 20px;
//             border-radius: 14px;
//             margin-top: 20px;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .button {
//             display: inline-block;
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
//             color: ${BEAUTY_BUCKET_COLORS.white};
//             padding: 12px 30px;
//             text-decoration: none;
//             border-radius: 50px;
//             font-weight: 600;
//             font-size: 14px;
//             margin-top: 10px;
//             box-shadow: 0 4px 15px rgba(82, 102, 90, 0.3);
//             transition: all 0.3s ease;
//           }
//           .button:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 25px rgba(82, 102, 90, 0.4);
//           }
//           .flower-icon {
//             display: inline-block;
//             font-size: 20px;
//           }
//           .divider {
//             height: 2px;
//             background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent);
//             margin: 20px 0;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>
//               <span>💖</span>
//               <span>Thank You for Contacting BeautyBucket</span>
//             </h1>
//             <p>✨ Your Beauty Journey Starts Here ✨</p>
//           </div>
          
//           <div class="content">
//             <p style="margin-bottom: 20px; font-size: 16px;">Dear <strong>${name}</strong>,</p>
            
//             <p style="margin-bottom: 20px; font-size: 16px;">
//               Thank you for reaching out to <strong>BeautyBucket</strong>! We have received your inquiry and our beauty experts will get back to you within <strong>24 hours</strong>.
//             </p>

//             <div class="section-title">
//               <span>🌸</span>
//               <span>Contact Summary</span>
//             </div>
            
//             <div class="info-box">
//               <div class="info-row">
//                 <div class="info-label">Date:</div>
//                 <div class="info-value">${currentDate}</div>
//               </div>
//               <div class="info-row">
//                 <div class="info-label">Product:</div>
//                 <div class="info-value"><strong>${productInterest}</strong></div>
//               </div>
//               <div class="info-row">
//                 <div class="info-label">Name:</div>
//                 <div class="info-value">${name}</div>
//               </div>
//               <div class="info-row">
//                 <div class="info-label">Email:</div>
//                 <div class="info-value">${email}</div>
//               </div>
//               <div class="info-row">
//                 <div class="info-label">Phone:</div>
//                 <div class="info-value">${phone}</div>
//               </div>
//             </div>

//             <div class="section-title">
//               <span>💬</span>
//               <span>Your Message</span>
//             </div>
            
//             <div class="message-box">
//               <p style="margin: 0; white-space: pre-wrap; line-height: 1.8;">${message}</p>
//             </div>

//             <div class="signature">
//               <p style="margin-bottom: 5px; font-size: 16px; font-weight: 600; color: ${BEAUTY_BUCKET_COLORS.primary};">
//                 ✨ What happens next?
//               </p>
//               <p style="margin: 0; font-size: 14px;">
//                 1️⃣ Our beauty team will review your inquiry<br>
//                 2️⃣ We'll respond within 24 hours<br>
//                 3️⃣ Get ready for a beauty transformation! 💖
//               </p>
//             </div>

//          <div style="text-align: center; margin: 25px 0 10px;">
//   <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" 
//      style="display: inline-block; background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary}); color: #FFFFFF; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(82, 102, 90, 0.3); transition: all 0.3s ease;">
//     🛍️ Explore Our Beauty Collection
//   </a>
// </div>

//             <div class="divider"></div>

//             <div class="footer">
//               <p style="margin-bottom: 5px; font-family: 'Playfair Display', 'Georgia', serif; font-size: 16px;">With love,</p>
//               <p style="margin: 0; font-weight: bold; font-size: 18px; color: ${BEAUTY_BUCKET_COLORS.primary};">
//                 BeautyBucket Team 💕
//               </p>
//               <p style="font-size: 12px; color: ${BEAUTY_BUCKET_COLORS.textLight}; margin-top: 15px;">
//                 📧 ${from.email}<br>
//                 🌐 ${process.env.FRONTEND_URL || 'http://localhost:3000'}
//               </p>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     // Customer email text version
//     const customerText = `
//       Dear ${name},

//       Thank you for reaching out to BeautyBucket! We have received your inquiry and our beauty experts will get back to you within 24 hours.

//       Contact Summary:
//       Date: ${currentDate}
//       Product: ${productInterest}
//       Name: ${name}
//       Email: ${email}
//       Phone: ${phone}

//       Your Message:
//       ${message}

//       What happens next?
//       1. Our beauty team will review your inquiry
//       2. We'll respond within 24 hours
//       3. Get ready for a beauty transformation! 💖

//       With love,
//       BeautyBucket Team 💕
      
//       Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
//     `;

//     // Send customer confirmation email using system email settings
//     const customerResult = await sendEmail(
//       email,
//       customerSubject,
//       customerHTML,
//       customerText,
//       'system'
//     );

//     if (!customerResult.success) {
//       console.warn('⚠️ Customer email failed but continuing:', customerResult.error);
//     } else {
//       console.log('✅ Customer confirmation email sent to:', email, 'Message ID:', customerResult.messageId);
//     }

//     // 2. Send notification email to ADMIN
//     const adminSubject = `💖 New Contact Form Submission - ${name}`;
//     const adminHTML = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           body { 
//             font-family: 'Playfair Display', 'Georgia', 'Segoe UI', Arial, sans-serif; 
//             line-height: 1.6; 
//             color: ${BEAUTY_BUCKET_COLORS.textDark}; 
//             margin: 0;
//             padding: 20px;
//             background-color: ${BEAUTY_BUCKET_COLORS.lightBg};
//           }
//           .container {
//             max-width: 700px;
//             margin: 0 auto;
//             background-color: ${BEAUTY_BUCKET_COLORS.white};
//             border-radius: 20px;
//             overflow: hidden;
//             box-shadow: 0 8px 40px rgba(82, 102, 90, 0.12);
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .header {
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
//             padding: 30px 30px;
//             text-align: center;
//             position: relative;
//           }
//           .header::after {
//             content: '';
//             position: absolute;
//             bottom: 0;
//             left: 0;
//             right: 0;
//             height: 4px;
//             background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});
//           }
//           .header h1 {
//             color: ${BEAUTY_BUCKET_COLORS.white};
//             margin: 0;
//             font-size: 28px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             gap: 10px;
//             font-weight: 700;
//             font-family: 'Playfair Display', 'Georgia', serif;
//           }
//           .badge {
//             display: inline-block;
//             background: ${BEAUTY_BUCKET_COLORS.white};
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             padding: 4px 20px;
//             border-radius: 50px;
//             font-size: 12px;
//             font-weight: bold;
//             margin-top: 10px;
//             box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//           }
//           .content {
//             padding: 30px;
//             text-align: left;
//           }
//           .section-title {
//             font-size: 18px;
//             font-weight: 700;
//             margin: 25px 0 15px 0;
//             display: flex;
//             align-items: center;
//             gap: 8px;
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//             border-bottom: 2px solid ${BEAUTY_BUCKET_COLORS.border};
//             padding-bottom: 10px;
//             font-family: 'Playfair Display', 'Georgia', serif;
//           }
//           .section-title span:first-child {
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//           }
//           .info-grid {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             padding: 20px;
//             border-radius: 14px;
//             margin: 15px 0;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .info-row {
//             display: flex;
//             margin-bottom: 12px;
//             border-bottom: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//             padding-bottom: 8px;
//           }
//           .info-row:last-child {
//             border-bottom: none;
//             margin-bottom: 0;
//             padding-bottom: 0;
//           }
//           .info-label {
//             width: 100px;
//             font-weight: 600;
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//           }
//           .info-value {
//             flex: 1;
//             color: ${BEAUTY_BUCKET_COLORS.textDark};
//           }
//           .message-box {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             padding: 20px;
//             border-radius: 14px;
//             margin: 20px 0;
//             border: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//           }
//           .action-buttons {
//             margin: 30px 0;
//             text-align: center;
//           }
//           .button {
//             background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary});
//             color: white;
//             padding: 12px 25px;
//             text-decoration: none;
//             border-radius: 50px;
//             display: inline-block;
//             font-weight: 600;
//             font-size: 14px;
//             margin: 0 10px 10px 10px;
//             box-shadow: 0 4px 15px rgba(82, 102, 90, 0.3);
//             transition: all 0.3s ease;
//           }
//           .button:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 25px rgba(82, 102, 90, 0.4);
//           }
//           .button-outline {
//             background: white;
//             color: ${BEAUTY_BUCKET_COLORS.primary};
//             border: 2px solid ${BEAUTY_BUCKET_COLORS.primary};
//             padding: 10px 23px;
//             text-decoration: none;
//             border-radius: 50px;
//             display: inline-block;
//             font-weight: 600;
//             font-size: 14px;
//             margin: 0 10px 10px 10px;
//             transition: all 0.3s ease;
//           }
//           .button-outline:hover {
//             background: ${BEAUTY_BUCKET_COLORS.lightBg};
//             transform: translateY(-2px);
//           }
//           .footer {
//             margin-top: 30px;
//             padding-top: 20px;
//             border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};
//             text-align: left;
//             font-size: 13px;
//             color: ${BEAUTY_BUCKET_COLORS.textLight};
//           }
//           .divider {
//             height: 2px;
//             background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent);
//             margin: 20px 0;
//           }
//           .urgent-badge {
//             display: inline-block;
//             background: ${BEAUTY_BUCKET_COLORS.primary};
//             color: white;
//             padding: 2px 12px;
//             border-radius: 50px;
//             font-size: 10px;
//             font-weight: bold;
//             margin-left: 8px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>
//               <span>💖</span>
//               <span>New Contact Form Submission</span>
//             </h1>
//             <div class="badge">✨ ACTION REQUIRED ✨</div>
//           </div>
          
//           <div class="content">
//             <p style="margin-bottom: 20px; font-size: 16px;">
//               A new beauty inquiry has been submitted on BeautyBucket website.
//             </p>

//             <div class="section-title">
//               <span>👤</span>
//               <span>Customer Information</span>
//             </div>
            
//             <div class="info-grid">
//               <div class="info-row">
//                 <div class="info-label">Name:</div>
//                 <div class="info-value"><strong>${name}</strong></div>
//               </div>
//               <div class="info-row">
//                 <div class="info-label">Email:</div>
//                 <div class="info-value">
//                   <a href="mailto:${email}" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none;">${email}</a>
//                 </div>
//               </div>
//               <div class="info-row">
//                 <div class="info-label">Phone:</div>
//                 <div class="info-value"><a href="tel:${phone}" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none;">${phone}</a></div>
//               </div>
//               <div class="info-row">
//                 <div class="info-label">Product:</div>
//                 <div class="info-value"><strong>${productInterest}</strong></div>
//               </div>
//               <div class="info-row">
//                 <div class="info-label">Submitted:</div>
//                 <div class="info-value">${currentDate}</div>
//               </div>
//             </div>

//             <div class="section-title">
//               <span>💬</span>
//               <span>Customer Message</span>
//             </div>
            
//             <div class="message-box">
//               <p style="margin: 0; white-space: pre-wrap; line-height: 1.8;">${message}</p>
//             </div>

//             <div class="divider"></div>

//             <div class="action-buttons">
//               <a href="mailto:${email}" class="button">💌 Reply to Customer</a>
//               <a href="tel:${phone}" class="button-outline">📞 Call Customer</a>
//             </div>
            
//             <div class="footer">
//               <p style="margin: 0;">
//                 ✨ This is an automated notification from BeautyBucket contact form. 
//                 <span style="color: ${BEAUTY_BUCKET_COLORS.primary}; font-weight: 600;">
//                   Please respond within 24 hours.
//                 </span>
//               </p>
//               <p style="margin-top: 10px; font-size: 12px; color: ${BEAUTY_BUCKET_COLORS.textLight};">
//                 💖 Beauty is our passion. Thank you for being part of our beauty community!
//               </p>
//             </div>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     // Admin email text version
//     const adminText = `
//       New Contact Form Submission

//       A new beauty inquiry has been submitted on BeautyBucket website.

//       Customer Information:
//       Name: ${name}
//       Email: ${email}
//       Phone: ${phone}
//       Product: ${productInterest}
//       Submitted: ${currentDate}

//       Customer Message:
//       ${message}

//       Please respond within 24 hours.
//     `;

//     // Send admin notification email using system email settings
//     const adminResult = await sendEmail(
//       ownerEmail,
//       adminSubject,
//       adminHTML,
//       adminText,
//       'system'
//     );

//     if (!adminResult.success) {
//       console.warn('⚠️ Admin email failed but continuing:', adminResult.error);
//     } else {
//       console.log('✅ Admin notification email sent to:', ownerEmail, 'Message ID:', adminResult.messageId);
//     }

//     // Return success if at least one email was sent
//     if (customerResult.success || adminResult.success) {
//       return { success: true };
//     } else {
//       return { 
//         success: false, 
//         error: 'Failed to send emails. Please check email configuration.' 
//       };
//     }
//   } catch (error) {
//     console.error('❌ Contact form email error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// module.exports = {
//   sendContactFormEmails
// };



// utils/contactEmailService.js
const { sendEmail, sendEmailWithOwnerBCC, getFromAddress, getOwnerEmail } = require('./emailService');

// Nishita's Creation Brand Colors - Red / Black / Cream
const NISHITAS_COLORS = {
  primary: '#CF1B34',        // Brand Red
  secondary: '#a81428',      // Deep Red
  accent: '#e33a52',         // Light Red accent
  darkInk: '#1a1a1a',        // Ink Black
  textDark: '#1a1a1a',       // Ink Black (main text)
  textLight: '#6b6b6b',      // Muted Gray
  white: '#FFFFFF',          // White
  lightBg: '#F2F1E6',        // Warm Cream background
  border: '#e6e4d8',         // Warm cream border
  success: '#4c8a5b',        // Green for success
  warning: '#b8860b',        // Deep Amber for warnings
  gold: '#b8860b'            // Amber accent
};

const TIMEZONE = 'Asia/Dhaka';

/**
 * Format date
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: TIMEZONE
  });
};

/**
 * Send contact form submission emails (customer + admin)
 * Uses database-stored email settings
 */
const sendContactFormEmails = async (formData) => {
  console.log('📧 Sending contact form emails...');
  console.log('📧 Customer email:', formData.email);

  try {
    const {
      name,
      email,
      phone,
      subject,
      message
    } = formData;

    if (!email) {
      throw new Error('Customer email is required');
    }

    // Get from address and owner email from database
    const from = await getFromAddress('system');
    const ownerEmail = await getOwnerEmail('system');

    if (!from.email) {
      throw new Error('System email not configured. Please set up email settings in admin panel.');
    }

    const currentDate = formatDate(new Date());
    const productInterest = subject || 'General Inquiry';

    // 1. Send confirmation email to CUSTOMER
    const customerSubject = `Thank You for Contacting Nishita's Creation - ${productInterest}`;
    const customerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Raleway', 'Inter', 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: ${NISHITAS_COLORS.textDark};
            margin: 0;
            padding: 0;
            background-color: ${NISHITAS_COLORS.lightBg};
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: ${NISHITAS_COLORS.white};
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(26, 26, 26, 0.08);
            border: 1px solid ${NISHITAS_COLORS.border};
          }
          .header {
            background: linear-gradient(135deg, ${NISHITAS_COLORS.secondary}, ${NISHITAS_COLORS.primary});
            padding: 35px 20px;
            text-align: center;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${NISHITAS_COLORS.gold}, ${NISHITAS_COLORS.primary}, ${NISHITAS_COLORS.gold});
          }
          .header h1 {
            color: ${NISHITAS_COLORS.white};
            margin: 0;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-weight: 700;
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .header p {
            color: ${NISHITAS_COLORS.white};
            margin: 10px 0 0 0;
            opacity: 0.95;
            font-size: 13px;
            font-family: 'Raleway', 'Inter', sans-serif;
            letter-spacing: 2px;
          }
          .content {
            padding: 30px;
            text-align: left;
          }
          .section-title {
            font-size: 15px;
            font-weight: 700;
            margin: 25px 0 15px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${NISHITAS_COLORS.textDark};
            border-bottom: 2px solid ${NISHITAS_COLORS.border};
            padding-bottom: 10px;
            font-family: 'Raleway', 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .section-title span:first-child {
            color: ${NISHITAS_COLORS.primary};
          }
          .info-box {
            background: ${NISHITAS_COLORS.lightBg};
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid ${NISHITAS_COLORS.primary};
            border: 1px solid ${NISHITAS_COLORS.border};
          }
          .info-row {
            display: flex;
            margin-bottom: 12px;
            border-bottom: 1px solid ${NISHITAS_COLORS.border};
            padding-bottom: 8px;
          }
          .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .info-label {
            width: 100px;
            font-weight: 600;
            color: ${NISHITAS_COLORS.textLight};
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .info-value {
            flex: 1;
            color: ${NISHITAS_COLORS.textDark};
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .message-box {
            background: ${NISHITAS_COLORS.lightBg};
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid ${NISHITAS_COLORS.border};
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid ${NISHITAS_COLORS.border};
            text-align: left;
          }
          .signature {
            background: ${NISHITAS_COLORS.lightBg};
            padding: 15px 20px;
            border-radius: 8px;
            margin-top: 20px;
            border: 1px solid ${NISHITAS_COLORS.border};
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, ${NISHITAS_COLORS.secondary}, ${NISHITAS_COLORS.primary});
            color: ${NISHITAS_COLORS.white};
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 10px;
            box-shadow: 0 4px 15px rgba(207, 27, 52, 0.3);
            transition: all 0.3s ease;
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(207, 27, 52, 0.4);
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, ${NISHITAS_COLORS.border}, transparent);
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>✦</span>
              <span>Thank You for Contacting Nishita's Creation</span>
            </h1>
            <p>CRAFTED WITH CARE • MADE FOR YOU</p>
          </div>
          
          <div class="content">
            <p style="margin-bottom: 20px; font-size: 16px;">Dear <strong>${name}</strong>,</p>
            
            <p style="margin-bottom: 20px; font-size: 15px;">
              Thank you for reaching out to <strong>Nishita's Creation</strong>! We've received your inquiry and our team will get back to you within <strong>24 hours</strong>.
            </p>

            <div class="section-title">
              <span>✦</span>
              <span>Contact Summary</span>
            </div>
            
            <div class="info-box">
              <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">${currentDate}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Subject:</div>
                <div class="info-value"><strong>${productInterest}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value">${name}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">${email}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value">${phone}</div>
              </div>
            </div>

            <div class="section-title">
              <span>✦</span>
              <span>Your Message</span>
            </div>
            
            <div class="message-box">
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.8;">${message}</p>
            </div>

            <div class="signature">
              <p style="margin-bottom: 5px; font-size: 15px; font-weight: 700; color: ${NISHITAS_COLORS.primary}; font-family: 'Raleway', 'Inter', sans-serif;">
                ✦ What happens next?
              </p>
              <p style="margin: 0; font-size: 14px; font-family: 'Raleway', 'Inter', sans-serif;">
                1 — Our team will review your inquiry<br>
                2 — We'll respond within 24 hours<br>
                3 — Thank you for choosing Nishita's Creation
              </p>
            </div>

            <div style="text-align: center; margin: 25px 0 10px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" 
                 style="display: inline-block; background: linear-gradient(135deg, ${NISHITAS_COLORS.secondary}, ${NISHITAS_COLORS.primary}); color: #FFFFFF; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(207, 27, 52, 0.3); transition: all 0.3s ease; font-family: 'Raleway', 'Inter', sans-serif;">
                Browse Our Collection
              </a>
            </div>

            <div class="divider"></div>

            <div class="footer">
              <p style="margin-bottom: 5px; font-family: 'Raleway', 'Inter', sans-serif; font-size: 15px;">Warm regards,</p>
              <p style="margin: 0; font-weight: 700; font-size: 17px; color: ${NISHITAS_COLORS.primary}; font-family: 'Raleway', 'Inter', sans-serif;">
                Nishita's Creation
              </p>
              <p style="font-size: 12px; color: ${NISHITAS_COLORS.textLight}; margin-top: 15px; font-family: 'Raleway', 'Inter', sans-serif;">
                ${from.email}<br>
                ${process.env.FRONTEND_URL || 'http://localhost:3000'}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Customer email text version
    const customerText = `
      Dear ${name},

      Thank you for reaching out to Nishita's Creation! We have received your inquiry and our team will get back to you within 24 hours.

      Contact Summary:
      Date: ${currentDate}
      Subject: ${productInterest}
      Name: ${name}
      Email: ${email}
      Phone: ${phone}

      Your Message:
      ${message}

      What happens next?
      1. Our team will review your inquiry
      2. We'll respond within 24 hours
      3. Thank you for choosing Nishita's Creation

      Warm regards,
      Nishita's Creation
      
      Visit us at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
    `;

    // Send customer confirmation email using system email settings
    const customerResult = await sendEmail(
      email,
      customerSubject,
      customerHTML,
      customerText,
      'system'
    );

    if (!customerResult.success) {
      console.warn('⚠️ Customer email failed but continuing:', customerResult.error);
    } else {
      console.log('✅ Customer confirmation email sent to:', email, 'Message ID:', customerResult.messageId);
    }

    // 2. Send notification email to ADMIN
    const adminSubject = `New Contact Form Submission - ${name}`;
    const adminHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Raleway', 'Inter', 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: ${NISHITAS_COLORS.textDark};
            margin: 0;
            padding: 20px;
            background-color: ${NISHITAS_COLORS.lightBg};
          }
          .container {
            max-width: 700px;
            margin: 0 auto;
            background-color: ${NISHITAS_COLORS.white};
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(26, 26, 26, 0.08);
            border: 1px solid ${NISHITAS_COLORS.border};
          }
          .header {
            background: linear-gradient(135deg, ${NISHITAS_COLORS.secondary}, ${NISHITAS_COLORS.primary});
            padding: 30px 30px;
            text-align: center;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${NISHITAS_COLORS.gold}, ${NISHITAS_COLORS.primary}, ${NISHITAS_COLORS.gold});
          }
          .header h1 {
            color: ${NISHITAS_COLORS.white};
            margin: 0;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 700;
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .badge {
            display: inline-block;
            background: ${NISHITAS_COLORS.white};
            color: ${NISHITAS_COLORS.primary};
            padding: 4px 20px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-family: 'Raleway', 'Inter', sans-serif;
            letter-spacing: 1px;
          }
          .content {
            padding: 30px;
            text-align: left;
          }
          .section-title {
            font-size: 15px;
            font-weight: 700;
            margin: 25px 0 15px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${NISHITAS_COLORS.textDark};
            border-bottom: 2px solid ${NISHITAS_COLORS.border};
            padding-bottom: 10px;
            font-family: 'Raleway', 'Inter', sans-serif;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .section-title span:first-child {
            color: ${NISHITAS_COLORS.primary};
          }
          .info-grid {
            background: ${NISHITAS_COLORS.lightBg};
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid ${NISHITAS_COLORS.border};
          }
          .info-row {
            display: flex;
            margin-bottom: 12px;
            border-bottom: 1px solid ${NISHITAS_COLORS.border};
            padding-bottom: 8px;
          }
          .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
          }
          .info-label {
            width: 100px;
            font-weight: 600;
            color: ${NISHITAS_COLORS.textLight};
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .info-value {
            flex: 1;
            color: ${NISHITAS_COLORS.textDark};
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .message-box {
            background: ${NISHITAS_COLORS.lightBg};
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid ${NISHITAS_COLORS.border};
          }
          .action-buttons {
            margin: 30px 0;
            text-align: center;
          }
          .button {
            background: linear-gradient(135deg, ${NISHITAS_COLORS.secondary}, ${NISHITAS_COLORS.primary});
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 50px;
            display: inline-block;
            font-weight: 600;
            font-size: 14px;
            margin: 0 10px 10px 10px;
            box-shadow: 0 4px 15px rgba(207, 27, 52, 0.3);
            transition: all 0.3s ease;
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(207, 27, 52, 0.4);
          }
          .button-outline {
            background: white;
            color: ${NISHITAS_COLORS.primary};
            border: 2px solid ${NISHITAS_COLORS.primary};
            padding: 10px 23px;
            text-decoration: none;
            border-radius: 50px;
            display: inline-block;
            font-weight: 600;
            font-size: 14px;
            margin: 0 10px 10px 10px;
            transition: all 0.3s ease;
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .button-outline:hover {
            background: ${NISHITAS_COLORS.lightBg};
            transform: translateY(-2px);
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid ${NISHITAS_COLORS.border};
            text-align: left;
            font-size: 13px;
            color: ${NISHITAS_COLORS.textLight};
            font-family: 'Raleway', 'Inter', sans-serif;
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, ${NISHITAS_COLORS.border}, transparent);
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>
              <span>✦</span>
              <span>New Contact Form Submission</span>
            </h1>
            <div class="badge">ACTION REQUIRED</div>
          </div>
          
          <div class="content">
            <p style="margin-bottom: 20px; font-size: 15px;">
              A new inquiry has been submitted on the Nishita's Creation website.
            </p>

            <div class="section-title">
              <span>✦</span>
              <span>Customer Information</span>
            </div>
            
            <div class="info-grid">
              <div class="info-row">
                <div class="info-label">Name:</div>
                <div class="info-value"><strong>${name}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Email:</div>
                <div class="info-value">
                  <a href="mailto:${email}" style="color: ${NISHITAS_COLORS.primary}; text-decoration: none;">${email}</a>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">Phone:</div>
                <div class="info-value"><a href="tel:${phone}" style="color: ${NISHITAS_COLORS.primary}; text-decoration: none;">${phone}</a></div>
              </div>
              <div class="info-row">
                <div class="info-label">Subject:</div>
                <div class="info-value"><strong>${productInterest}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Submitted:</div>
                <div class="info-value">${currentDate}</div>
              </div>
            </div>

            <div class="section-title">
              <span>✦</span>
              <span>Customer Message</span>
            </div>
            
            <div class="message-box">
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.8;">${message}</p>
            </div>

            <div class="divider"></div>

            <div class="action-buttons">
              <a href="mailto:${email}" class="button">Reply to Customer</a>
              <a href="tel:${phone}" class="button-outline">Call Customer</a>
            </div>
            
            <div class="footer">
              <p style="margin: 0;">
                This is an automated notification from the Nishita's Creation contact form.
                <span style="color: ${NISHITAS_COLORS.primary}; font-weight: 600;">
                  Please respond within 24 hours.
                </span>
              </p>
              <p style="margin-top: 10px; font-size: 12px; color: ${NISHITAS_COLORS.textLight};">
                Thank you for being part of the Nishita's Creation community.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Admin email text version
    const adminText = `
      New Contact Form Submission

      A new inquiry has been submitted on the Nishita's Creation website.

      Customer Information:
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Subject: ${productInterest}
      Submitted: ${currentDate}

      Customer Message:
      ${message}

      Please respond within 24 hours.
    `;

    // Send admin notification email using system email settings
    const adminResult = await sendEmail(
      ownerEmail,
      adminSubject,
      adminHTML,
      adminText,
      'system'
    );

    if (!adminResult.success) {
      console.warn('⚠️ Admin email failed but continuing:', adminResult.error);
    } else {
      console.log('✅ Admin notification email sent to:', ownerEmail, 'Message ID:', adminResult.messageId);
    }

    // Return success if at least one email was sent
    if (customerResult.success || adminResult.success) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Failed to send emails. Please check email configuration.' 
      };
    }
  } catch (error) {
    console.error('❌ Contact form email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendContactFormEmails
};