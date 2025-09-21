import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Download,
  Search,
  FilterList,
  Description,
  Upload,
} from '@mui/icons-material';
import { MedicalReport, HealthRecord } from '../types';
import apiService from '../services/api';

const MedicalReportsPage: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  
  // Upload dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [uploadFormData, setUploadFormData] = useState({
    healthRecordId: '',
    reportType: '',
    reportName: '',
    reportDate: new Date().toISOString().split('T')[0],
    reportDetails: {
      findings: '',
      conclusion: '',
      recommendations: '',
      normalRange: '',
      actualValue: ''
    },
    labInfo: {
      name: '',
      address: '',
      contactNumber: '',
      doctorName: ''
    }
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchReports();
    fetchHealthRecords();
  }, []);

  const fetchReports = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const data = await apiService.getMedicalReports({
        page,
        limit,
        type: filterType || undefined,
      });
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load medical reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await apiService.searchMedicalReports({
        q: searchTerm,
        type: filterType || undefined,
        page: 1,
        limit: 10,
      });
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthRecords = async () => {
    try {
      const data = await apiService.getHealthRecords({ limit: 100 });
      setHealthRecords(data.records);
    } catch (err: any) {
      console.error('Failed to load health records:', err);
    }
  };

  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
    setError('');
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
    setUploadFormData({
      healthRecordId: '',
      reportType: '',
      reportName: '',
      reportDate: new Date().toISOString().split('T')[0],
      reportDetails: {
        findings: '',
        conclusion: '',
        recommendations: '',
        normalRange: '',
        actualValue: ''
      },
      labInfo: {
        name: '',
        address: '',
        contactNumber: '',
        doctorName: ''
      }
    });
  };

  const handleUploadFormChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setUploadFormData((prev) => {
        const parentObj = (prev as any)[parent] ?? {};
        return {
          ...prev,
          [parent]: {
            ...(parentObj as Record<string, any>),
            [child]: value,
          },
        };
      });
    } else {
      setUploadFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUploadReport = async () => {
    try {
      setUploadLoading(true);
      setError('');

      if (!uploadFormData.healthRecordId) {
        setError('Please select a health record');
        return;
      }
      if (!uploadFormData.reportType) {
        setError('Please select a report type');
        return;
      }
      if (!uploadFormData.reportName) {
        setError('Please enter a report name');
        return;
      }
      if (!selectedFile) {
        setError('Please select a file to upload');
        return;
      }

      const formData = new FormData();
      formData.append('healthRecordId', uploadFormData.healthRecordId);
      formData.append('reportType', uploadFormData.reportType);
      formData.append('reportName', uploadFormData.reportName);
      formData.append('reportDate', uploadFormData.reportDate);
      formData.append('reportFile', selectedFile);

      // Add nested objects as JSON strings
      if (uploadFormData.reportDetails.findings || uploadFormData.reportDetails.conclusion || uploadFormData.reportDetails.recommendations) {
        formData.append('reportDetails', JSON.stringify(uploadFormData.reportDetails));
      }
      if (uploadFormData.labInfo.name) {
        formData.append('labInfo', JSON.stringify(uploadFormData.labInfo));
      }

      const result = await apiService.createMedicalReport(formData);
      
      // Refresh the reports list
      fetchReports();
      handleCloseUploadDialog();
      
      // Show success message
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload medical report');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleViewReport = async (id: string) => {
    try {
      const data = await apiService.getMedicalReport(id);
      setSelectedReport(data.report);
      setViewDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load medical report');
    }
  };

  const handleDownloadReport = async (id: string) => {
    try {
      const blob = await apiService.downloadMedicalReport(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `medical-report-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this medical report?')) {
      try {
        await apiService.deleteMedicalReport(id);
        setReports(reports.filter(report => report.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete medical report');
      }
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'Blood Test':
        return 'error';
      case 'X-Ray':
        return 'info';
      case 'CT Scan':
        return 'warning';
      case 'MRI':
        return 'primary';
      case 'ECG':
        return 'success';
      case 'Ultrasound':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Medical Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={handleOpenUploadDialog}
        >
          Upload Report
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Search reports"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by report name, findings, or lab"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Blood Test">Blood Test</MenuItem>
                <MenuItem value="X-Ray">X-Ray</MenuItem>
                <MenuItem value="CT Scan">CT Scan</MenuItem>
                <MenuItem value="MRI">MRI</MenuItem>
                <MenuItem value="ECG">ECG</MenuItem>
                <MenuItem value="Ultrasound">Ultrasound</MenuItem>
                <MenuItem value="Pathology">Pathology</MenuItem>
                <MenuItem value="Microbiology">Microbiology</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              fullWidth
            >
              Search
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => fetchReports()}
              fullWidth
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports List */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : reports.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {report.reportName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<Description />}
                      label={report.reportType}
                      color={getReportTypeColor(report.reportType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {report.reportDate ? new Date(report.reportDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={report.status === 'Final' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {report.fileInfo ? formatFileSize(report.fileInfo.fileSize) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewReport(report.id)}
                    >
                      <Visibility />
                    </IconButton>
                    {report.fileInfo && (
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {/* Navigate to edit */}}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteReport(report.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No medical reports found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by uploading your first medical report
          </Typography>
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={handleOpenUploadDialog}
          >
            Upload Report
          </Button>
        </Paper>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            disabled={pagination.current === 1}
            onClick={() => fetchReports(pagination.current - 1)}
          >
            Previous
          </Button>
          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            Page {pagination.current} of {pagination.pages}
          </Typography>
          <Button
            disabled={pagination.current === pagination.pages}
            onClick={() => fetchReports(pagination.current + 1)}
          >
            Next
          </Button>
        </Box>
      )}

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Medical Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Report Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedReport.reportName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip
                    icon={<Description />}
                    label={selectedReport.reportType}
                    color={getReportTypeColor(selectedReport.reportType) as any}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Report Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedReport.reportDate ? new Date(selectedReport.reportDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedReport.status}
                    color={selectedReport.status === 'Final' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
              </Grid>

              {selectedReport.labInfo && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Lab Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Lab Name:</strong> {selectedReport.labInfo.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {selectedReport.labInfo.address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contact:</strong> {selectedReport.labInfo.contactNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Doctor:</strong> {selectedReport.labInfo.doctorName}
                  </Typography>
                </Box>
              )}

              {selectedReport.reportDetails && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Report Details
                  </Typography>
                  {selectedReport.reportDetails.findings && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Findings
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.reportDetails.findings}
                      </Typography>
                    </Box>
                  )}
                  {selectedReport.reportDetails.conclusion && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Conclusion
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.reportDetails.conclusion}
                      </Typography>
                    </Box>
                  )}
                  {selectedReport.reportDetails.recommendations && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Recommendations
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.reportDetails.recommendations}
                      </Typography>
                    </Box>
                  )}
                  {selectedReport.reportDetails.actualValue && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Actual Value
                      </Typography>
                      <Typography variant="body2">
                        {selectedReport.reportDetails.actualValue}
                        {selectedReport.reportDetails.normalRange && (
                          <span> (Normal: {selectedReport.reportDetails.normalRange})</span>
                        )}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {selectedReport.fileInfo && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    File Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>File Name:</strong> {selectedReport.fileInfo.originalName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>File Size:</strong> {formatFileSize(selectedReport.fileInfo.fileSize)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Uploaded:</strong> {new Date(selectedReport.fileInfo.uploadedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedReport?.fileInfo && (
            <Button
              startIcon={<Download />}
              onClick={() => handleDownloadReport(selectedReport.id)}
            >
              Download
            </Button>
          )}
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Upload Report Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="md" fullWidth>
        <DialogTitle>Upload Medical Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {/* Health Record Selection */}
            <FormControl fullWidth required>
              <InputLabel>Health Record</InputLabel>
              <Select
                value={uploadFormData.healthRecordId}
                label="Health Record"
                onChange={(e) => handleUploadFormChange('healthRecordId', e.target.value)}
              >
                {healthRecords.map((record) => (
                  <MenuItem key={record.id} value={record.id}>
                    {record.checkupType} - {record.checkupDate ? new Date(record.checkupDate).toLocaleDateString() : 'N/A'}
                    {record.doctor?.name && ` (Dr. ${record.doctor.name})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Report Type and Name */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={uploadFormData.reportType}
                    label="Report Type"
                    onChange={(e) => handleUploadFormChange('reportType', e.target.value)}
                  >
                    <MenuItem value="Blood Test">Blood Test</MenuItem>
                    <MenuItem value="X-Ray">X-Ray</MenuItem>
                    <MenuItem value="CT Scan">CT Scan</MenuItem>
                    <MenuItem value="MRI">MRI</MenuItem>
                    <MenuItem value="ECG">ECG</MenuItem>
                    <MenuItem value="Ultrasound">Ultrasound</MenuItem>
                    <MenuItem value="Pathology">Pathology</MenuItem>
                    <MenuItem value="Microbiology">Microbiology</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Report Name"
                  value={uploadFormData.reportName}
                  onChange={(e) => handleUploadFormChange('reportName', e.target.value)}
                  placeholder="e.g., Complete Blood Count, Chest X-Ray"
                />
              </Grid>
            </Grid>

            {/* Report Date */}
            <TextField
              fullWidth
              required
              label="Report Date"
              type="date"
              value={uploadFormData.reportDate}
              onChange={(e) => handleUploadFormChange('reportDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {/* File Upload */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Upload Report File *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                fullWidth
                sx={{ height: 56, textTransform: 'none' }}
              >
                {selectedFile ? selectedFile.name : 'Choose File (PDF, Image, or Document)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                />
              </Button>
              {selectedFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              )}
            </Box>

            {/* Report Details (Optional) */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Report Details (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Findings"
                    value={uploadFormData.reportDetails.findings}
                    onChange={(e) => handleUploadFormChange('reportDetails.findings', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Conclusion"
                    value={uploadFormData.reportDetails.conclusion}
                    onChange={(e) => handleUploadFormChange('reportDetails.conclusion', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Recommendations"
                    value={uploadFormData.reportDetails.recommendations}
                    onChange={(e) => handleUploadFormChange('reportDetails.recommendations', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Normal Range"
                    value={uploadFormData.reportDetails.normalRange}
                    onChange={(e) => handleUploadFormChange('reportDetails.normalRange', e.target.value)}
                    placeholder="e.g., 4.5-11.0 x10³/μL"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Actual Value"
                    value={uploadFormData.reportDetails.actualValue}
                    onChange={(e) => handleUploadFormChange('reportDetails.actualValue', e.target.value)}
                    placeholder="e.g., 8.5 x10³/μL"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Lab Information (Optional) */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Lab Information (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Lab Name"
                    value={uploadFormData.labInfo.name}
                    onChange={(e) => handleUploadFormChange('labInfo.name', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={uploadFormData.labInfo.contactNumber}
                    onChange={(e) => handleUploadFormChange('labInfo.contactNumber', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Lab Address"
                    value={uploadFormData.labInfo.address}
                    onChange={(e) => handleUploadFormChange('labInfo.address', e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Doctor Name"
                    value={uploadFormData.labInfo.doctorName}
                    onChange={(e) => handleUploadFormChange('labInfo.doctorName', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button 
            onClick={handleUploadReport} 
            variant="contained"
            disabled={uploadLoading}
          >
            {uploadLoading ? <CircularProgress size={20} /> : 'Upload Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleOpenUploadDialog}
      >
        <Upload />
      </Fab>
    </Container>
  );
};

export default MedicalReportsPage;
