
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { generateOTP, sendOTPEmail } = require('../utils/emailOtpService');
const { generateOTP: generateResetOTP, sendPasswordResetOTP } = require('../utils/forgetPasswordOtpService');
const { sendSubscriptionConfirmationEmail, sendUnsubscribeConfirmationEmail } = require('../utils/subscriptionEmailService');
const { sendWelcomeEmail, sendGoogleWelcomeEmail } = require('../utils/welcomeEmailService');
const admin = require('../config/firebaseAdmin');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate email verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ============================================
// REGISTER USER
// ============================================
const registerUser = async (req, res) => {
  try {
    const { 
      contactPerson, 
      email, 
      phone, 
      whatsapp, 
      country, 
      address, 
      city, 
      zipCode, 
      password,
      role = 'customer' 
    } = req.body;

    // PREVENT users from registering as admin roles
    const allowedRoles = ['customer'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role for registration'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash the password BEFORE saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if all required fields are filled
    const requiredFields = ['contactPerson', 'phone', 'whatsapp', 'country', 'address', 'city', 'zipCode'];
    const allFieldsFilled = requiredFields.every(field => 
      req.body[field] && req.body[field].toString().trim() !== ''
    );

    // Create user with hashed password
    const user = await User.create({
      contactPerson,
      email,
      phone,
      whatsapp,
      country,
      address,
      city,
      zipCode,
      password: hashedPassword,
      role: 'customer',
      otp,
      otpExpiry,
      registrationStatus: 'pending',
      emailVerified: false,
      isActive: true,
      profileCompleted: allFieldsFilled,
      permissions: [],
      dashboardAccess: []
    });

    // Send OTP email
    await sendOTPEmail(email, otp, contactPerson);

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email for OTP.',
      data: {
        email: user.email,
        contactPerson: user.contactPerson,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
};

// ============================================
// VERIFY OTP
// ============================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      registrationStatus: 'pending'
    }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request or user already verified'
      });
    }

    if (user.otpExpiry < new Date()) {
      await User.deleteOne({ _id: user._id });
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please register again.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Check again in case fields were updated before verification
    const requiredFields = ['contactPerson', 'phone', 'whatsapp', 'country', 'address', 'city', 'zipCode'];
    const allFieldsFilled = requiredFields.every(field => 
      user[field] && user[field].toString().trim() !== ''
    );

    // Update user status
    user.isActive = true;
    user.emailVerified = true;
    user.registrationStatus = 'completed';
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.profileCompleted = allFieldsFilled;
    
    await user.save();

    sendWelcomeEmail(user.email, user.contactPerson, null)
      .catch(err => console.error('Background welcome email failed:', err));

    // Generate token with permissions
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ Email verified successfully for:', email);

    res.json({
      success: true,
      message: 'Email verified successfully! Registration complete.',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during verification'
    });
  }
};

// ============================================
// RESEND OTP
// ============================================
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      registrationStatus: 'pending'
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'No pending registration found for this email'
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with new OTP
    user.otp = newOTP;
    user.otpExpiry = newExpiry;
    await user.save();

    // Send new OTP email
    await sendOTPEmail(email, newOTP, user.contactPerson);

    console.log('✅ New OTP sent to:', email);

    res.json({
      success: true,
      message: 'New OTP sent successfully'
    });

  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend OTP'
    });
  }
};

