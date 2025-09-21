const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // QR Code Information
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  
  // QR Code Data
  qrData: {
    type: String,
    required: false  // Generated when needed
  },
  
  // QR Code Image
  qrImage: {
    data: Buffer,
    contentType: String
  },
  
  // Access Information
  accessLevel: {
    type: String,
    enum: ['Public', 'Restricted', 'Emergency'],
    default: 'Restricted'
  },
  
  // Validity
  isValid: {
    type: Boolean,
    default: true
  },
  
  expiresAt: {
    type: Date,
    default: null
  },
  
  // Usage Tracking
  scanCount: {
    type: Number,
    default: 0
  },
  
  lastScannedAt: Date,
  
  // Security
  accessToken: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // QR Code Type
  qrType: {
    type: String,
    enum: ['Health Card', 'Emergency', 'Medical History', 'Contact'],
    default: 'Health Card'
  },
  
  // Additional Data
  additionalData: {
    emergencyContact: String,
    bloodGroup: String,
    allergies: [String],
    currentMedications: [String]
  }
}, {
  timestamps: true
});

// Index for faster queries
qrCodeSchema.index({ userId: 1 });
qrCodeSchema.index({ qrCode: 1 });
qrCodeSchema.index({ accessToken: 1 });
qrCodeSchema.index({ isValid: 1 });

// Method to generate QR data
qrCodeSchema.methods.generateQRData = function() {
  const qrData = {
    userId: this.userId,
    qrCode: this.qrCode,
    accessToken: this.accessToken,
    qrType: this.qrType,
    timestamp: new Date().toISOString(),
    additionalData: this.additionalData
  };
  
  this.qrData = JSON.stringify(qrData);
  return this.qrData;
};

// Method to validate QR code
qrCodeSchema.methods.validateQR = function() {
  if (!this.isValid) {
    return false;
  }
  
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isValid = false;
    this.save();
    return false;
  }
  
  return true;
};

// Method to record scan
qrCodeSchema.methods.recordScan = function() {
  this.scanCount += 1;
  this.lastScannedAt = new Date();
  this.save();
};

// Static method to generate unique QR code
qrCodeSchema.statics.generateUniqueQRCode = async function() {
  let qrCode;
  let isUnique = false;
  
  while (!isUnique) {
    qrCode = 'MH' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const existing = await this.findOne({ qrCode });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return qrCode;
};

module.exports = mongoose.model('QRCode', qrCodeSchema);
