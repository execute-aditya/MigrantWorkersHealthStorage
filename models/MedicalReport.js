const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  healthRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthRecord',
    required: true
  },
  
  // Report Information
  reportType: {
    type: String,
    enum: [
      'Blood Test',
      'X-Ray',
      'CT Scan',
      'MRI',
      'ECG',
      'Ultrasound',
      'Pathology',
      'Microbiology',
      'Other'
    ],
    required: true
  },
  
  reportName: {
    type: String,
    required: true
  },
  
  reportDate: {
    type: Date,
    required: true
  },
  
  // File Information
  fileInfo: {
    originalName: String,
    fileName: String,
    filePath: String,
    fileSize: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Report Details
  reportDetails: {
    findings: String,
    conclusion: String,
    recommendations: String,
    normalRange: String,
    actualValue: String,
    status: {
      type: String,
      enum: ['Normal', 'Abnormal', 'Critical', 'Pending'],
      default: 'Pending'
    }
  },
  
  // Lab/Hospital Information
  labInfo: {
    name: String,
    address: String,
    contactNumber: String,
    licenseNumber: String,
    doctorName: String,
    doctorSignature: String
  },
  
  // Access Control
  isPublic: {
    type: Boolean,
    default: false
  },
  
  accessCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['Draft', 'Final', 'Archived'],
    default: 'Draft'
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verifiedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
medicalReportSchema.index({ userId: 1, reportDate: -1 });
medicalReportSchema.index({ healthRecordId: 1 });
medicalReportSchema.index({ reportType: 1 });
medicalReportSchema.index({ accessCode: 1 });

// Pre-save middleware to generate access code
medicalReportSchema.pre('save', function(next) {
  if (this.isNew && !this.accessCode) {
    this.accessCode = this._id.toString().slice(-8).toUpperCase();
  }
  next();
});

// Method to get report summary
medicalReportSchema.methods.getReportSummary = function() {
  return {
    id: this._id,
    reportType: this.reportType,
    reportName: this.reportName,
    reportDate: this.reportDate,
    status: this.status,
    isVerified: this.isVerified,
    accessCode: this.accessCode
  };
};

// Method to check if report is accessible
medicalReportSchema.methods.isAccessible = function(userId, accessCode) {
  if (this.userId.toString() === userId.toString()) {
    return true;
  }
  
  if (this.isPublic && this.accessCode === accessCode) {
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