// ============================================
// LOGIN USER
// ============================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (!user.emailVerified || user.registrationStatus !== 'completed') {
      return res.status(401).json({
        success: false,
        error: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// ============================================
// GET CURRENT USER PROFILE
// ============================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = user.toJSON();
    userData.role = user.role;
    userData.permissions = user.permissions || [];
    userData.dashboardAccess = user.dashboardAccess || [];

    res.json({
      success: true,
      user: userData,
      roleInfo: {
        role: user.role,
        permissions: user.permissions || [],
        dashboardAccess: user.dashboardAccess || [],
        isSuperAdmin: user.role === 'super_admin',
        isAdmin: user.role === 'admin' || user.role === 'super_admin',
        isModerator: ['super_admin', 'admin', 'moderator'].includes(user.role),
        isCallCenterAgent: ['super_admin', 'admin', 'moderator', 'call_center_agent'].includes(user.role)
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================
const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = [
      'contactPerson', 
      'phone', 
      'whatsapp', 
      'country', 
      'address', 
      'city', 
      'zipCode', 
      'businessType',
      'timezone',
      'notificationPreferences'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isGoogleUser = user.authProvider === 'google';
    
    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });

    if (isGoogleUser) {
      const requiredFields = ['country', 'address', 'city', 'zipCode', 'phone'];
      const allFieldsFilled = requiredFields.every(field => 
        user[field] && user[field] !== 'TBD' && user[field].trim() !== ''
      );
      
      if (allFieldsFilled) {
        user.profileCompleted = true;
      }
    }

    const saveOptions = isGoogleUser ? { validateBeforeSave: false } : {};
    await user.save(saveOptions);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters long'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ============================================
// VERIFY EMAIL
// ============================================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ============================================
// FORGOT PASSWORD
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email'
      });
    }

    const otp = generateResetOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    await user.save();

    try {
      await sendPasswordResetOTP(email, otp, user.contactPerson || 'User');
    } catch (emailError) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email. Please try again.'
      });
    }

    console.log('✅ Password reset OTP sent to:', email);

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email',
      email: email
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ============================================
// VERIFY RESET OTP
// ============================================
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and OTP'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase()
    }).select('+resetPasswordOTP +resetPasswordOTPExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({
        success: false,
        error: 'No reset request found. Please request again.'
      });
    }

    if (user.resetPasswordOTPExpiry < new Date()) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpiry = undefined;
      await user.save();
      
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request again.'
      });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    console.log('✅ Password reset OTP verified for:', email);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      email: user.email
    });

  } catch (error) {
    console.error('❌ Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ============================================
// RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    console.log('Reset password request received:', { email, otp, password: '***' });

    if (!email || !otp || !password) {
      console.log('Missing fields:', { email: !!email, otp: !!otp, password: !!password });
      return res.status(400).json({
        success: false,
        error: 'Please provide email, OTP and new password'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase()
    }).select('+resetPasswordOTP +resetPasswordOTPExpiry +password');

    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('User found:', user.email);
    console.log('Stored OTP:', user.resetPasswordOTP);
    console.log('Received OTP:', otp);
    console.log('OTP Expiry:', user.resetPasswordOTPExpiry);

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      console.log('OTP mismatch');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP. Please request again.'
      });
    }

    if (user.resetPasswordOTPExpiry < new Date()) {
      console.log('OTP expired');
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request again.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpiry = undefined;
    await user.save();

    console.log('✅ Password reset successful for:', email);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// In authController.js - Update googleAuth function

// const googleAuth = async (req, res) => {
//   try {
//     const { idToken } = req.body;

//     if (!idToken) {
//       return res.status(400).json({
//         success: false,
//         error: 'ID token is required'
//       });
//     }

//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const { email, name, picture, uid, email_verified } = decodedToken;

//     let user = await User.findOne({ email: email.toLowerCase() });

//     if (user) {
//       // ✅ Update firebaseUid if not set
//       if (!user.firebaseUid) {
//         user.firebaseUid = uid;
//         user.authProvider = 'google';
//         user.emailVerified = user.emailVerified || email_verified;
//         await user.save();
//       }
      
//       // ✅ ENSURE Super Admin has permissions
//       if (user.role === 'super_admin') {
//         if (!user.permissions || user.permissions.length === 0) {
//           user.permissions = ['*'];
//           user.dashboardAccess = [
//             'analytics', 'users', 'products', 'orders', 'content',
//             'reviews', 'support', 'settings', 'coupons', 'banners',
//             'blogs', 'delivery', 'payments', 'roles'
//           ];
//           await user.save();
//         }
//       }
//     } else {
//       // Create new user (regular customer)
//       const contactPerson = name || email.split('@')[0];
      
//       const randomPassword = Math.random().toString(36).slice(-16);
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(randomPassword, salt);

//       user = new User({
//         contactPerson: contactPerson,
//         email: email.toLowerCase(),
//         phone: '',
//         whatsapp: '',
//         country: '',
//         address: '',
//         city: '',
//         zipCode: '',
//         role: 'customer',
//         password: hashedPassword,
//         businessType: 'Retailer',
//         isActive: true,
//         emailVerified: email_verified,
//         registrationStatus: 'completed',
//         firebaseUid: uid,
//         authProvider: 'google',
//         profilePicture: picture || '',
//         permissions: [],
//         dashboardAccess: []
//       });

//       await user.save();
//     }

//     // ✅ Generate token with ALL permissions
//     const token = jwt.sign(
//       { 
//         id: user._id, 
//         email: user.email,
//         role: user.role,
//         permissions: user.permissions || []
//       },
//       process.env.JWT_SECRET || 'your-secret-key-change-this',
//       { expiresIn: process.env.JWT_EXPIRE || '7d' }
//     );

//     // ✅ Prepare user data with ALL fields
//     const userData = user.toJSON();
    
//     // ✅ ENSURE permissions and dashboardAccess are always present
//     if (user.role === 'super_admin') {
//       userData.permissions = ['*'];
//       userData.dashboardAccess = [
//         'analytics', 'users', 'products', 'orders', 'content',
//         'reviews', 'support', 'settings', 'coupons', 'banners',
//         'blogs', 'delivery', 'payments', 'roles'
//       ];
//     } else {
//       userData.permissions = user.permissions || [];
//       userData.dashboardAccess = user.dashboardAccess || [];
//     }

//     const isProfileComplete = !!(user.country && user.address && user.city && user.zipCode && user.phone);

//     console.log('✅ Google auth successful for:', email);
//     console.log('👤 User role:', user.role);
//     console.log('🔑 Permissions:', userData.permissions);
//     console.log('📊 Dashboard Access:', userData.dashboardAccess);

//     res.json({
//       success: true,
//       message: 'Google authentication successful',
//       token,
//       user: userData,
//       isProfileComplete,
//       requiresAdditionalInfo: !isProfileComplete
//     });

//   } catch (error) {
//     console.error('❌ Google auth error:', error);
    
//     if (error.code === 'auth/id-token-expired') {
//       return res.status(401).json({
//         success: false,
//         error: 'Google token expired'
//       });
//     }
    
//     if (error.code === 'auth/argument-error') {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid Google token'
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: 'Google authentication failed'
//     });
//   }
// };

// In authController.js - Update googleAuth function

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid, email_verified } = decodedToken;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // ✅ Update firebaseUid if not set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.authProvider = 'google';
        user.emailVerified = user.emailVerified || email_verified;
        await user.save();
      }
      
      // ✅ ENSURE Super Admin has all page permissions
      if (user.role === 'super_admin') {
        const allPageKeys = [
          'dashboard', 'profit_margin',
          'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score',
          'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
          'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer',
            'deal_management', 'trust_results_management',
          'terms_management', 'privacy_management', 'contact_management', 'about_management',
          'pixel_settings', 'custom_code',
          'manage_reviews',
          'create_users', 'manage_users', 'manage_customers', 'role_management',
          'delivery_settings', 'media_library', 'email_settings', 'settings'
        ];
        
        if (!user.permissions || user.permissions.length === 0 || !user.permissions.includes('*')) {
          user.permissions = ['*'];
          user.dashboardAccess = allPageKeys;
          await user.save();
        }
      }
    } else {
      // Create new user (regular customer)
      const contactPerson = name || email.split('@')[0];
      
      const randomPassword = Math.random().toString(36).slice(-16);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        contactPerson: contactPerson,
        email: email.toLowerCase(),
        phone: '',
        whatsapp: '',
        country: '',
        address: '',
        city: '',
        zipCode: '',
        role: 'customer',
        password: hashedPassword,
        businessType: 'Retailer',
        isActive: true,
        emailVerified: email_verified,
        registrationStatus: 'completed',
        firebaseUid: uid,
        authProvider: 'google',
        profilePicture: picture || '',
        permissions: [],
        dashboardAccess: []
      });

      await user.save();
    }

    // ✅ Generate token with ALL permissions
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // ✅ Prepare user data with ALL fields
    const userData = user.toJSON();
    
    // ✅ ENSURE permissions and dashboardAccess are always present
    if (user.role === 'super_admin') {
      userData.permissions = ['*'];
      userData.dashboardAccess = [
        'dashboard', 'profit_margin',
        'all_orders', 'incomplete_orders', 'order_restrictions', 'courier_settings', 'courier_score',
        'all_products', 'create_products', 'product_cost', 'create_category', 'manage_brands', 'manage_tags',
        'manage_navbar', 'create_banner', 'manage_banner', 'manage_homepage', 'manage_footer',
        'terms_management', 'privacy_management', 'contact_management', 'about_management',
        'pixel_settings', 'custom_code',
        'manage_reviews',
        'create_users', 'manage_users', 'manage_customers', 'role_management',
        'delivery_settings', 'media_library', 'email_settings', 'settings'
      ];
    } else {
      userData.permissions = user.permissions || [];
      userData.dashboardAccess = user.dashboardAccess || [];
    }

    const isProfileComplete = !!(user.country && user.address && user.city && user.zipCode && user.phone);

    console.log('✅ Google auth successful for:', email);
    console.log('👤 User role:', user.role);
    console.log('🔑 Permissions:', userData.permissions);
    console.log('📊 Dashboard Access:', userData.dashboardAccess);

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: userData,
      isProfileComplete,
      requiresAdditionalInfo: !isProfileComplete
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Google token expired'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
};

