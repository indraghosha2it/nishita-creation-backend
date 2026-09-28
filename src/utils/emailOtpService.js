

// // utils/emailOtpService.js
// const { sendEmail, getFromAddress } = require('./emailService');

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

// // Generate 6-digit OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// /**
//  * Send OTP email with BeautyBucket branding using database-stored system email settings
//  * @param {string} email - Recipient email address
//  * @param {string} otp - 6-digit OTP code
//  * @param {string} contactPerson - User's name
//  * @returns {Promise<boolean>}
//  */
// const sendOTPEmail = async (email, otp, contactPerson) => {
//   try {
//     // Get from address from database settings (system type)
//     const from = await getFromAddress('system');
    
//     if (!from.email) {
//       throw new Error('System email not configured. Please set up email settings in admin panel.');
//     }

//     console.log(`📧 Attempting to send OTP email to: ${email}`);
//     console.log(`📧 From: ${from.email} (${from.name})`);

//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <style>
//           @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
//         </style>
//       </head>
//       <body style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: ${BEAUTY_BUCKET_COLORS.lightBg};">
//         <div style="max-width: 600px; margin: 20px auto; background-color: ${BEAUTY_BUCKET_COLORS.white}; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 40px rgba(82, 102, 90, 0.12); border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
          
//           <!-- Header with BeautyBucket Branding -->
//           <div style="background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary}); padding: 35px 20px 30px; text-align: center; position: relative;">
//             <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${BEAUTY_BUCKET_COLORS.gold}, ${BEAUTY_BUCKET_COLORS.secondary}, ${BEAUTY_BUCKET_COLORS.gold});"></div>
//             <div style="display: inline-block; background: rgba(255,255,255,0.12); border-radius: 14px; padding: 12px 24px; margin-bottom: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
//               <span style="font-size: 28px; margin-right: 10px;">💖</span>
//               <span style="font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.white}; font-weight: 700; font-size: 22px; letter-spacing: 1px;">BeautyBucket</span>
//             </div>
//             <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px; font-family: 'Playfair Display', 'Georgia', serif; letter-spacing: 2px;">✨ Your Beauty Journey Starts Here ✨</p>
//           </div>
          
//           <!-- Content -->
//           <div style="padding: 40px 30px;">
//             <h2 style="color: ${BEAUTY_BUCKET_COLORS.textDark}; margin-top: 0; font-family: 'Playfair Display', 'Georgia', serif; font-size: 24px; font-weight: 700;">
//               Welcome to BeautyBucket, ${contactPerson}! 💖
//             </h2>
            
//             <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; line-height: 1.8; margin-bottom: 20px; font-size: 15px;">
//               Thank you for joining <strong>BeautyBucket</strong> — your ultimate destination for premium beauty and cosmetic products! 
//               To complete your registration and unlock exclusive beauty deals, please verify your email address using the OTP below:
//             </p>
            
//             <!-- OTP Box -->
//             <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; border: 2px solid ${BEAUTY_BUCKET_COLORS.primary}; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 4px 20px rgba(82, 102, 90, 0.12);">
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin-bottom: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;">Verification Code</p>
//               <h1 style="font-size: 52px; letter-spacing: 14px; background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 10px 0; font-family: 'Inter', Arial, sans-serif; font-weight: 700;">${otp}</h1>
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin-top: 10px;">Enter this code to verify your email</p>
//             </div>
            
//             <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; line-height: 1.8;">
//               This OTP is valid for <strong style="color: ${BEAUTY_BUCKET_COLORS.primary};">10 minutes</strong>.
//             </p>
            
