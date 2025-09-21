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
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Login: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpData, setOtpData] = useState<{ mobileNumber?: string; aadhaarNumber?: string }>({});
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
    setOtpSent(false);
  };

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData(e.currentTarget);
      const aadhaarNumber = formData.get('aadhaarNumber') as string;

      if (!aadhaarNumber || aadhaarNumber.length !== 12) {
        setError('Please enter a valid 12-digit Aadhaar number');
        setLoading(false);
        return;
      }

      const response = await apiService.sendOTPLogin(aadhaarNumber);
      setSuccess('OTP sent successfully to your registered mobile number');
      setOtpSent(true);
      setOtpData({ aadhaarNumber });
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
      const formData = new FormData(e.currentTarget);
      const otp = formData.get('otp') as string;

      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        setLoading(false);
        return;
      }

      const response = await apiService.verifyOTPLogin(otpData.aadhaarNumber!, otp);
      login(response.token, response.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ width: '100%', padding: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" color="primary">
              Kerala Migrant Health Storage
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Digital Health Management System
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="login tabs">
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography component="h2" variant="h5" gutterBottom>
              Login with Aadhaar
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {!otpSent ? (
              <Box component="form" onSubmit={handleSendOTP} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="aadhaarNumber"
                  label="Aadhaar Number"
                  name="aadhaarNumber"
                  type="tel"
                  inputProps={{ maxLength: 12 }}
                  helperText="Enter your 12-digit Aadhaar number"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Send OTP'}
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleVerifyOTP} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="otp"
                  label="OTP"
                  name="otp"
                  type="tel"
                  inputProps={{ maxLength: 6 }}
                  helperText="Enter the 6-digit OTP sent to your mobile number"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify OTP & Login'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setOtpSent(false)}
                  sx={{ mb: 2 }}
                >
                  Back to Aadhaar Entry
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography component="h2" variant="h5" gutterBottom>
              New User Registration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Register with your mobile number and Aadhaar card
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Go to Registration
            </Button>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
