// src/types.ts

// Blood Group types
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// User interface
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  aadhaarNumber?: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  bloodGroup?: BloodGroup;
  address?: {
    street: string;
    city: string;
    district: string;
    pincode: string;
    state?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    mobileNumber: string;
  };
  allergies?: string[];
  currentMedications?: string[];
  workDetails?: {
    occupation: string;
    employer: string;
    workLocation: string;
    workId: string;
  };
  qrCode?: string;
  isActive?: boolean;
  isVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// AuthContext types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

// Health Record types
export interface Diagnosis {
  condition: string;
  severity: string;
  notes?: string;
}

export interface PrescribedMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Treatment {
  prescribedMedicines: PrescribedMedicine[];
  recommendations?: string[];
  followUpDate?: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  hospitalName: string;
  doctorName: string;
  visitDate: string;
  visitType: string;
  checkupDate?: string;
  checkupType?: string;
  status?: string;
  doctor?: {
    name: string;
    specialization: string;
    hospital: string;
  };
  diagnosis: Diagnosis[];
  treatment: Treatment;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  vitals?: {
    bloodPressure?: {
      systolic: number;
      diastolic: number;
      unit: string;
    };
    heartRate?: {
      value: number;
      unit: string;
    };
    temperature?: {
      value: number;
      unit: string;
    };
    weight?: {
      value: number;
      unit: string;
    };
  };
  labResults?: any[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Medical Report types
export interface MedicalReport {
  id: string;
  userId: string;
  title: string;
  reportName?: string;
  reportDate?: string;
  description?: string;
  reportType: string;
  filePath: string;
  uploadDate: string;
  status?: string;
  associatedVisit?: string;
  fileInfo?: {
    originalName: string;
    fileSize: number;
    uploadedAt: string;
  };
  labInfo?: {
    name: string;
    address: string;
    contactNumber: string;
    doctorName: string;
  };
  reportDetails?: {
    findings?: string;
    conclusion?: string;
    recommendations?: string;
    actualValue?: string;
    normalRange?: string;
  };
}

// QR Code types
export interface QRCode {
  id: string;
  userId: string;
  qrData: string;
  createdAt: string;
  expiresAt?: string;
}

export interface QRCodeData {
  id?: string;
  qrCode: string;
  qrData: string;
  qrImage: string;
  accessLevel: 'Public' | 'Restricted' | 'Emergency';
  isValid: boolean;
  scanCount?: number;
  lastScannedAt?: string;
  qrType?: 'Health Card' | 'Emergency' | 'Medical History' | 'Contact';
  expiresAt?: string;
  createdAt?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Registration Form Data (renamed to avoid conflict with native FormData)
export interface RegistrationFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    district: string;
    pincode: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    mobileNumber: string;
  };
  bloodGroup?: BloodGroup;
  workDetails?: {
    occupation: string;
    employer: string;
    workLocation: string;
    workId: string;
  };
}