//             <!-- Benefits Section -->
//             <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; border-radius: 14px; padding: 25px; margin: 30px 0; border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textDark}; font-weight: 700; margin-bottom: 15px; text-align: center; font-size: 15px; font-family: 'Playfair Display', 'Georgia', serif;">💖 What Awaits You at BeautyBucket? 💖</p>
//               <table style="width: 100%; font-size: 13px;">
//                 <tr>
//                   <td style="padding: 8px 0; color: ${BEAUTY_BUCKET_COLORS.primary}; font-size: 20px; width: 35px;">💄</td>
//                   <td style="padding: 8px 0; color: ${BEAUTY_BUCKET_COLORS.textDark};">Premium cosmetics and skincare curated for you</td>
//                 </tr>
//                 <tr>
//                   <td style="padding: 8px 0; color: ${BEAUTY_BUCKET_COLORS.primary}; font-size: 20px;">✨</td>
//                   <td style="padding: 8px 0; color: ${BEAUTY_BUCKET_COLORS.textDark};">100% authentic beauty products guaranteed</td>
//                 </tr>
//                 <tr>
//                   <td style="padding: 8px 0; color: ${BEAUTY_BUCKET_COLORS.primary}; font-size: 20px;">🚚</td>
//                   <td style="padding: 8px 0; color: ${BEAUTY_BUCKET_COLORS.textDark};">Fast delivery across Bangladesh</td>
//                 </tr>
//                 <tr>
//                   <td style="padding: 8px 0; color: ${BEAUTY_BUCKET_COLORS.primary}; font-size: 20px;">💝</td>
//                   <td style="padding: 8px 0; color: ${BEAUTY_BUCKET_COLORS.textDark};">Expert beauty advice & support</td>
//                 </tr>
//               </table>
//             </div>
            
//             <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; border-left: 4px solid ${BEAUTY_BUCKET_COLORS.secondary}; padding: 18px 20px; margin: 20px 0; border-radius: 10px; border: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; margin: 0; font-size: 13px;">
//                 <strong style="color: ${BEAUTY_BUCKET_COLORS.primary};">🔒 Important:</strong> If you didn't request this registration, please ignore this email. 
//                 Your account will not be activated without verification.
//               </p>
//             </div>
            
//             <!-- Divider -->
//             <div style="height: 2px; background: linear-gradient(90deg, transparent, ${BEAUTY_BUCKET_COLORS.border}, transparent); margin: 25px 0;"></div>
            
//             <!-- Call to Action -->
//             <div style="text-align: center; margin-top: 20px;">
//               <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 13px; margin-bottom: 15px;">
//                 <span style="font-family: 'Playfair Display', 'Georgia', serif; font-size: 14px; color: ${BEAUTY_BUCKET_COLORS.primary};">💖</span>
//                 Ready to explore the world of beauty?
//               </p>
//               <div style="text-align: center; margin: 15px 0 10px;">
//                 <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://beautybucket.com'}/products" 
//                    style="display: inline-block; background: linear-gradient(135deg, ${BEAUTY_BUCKET_COLORS.primary}, ${BEAUTY_BUCKET_COLORS.secondary}); color: #FFFFFF !important; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(82, 102, 90, 0.3);">
//                   🛍️ Explore Beauty Collection
//                 </a>
//               </div>
//             </div>
//           </div>
          
//           <!-- Footer -->
//           <div style="background: ${BEAUTY_BUCKET_COLORS.lightBg}; padding: 25px 30px; text-align: center; border-top: 1px solid ${BEAUTY_BUCKET_COLORS.border};">
//             <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 12px; margin: 0;">
//               &copy; ${new Date().getFullYear()} BeautyBucket. All rights reserved.<br>
//               <span style="font-size: 11px; font-family: 'Playfair Display', 'Georgia', serif; color: ${BEAUTY_BUCKET_COLORS.primary};">💖 Beauty is our passion. Thank you for being part of our beauty community! 💖</span>
//             </p>
//             <p style="color: ${BEAUTY_BUCKET_COLORS.textLight}; font-size: 11px; margin-top: 10px;">
//               <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://beautybucket.com'}" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none; font-weight: 600;">Visit Our Store</a> | 
//               <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://beautybucket.com'}/contact" style="color: ${BEAUTY_BUCKET_COLORS.primary}; text-decoration: none; font-weight: 600;">Support Center</a>
//             </p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     // Plain text version
//     const text = `
//       Welcome to BeautyBucket, ${contactPerson}! 💖

//       Thank you for joining BeautyBucket — your ultimate destination for premium beauty and cosmetic products!