// ============================================
// COMPLETE PROFILE
// ============================================
const completeProfile = async (req, res) => {
  try {
    const {
      contactPerson,
      phone,
      whatsapp,
      country,
      address,
      city,
      zipCode,
      businessType
    } = req.body;

    const requiredFields = ['contactPerson', 'phone', 'whatsapp', 'country', 'address', 'city', 'zipCode'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field] === '');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.contactPerson = contactPerson;
    user.phone = phone;
    user.whatsapp = whatsapp;
    user.country = country;
    user.address = address;
    user.city = city;
    user.zipCode = zipCode;
    
    if (businessType) user.businessType = businessType;
    
    user.profileCompleted = true;
    
    if (user.authProvider === 'google') {
      await user.save({ validateBeforeSave: false });
    } else {
      await user.save();
    }
    
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Profile completed successfully',
      token,
      user: user.toJSON(),
      isComplete: true
    });

  } catch (error) {
    console.error('❌ Complete profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete profile'
    });
  }
};

// ============================================
// GOOGLE SIGNUP
// ============================================
const googleSignup = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid, email_verified } = decodedToken;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please login instead.',
        existingUser: true
      });
    }

    const contactPerson = name || email.split('@')[0];
    
    const randomPassword = Math.random().toString(36).slice(-16);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    user = new User({
      contactPerson: contactPerson,
      email: email.toLowerCase(),
      phone: '',
      whatsapp: '',
      country: '',
      address: '',
      city: '',
      zipCode: '',
      role: 'customer',
      password: hashedPassword,
      businessType: 'Retailer',
      isActive: true,
      emailVerified: email_verified,
      registrationStatus: 'completed',
      firebaseUid: uid,
      authProvider: 'google',
      profilePicture: picture || '',
      permissions: [],
      dashboardAccess: []
    });

    await user.save();

    const isProfileComplete = !!(user.country && user.address && user.city && user.zipCode && user.phone);
    sendGoogleWelcomeEmail(user.email, user.contactPerson, !isProfileComplete)
      .catch(err => console.error('Background welcome email failed:', err));

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role,
        permissions: user.permissions || []
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Google signup successful',
      token,
      user: user.toJSON(),
      isNewUser: true,
      requiresAdditionalInfo: !isProfileComplete
    });

  } catch (error) {
    console.error('❌ Google signup error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Google token expired'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Google token'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Google signup failed'
    });
  }
};

