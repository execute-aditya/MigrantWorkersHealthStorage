const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const MedicalReport = require('../models/MedicalReport');
const HealthRecord = require('../models/HealthRecord');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/reports';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Get all medical reports for a user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId };
    if (type) {
      query.reportType = type;
    }

    const reports = await MedicalReport.find(query)
      .sort({ reportDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName mobileNumber')
      .populate('healthRecordId', 'checkupDate checkupType doctor');

    const total = await MedicalReport.countDocuments(query);

    res.json({
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get medical reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific medical report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await MedicalReport.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('userId', 'firstName lastName mobileNumber aadhaarNumber')
      .populate('healthRecordId', 'checkupDate checkupType doctor');

    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get medical report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new medical report
router.post('/', auth, upload.single('reportFile'), [
  body('healthRecordId').isMongoId().withMessage('Valid health record ID required'),
  body('reportType').isIn(['Blood Test', 'X-Ray', 'CT Scan', 'MRI', 'ECG', 'Ultrasound', 'Pathology', 'Microbiology', 'Other']).withMessage('Valid report type required'),
  body('reportName').notEmpty().withMessage('Report name is required'),
  body('reportDate').isISO8601().withMessage('Valid report date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify health record belongs to user
    const healthRecord = await HealthRecord.findOne({
      _id: req.body.healthRecordId,
      userId: req.user.userId
    });

    if (!healthRecord) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    const reportData = {
      ...req.body,
      userId: req.user.userId,
      healthRecordId: req.body.healthRecordId
    };

    if (req.file) {
      reportData.fileInfo = {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };
    }

    const medicalReport = new MedicalReport(reportData);
    await medicalReport.save();

    await medicalReport.populate('userId', 'firstName lastName mobileNumber');
    await medicalReport.populate('healthRecordId', 'checkupDate checkupType doctor');

    res.status(201).json({
      message: 'Medical report created successfully',
      report: medicalReport
    });
  } catch (error) {
    console.error('Create medical report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medical report
router.put('/:id', auth, [
  body('reportType').optional().isIn(['Blood Test', 'X-Ray', 'CT Scan', 'MRI', 'ECG', 'Ultrasound', 'Pathology', 'Microbiology', 'Other']).withMessage('Valid report type required'),
  body('reportName').optional().notEmpty().withMessage('Report name cannot be empty'),
  body('reportDate').optional().isISO8601().withMessage('Valid report date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const report = await MedicalReport.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }

    const allowedUpdates = [
      'reportType', 'reportName', 'reportDate', 'reportDetails',
      'labInfo', 'isPublic', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    });

    await report.save();
    await report.populate('userId', 'firstName lastName mobileNumber');
    await report.populate('healthRecordId', 'checkupDate checkupType doctor');

    res.json({
      message: 'Medical report updated successfully',
      report
    });
  } catch (error) {
    console.error('Update medical report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete medical report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await MedicalReport.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }

    // Delete file if exists
    if (report.fileInfo && report.fileInfo.filePath) {
      try {
        fs.unlinkSync(report.fileInfo.filePath);
      } catch (fileError) {
        console.error('File deletion error:', fileError);
      }
    }

    await MedicalReport.findByIdAndDelete(req.params.id);

    res.json({ message: 'Medical report deleted successfully' });
  } catch (error) {
    console.error('Delete medical report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download medical report file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const report = await MedicalReport.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }

    if (!report.fileInfo || !report.fileInfo.filePath) {
      return res.status(404).json({ message: 'Report file not found' });
    }

    const filePath = report.fileInfo.filePath;
    const fileName = report.fileInfo.originalName || report.fileInfo.fileName;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Download medical report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report by access code (for QR code access)
router.get('/access/:accessCode', async (req, res) => {
  try {
    const report = await MedicalReport.findOne({
      accessCode: req.params.accessCode,
      isPublic: true
    }).populate('userId', 'firstName lastName mobileNumber')
      .populate('healthRecordId', 'checkupDate checkupType doctor');

    if (!report) {
      return res.status(404).json({ message: 'Report not found or access denied' });
    }

    // Record the scan
    report.recordScan();

    res.json({
      report: {
        id: report._id,
        reportType: report.reportType,
        reportName: report.reportName,
        reportDate: report.reportDate,
        reportDetails: report.reportDetails,
        labInfo: report.labInfo,
        user: report.userId,
        healthRecord: report.healthRecordId
      }
    });
  } catch (error) {
    console.error('Get report by access code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search medical reports
router.get('/search', auth, async (req, res) => {
  try {
    const { q, type, startDate, endDate } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId };

    if (type) {
      query.reportType = type;
    }

    if (startDate && endDate) {
      query.reportDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (q) {
      query.$or = [
        { reportName: { $regex: q, $options: 'i' } },
        { 'reportDetails.findings': { $regex: q, $options: 'i' } },
        { 'reportDetails.conclusion': { $regex: q, $options: 'i' } },
        { 'labInfo.name': { $regex: q, $options: 'i' } }
      ];
    }

    const reports = await MedicalReport.find(query)
      .sort({ reportDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName mobileNumber')
      .populate('healthRecordId', 'checkupDate checkupType doctor');

    const total = await MedicalReport.countDocuments(query);

    res.json({
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search medical reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