//       Your OTP verification code is: ${otp}

//       This code is valid for 10 minutes.

//       💖 What Awaits You at BeautyBucket? 💖
//       💄 Premium cosmetics and skincare curated for you
//       ✨ 100% authentic beauty products guaranteed
//       🚚 Fast delivery across Bangladesh
//       💝 Expert beauty advice & support

//       🔒 Important: If you didn't request this registration, please ignore this email.

//       Visit us at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://beautybucket.com'}
//       Support: ${process.env.NEXT_PUBLIC_APP_URL || 'https://beautybucket.com'}/contact
//     `;

//     // Send email using the system email configuration
//     const result = await sendEmail(
//       email,
//       '💖 Verify Your Email - BeautyBucket',
//       html,
//       text,
//       'system'  // Use 'system' email type for OTP emails
//     );

//     if (result.success) {
//       console.log(`✅ OTP email sent successfully to ${email}`);
//       console.log(`📧 Message ID: ${result.messageId}`);
//       return true;
//     } else {
//       throw new Error(result.error);
//     }
//   } catch (error) {
//     console.error('❌ Email send error details:', {
//       error: error.message,
//       stack: error.stack
//     });
    
//     // More specific error messages
//     if (error.message.includes('authentication')) {
//       throw new Error('Email authentication failed. Please check your SMTP username and password in the admin panel.');
//     } else if (error.message.includes('connect') || error.message.includes('ENETUNREACH')) {
//       throw new Error(`Could not connect to SMTP server. Please check your network and firewall settings.`);
//     } else if (error.message.includes('timeout')) {
//       throw new Error('Connection to SMTP server timed out. Please check your network.');
//     } else {
//       throw new Error(`Failed to send OTP email: ${error.message}`);
//     }
//   }
// };

// module.exports = {
//   generateOTP,
//   sendOTPEmail
// };
// utils/emailOtpService.js
const { sendEmail, getFromAddress } = require('./emailService');

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

// Brand tagline — English only
const TAGLINE_EN = "Blockprint, Appliqué, and Handcrafted from Jessore — Every piece is made in our own workshop by skilled artisans.";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP email with Nishita's Creation branding using database-stored system email settings
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} contactPerson - User's name
 * @returns {Promise<boolean>}
 */
