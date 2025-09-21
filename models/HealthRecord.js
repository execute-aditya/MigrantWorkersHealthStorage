const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Health Check Information
  checkupDate: {
    type: Date,
    required: true
  },
  checkupType: {
    type: String,
    enum: ['Routine', 'Emergency', 'Follow-up', 'Pre-employment', 'Annual'],
    required: true
  },
  
  // Vital Signs
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: { type: String, default: 'mmHg' }
    },
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' }
    },
    temperature: {
      value: Number,
      unit: { type: String, default: '°C' }
    },
    weight: {
      value: Number,
      unit: { type: String, default: 'kg' }
    },
    height: {
      value: Number,
      unit: { type: String, default: 'cm' }
    },
    oxygenSaturation: {
      value: Number,
      unit: { type: String, default: '%' }
    }
  },
  
  // Medical Information
  currentSymptoms: [String],
  diagnosis: [{
    condition: String,
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe', 'Critical']
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved', 'Chronic', 'Under Treatment']
    },
    notes: String
  }],
  
  // Treatment Information
  treatment: {
    prescribedMedicines: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    procedures: [{
      name: String,
      date: Date,
      notes: String
    }],
    recommendations: [String]
  },
  
  // Doctor Information
  doctor: {
    name: String,
    specialization: String,
    licenseNumber: String,
    hospital: String,
    contactNumber: String
  },
  
  // Follow-up Information
  followUp: {
    required: Boolean,
    nextAppointment: Date,
    instructions: String
  },
  
  // Lab Results
  labResults: [{
    testName: String,
    result: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['Normal', 'Abnormal', 'Critical']
    },
    labName: String,
    testDate: Date
  }],
  
  // Additional Notes
  notes: String,
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Index for faster queries
healthRecordSchema.index({ userId: 1, checkupDate: -1 });
healthRecordSchema.index({ 'doctor.name': 1 });
healthRecordSchema.index({ checkupType: 1 });

// Virtual for BMI calculation
healthRecordSchema.virtual('bmi').get(function() {
  if (this.vitals.weight && this.vitals.height) {
    const heightInMeters = this.vitals.height.value / 100;
    return (this.vitals.weight.value / (heightInMeters * heightInMeters)).toFixed(2);
  }
  return null;
});

// Method to get health summary
healthRecordSchema.methods.getHealthSummary = function() {
  return {
    checkupDate: this.checkupDate,
    checkupType: this.checkupType,
    vitals: this.vitals,
    diagnosis: this.diagnosis,
    doctor: this.doctor,
    followUp: this.followUp,
    bmi: this.bmi
  };
};

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
