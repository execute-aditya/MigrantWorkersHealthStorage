import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegistrationFormData } from '../types';
import apiService from '../services/api';

const steps = ['Personal Information', 'Contact Details', 'Health Information', 'Verification'];

const Register: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpData, setOtpData] = useState<{ mobileNumber?: string; aadhaarNumber?: string }>({});
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registrationData, setRegistrationData] = useState<RegistrationFormData & { mobileNumber: string; aadhaarNumber: string }>({
    mobileNumber: '',
    aadhaarNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    bloodGroup: undefined,
    address: {
      street: '',
      city: '',
      district: '',
      pincode: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      mobileNumber: '',
    },
    workDetails: {
      occupation: '',
      employer: '',
      workLocation: '',
      workId: '',
    },
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRegistrationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value,
        },
      }));
    } else {
      setRegistrationData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!registrationData.mobileNumber || registrationData.mobileNumber.length !== 10) {
        setError('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }

      if (!registrationData.aadhaarNumber || registrationData.aadhaarNumber.length !== 12) {
        setError('Please enter a valid 12-digit Aadhaar number');
        setLoading(false);
        return;
      }

      await apiService.sendOTPRegistration(registrationData.mobileNumber, registrationData.aadhaarNumber);
      setSuccess('OTP sent successfully to your mobile number');
      setOtpSent(true);
      setOtpData({ mobileNumber: registrationData.mobileNumber, aadhaarNumber: registrationData.aadhaarNumber });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const form = new FormData(e.currentTarget);
      const otp = form.get('otp') as string;

      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }

      const response = await apiService.verifyOTPRegistration({
        mobileNumber: otpData.mobileNumber!,
        // aadhaarNumber: otpData.aadhaarNumber!,
        otp,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        dateOfBirth: registrationData.dateOfBirth,
        gender: registrationData.gender,
        email: registrationData.email || undefined,
        address: registrationData.address,
        emergencyContact: registrationData.emergencyContact,
        bloodGroup: registrationData.bloodGroup || undefined,
        workDetails: registrationData.workDetails,
      });

      login(response.token, response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                value={registrationData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                value={registrationData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="mobileNumber"
                label="Mobile Number"
                name="mobileNumber"
                type="tel"
                inputProps={{ maxLength: 10 }}
                value={registrationData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="aadhaarNumber"
                label="Aadhaar Number"
                name="aadhaarNumber"
                type="tel"
                inputProps={{ maxLength: 12 }}
                value={registrationData.aadhaarNumber}
                onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                id="dateOfBirth"
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={registrationData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl required fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  value={registrationData.gender}
                  label="Gender"
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                value={registrationData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="street"
                label="Street Address"
                name="street"
                value={registrationData.address?.street || ''}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="city"
                label="City"
                name="city"
                value={registrationData.address?.city || ''}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="district"
                label="District"
                name="district"
                value={registrationData.address?.district || ''}
                onChange={(e) => handleInputChange('address.district', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="pincode"
                label="Pincode"
                name="pincode"
                value={registrationData.address?.pincode || ''}
                onChange={(e) => handleInputChange('address.pincode', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="emergencyName"
                label="Emergency Contact Name"
                name="emergencyName"
                value={registrationData.emergencyContact?.name || ''}
                onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="emergencyRelationship"
                label="Relationship"
                name="emergencyRelationship"
                value={registrationData.emergencyContact?.relationship || ''}
                onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="emergencyMobile"
                label="Emergency Contact Mobile"
                name="emergencyMobile"
                type="tel"
                value={registrationData.emergencyContact?.mobileNumber || ''}
                onChange={(e) => handleInputChange('emergencyContact.mobileNumber', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="bloodGroup-label">Blood Group</InputLabel>
                <Select
                  labelId="bloodGroup-label"
                  id="bloodGroup"
                  value={registrationData.bloodGroup || ''}
                  label="Blood Group"
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="occupation"
                label="Occupation"
                name="occupation"
                value={registrationData.workDetails?.occupation || ''}
                onChange={(e) => handleInputChange('workDetails.occupation', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="employer"
                label="Employer"
                name="employer"
                value={registrationData.workDetails?.employer || ''}
                onChange={(e) => handleInputChange('workDetails.employer', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                id="workLocation"
                label="Work Location"
                name="workLocation"
                value={registrationData.workDetails?.workLocation || ''}
                onChange={(e) => handleInputChange('workDetails.workLocation', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            {!otpSent ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Verify Your Mobile Number
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  We will send an OTP to {registrationData.mobileNumber} to verify your registration.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSendOTP}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleVerifyOTP}>
                <Typography variant="h6" gutterBottom>
                  Enter OTP
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter the 6-digit OTP sent to {registrationData.mobileNumber}
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="otp"
                  label="OTP"
                  name="otp"
                  type="tel"
                  inputProps={{ maxLength: 6 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
                </Button>
              </Box>
            )}
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', padding: 3 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            User Registration
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Register for Kerala Migrant Health Storage System
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep !== steps.length - 1 && (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