const sendOTPEmail = async (email, otp, contactPerson) => {
  try {
    // Get from address from database settings (system type)
    const from = await getFromAddress('system');
    
    if (!from.email) {
      throw new Error('System email not configured. Please set up email settings in admin panel.');
    }

    console.log(`📧 Attempting to send OTP email to: ${email}`);
    console.log(`📧 From: ${from.email} (${from.name})`);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap');
        </style>
      </head>
      <body style="font-family: 'Raleway', 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: ${NISHITAS_COLORS.lightBg};">
        <div style="max-width: 600px; margin: 20px auto; background-color: ${NISHITAS_COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 40px rgba(26, 26, 26, 0.08); border: 1px solid ${NISHITAS_COLORS.border};">
          
          <!-- Header with Nishita's Creation Branding -->
          <div style="background: linear-gradient(135deg, ${NISHITAS_COLORS.secondary}, ${NISHITAS_COLORS.primary}); padding: 35px 20px 30px; text-align: center; position: relative;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${NISHITAS_COLORS.gold}, ${NISHITAS_COLORS.primary}, ${NISHITAS_COLORS.gold});"></div>
            <div style="display: inline-block; background: rgba(255,255,255,0.12); border-radius: 10px; padding: 12px 24px; margin-bottom: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
              <span style="font-size: 24px; margin-right: 8px; color: ${NISHITAS_COLORS.white};">✦</span>
              <span style="font-family: 'Raleway', 'Inter', sans-serif; color: ${NISHITAS_COLORS.white}; font-weight: 700; font-size: 22px; letter-spacing: 1px;">Nishita's Creation</span>
            </div>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 12px; font-family: 'Raleway', 'Inter', sans-serif; letter-spacing: 3px; text-transform: uppercase;">Handcrafted Clothing</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: ${NISHITAS_COLORS.textDark}; margin-top: 0; font-family: 'Raleway', 'Inter', sans-serif; font-size: 22px; font-weight: 700;">
              Welcome to Nishita's Creation, ${contactPerson}!
            </h2>
            
            <p style="color: ${NISHITAS_COLORS.textLight}; line-height: 1.8; margin-bottom: 20px; font-size: 15px; font-family: 'Raleway', 'Inter', sans-serif;">
              Thank you for joining <strong>Nishita's Creation</strong> — a handcrafted clothing brand rooted in tradition. 
              To complete your registration and unlock access to our collection, please verify your email address using the OTP below:
            </p>

            <!-- Brand tagline block -->
            <div style="background: ${NISHITAS_COLORS.lightBg}; border-left: 4px solid ${NISHITAS_COLORS.primary}; padding: 18px 20px; margin: 20px 0; border-radius: 8px; border: 1px solid ${NISHITAS_COLORS.border};">
              <p style="color: ${NISHITAS_COLORS.textDark}; margin: 0; font-size: 13px; line-height: 1.8; font-family: 'Raleway', 'Inter', sans-serif; font-style: italic;">
                ${TAGLINE_EN}
              </p>
            </div>
            
            <!-- OTP Box -->
            <div style="background: ${NISHITAS_COLORS.lightBg}; border: 2px solid ${NISHITAS_COLORS.primary}; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; box-shadow: 0 4px 20px rgba(207, 27, 52, 0.12);">
              <p style="color: ${NISHITAS_COLORS.textLight}; font-size: 12px; margin-bottom: 10px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600; font-family: 'Raleway', 'Inter', sans-serif;">Verification Code</p>
              <h1 style="font-size: 48px; letter-spacing: 14px; background: linear-gradient(135deg, ${NISHITAS_COLORS.secondary}, ${NISHITAS_COLORS.primary}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 10px 0; font-family: 'Raleway', 'Inter', sans-serif; font-weight: 700;">${otp}</h1>
              <p style="color: ${NISHITAS_COLORS.textLight}; font-size: 12px; margin-top: 10px; font-family: 'Raleway', 'Inter', sans-serif;">Enter this code to verify your email</p>
            </div>
            
            <p style="color: ${NISHITAS_COLORS.textLight}; line-height: 1.8; font-family: 'Raleway', 'Inter', sans-serif;">
              This OTP is valid for <strong style="color: ${NISHITAS_COLORS.primary};">10 minutes</strong>.
            </p>
            
            <!-- Benefits Section -->
            <div style="background: ${NISHITAS_COLORS.lightBg}; border-radius: 10px; padding: 25px; margin: 30px 0; border: 1px solid ${NISHITAS_COLORS.border};">
              <p style="color: ${NISHITAS_COLORS.textDark}; font-weight: 700; margin-bottom: 15px; text-align: center; font-size: 15px; font-family: 'Raleway', 'Inter', sans-serif; letter-spacing: 0.5px;">What Awaits You at Nishita's Creation</p>
              <table style="width: 100%; font-size: 13px; font-family: 'Raleway', 'Inter', sans-serif;">
                <tr>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.primary}; font-size: 16px; width: 30px;">✦</td>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.textDark};">Handcrafted blockprint, appliqué, and Jessore handwork</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.primary}; font-size: 16px;">✦</td>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.textDark};">Made in our own workshop by skilled artisans</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.primary}; font-size: 16px;">✦</td>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.textDark};">Timeless designs, quality fabrics, honest craftsmanship</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.primary}; font-size: 16px;">✦</td>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.textDark};">Fast and reliable delivery across Bangladesh</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.primary}; font-size: 16px;">✦</td>
                  <td style="padding: 8px 0; color: ${NISHITAS_COLORS.textDark};">Personal customer care and styling support</td>
                </tr>
              </table>
            </div>
            
            <div style="background: ${NISHITAS_COLORS.lightBg}; border-left: 4px solid ${NISHITAS_COLORS.primary}; padding: 18px 20px; margin: 20px 0; border-radius: 8px; border: 1px solid ${NISHITAS_COLORS.border};">
              <p style="color: ${NISHITAS_COLORS.textLight}; margin: 0; font-size: 13px; font-family: 'Raleway', 'Inter', sans-serif;">
                <strong style="color: ${NISHITAS_COLORS.primary};">Important:</strong> If you didn't request this registration, please ignore this email. 
                Your account will not be activated without verification.
              </p>
            </div>
            
            <!-- Divider -->
            <div style="height: 2px; background: linear-gradient(90deg, transparent, ${NISHITAS_COLORS.border}, transparent); margin: 25px 0;"></div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: ${NISHITAS_COLORS.textLight}; font-size: 13px; margin-bottom: 15px; font-family: 'Raleway', 'Inter', sans-serif;">
                Ready to explore the collection?
              </p>
              <div style="text-align: center; margin: 15px 0 10px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://nishitascreation.com'}/products" 
                   style="display: inline-block; background: linear-gradient(135deg, ${NISHITAS_COLORS.secondary}, ${NISHITAS_COLORS.primary}); color: #FFFFFF !important; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(207, 27, 52, 0.3); font-family: 'Raleway', 'Inter', sans-serif;">
                  Browse Our Collection
                </a>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: ${NISHITAS_COLORS.lightBg}; padding: 25px 30px; text-align: center; border-top: 1px solid ${NISHITAS_COLORS.border};">
            <p style="color: ${NISHITAS_COLORS.textLight}; font-size: 12px; margin: 0; font-family: 'Raleway', 'Inter', sans-serif;">
              &copy; ${new Date().getFullYear()} Nishita's Creation. All rights reserved.<br>
              <span style="font-size: 11px; color: ${NISHITAS_COLORS.primary};">Handcrafted clothing from Jessore — made with care, worn with pride.</span>
            </p>
            <p style="color: ${NISHITAS_COLORS.textLight}; font-size: 11px; margin-top: 10px; font-family: 'Raleway', 'Inter', sans-serif;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://nishitascreation.com'}" style="color: ${NISHITAS_COLORS.primary}; text-decoration: none; font-weight: 600;">Visit Our Store</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://nishitascreation.com'}/contact" style="color: ${NISHITAS_COLORS.primary}; text-decoration: none; font-weight: 600;">Support Center</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Plain text version
    const text = `
      Welcome to Nishita's Creation, ${contactPerson}!

      Thank you for joining Nishita's Creation — a handcrafted clothing brand rooted in tradition.

      ${TAGLINE_EN}

      Your OTP verification code is: ${otp}

      This code is valid for 10 minutes.

      What Awaits You at Nishita's Creation:
      ✦ Handcrafted blockprint, appliqué, and Jessore handwork
      ✦ Made in our own workshop by skilled artisans
      ✦ Timeless designs, quality fabrics, honest craftsmanship
      ✦ Fast and reliable delivery across Bangladesh
      ✦ Personal customer care and styling support

      Important: If you didn't request this registration, please ignore this email.

      Visit us at: ${process.env.NEXT_PUBLIC_APP_URL || 'https://nishitascreation.com'}
      Support: ${process.env.NEXT_PUBLIC_APP_URL || 'https://nishitascreation.com'}/contact
    `;

    // Send email using the system email configuration
    const result = await sendEmail(
      email,
      'Verify Your Email - Nishita\'s Creation',
      html,
      text,
      'system'  // Use 'system' email type for OTP emails
    );

    if (result.success) {
      console.log(`✅ OTP email sent successfully to ${email}`);
      console.log(`📧 Message ID: ${result.messageId}`);
      return true;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('❌ Email send error details:', {
      error: error.message,
      stack: error.stack
    });
    
    // More specific error messages
    if (error.message.includes('authentication')) {
      throw new Error('Email authentication failed. Please check your SMTP username and password in the admin panel.');
    } else if (error.message.includes('connect') || error.message.includes('ENETUNREACH')) {
      throw new Error(`Could not connect to SMTP server. Please check your network and firewall settings.`);
    } else if (error.message.includes('timeout')) {
      throw new Error('Connection to SMTP server timed out. Please check your network.');
    } else {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail
};