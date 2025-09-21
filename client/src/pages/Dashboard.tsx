import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  HealthAndSafety,
  Description,
  QrCode,
  ContactPage,
  TrendingUp,
  Emergency,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface DashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    mobileNumber: string;
    bloodGroup: string;
    isVerified: boolean;
    lastLogin: string;
  };
  statistics: {
    totalHealthRecords: number;
    totalMedicalReports: number;
    emergencyRecords: number;
    activeConditions: number;
  };
  recentHealthRecords: any[];
  recentMedicalReports: any[];
  activeConditions: any[];
  upcomingFollowUps: any[];
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (!dashboardData) {
    return (
      <Alert severity="info">
        No dashboard data available
      </Alert>
    );
  }

  const StatCard = ({ title, value, icon, color, onClick }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
  }) => (
    <Card sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box color={color}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {dashboardData.user.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your health records and access medical services
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Health Records"
            value={dashboardData.statistics.totalHealthRecords}
            icon={<HealthAndSafety fontSize="large" />}
            color="primary.main"
            onClick={() => navigate('/health-records')}
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Medical Reports"
            value={dashboardData.statistics.totalMedicalReports}
            icon={<Description fontSize="large" />}
            color="secondary.main"
            onClick={() => navigate('/medical-reports')}
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Emergency Visits"
            value={dashboardData.statistics.emergencyRecords}
            icon={<Emergency fontSize="large" />}
            color="error.main"
          />
        </Grid>
        <Grid sx={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Conditions"
            value={dashboardData.statistics.activeConditions}
            icon={<TrendingUp fontSize="large" />}
            color="warning.main"
          />
        </Grid>

        {/* Quick Actions */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid sx={{ xs: 6 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<QrCode />}
                  onClick={() => navigate('/qr-code')}
                >
                  Generate QR Code
                </Button>
              </Grid>
              <Grid sx={{ xs: 6 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ContactPage />}
                  onClick={() => navigate('/health-card')}
                >
                  Health Card
                </Button>
              </Grid>
              <Grid sx={{ xs: 6 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<HealthAndSafety />}
                  onClick={() => navigate('/health-records')}
                >
                  Add Health Record
                </Button>
              </Grid>
              <Grid sx={{ xs: 6 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Description />}
                  onClick={() => navigate('/medical-reports')}
                >
                  Upload Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Active Conditions */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Health Conditions
            </Typography>
            {dashboardData.activeConditions.length > 0 ? (
              <Box>
                {dashboardData.activeConditions.map((condition: any, index: number) => (
                  <Chip
                    key={index}
                    label={condition._id}
                    color="warning"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">
                No active health conditions
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Health Records */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Health Records
            </Typography>
            {dashboardData.recentHealthRecords.length > 0 ? (
              <List>
                {dashboardData.recentHealthRecords.slice(0, 3).map((record: any, index: number) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <HealthAndSafety color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={record.checkupType}
                      secondary={`${new Date(record.checkupDate).toLocaleDateString()} - ${record.doctor?.name || 'No doctor info'}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No recent health records
              </Typography>
            )}
            <Button
              size="small"
              onClick={() => navigate('/health-records')}
              sx={{ mt: 1 }}
            >
              View All Records
            </Button>
          </Paper>
        </Grid>

        {/* Recent Medical Reports */}
        <Grid sx={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Medical Reports
            </Typography>
            {dashboardData.recentMedicalReports.length > 0 ? (
              <List>
                {dashboardData.recentMedicalReports.slice(0, 3).map((report: any, index: number) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Description color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={report.reportName}
                      secondary={`${report.reportType} - ${new Date(report.reportDate).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No recent medical reports
              </Typography>
            )}
            <Button
              size="small"
              onClick={() => navigate('/medical-reports')}
              sx={{ mt: 1 }}
            >
              View All Reports
            </Button>
          </Paper>
        </Grid>

        {/* Upcoming Follow-ups */}
        {dashboardData.upcomingFollowUps.length > 0 && (
          <Grid sx={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Follow-ups
              </Typography>
              <List>
                {dashboardData.upcomingFollowUps.map((followUp: any, index: number) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <Schedule color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={followUp.doctor?.name || 'Doctor'}
                      secondary={`${new Date(followUp.followUp.nextAppointment).toLocaleDateString()} - ${followUp.followUp.instructions || 'No instructions'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
