import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, HealthRecord, MedicalReport, QRCode, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async sendOTPRegistration(mobileNumber: string, aadhaarNumber: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.post('/auth/send-otp-registration', {
      mobileNumber,
      aadhaarNumber,
    });
    return response.data;
  }

  async verifyOTPRegistration(data: {
    mobileNumber: string;
    otp: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email?: string;
    address?: any;
    emergencyContact?: any;
    bloodGroup?: string;
    workDetails?: any;
  }): Promise<{ message: string; token: string; user: User }> {
    const response: AxiosResponse = await this.api.post('/auth/verify-otp-registration', data);
    return response.data;
  }

  async sendOTPLogin(aadhaarNumber: string): Promise<ApiResponse<any>> {
    const response: AxiosResponse = await this.api.post('/auth/send-otp-login', {
      aadhaarNumber,
    });
    return response.data;
  }

  async verifyOTPLogin(aadhaarNumber: string, otp: string): Promise<{ message: string; token: string; user: User }> {
    const response: AxiosResponse = await this.api.post('/auth/verify-otp-login', {
      aadhaarNumber,
      otp,
    });
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response: AxiosResponse = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    const response: AxiosResponse = await this.api.put('/auth/profile', data);
    return response.data;
  }

  // Health records endpoints
  async getHealthRecords(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ records: HealthRecord[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/health/records', { params });
    return response.data;
  }

  async getHealthRecord(id: string): Promise<{ record: HealthRecord }> {
    const response: AxiosResponse = await this.api.get(`/health/records/${id}`);
    return response.data;
  }

  async createHealthRecord(data: Partial<HealthRecord>): Promise<{ message: string; record: HealthRecord }> {
    const response: AxiosResponse = await this.api.post('/health/records', data);
    return response.data;
  }

  async updateHealthRecord(id: string, data: Partial<HealthRecord>): Promise<{ message: string; record: HealthRecord }> {
    const response: AxiosResponse = await this.api.put(`/health/records/${id}`, data);
    return response.data;
  }

  async deleteHealthRecord(id: string): Promise<{ message: string }> {
    const response: AxiosResponse = await this.api.delete(`/health/records/${id}`);
    return response.data;
  }

  async getHealthSummary(): Promise<any> {
    const response: AxiosResponse = await this.api.get('/health/summary');
    return response.data;
  }

  async getHealthTimeline(limit?: number): Promise<{ timeline: HealthRecord[] }> {
    const response: AxiosResponse = await this.api.get('/health/timeline', { params: { limit } });
    return response.data;
  }

  async searchHealthRecords(params: {
    q?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ records: HealthRecord[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/health/search', { params });
    return response.data;
  }

  // Medical reports endpoints
  async getMedicalReports(params?: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<{ reports: MedicalReport[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/reports', { params });
    return response.data;
  }

  async getMedicalReport(id: string): Promise<{ report: MedicalReport }> {
    const response: AxiosResponse = await this.api.get(`/reports/${id}`);
    return response.data;
  }

  async createMedicalReport(data: FormData): Promise<{ message: string; report: MedicalReport }> {
    const response: AxiosResponse = await this.api.post('/reports', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateMedicalReport(id: string, data: Partial<MedicalReport>): Promise<{ message: string; report: MedicalReport }> {
    const response: AxiosResponse = await this.api.put(`/reports/${id}`, data);
    return response.data;
  }

  async deleteMedicalReport(id: string): Promise<{ message: string }> {
    const response: AxiosResponse = await this.api.delete(`/reports/${id}`);
    return response.data;
  }

  async downloadMedicalReport(id: string): Promise<Blob> {
    const response: AxiosResponse = await this.api.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getReportByAccessCode(accessCode: string): Promise<{ report: MedicalReport }> {
    const response: AxiosResponse = await this.api.get(`/reports/access/${accessCode}`);
    return response.data;
  }

  async searchMedicalReports(params: {
    q?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ reports: MedicalReport[]; pagination: any }> {
    const response: AxiosResponse = await this.api.get('/reports/search', { params });
    return response.data;
  }

  // QR code endpoints
  async generateQRCode(data?: {
    qrType?: string;
    additionalData?: any;
  }): Promise<{ message: string; qrCode: QRCode }> {
    const response: AxiosResponse = await this.api.post('/qr/generate', data);
    return response.data;
  }

  async getQRCode(): Promise<{ qrCode: QRCode }> {
    const response: AxiosResponse = await this.api.get('/qr');
    return response.data;
  }

  async scanQRCode(data: {
    qrCode: string;
    accessToken?: string;
  }): Promise<any> {
    const response: AxiosResponse = await this.api.post('/qr/scan', data);
    return response.data;
  }

  async scanQRCodeDetailed(data: {
    qrCode: string;
    accessToken: string;
    authorizedPersonnel: string;
  }): Promise<any> {
    const response: AxiosResponse = await this.api.post('/qr/scan/detailed', data);
    return response.data;
  }

  async updateQRSettings(data: {
    qrType?: string;
    accessLevel?: string;
    additionalData?: any;
  }): Promise<{ message: string; qrCode: QRCode }> {
    const response: AxiosResponse = await this.api.put('/qr/settings', data);
    return response.data;
  }

  async getQRScanHistory(): Promise<any> {
    const response: AxiosResponse = await this.api.get('/qr/scan-history');
    return response.data;
  }

  // User dashboard endpoints
  async getDashboard(): Promise<any> {
    const response: AxiosResponse = await this.api.get('/users/dashboard');
    return response.data;
  }

  async getUserStatistics(period?: string): Promise<any> {
    const response: AxiosResponse = await this.api.get('/users/statistics', { params: { period } });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
