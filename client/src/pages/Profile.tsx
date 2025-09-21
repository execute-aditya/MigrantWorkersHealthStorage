import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  LocationOn,
  Bloodtype,
  Work,
  Edit,
  Save,
  Cancel,
  HealthAndSafety,
  Description,
  QrCode,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { BloodGroup } from '../types';
import apiService from '../services/api';

const ProfilePage: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();


  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bloodGroup: user?.bloodGroup || ('' as BloodGroup | ''),
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      district: user?.address?.district || '',
      pincode: user?.address?.pincode || '',
    },
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      relationship: user?.emergencyContact?.relationship || '',
      mobileNumber: user?.emergencyContact?.mobileNumber || '',
    },
    allergies: user?.allergies || [],
    currentMedications: user?.currentMedications || [],
    workDetails: {
      occupation: user?.workDetails?.occupation || '',
      employer: user?.workDetails?.employer || '',
      workLocation: user?.workDetails?.workLocation || '',
      workId: user?.workDetails?.workId || '',
    },
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bloodGroup: user.bloodGroup || ('' as BloodGroup | ''),
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          district: user.address?.district || '',
          pincode: user.address?.pincode || '',
        },
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          relationship: user.emergencyContact?.relationship || '',
          mobileNumber: user.emergencyContact?.mobileNumber || '',
        },
        allergies: user.allergies || [],
        currentMedications: user.currentMedications || [],
        workDetails: {
          occupation: user.workDetails?.occupation || '',
          employer: user.workDetails?.employer || '',
          workLocation: user.workDetails?.workLocation || '',
          workId: user.workDetails?.workId || '',
        },
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const profileData = {
        ...formData,
        bloodGroup: formData.bloodGroup === '' ? undefined : formData.bloodGroup
      };
      await apiService.updateProfile(profileData);
      // Profile update doesn't return a token, just update the user data
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bloodGroup: user?.bloodGroup || ('' as BloodGroup | ''),
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        district: user?.address?.district || '',
        pincode: user?.address?.pincode || '',
      },
      emergencyContact: {
        name: user?.emergencyContact?.name || '',
        relationship: user?.emergencyContact?.relationship || '',
        mobileNumber: user?.emergencyContact?.mobileNumber || '',
      },
      allergies: user?.allergies || [],
      currentMedications: user?.currentMedications || [],
      workDetails: {
        occupation: user?.workDetails?.occupation || '',
        employer: user?.workDetails?.employer || '',
        workLocation: user?.workDetails?.workLocation || '',
        workId: user?.workDetails?.workId || '',
      },
    });
    setEditing(false);
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((a: string) => a !== allergy)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim() && !formData.currentMedications.includes(newMedication.trim())) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((m: string) => m !== medication)
    }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Profile
        </Typography>
        <Button
          variant={editing ? "contained" : "outlined"}
          startIcon={editing ? <Save /> : <Edit />}
          onClick={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : editing ? 'Save' : 'Edit'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={user?.mobileNumber || ''}
                  disabled
                  helperText="Mobile number cannot be changed"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Aadhaar Number"
                  value={user?.aadhaarNumber || ''}
                  disabled
                  helperText="Aadhaar number cannot be changed"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Blood Group"
                  value={formData.bloodGroup || ''}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value as BloodGroup)}
                  disabled={!editing}
                  placeholder="e.g., A+, B-, O+, etc."
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Address Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="District"
                  value={formData.address.district}
                  onChange={(e) => handleInputChange('address.district', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={formData.address.pincode}
                  onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Emergency Contact */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Emergency Contact
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={formData.emergencyContact.mobileNumber}
                  onChange={(e) => handleInputChange('emergencyContact.mobileNumber', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Work Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Work Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Occupation"
                  value={formData.workDetails.occupation}
                  onChange={(e) => handleInputChange('workDetails.occupation', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Employer"
                  value={formData.workDetails.employer}
                  onChange={(e) => handleInputChange('workDetails.employer', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Work Location"
                  value={formData.workDetails.workLocation}
                  onChange={(e) => handleInputChange('workDetails.workLocation', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Work ID"
                  value={formData.workDetails.workId}
                  onChange={(e) => handleInputChange('workDetails.workId', e.target.value)}
                  disabled={!editing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Health Information */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Health Information
            </Typography>
            
            {/* Allergies */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Allergies
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.allergies.map((allergy: string, index: number) => (
                  <Chip
                    key={index}
                    label={allergy}
                    onDelete={editing ? () => removeAllergy(allergy) : undefined}
                    color="warning"
                  />
                ))}
              </Box>
              {editing && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Add Allergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                  />
                  <Button variant="outlined" onClick={addAllergy}>
                    Add
                  </Button>
                </Box>
              )}
            </Box>

            {/* Current Medications */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Medications
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {formData.currentMedications.map((medication: string, index: number) => (
                  <Chip
                    key={index}
                    label={medication}
                    onDelete={editing ? () => removeMedication(medication) : undefined}
                    color="info"
                  />
                ))}
              </Box>
              {editing && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    label="Add Medication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  />
                  <Button variant="outlined" onClick={addMedication}>
                    Add
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Account Information */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText
                  primary="Account Status"
                  secondary={user?.isActive ? 'Active' : 'Inactive'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <HealthAndSafety />
                </ListItemIcon>
                <ListItemText
                  primary="Verification Status"
                  secondary={user?.isVerified ? 'Verified' : 'Not Verified'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone />
                </ListItemIcon>
                <ListItemText
                  primary="Last Login"
                  secondary={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Cancel Button */}
      {editing && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ProfilePage;
