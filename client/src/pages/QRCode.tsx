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
  Divider,
  Grid,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Download,
  Share,
  Refresh,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeData } from '../types';
import apiService from '../services/api';

const QRCodePage: React.FC = () => {
  const [qrCodeData, setQrCodeData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const data = await apiService.getQRCode();
      setQrCodeData(data.qrCode as unknown as QRCodeData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No QR code exists, will show generate button
        setQrCodeData(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load QR code');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.generateQRCode({
        qrType: 'Health Card',
        additionalData: {
          emergencyContact: user?.mobileNumber,
          bloodGroup: user?.bloodGroup,
        },
      });
      setQrCodeData(data.qrCode as unknown as QRCodeData);
      setSuccess('QR code generated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleScanQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.scanQRCode({
        qrCode: qrCodeInput,
        accessToken: accessTokenInput || undefined,
      });
      setScanResult(data);
      setScanDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to scan QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeData?.qrImage) {
      const link = document.createElement('a');
      link.href = qrCodeData.qrImage;
      link.download = `health-qr-code-${qrCodeData.qrCode}.png`;
      link.click();
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && qrCodeData?.qrImage) {
      try {
        const response = await fetch(qrCodeData.qrImage);
        const blob = await response.blob();
        const file = new File([blob], `health-qr-code-${qrCodeData.qrCode}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'My Health QR Code',
          text: 'Scan this QR code to access my health information',
          files: [file],
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(qrCodeData.qrCode);
        setSuccess('QR code copied to clipboard');
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(qrCodeData?.qrCode || '');
      setSuccess('QR code copied to clipboard');
    }
  };

  if (loading && !qrCodeData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        QR Code Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Generate and manage your health QR code for easy access to medical information
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* QR Code Display */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Your Health QR Code
            </Typography>
            
            {qrCodeData ? (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <QRCodeSVG
                    value={qrCodeData.qrData}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  QR Code: {qrCodeData.qrCode}
                </Typography>
                
                <Chip
                  label={qrCodeData.accessLevel}
                  color={qrCodeData.accessLevel === 'Public' ? 'success' : 'warning'}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Scans: {qrCodeData.scanCount}
                  </Typography>
                  {qrCodeData.lastScannedAt && (
                    <Typography variant="body2" color="text.secondary">
                      Last scanned: {new Date(qrCodeData.lastScannedAt).toLocaleString()}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={downloadQRCode}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={shareQRCode}
                  >
                    Share
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchQRCode}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  No QR code generated yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  onClick={generateQRCode}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate QR Code'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* QR Code Scanner */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scan QR Code
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Scan a QR code to view health information
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="QR Code"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                placeholder="Enter QR code or scan with camera"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Access Token (if required)"
                value={accessTokenInput}
                onChange={(e) => setAccessTokenInput(e.target.value)}
                placeholder="Enter access token for restricted QR codes"
              />
            </Box>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<Visibility />}
              onClick={handleScanQRCode}
              disabled={loading || !qrCodeInput}
            >
              {loading ? <CircularProgress size={24} /> : 'Scan QR Code'}
            </Button>
          </Paper>
        </Grid>

        {/* QR Code Information */}
        {qrCodeData && (
          <Grid sx={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                QR Code Information
              </Typography>
              <Grid container spacing={2}>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    QR Code ID
                  </Typography>
                  <Typography variant="body1">
                    {qrCodeData.qrCode}
                  </Typography>
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {qrCodeData.qrType}
                  </Typography>
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Access Level
                  </Typography>
                  <Typography variant="body1">
                    {qrCodeData.accessLevel}
                  </Typography>
                </Grid>
                <Grid sx={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={qrCodeData.isValid ? 'Valid' : 'Invalid'}
                    color={qrCodeData.isValid ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Scan Result Dialog */}
      <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>QR Code Scan Result</DialogTitle>
        <DialogContent>
          {scanResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Health Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Name"
                    secondary={`${scanResult.user?.firstName} ${scanResult.user?.lastName}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Mobile Number"
                    secondary={scanResult.user?.mobileNumber}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Blood Group"
                    secondary={scanResult.user?.bloodGroup || 'Not specified'}
                  />
                </ListItem>
              </List>
              
              {scanResult.emergencyInfo && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Emergency Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Emergency Contact"
                        secondary={scanResult.emergencyInfo.emergencyContact}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Allergies"
                        secondary={scanResult.emergencyInfo.allergies?.join(', ') || 'None'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Current Medications"
                        secondary={scanResult.emergencyInfo.currentMedications?.join(', ') || 'None'}
                      />
                    </ListItem>
                  </List>
                </>
              )}
              
              {scanResult.latestHealthRecord && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Latest Health Record
                  </Typography>
                  <Typography variant="body2">
                    {new Date(scanResult.latestHealthRecord.checkupDate).toLocaleDateString()} - 
                    {scanResult.latestHealthRecord.checkupType}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QRCodePage;
