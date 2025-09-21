const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Connection
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected Successfully!"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ------------------------------------
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/health', require('./routes/health'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/qr', require('./routes/qr'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Kerala Migrant Health Storage API',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      health: '/api/health-check',
      auth: '/api/auth/*',
      health_records: '/api/health/*',
      medical_reports: '/api/reports/*',
      qr_code: '/api/qr/*',
      users: '/api/users/*'
    },
    frontend: 'http://localhost:3000',
    documentation: 'See README.md for API documentation'
  });
});

// Health check endpoint
app.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Migrant Health Storage API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Example formData object for testing
const formData = {
  firstName: "Aditya",
  lastName: "Dhembare",
  dateOfBirth: "2003-05-01",
  gender: "Male"
  // ...add other fields as needed
};

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
