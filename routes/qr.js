const express = require('express');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const QRCodeModel = require('../models/QRCode');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const MedicalReport = require('../models/MedicalReport');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate QR code for user
router.post('/generate', auth, async (req, res) => {
  try {
    const { qrType = 'Health Card', additionalData } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has a QR code
    let qrCodeRecord = await QRCodeModel.findOne({ userId: req.user.userId });

    if (!qrCodeRecord) {
      // Generate unique QR code
      const qrCode = await QRCodeModel.generateUniqueQRCode();
      
      // Generate access token
      const accessToken = require('crypto').randomBytes(32).toString('hex');

      qrCodeRecord = new QRCodeModel({
        userId: req.user.userId,
        qrCode,
        accessToken,
        qrType,
        additionalData: {
          emergencyContact: user.emergencyContact?.mobileNumber || user.mobileNumber,
          bloodGroup: user.bloodGroup,
          allergies: user.allergies,
          currentMedications: user.currentMedications,
          ...additionalData
        }
      });

      // Generate qrData immediately after creating the record
      qrCodeRecord.generateQRData();
      await qrCodeRecord.save();
    }

    // Generate QR data
    const qrData = qrCodeRecord.generateQRData();
    await qrCodeRecord.save();

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      message: 'QR code generated successfully',
      qrCode: {
        id: qrCodeRecord._id,
        qrCode: qrCodeRecord.qrCode,
        qrType: qrCodeRecord.qrType,
        qrData,
        qrImage: qrCodeImage,
        accessToken: qrCodeRecord.accessToken,
        isValid: qrCodeRecord.isValid,
        scanCount: qrCodeRecord.scanCount,
        lastScannedAt: qrCodeRecord.lastScannedAt
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's QR code
router.get('/', auth, async (req, res) => {
  try {
    const qrCodeRecord = await QRCodeModel.findOne({ userId: req.user.userId });

    if (!qrCodeRecord) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    // Generate QR data
    const qrData = qrCodeRecord.generateQRData();
    await qrCodeRecord.save();

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: {
        id: qrCodeRecord._id,
        qrCode: qrCodeRecord.qrCode,
        qrType: qrCodeRecord.qrType,
        qrData,
        qrImage: qrCodeImage,
        isValid: qrCodeRecord.isValid,
        scanCount: qrCodeRecord.scanCount,
        lastScannedAt: qrCodeRecord.lastScannedAt
      }
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Scan QR code and get user information
router.post('/scan', [
    body('qrCode').notEmpty().withMessage('QR code is required'),
    // Corrected line: removed .withMessage()
    body('accessToken').optional() 
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { qrCode, accessToken } = req.body;
  
      const qrCodeRecord = await QRCodeModel.findOne({ qrCode });
      if (!qrCodeRecord) {
        return res.status(404).json({ message: 'Invalid QR code' });
      }
  
      // Validate QR code
      if (!qrCodeRecord.validateQR()) {
        return res.status(400).json({ message: 'QR code has expired or is invalid' });
      }
  
      // Check access level
      if (qrCodeRecord.accessLevel === 'Restricted' && qrCodeRecord.accessToken !== accessToken) {
        return res.status(403).json({ message: 'Access denied - invalid access token' });
      }
  
      // Record the scan
      qrCodeRecord.recordScan();
  
      // Get user information
      const user = await User.findById(qrCodeRecord.userId).select('-otp -__v');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get latest health record
      const latestHealthRecord = await HealthRecord.findOne({ userId: user._id })
        .sort({ checkupDate: -1 })
        .select('checkupDate checkupType vitals diagnosis doctor followUp');
  
      // Get emergency information
      const emergencyInfo = {
        name: user.fullName,
        mobileNumber: user.mobileNumber,
        aadhaarNumber: user.aadhaarNumber,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
        currentMedications: user.currentMedications,
        emergencyContact: user.emergencyContact
      };
  
      // Get recent medical reports (last 3)
      const recentReports = await MedicalReport.find({ userId: user._id })
        .sort({ reportDate: -1 })
        .limit(3)
        .select('reportType reportName reportDate reportDetails.status accessCode');
  
      res.json({
        message: 'QR code scanned successfully',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          mobileNumber: user.mobileNumber,
          bloodGroup: user.bloodGroup,
          address: user.address
        },
        emergencyInfo,
        latestHealthRecord,
        recentReports,
        qrCodeInfo: {
          qrType: qrCodeRecord.qrType,
          scanCount: qrCodeRecord.scanCount,
          lastScannedAt: qrCodeRecord.lastScannedAt
        }
      });
    } catch (error) {
      console.error('Scan QR code error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  module.exports = router;