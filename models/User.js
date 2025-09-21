const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^[6-9]\d{9}$/
  },
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{12}$/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    district: String,
    state: {
      type: String,
      default: 'Kerala'
    },
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    mobileNumber: String
  },
  
  // Health Information
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [String],
  currentMedications: [String],
  
  // Work Information
  workDetails: {
    occupation: String,
    employer: String,
    workLocation: String,
    workId: String
  },
  
  // System Information
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // OTP Verification
  otp: {
    code: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ mobileNumber: 1 });
userSchema.index({ aadhaarNumber: 1 });
userSchema.index({ email: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash sensitive data
userSchema.pre('save', async function(next) {
  if (this.isModified('aadhaarNumber')) {
    // In a real application, you might want to hash Aadhaar numbers
    // For now, we'll store them as-is for verification purposes
  }
  next();
});

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0
  };
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otp) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  
  if (this.otp.expiresAt < new Date()) {
    return false;
  }
  
  if (this.otp.attempts >= 3) {
    return false;
  }
  
  if (this.otp.code !== otp) {
    this.otp.attempts += 1;
    this.save();
    return false;
  }
  
  // OTP verified successfully
  this.otp = undefined;
  this.isVerified = true;
  this.save();
  return true;
};

module.exports = mongoose.model('User', userSchema);
