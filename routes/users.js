const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const MedicalReport = require('../models/MedicalReport');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-otp -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent health records (last 5)
    const recentHealthRecords = await HealthRecord.find({ userId: req.user.userId })
      .sort({ checkupDate: -1 })
      .limit(5)
      .select('checkupDate checkupType diagnosis doctor notes');

    // Get recent medical reports (last 5)
    const recentMedicalReports = await MedicalReport.find({ userId: req.user.userId })
      .sort({ reportDate: -1 })
      .limit(5)
      .select('reportType reportName reportDate status accessCode');

    // Get health statistics
    const totalHealthRecords = await HealthRecord.countDocuments({ userId: req.user.userId });
    const totalMedicalReports = await MedicalReport.countDocuments({ userId: req.user.userId });
    const emergencyRecords = await HealthRecord.countDocuments({
      userId: req.user.userId,
      checkupType: 'Emergency'
    });

    // Get current active conditions
    const activeConditions = await HealthRecord.aggregate([
      { $match: { userId: req.user.userId } },
      { $unwind: '$diagnosis' },
      { $match: { 'diagnosis.status': 'Active' } },
      { $group: { _id: '$diagnosis.condition', count: { $sum: 1 } } }
    ]);

    // Get upcoming follow-ups
    const upcomingFollowUps = await HealthRecord.find({
      userId: req.user.userId,
      'followUp.required': true,
      'followUp.nextAppointment': { $gte: new Date() }
    }).sort({ 'followUp.nextAppointment': 1 })
      .select('followUp doctor checkupDate');

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        bloodGroup: user.bloodGroup,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      },
      statistics: {
        totalHealthRecords,
        totalMedicalReports,
        emergencyRecords,
        activeConditions: activeConditions.length
      },
      recentHealthRecords,
      recentMedicalReports,
      activeConditions,
      upcomingFollowUps
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
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
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group required'),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
  body('currentMedications').optional().isArray().withMessage('Current medications must be an array')
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

    const allowedUpdates = [
      'firstName', 'lastName', 'email', 'address', 'emergencyContact',
      'bloodGroup', 'allergies', 'currentMedications', 'workDetails'
    ];

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
        emergencyContact: user.emergencyContact,
        allergies: user.allergies,
        currentMedications: user.currentMedications,
        workDetails: user.workDetails
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user health summary
router.get('/health-summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get latest health record
    const latestRecord = await HealthRecord.findOne({ userId: req.user.userId })
      .sort({ checkupDate: -1 });

    // Get health statistics
    const totalRecords = await HealthRecord.countDocuments({ userId: req.user.userId });
    const emergencyRecords = await HealthRecord.countDocuments({
      userId: req.user.userId,
      checkupType: 'Emergency'
    });

    // Get current diseases
    const currentDiseases = await HealthRecord.aggregate([
      { $match: { userId: req.user.userId } },
      { $unwind: '$diagnosis' },
      { $match: { 'diagnosis.status': 'Active' } },
      { $group: { _id: '$diagnosis.condition', count: { $sum: 1 } } }
    ]);

    // Get past diseases
    const pastDiseases = await HealthRecord.aggregate([
      { $match: { userId: req.user.userId } },
      { $unwind: '$diagnosis' },
      { $match: { 'diagnosis.status': { $in: ['Resolved', 'Chronic'] } } },
      { $group: { _id: '$diagnosis.condition', count: { $sum: 1 } } }
    ]);

    // Get recent lab results
    const recentLabResults = await HealthRecord.aggregate([
      { $match: { userId: req.user.userId } },
      { $unwind: '$labResults' },
      { $sort: { 'labResults.testDate': -1 } },
      { $limit: 5 },
      { $project: {
        testName: '$labResults.testName',
        result: '$labResults.result',
        status: '$labResults.status',
        testDate: '$labResults.testDate'
      } }
    ]);

    res.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        bloodGroup: user.bloodGroup,
        allergies: user.allergies,
        currentMedications: user.currentMedications
      },
      latestRecord: latestRecord ? latestRecord.getHealthSummary() : null,
      statistics: {
        totalRecords,
        emergencyRecords,
        currentDiseases: currentDiseases.length,
        pastDiseases: pastDiseases.length
      },
      currentDiseases,
      pastDiseases,
      recentLabResults
    });
  } catch (error) {
    console.error('Get health summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      switch (period) {
        case 'week':
          dateFilter = { checkupDate: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
          break;
        case 'month':
          dateFilter = { checkupDate: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
          break;
        case 'year':
          dateFilter = { checkupDate: { $gte: new Date(now.getFullYear(), 0, 1) } };
          break;
      }
    }

    const healthRecordsFilter = { userId: req.user.userId, ...dateFilter };
    const medicalReportsFilter = { userId: req.user.userId, ...dateFilter };

    const [
      totalHealthRecords,
      totalMedicalReports,
      emergencyRecords,
      routineRecords,
      followUpRecords,
      healthRecordsByType,
      medicalReportsByType
    ] = await Promise.all([
      HealthRecord.countDocuments(healthRecordsFilter),
      MedicalReport.countDocuments(medicalReportsFilter),
      HealthRecord.countDocuments({ ...healthRecordsFilter, checkupType: 'Emergency' }),
      HealthRecord.countDocuments({ ...healthRecordsFilter, checkupType: 'Routine' }),
      HealthRecord.countDocuments({ ...healthRecordsFilter, checkupType: 'Follow-up' }),
      HealthRecord.aggregate([
        { $match: healthRecordsFilter },
        { $group: { _id: '$checkupType', count: { $sum: 1 } } }
      ]),
      MedicalReport.aggregate([
        { $match: medicalReportsFilter },
        { $group: { _id: '$reportType', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      period,
      healthRecords: {
        total: totalHealthRecords,
        emergency: emergencyRecords,
        routine: routineRecords,
        followUp: followUpRecords,
        byType: healthRecordsByType
      },
      medicalReports: {
        total: totalMedicalReports,
        byType: medicalReportsByType
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users (for admin/authorized personnel)
router.get('/search', auth, [
  body('query').notEmpty().withMessage('Search query is required')
], async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    // This is a basic search - in production, you might want to add more sophisticated search
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { mobileNumber: { $regex: query, $options: 'i' } },
        { aadhaarNumber: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
    .select('firstName lastName mobileNumber aadhaarNumber bloodGroup')
    .limit(parseInt(limit));

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate user account
router.put('/deactivate', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
