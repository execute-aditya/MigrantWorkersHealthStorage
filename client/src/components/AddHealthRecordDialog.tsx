import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
// Date picker imports removed - using standard TextField with date type
import { HealthRecord, Diagnosis, PrescribedMedicine } from '../types';
import apiService from '../services/api';

interface AddHealthRecordDialogProps {
  open: boolean;
  onClose: () => void;
  onRecordAdded: (record: HealthRecord) => void;
}

const AddHealthRecordDialog: React.FC<AddHealthRecordDialogProps> = ({
  open,
  onClose,
  onRecordAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    hospitalName: '',
    checkupDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    checkupType: 'Routine',
    status: 'Active',
    doctor: {
      name: '',
      specialization: '',
      hospital: '',
    },
    vitals: {
      bloodPressure: {
        systolic: '',
        diastolic: '',
        unit: 'mmHg',
      },
      heartRate: {
        value: '',
        unit: 'bpm',
      },
      temperature: {
        value: '',
        unit: '°C',
      },
      weight: {
        value: '',
        unit: 'kg',
      },
    },
    diagnosis: [] as Diagnosis[],
    treatment: {
      prescribedMedicines: [] as PrescribedMedicine[],
      recommendations: [] as string[],
      followUpDate: '', // YYYY-MM-DD format or empty string
    },
    notes: '',
  });

  const [currentDiagnosis, setCurrentDiagnosis] = useState({
    condition: '',
    severity: 'Mild',
    notes: '',
  });

  const [currentMedicine, setCurrentMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  const [currentRecommendation, setCurrentRecommendation] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const handleVitalsChange = (vital: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [vital]: {
          ...prev.vitals[vital as keyof typeof prev.vitals],
          [field]: value,
        },
      },
    }));
  };

  const addDiagnosis = () => {
    if (currentDiagnosis.condition) {
      setFormData(prev => ({
        ...prev,
        diagnosis: [...prev.diagnosis, { ...currentDiagnosis }],
      }));
      setCurrentDiagnosis({ condition: '', severity: 'Mild', notes: '' });
    }
  };

  const removeDiagnosis = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.filter((_, i) => i !== index),
    }));
  };

  const addMedicine = () => {
    if (currentMedicine.name && currentMedicine.dosage) {
      setFormData(prev => ({
        ...prev,
        treatment: {
          ...prev.treatment,
          prescribedMedicines: [...prev.treatment.prescribedMedicines, { ...currentMedicine }],
        },
      }));
      setCurrentMedicine({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
    }
  };

  const removeMedicine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        prescribedMedicines: prev.treatment.prescribedMedicines.filter((_, i) => i !== index),
      },
    }));
  };

  const addRecommendation = () => {
    if (currentRecommendation.trim()) {
      setFormData(prev => ({
        ...prev,
        treatment: {
          ...prev.treatment,
          recommendations: [...prev.treatment.recommendations, currentRecommendation.trim()],
        },
      }));
      setCurrentRecommendation('');
    }
  };

  const removeRecommendation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        recommendations: prev.treatment.recommendations.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Prepare data for API
      const recordData = {
        hospitalName: formData.hospitalName,
        checkupDate: new Date(formData.checkupDate).toISOString(),
        checkupType: formData.checkupType,
        status: formData.status,
        doctor: formData.doctor,
        vitals: {
          bloodPressure: formData.vitals.bloodPressure.systolic && formData.vitals.bloodPressure.diastolic
            ? {
                systolic: parseInt(formData.vitals.bloodPressure.systolic),
                diastolic: parseInt(formData.vitals.bloodPressure.diastolic),
                unit: formData.vitals.bloodPressure.unit,
              }
            : undefined,
          heartRate: formData.vitals.heartRate.value
            ? {
                value: parseInt(formData.vitals.heartRate.value),
                unit: formData.vitals.heartRate.unit,
              }
            : undefined,
          temperature: formData.vitals.temperature.value
            ? {
                value: parseFloat(formData.vitals.temperature.value),
                unit: formData.vitals.temperature.unit,
              }
            : undefined,
          weight: formData.vitals.weight.value
            ? {
                value: parseFloat(formData.vitals.weight.value),
                unit: formData.vitals.weight.unit,
              }
            : undefined,
        },
        diagnosis: formData.diagnosis,
        treatment: {
          prescribedMedicines: formData.treatment.prescribedMedicines,
          recommendations: formData.treatment.recommendations,
          followUpDate: formData.treatment.followUpDate ? new Date(formData.treatment.followUpDate).toISOString() : undefined,
        },
        notes: formData.notes,
      };

      const response = await apiService.createHealthRecord(recordData);
      onRecordAdded(response.record);
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create health record');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form
      setFormData({
        hospitalName: '',
        checkupDate: new Date().toISOString().split('T')[0],
        checkupType: 'Routine',
        status: 'Active',
        doctor: { name: '', specialization: '', hospital: '' },
        vitals: {
          bloodPressure: { systolic: '', diastolic: '', unit: 'mmHg' },
          heartRate: { value: '', unit: 'bpm' },
          temperature: { value: '', unit: '°C' },
          weight: { value: '', unit: 'kg' },
        },
        diagnosis: [],
        treatment: { prescribedMedicines: [], recommendations: [], followUpDate: '' },
        notes: '',
      });
      setCurrentDiagnosis({ condition: '', severity: 'Mild', notes: '' });
      setCurrentMedicine({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });
      setCurrentRecommendation('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Health Record</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Hospital Name"
                value={formData.hospitalName}
                onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Checkup Date"
                type="date"
                value={formData.checkupDate}
                onChange={(e) => handleInputChange('checkupDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Checkup Type</InputLabel>
                <Select
                  value={formData.checkupType}
                  label="Checkup Type"
                  onChange={(e) => handleInputChange('checkupType', e.target.value)}
                >
                  <MenuItem value="Routine">Routine</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Pre-employment">Pre-employment</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Follow-up Required">Follow-up Required</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Doctor Information */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Doctor Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Doctor Name"
                value={formData.doctor.name}
                onChange={(e) => handleNestedChange('doctor', 'name', e.target.value)}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Specialization"
                value={formData.doctor.specialization}
                onChange={(e) => handleNestedChange('doctor', 'specialization', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Hospital"
                value={formData.doctor.hospital}
                onChange={(e) => handleNestedChange('doctor', 'hospital', e.target.value)}
              />
            </Grid>

            {/* Vital Signs */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Vital Signs
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Systolic BP"
                type="number"
                value={formData.vitals.bloodPressure.systolic}
                onChange={(e) => handleVitalsChange('bloodPressure', 'systolic', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Diastolic BP"
                type="number"
                value={formData.vitals.bloodPressure.diastolic}
                onChange={(e) => handleVitalsChange('bloodPressure', 'diastolic', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Heart Rate"
                type="number"
                value={formData.vitals.heartRate.value}
                onChange={(e) => handleVitalsChange('heartRate', 'value', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Temperature"
                type="number"
                value={formData.vitals.temperature.value}
                onChange={(e) => handleVitalsChange('temperature', 'value', e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={formData.vitals.weight.value}
                onChange={(e) => handleVitalsChange('weight', 'value', e.target.value)}
              />
            </Grid>

            {/* Diagnosis */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Diagnosis
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Condition"
                value={currentDiagnosis.condition}
                onChange={(e) => setCurrentDiagnosis(prev => ({ ...prev, condition: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={currentDiagnosis.severity}
                  label="Severity"
                  onChange={(e) => setCurrentDiagnosis(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <MenuItem value="Mild">Mild</MenuItem>
                  <MenuItem value="Moderate">Moderate</MenuItem>
                  <MenuItem value="Severe">Severe</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Notes"
                value={currentDiagnosis.notes}
                onChange={(e) => setCurrentDiagnosis(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addDiagnosis}
                disabled={!currentDiagnosis.condition}
              >
                Add
              </Button>
            </Grid>

            {formData.diagnosis.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.diagnosis.map((diagnosis, index) => (
                    <Chip
                      key={index}
                      label={`${diagnosis.condition} (${diagnosis.severity})`}
                      onDelete={() => removeDiagnosis(index)}
                      deleteIcon={<DeleteIcon />}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Prescribed Medicines */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Prescribed Medicines
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Medicine Name"
                value={currentMedicine.name}
                onChange={(e) => setCurrentMedicine(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                label="Dosage"
                value={currentMedicine.dosage}
                onChange={(e) => setCurrentMedicine(prev => ({ ...prev, dosage: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                label="Frequency"
                value={currentMedicine.frequency}
                onChange={(e) => setCurrentMedicine(prev => ({ ...prev, frequency: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                label="Duration"
                value={currentMedicine.duration}
                onChange={(e) => setCurrentMedicine(prev => ({ ...prev, duration: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                fullWidth
                label="Instructions"
                value={currentMedicine.instructions}
                onChange={(e) => setCurrentMedicine(prev => ({ ...prev, instructions: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addMedicine}
                disabled={!currentMedicine.name || !currentMedicine.dosage}
              >
                Add
              </Button>
            </Grid>

            {formData.treatment.prescribedMedicines.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.treatment.prescribedMedicines.map((medicine, index) => (
                    <Chip
                      key={index}
                      label={`${medicine.name} - ${medicine.dosage}`}
                      onDelete={() => removeMedicine(index)}
                      deleteIcon={<DeleteIcon />}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Recommendations */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Treatment Recommendations
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 10 }}>
              <TextField
                fullWidth
                label="Recommendation"
                value={currentRecommendation}
                onChange={(e) => setCurrentRecommendation(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addRecommendation}
                disabled={!currentRecommendation.trim()}
              >
                Add
              </Button>
            </Grid>

            {formData.treatment.recommendations.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.treatment.recommendations.map((recommendation, index) => (
                    <Chip
                      key={index}
                      label={recommendation}
                      onDelete={() => removeRecommendation(index)}
                      deleteIcon={<DeleteIcon />}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Follow-up Date (Optional)"
                type="date"
                value={formData.treatment.followUpDate}
                onChange={(e) => handleNestedChange('treatment', 'followUpDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Additional Notes */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={loading}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.hospitalName || !formData.doctor.name}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? 'Saving...' : 'Save Health Record'}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default AddHealthRecordDialog;