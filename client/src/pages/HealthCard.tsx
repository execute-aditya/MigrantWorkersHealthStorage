import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  ContactPage,
  Phone,
  LocationOn,
  Bloodtype,
  Person,
  Work,
  Download,
  Print,
  Share,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const HealthCardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchHealthSummary();
  }, []);

  const fetchHealthSummary = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHealthSummary();
      setHealthSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load health summary');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real application, you would generate a PDF
    const element = document.getElementById('health-card');
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Health Card - ${user?.firstName} ${user?.lastName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #1976d2; padding-bottom: 10px; margin-bottom: 20px; }
                .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
                .section { margin-bottom: 20px; }
                .section-title { font-weight: bold; color: #1976d2; margin-bottom: 10px; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .chip { background-color: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Health Card',
          text: `Health Card for ${user?.firstName} ${user?.lastName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Health card URL copied to clipboard');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Digital Health Card
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={handleShare}
          >
            Share
          </Button>
        </Box>
      </Box>

      <Paper id="health-card" elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Government of Kerala
          </Typography>
          <Typography variant="h5" gutterBottom>
            Digital Health Card
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Migrant Health Storage System
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Personal Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid sx={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {user?.firstName} {user?.lastName}
              </Typography>
            </Grid>
            <Grid sx={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Mobile Number
                </Typography>
              </Box>
              <Typography variant="body1">
                {user?.mobileNumber}
              </Typography>
            </Grid>
            <Grid sx={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ContactPage sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Aadhaar Number
                </Typography>
              </Box>
              <Typography variant="body1">
                {user?.aadhaarNumber}
              </Typography>
            </Grid>
            <Grid sx={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Bloodtype sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Blood Group
                </Typography>
              </Box>
              <Typography variant="body1">
                {user?.bloodGroup || 'Not specified'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Address Information */}
        {user?.address && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
              <Typography variant="body1">
                {user.address.street && `${user.address.street}, `}
                {user.address.city && `${user.address.city}, `}
                {user.address.district && `${user.address.district}, `}
                {user.address.state && `${user.address.state} `}
                {user.address.pincode && `- ${user.address.pincode}`}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Work Information */}
        {user?.workDetails && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Work Information
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Occupation
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {user.workDetails.occupation || 'Not specified'}
                </Typography>
              </Grid>
              <Grid sx={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Employer
                </Typography>
                <Typography variant="body1">
                  {user.workDetails.employer || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Health Information */}
        {healthSummary && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Health Information
            </Typography>
            
            {/* Allergies */}
            {user?.allergies && user.allergies.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Allergies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.allergies.map((allergy: string, index: number) => (
                    <Chip key={index} label={allergy} color="warning" size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Current Medications */}
            {user?.currentMedications && user.currentMedications.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Medications
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.currentMedications.map((medication: string, index: number) => (
                    <Chip key={index} label={medication} color="info" size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Current Health Conditions */}
            {healthSummary.currentDiseases && healthSummary.currentDiseases.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Health Conditions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {healthSummary.currentDiseases.map((disease: any, index: number) => (
                    <Chip key={index} label={disease._id} color="error" size="small" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Health Statistics */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Health Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid sx={{ xs: 6 }}>
                  <Typography variant="body2">
                    Total Health Records: {healthSummary.statistics?.totalRecords || 0}
                  </Typography>
                </Grid>
                <Grid sx={{ xs: 6 }}>
                  <Typography variant="body2">
                    Emergency Visits: {healthSummary.statistics?.emergencyRecords || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}

        {/* Emergency Contact */}
        {user?.emergencyContact && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Emergency Contact
            </Typography>
            <Typography variant="body1">
              <strong>{user.emergencyContact.name}</strong>
              {user.emergencyContact.relationship && ` (${user.emergencyContact.relationship})`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.emergencyContact.mobileNumber}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            This is an official digital health card issued by the Government of Kerala
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generated on {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default HealthCardPage;
