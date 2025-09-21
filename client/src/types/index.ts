export interface User {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  aadhaarNumber: string;
  email?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address?: {
    street?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    mobileNumber?: string;
  };
  allergies?: string[];
  currentMedications?: string[];
  workDetails?: {
    occupation?: string;
    employer?: string;
    workLocation?: string;
    workId?: string;
  };
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  checkupDate: string;
  checkupType: 'Routine' | 'Emergency' | 'Follow-up' | 'Pre-employment' | 'Annual';
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
    height?: {
      value: number;
      unit: string;
    };
    oxygenSaturation?: {
      value: number;
      unit: string;
    };
  };
  currentSymptoms?: string[];
  diagnosis?: Array<{
    condition: string;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
    status: 'Active' | 'Resolved' | 'Chronic' | 'Under Treatment';
    notes?: string;
  }>;
  treatment?: {
    prescribedMedicines?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    procedures?: Array<{
      name: string;
      date: string;
      notes: string;
    }>;
    recommendations?: string[];
  };
  doctor?: {
    name: string;
    specialization: string;
    licenseNumber: string;
    hospital: string;
    contactNumber: string;
  };
  followUp?: {
    required: boolean;
    nextAppointment?: string;
    instructions?: string;
  };
  labResults?: Array<{
    testName: string;
    result: string;
    normalRange: string;
    status: 'Normal' | 'Abnormal' | 'Critical';
    labName: string;
    testDate: string;
  }>;
  notes?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReport {
  id: string;
  userId: string;
  healthRecordId: string;
  reportType: 'Blood Test' | 'X-Ray' | 'CT Scan' | 'MRI' | 'ECG' | 'Ultrasound' | 'Pathology' | 'Microbiology' | 'Other';
  reportName: string;
  reportDate: string;
  fileInfo?: {
    originalName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
  reportDetails?: {
    findings?: string;
    conclusion?: string;
    recommendations?: string;
    normalRange?: string;
    actualValue?: string;
    status: 'Normal' | 'Abnormal' | 'Critical' | 'Pending';
  };
  labInfo?: {
    name: string;
    address: string;
    contactNumber: string;
    licenseNumber: string;
    doctorName: string;
    doctorSignature: string;
  };
  isPublic: boolean;
  accessCode: string;
  status: 'Draft' | 'Final' | 'Archived';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QRCode {
  id: string;
  userId: string;
  qrCode: string;
  qrData: string;
  qrImage: string;
  accessLevel: 'Public' | 'Restricted' | 'Emergency';
  isValid: boolean;
  expiresAt?: string;
  scanCount: number;
  lastScannedAt?: string;
  accessToken: string;
  qrType: 'Health Card' | 'Emergency' | 'Medical History' | 'Contact';
  additionalData?: {
    emergencyContact?: string;
    bloodGroup?: string;
    allergies?: string[];
    currentMedications?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
}
