import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  HealthAndSafety,
  Emergency,
  Schedule,
} from '@mui/icons-material';
import { HealthRecord } from '../types';
import apiService from '../services/api';

const HealthRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const data = await apiService.getHealthRecords({
        page,
        limit,
        type: filterType || undefined,
      });
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await apiService.searchHealthRecords({
        q: searchTerm,
        type: filterType || undefined,
        page: 1,
        limit: 10,
      });
      setRecords(data.records);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = async (id: string) => {
    try {
      const data = await apiService.getHealthRecord(id);
      setSelectedRecord(data.record);
      setViewDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load health record');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      try {
        await apiService.deleteHealthRecord(id);
        setRecords(records.filter(record => record.id !== id));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete health record');
      }
    }
  };

  const getCheckupTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'error';
      case 'Routine':
        return 'success';
      case 'Follow-up':
        return 'info';
      case 'Pre-employment':
        return 'warning';
      case 'Annual':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getCheckupTypeIcon = (type: string) => {
    switch (type) {
      case 'Emergency':
        return <Emergency />;
      case 'Routine':
        return <HealthAndSafety />;
      case 'Follow-up':
        return <Schedule />;
      default:
        return <HealthAndSafety />;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Health Records
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* Navigate to add record */}}
        >
          Add Health Record
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Search records"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by doctor, diagnosis, or notes"
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
                <MenuItem value="Routine">Routine</MenuItem>
                <MenuItem value="Emergency">Emergency</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
                <MenuItem value="Pre-employment">Pre-employment</MenuItem>
                <MenuItem value="Annual">Annual</MenuItem>
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
              onClick={() => fetchRecords()}
              fullWidth
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Records List */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : records.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.checkupDate ? new Date(record.checkupDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getCheckupTypeIcon(record.checkupType || 'Routine')}
                      label={record.checkupType || 'N/A'}
                      color={getCheckupTypeColor(record.checkupType || 'Routine') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {record.doctor?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {record.diagnosis && record.diagnosis.length > 0
                      ? record.diagnosis.map((d: any) => d.condition).join(', ')
                      : 'No diagnosis'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={record.status === 'Active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewRecord(record.id)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {/* Navigate to edit */}}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRecord(record.id)}
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
            No health records found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start by adding your first health record
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* Navigate to add record */}}
          >
            Add Health Record
          </Button>
        </Paper>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            disabled={pagination.current === 1}
            onClick={() => fetchRecords(pagination.current - 1)}
          >
            Previous
          </Button>
          <Typography sx={{ mx: 2, alignSelf: 'center' }}>
            Page {pagination.current} of {pagination.pages}
          </Typography>
          <Button
            disabled={pagination.current === pagination.pages}
            onClick={() => fetchRecords(pagination.current + 1)}
          >
            Next
          </Button>
        </Box>
      )}

      {/* View Record Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Health Record Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Checkup Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedRecord.checkupDate ? new Date(selectedRecord.checkupDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip
                    icon={getCheckupTypeIcon(selectedRecord.checkupType || 'Routine')}
                    label={selectedRecord.checkupType || 'N/A'}
                    color={getCheckupTypeColor(selectedRecord.checkupType || 'Routine') as any}
                    size="small"
                  />
                </Grid>
              </Grid>

              {selectedRecord.doctor && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Doctor Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedRecord.doctor.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Specialization:</strong> {selectedRecord.doctor.specialization}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hospital:</strong> {selectedRecord.doctor.hospital}
                  </Typography>
                </Box>
              )}

              {selectedRecord.vitals && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Vital Signs
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedRecord.vitals.bloodPressure && (
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2">
                          <strong>Blood Pressure:</strong> {selectedRecord.vitals.bloodPressure.systolic}/{selectedRecord.vitals.bloodPressure.diastolic} {selectedRecord.vitals.bloodPressure.unit}
                        </Typography>
                      </Grid>
                    )}
                    {selectedRecord.vitals.heartRate && (
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2">
                          <strong>Heart Rate:</strong> {selectedRecord.vitals.heartRate.value} {selectedRecord.vitals.heartRate.unit}
                        </Typography>
                      </Grid>
                    )}
                    {selectedRecord.vitals.temperature && (
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2">
                          <strong>Temperature:</strong> {selectedRecord.vitals.temperature.value} {selectedRecord.vitals.temperature.unit}
                        </Typography>
                      </Grid>
                    )}
                    {selectedRecord.vitals.weight && (
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="body2">
                          <strong>Weight:</strong> {selectedRecord.vitals.weight.value} {selectedRecord.vitals.weight.unit}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {selectedRecord.diagnosis && selectedRecord.diagnosis.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Diagnosis
                  </Typography>
                  {selectedRecord.diagnosis.map((diagnosis: any, index: number) => (
                    <Card key={index} sx={{ mb: 1 }}>
                      <CardContent>
                        <Typography variant="body1">
                          <strong>{diagnosis.condition}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Severity: {diagnosis.severity} | Status: {diagnosis.status}
                        </Typography>
                        {diagnosis.notes && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {diagnosis.notes}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {selectedRecord.treatment && selectedRecord.treatment.prescribedMedicines && selectedRecord.treatment.prescribedMedicines.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Prescribed Medicines
                  </Typography>
                  {selectedRecord.treatment.prescribedMedicines.map((medicine: any, index: number) => (
                    <Card key={index} sx={{ mb: 1 }}>
                      <CardContent>
                        <Typography variant="body1">
                          <strong>{medicine.name}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Dosage: {medicine.dosage} | Frequency: {medicine.frequency} | Duration: {medicine.duration}
                        </Typography>
                        {medicine.instructions && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Instructions: {medicine.instructions}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              {selectedRecord.notes && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Typography variant="body2">
                    {selectedRecord.notes}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {/* Navigate to add record */}}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default HealthRecordsPage;