// ============================================
// CHECK PROFILE STATUS
// ============================================
const checkProfileStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('contactPerson phone whatsapp country address city zipCode profileCompleted authProvider');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let requiredFields = ['contactPerson', 'phone', 'whatsapp', 'country', 'address', 'city', 'zipCode'];
    
    const missingFields = requiredFields.filter(field => {
      const value = user[field];
      return !value || value === '' || value === 'TBD';
    });
    
    const isComplete = missingFields.length === 0;
    
    if (isComplete !== user.profileCompleted) {
      user.profileCompleted = isComplete;
      await user.save();
    }
    
    res.json({
      success: true,
      data: {
        isComplete,
        missingFields,
        profileCompleted: user.profileCompleted,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('❌ Check profile status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// ============================================
// ADMIN CREATE CUSTOMER
// ============================================
const adminCreateCustomer = async (req, res) => {
  try {
    console.log('📝 Admin creating customer account');

    const {
      contactPerson,
      email,
      phone,
      whatsapp,
      country,
      address,
      city,
      zipCode,
      password,
      businessType
    } = req.body;

    const missingFields = [];
    if (!contactPerson) missingFields.push('contactPerson');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!country) missingFields.push('country');
    if (!address) missingFields.push('address');
    if (!city) missingFields.push('city');
    if (!zipCode) missingFields.push('zipCode');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      contactPerson,
      email: email.toLowerCase(),
      phone,
      whatsapp: whatsapp || '',
      country,
      address,
      city,
      zipCode,
      role: 'customer',
      password: hashedPassword,
      businessType: businessType || 'Retailer',
      isActive: true,
      emailVerified: true,
      registrationStatus: 'completed',
      authProvider: 'local',
      createdBy: req.user.id,
      permissions: [],
      dashboardAccess: []
    });

    await user.save();

    console.log('✅ Customer account created by admin:', user._id);

    try {
      await sendWelcomeEmail(user.email, user.contactPerson);
      console.log('✅ Welcome email sent to:', email);
    } catch (emailError) {
      console.error('⚠️ Welcome email failed but account created:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Customer account created successfully! Welcome email sent.',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Admin create customer error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error during customer creation'
    });
  }
};

// ============================================
// 🆕 SUPER ADMIN CREATE STAFF ACCOUNT
// ============================================
const createStaffAccount = async (req, res) => {
  try {
    console.log('📝 Super Admin creating staff account');

    const {
      contactPerson,
      email,
      phone,
      whatsapp,
      country,
      address,
      city,
      zipCode,
      password,
      role,
      permissions,
      dashboardAccess
    } = req.body;

    // Validate role - only these roles can be created
    const allowedRoles = ['admin', 'moderator', 'call_center_agent'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Role must be one of: ${allowedRoles.join(', ')}`
      });
    }

    // Validate required fields
    const missingFields = [];
    if (!contactPerson) missingFields.push('contactPerson');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get default permissions and dashboard access from config
    const rolePermissions = require('../config/rolePermissions');
    const defaultPermissions = rolePermissions[role]?.permissions || [];
    const defaultDashboardAccess = rolePermissions[role]?.dashboardAccess || [];

    // Create new staff user
    const user = new User({
      contactPerson,
      email: email.toLowerCase(),
      phone,
      whatsapp: whatsapp || '',
      country: country || '',
      address: address || '',
      city: city || '',
      zipCode: zipCode || '',
      role: role,
      password: hashedPassword,
      isActive: true,
      emailVerified: true,
      registrationStatus: 'completed',
      authProvider: 'local',
      createdBy: req.user.id,
      permissions: permissions || defaultPermissions,
      dashboardAccess: dashboardAccess || defaultDashboardAccess,
      roleAssignedBy: req.user.id,
      roleAssignedAt: new Date()
    });

    await user.save();

    console.log('✅ Staff account created by super admin:', user._id);

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.contactPerson, role);
      console.log('✅ Welcome email sent to:', email);
    } catch (emailError) {
      console.error('⚠️ Welcome email failed but account created:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: `Staff account (${role}) created successfully!`,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('❌ Create staff error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server error during staff creation'
    });
  }
};

// ============================================
// 🆕 UPDATE USER ROLE (Super Admin only)
// ============================================
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions, dashboardAccess, isActive } = req.body;

    // Prevent self-demotion
    if (userId === req.user.id && role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'You cannot demote yourself'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent modifying super_admin account (except by another super_admin)
    if (user.role === 'super_admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify super admin account'
      });
    }

    // Validate role
    const validRoles = ['super_admin', 'admin', 'moderator', 'call_center_agent', 'customer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Update fields
    if (role) user.role = role;
    if (permissions) user.permissions = permissions;
    if (dashboardAccess) user.dashboardAccess = dashboardAccess;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    
    user.roleAssignedBy = req.user.id;
    user.roleAssignedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user.toJSON()
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

// ============================================
// 🆕 GET DASHBOARD ACCESS
// ============================================
const getDashboardAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Define all possible dashboard sections
    const allSections = [
      'analytics',
      'users',
      'products',
      'orders',
      'content',
      'reviews',
      'support',
      'settings',
      'coupons',
      'banners',
      'blogs',
      'delivery',
      'payments',
      'roles'
    ];

    // Super Admin has access to everything
    if (user.role === 'super_admin') {
      return res.json({
        success: true,
        data: {
          role: user.role,
          access: allSections,
          canConfigure: true,
          isSuperAdmin: true
        }
      });
    }

    // Other roles: use dashboardAccess array or default based on role
    let access = user.dashboardAccess || [];
    
    // If no custom access defined, use role defaults
    if (access.length === 0) {
      const roleDefaults = {
        admin: ['analytics', 'users', 'products', 'orders', 'content', 'reviews', 'coupons', 'banners', 'blogs', 'payments'],
        moderator: ['analytics', 'products', 'content', 'reviews', 'banners', 'blogs'],
        call_center_agent: ['analytics', 'orders', 'support', 'delivery'],
        customer: []
      };
      access = roleDefaults[user.role] || [];
    }

    res.json({
      success: true,
      data: {
        role: user.role,
        access: access,
        canConfigure: false,
        isSuperAdmin: false
      }
    });
  } catch (error) {
    console.error('Get dashboard access error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard access'
    });
  }
};

// ============================================
// SUBSCRIBE TO NEWSLETTER
// ============================================
const subscribeToNewsletter = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isSubscribedToNewsletter) {
      return res.status(400).json({
        success: false,
        error: 'Already subscribed to newsletter'
      });
    }

    user.isSubscribedToNewsletter = true;
    user.newsletterSubscriptionDate = new Date();
    await user.save();

    const emailName = user.contactPerson || user.email.split('@')[0];
    sendSubscriptionConfirmationEmail(user.email, emailName)
      .catch(err => console.error('Background subscription email failed:', err));

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      isSubscribed: true
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe'
    });
  }
};

// ============================================
// UNSUBSCRIBE FROM NEWSLETTER
// ============================================
const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isSubscribedToNewsletter) {
      return res.status(400).json({
        success: false,
        error: 'Not subscribed to newsletter'
      });
    }

    user.isSubscribedToNewsletter = false;
    user.newsletterSubscriptionDate = null;
    await user.save();

    const emailName = user.contactPerson || user.email.split('@')[0];
    sendUnsubscribeConfirmationEmail(user.email, emailName)
      .catch(err => console.error('Background unsubscribe email failed:', err));

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      isSubscribed: false
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe'
    });
  }
};

// ============================================
// GET SUBSCRIPTION STATUS
// ============================================
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      isSubscribed: user?.isSubscribedToNewsletter || false,
      subscribedSince: user?.newsletterSubscriptionDate || null
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription status'
    });
  }
};

// ============================================
// LOGOUT USER
// ============================================
const logoutUser = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyResetOTP,
  googleAuth,
  completeProfile,
  checkProfileStatus,
  googleSignup,
  adminCreateCustomer,
  logoutUser,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getSubscriptionStatus,
  
  // 🆕 New exports for role management
  createStaffAccount,
  updateUserRole,
  getDashboardAccess
};
