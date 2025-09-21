const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOTP, sendLoginOTP } = require('../services/twilio');

const router = express.Router();

// Send OTP for registration
router.post('/send-otp-registration', [
  body('mobileNumber').isMobilePhone('en-IN').withMessage('Valid mobile number required'),
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).isNumeric().withMessage('Valid Aadhaar number required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobileNumber, aadhaarNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { mobileNumber },
        { aadhaarNumber }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this mobile number or Aadhaar number'
      });
    }

    // Create a temporary registration session (using a separate collection or in-memory store)
    // For simplicity, we'll store this temporarily in a global object
    // In production, use Redis or a separate MongoDB collection
    
    const tempRegistrations = global.tempRegistrations || (global.tempRegistrations = new Map());
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store temporary registration data
    tempRegistrations.set(mobileNumber, {
      mobileNumber,
      aadhaarNumber,
      otp,
      otpExpiry,
      attempts: 0
    });

    // Send OTP via SMS using Twilio
    const smsResult = await sendOTP(mobileNumber, otp);
    
    if (!smsResult.success) {
      console.error('Failed to send SMS:', smsResult.error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Twilio not configured or SMS failed; proceeding in development mode and exposing OTP in response.');
        console.log(`DEV ONLY - Registration OTP for ${mobileNumber}: ${otp}`);
        return res.json({
          message: 'OTP generated (DEV MODE - SMS not sent)',
          mobileNumber,
          expiresIn: '10 minutes',
          code: 'OTP_SENT_DEV',
          devOTP: otp
        });
      }
      // Remove from temp storage if SMS fails in non-dev environments
      tempRegistrations.delete(mobileNumber);
      return res.status(500).json({ 
        message: 'Failed to send OTP. Please try again.' 
      });
    }

    console.log(`OTP for ${mobileNumber}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      mobileNumber,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and complete registration
router.post('/verify-otp-registration', [
  body('mobileNumber').isMobilePhone('en-IN').withMessage('Valid mobile number required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Valid OTP required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { mobileNumber, otp, firstName, lastName, dateOfBirth, gender, email, address, emergencyContact, bloodGroup, workDetails } = req.body;

    // Get temporary registration data
    const tempRegistrations = global.tempRegistrations || new Map();
    const tempData = tempRegistrations.get(mobileNumber);
    
    if (!tempData) {
      return res.status(400).json({ message: 'Registration session not found. Please request OTP again.' });
    }

    // Verify OTP
    if (tempData.otp !== otp) {
      tempData.attempts += 1;
      if (tempData.attempts >= 3) {
        tempRegistrations.delete(mobileNumber);
        return res.status(400).json({ message: 'Too many failed attempts. Please request OTP again.' });
      }
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP has expired
    if (new Date() > tempData.otpExpiry) {
      tempRegistrations.delete(mobileNumber);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Create new user with all required information
    const user = new User({
      firstName,
      lastName,
      mobileNumber,
      aadhaarNumber: tempData.aadhaarNumber,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      email: email || undefined,
      address: address || undefined,
      emergencyContact: emergencyContact || undefined,
      bloodGroup: bloodGroup || undefined,
      workDetails: workDetails || undefined,
      isVerified: true
    });

    await user.save();
    
    // Remove temporary registration data
    tempRegistrations.delete(mobileNumber);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, mobileNumber: user.mobileNumber },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Registration completed successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Verify OTP registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for login
router.post('/send-otp-login', [
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).isNumeric().withMessage('Valid Aadhaar number required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { aadhaarNumber } = req.body;

    // Find user by Aadhaar number
    const user = await User.findOne({ aadhaarNumber });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found with this Aadhaar number. Please register first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        message: 'Please complete your registration first.',
        code: 'USER_NOT_VERIFIED'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({ 
        message: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    if (user.isLocked()) {
      const lockTime = new Date(user.lockUntil);
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to too many failed attempts.',
        code: 'ACCOUNT_LOCKED',
        unlockTime: lockTime.toISOString()
      });
    }

    // Generate and send OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP via SMS using Twilio
    const smsResult = await sendLoginOTP(user.mobileNumber, otp);
    
    if (!smsResult.success) {
      console.error('Failed to send login SMS:', smsResult.error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Twilio not configured or SMS failed; proceeding in development mode and exposing OTP in response.');
        const maskedMobileDev = user.mobileNumber.replace(/(\d{3})(\d{5})(\d{2})/, '$1*****$3');
        console.log(`DEV ONLY - Login OTP for ${user.mobileNumber}: ${otp}`);
        return res.json({
          message: 'OTP generated (DEV MODE - SMS not sent)',
          mobileNumber: maskedMobileDev,
          fullName: user.fullName,
          expiresIn: '10 minutes',
          code: 'OTP_SENT_DEV',
          devOTP: otp,
        });
      }
      return res.status(500).json({ 
        message: 'Failed to send OTP. Please try again.',
        code: 'SMS_SEND_FAILED',
        ...(process.env.NODE_ENV === 'development' ? { twilioError: smsResult.error } : {})
      });
    }

    // Mask mobile number for security (show first 3 and last 2 digits)
    const maskedMobile = user.mobileNumber.replace(/(\d{3})(\d{5})(\d{2})/, '$1*****$3');

    console.log(`Login OTP sent to ${user.mobileNumber}: ${otp}`);

    res.json({
      message: 'OTP sent successfully to your registered mobile number',
      mobileNumber: maskedMobile,
      fullName: user.fullName,
      expiresIn: '10 minutes',
      code: 'OTP_SENT'
    });

  } catch (error) {
    console.error('Send OTP login error:', error);
    res.status(500).json({ 
      message: 'Server error occurred. Please try again.',
      code: 'SERVER_ERROR'
    });
  }
});

// Verify OTP and login
router.post('/verify-otp-login', [
  body('aadhaarNumber').isLength({ min: 12, max: 12 }).isNumeric().withMessage('Valid Aadhaar number required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Valid OTP required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { aadhaarNumber, otp } = req.body;

    const user = await User.findOne({ aadhaarNumber });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({ 
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    if (user.isLocked()) {
      const lockTime = new Date(user.lockUntil);
      return res.status(423).json({ 
        message: 'Account is temporarily locked',
        code: 'ACCOUNT_LOCKED',
        unlockTime: lockTime.toISOString()
      });
    }

    // Verify OTP
    const otpValid = user.verifyOTP(otp);
    if (!otpValid) {
      // Save the user with updated OTP attempts first
      await user.save();
      // Then increment login attempts (this uses updateOne, not save)
      await user.incLoginAttempts();
      
      // Get remaining attempts
      const remainingAttempts = 5 - (user.loginAttempts + 1);
      
      return res.status(400).json({ 
        message: 'Invalid or expired OTP',
        code: 'INVALID_OTP',
        remainingAttempts: Math.max(0, remainingAttempts)
      });
    }

    // Reset login attempts and update last login (these use updateOne, not save)
    await user.resetLoginAttempts();
    // Update last login directly in database
    await user.updateOne({ lastLogin: new Date() });

    // Generate JWT token with more user info
    const token = jwt.sign(
      { 
        userId: user._id, 
        mobileNumber: user.mobileNumber,
        aadhaarNumber: user.aadhaarNumber,
        isVerified: user.isVerified
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Mask Aadhaar number in response
    const maskedAadhaar = user.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '****-****-$3');

    res.json({
      message: `Welcome back, ${user.firstName}! Login successful.`,
      token,
      code: 'LOGIN_SUCCESS',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        aadhaarNumber: maskedAadhaar,
        email: user.email,
        bloodGroup: user.bloodGroup,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Verify OTP login error:', error);
    res.status(500).json({ 
      message: 'Server error occurred. Please try again.',
      code: 'SERVER_ERROR'
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-otp -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedUpdates = ['firstName', 'lastName', 'email', 'address', 'emergencyContact', 'bloodGroup', 'allergies', 'currentMedications', 'workDetails'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bloodGroup: user.bloodGroup,
        address: user.address,
        emergencyContact: user.emergencyContact
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// System configuration check endpoint (for development/testing)
router.get('/config-check', async (req, res) => {
  try {
    const config = {
      database: {
        status: 'unknown',
        connected: false
      },
      twilio: {
        status: 'unknown',
        configured: false
      },
      jwt: {
        configured: !!process.env.JWT_SECRET
      }
    };

    // Check MongoDB connection
    try {
      const mongoose = require('mongoose');
      config.database.connected = mongoose.connection.readyState === 1;
      config.database.status = config.database.connected ? 'connected' : 'disconnected';
    } catch (err) {
      config.database.status = 'error';
    }

    // Check Twilio configuration
    const { 
      TWILIO_ACCOUNT_SID, 
      TWILIO_AUTH_TOKEN, 
      TWILIO_PHONE_NUMBER,
      TWILIO_MESSAGING_SERVICE_SID 
    } = process.env;
    
    config.twilio.configured = !!(
      TWILIO_ACCOUNT_SID && 
      TWILIO_AUTH_TOKEN && 
      (TWILIO_PHONE_NUMBER || TWILIO_MESSAGING_SERVICE_SID)
    );
    config.twilio.status = config.twilio.configured ? 'configured' : 'missing_credentials';

    const overallStatus = config.database.connected && config.twilio.configured && config.jwt.configured;

    res.json({
      message: 'System configuration check',
      status: overallStatus ? 'ready' : 'needs_configuration',
      config,
      recommendations: {
        ...(!config.database.connected ? { database: 'Check MongoDB connection string and network access' } : {}),
        ...(!config.twilio.configured ? { twilio: 'Configure Twilio credentials for SMS functionality' } : {}),
        ...(!config.jwt.configured ? { jwt: 'Set JWT_SECRET environment variable' } : {})
      }
    });
  } catch (error) {
    console.error('Config check error:', error);
    res.status(500).json({ 
      message: 'Error checking system configuration',
      error: error.message 
    });
  }
});

module.exports = router;
