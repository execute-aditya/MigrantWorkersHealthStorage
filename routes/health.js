const express = require('express');
const { body, validationResult } = require('express-validator');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all health records for a user
router.get('/records', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId };
    if (type) {
      query.checkupType = type;
    }

    const records = await HealthRecord.find(query)
      .sort({ checkupDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName mobileNumber');

    const total = await HealthRecord.countDocuments(query);

    res.json({
      records,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific health record
router.get('/records/:id', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('userId', 'firstName lastName mobileNumber aadhaarNumber');

    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    res.json({ record });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new health record
router.post('/records', auth, [
  body('checkupDate').isISO8601().withMessage('Valid checkup date required'),
  body('checkupType').isIn(['Routine', 'Emergency', 'Follow-up', 'Pre-employment', 'Annual']).withMessage('Valid checkup type required'),
  body('vitals.bloodPressure.systolic').optional().isNumeric().withMessage('Systolic pressure must be numeric'),
  body('vitals.bloodPressure.diastolic').optional().isNumeric().withMessage('Diastolic pressure must be numeric'),
  body('vitals.heartRate.value').optional().isNumeric().withMessage('Heart rate must be numeric'),
  body('vitals.temperature.value').optional().isNumeric().withMessage('Temperature must be numeric'),
  body('vitals.weight.value').optional().isNumeric().withMessage('Weight must be numeric'),
  body('vitals.height.value').optional().isNumeric().withMessage('Height must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const healthRecord = new HealthRecord({
      ...req.body,
      userId: req.user.userId
    });

    await healthRecord.save();
    await healthRecord.populate('userId', 'firstName lastName mobileNumber');

    res.status(201).json({
      message: 'Health record created successfully',
      record: healthRecord
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update health record
router.put('/records/:id', auth, [
  body('checkupDate').optional().isISO8601().withMessage('Valid checkup date required'),
  body('checkupType').optional().isIn(['Routine', 'Emergency', 'Follow-up', 'Pre-employment', 'Annual']).withMessage('Valid checkup type required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    const allowedUpdates = [
      'checkupDate', 'checkupType', 'vitals', 'currentSymptoms', 'diagnosis',
      'treatment', 'doctor', 'followUp', 'labResults', 'notes', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        record[field] = req.body[field];
      }
    });

    await record.save();
    await record.populate('userId', 'firstName lastName mobileNumber');

    res.json({
      message: 'Health record updated successfully',
      record
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete health record
router.delete('/records/:id', auth, async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!record) {
      return res.status(404).json({ message: 'Health record not found' });
    }

    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get health summary
router.get('/summary', auth, async (req, res) => {
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

// Get health history timeline
router.get('/timeline', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const timeline = await HealthRecord.find({ userId: req.user.userId })
      .sort({ checkupDate: -1 })
      .limit(parseInt(limit))
      .select('checkupDate checkupType diagnosis doctor notes status')
      .populate('userId', 'firstName lastName');

    res.json({ timeline });
  } catch (error) {
    console.error('Get health timeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search health records
router.get('/search', auth, async (req, res) => {
  try {
    const { q, type, startDate, endDate } = req.query;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.userId };

    if (type) {
      query.checkupType = type;
    }

    if (startDate && endDate) {
      query.checkupDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (q) {
      query.$or = [
        { 'diagnosis.condition': { $regex: q, $options: 'i' } },
        { 'doctor.name': { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ];
    }

    const records = await HealthRecord.find(query)
      .sort({ checkupDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName mobileNumber');

    const total = await HealthRecord.countDocuments(query);

    res.json({
      records,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Search health records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
