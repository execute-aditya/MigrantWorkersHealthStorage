import { User, HealthRecord, MedicalReport, QRCode, ApiResponse } from '../types';
declare class ApiService {
    private api;
    constructor();
    sendOTPRegistration(mobileNumber: string, aadhaarNumber: string): Promise<ApiResponse<any>>;
    verifyOTPRegistration(data: {
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
    }): Promise<{
        message: string;
        token: string;
        user: User;
    }>;
    sendOTPLogin(aadhaarNumber: string): Promise<ApiResponse<any>>;
    verifyOTPLogin(aadhaarNumber: string, otp: string): Promise<{
        message: string;
        token: string;
        user: User;
    }>;
    getProfile(): Promise<{
        user: User;
    }>;
    updateProfile(data: Partial<User>): Promise<{
        message: string;
        user: User;
    }>;
    getHealthRecords(params?: {
        page?: number;
        limit?: number;
        type?: string;
    }): Promise<{
        records: HealthRecord[];
        pagination: any;
    }>;
    getHealthRecord(id: string): Promise<{
        record: HealthRecord;
    }>;
    createHealthRecord(data: Partial<HealthRecord>): Promise<{
        message: string;
        record: HealthRecord;
    }>;
    updateHealthRecord(id: string, data: Partial<HealthRecord>): Promise<{
        message: string;
        record: HealthRecord;
    }>;
    deleteHealthRecord(id: string): Promise<{
        message: string;
    }>;
    getHealthSummary(): Promise<any>;
    getHealthTimeline(limit?: number): Promise<{
        timeline: HealthRecord[];
    }>;
    searchHealthRecords(params: {
        q?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        records: HealthRecord[];
        pagination: any;
    }>;
    getMedicalReports(params?: {
        page?: number;
        limit?: number;
        type?: string;
    }): Promise<{
        reports: MedicalReport[];
        pagination: any;
    }>;
    getMedicalReport(id: string): Promise<{
        report: MedicalReport;
    }>;
    createMedicalReport(data: FormData): Promise<{
        message: string;
        report: MedicalReport;
    }>;
    updateMedicalReport(id: string, data: Partial<MedicalReport>): Promise<{
        message: string;
        report: MedicalReport;
    }>;
    deleteMedicalReport(id: string): Promise<{
        message: string;
    }>;
    downloadMedicalReport(id: string): Promise<Blob>;
    getReportByAccessCode(accessCode: string): Promise<{
        report: MedicalReport;
    }>;
    searchMedicalReports(params: {
        q?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        reports: MedicalReport[];
        pagination: any;
    }>;
    generateQRCode(data?: {
        qrType?: string;
        additionalData?: any;
    }): Promise<{
        message: string;
        qrCode: QRCode;
    }>;
    getQRCode(): Promise<{
        qrCode: QRCode;
    }>;
    scanQRCode(data: {
        qrCode: string;
        accessToken?: string;
    }): Promise<any>;
    scanQRCodeDetailed(data: {
        qrCode: string;
        accessToken: string;
        authorizedPersonnel: string;
    }): Promise<any>;
    updateQRSettings(data: {
        qrType?: string;
        accessLevel?: string;
        additionalData?: any;
    }): Promise<{
        message: string;
        qrCode: QRCode;
    }>;
    getQRScanHistory(): Promise<any>;
    getDashboard(): Promise<any>;
    getUserStatistics(period?: string): Promise<any>;
}
export declare const apiService: ApiService;
export default apiService;
//# sourceMappingURL=api.d.ts.map