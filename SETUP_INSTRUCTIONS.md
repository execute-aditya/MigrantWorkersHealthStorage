# Kerala Migrant Health Storage System - Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- MongoDB Atlas account (free tier available) - [Sign up here](https://www.mongodb.com/atlas)

### 1. Clone and Setup
```bash
# Navigate to the project directory
cd MigrantHealthStorage

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following content:

```env
# Database
MONGODB_URI=mongodb+srv://em4017077_db_user:WJZ1wSYJRoyycQJv@migranthealth.dfm4djc.mongodb.net/MigrantHealthDB?retryWrites=true&w=majority&appName=migranthealth

# JWT Secret
JWT_SECRET=d5e4e2a9aa4d872218004584

# Twilio for SMS OTP (Optional - for production)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 3. Start the Application

#### Option A: Using the provided scripts
- **Windows**: Double-click `start-dev.bat` or run `start-dev.bat` in command prompt
- **Linux/Mac**: Run `./start-dev.sh` in terminal

#### Option B: Manual start
```bash
# Terminal 1 - Start Backend
npm start

# Terminal 2 - Start Frontend
cd client
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000 (see endpoints in response)

## 📱 User Registration Flow

### For New Users:
1. Go to http://localhost:3000
2. Click on "Register" tab
3. Fill in personal information:
   - First Name, Last Name
   - Mobile Number (10 digits)
   - Aadhaar Number (12 digits)
   - Date of Birth, Gender
4. Fill in contact details:
   - Email (optional)
   - Address information
   - Emergency contact details
5. Fill in health information:
   - Blood Group
   - Work details
6. Verify mobile number with OTP
7. Complete registration and access dashboard

### For Existing Users:
1. Go to http://localhost:3000
2. Enter your 12-digit Aadhaar number
3. Click "Send OTP"
4. Enter the 6-digit OTP received
5. Access your dashboard

## 🏥 Features Overview

### 1. **Dashboard**
- Health statistics and overview
- Quick actions for common tasks
- Recent health records and medical reports
- Active health conditions
- Emergency contact button

### 2. **Health Records**
- Add new health checkup records
- View health history
- Track vital signs and diagnoses
- Doctor consultation history

### 3. **Medical Reports**
- Upload medical reports (PDF, images)
- Download specific reports
- Organize by report type
- Access control and sharing

### 4. **QR Code System**
- Generate health QR codes
- Emergency access for medical personnel
- Scan tracking and history
- Multiple access levels

### 5. **Digital Health Card**
- Government-approved format
- Printable health summary
- Emergency information
- Professional design

### 6. **Support & Emergency**
- Emergency contact numbers (108, 100, 101)
- Doctor helplines
- Health department contacts
- Support ticket system
- FAQ section

## 🔧 Development

### Backend Structure
```
├── server.js              # Main server file
├── models/                # Database models
│   ├── User.js
│   ├── HealthRecord.js
│   ├── MedicalReport.js
│   └── QRCode.js
├── routes/                # API routes
│   ├── auth.js
│   ├── health.js
│   ├── reports.js
│   ├── qr.js
│   └── users.js
├── middleware/            # Custom middleware
│   └── auth.js
└── uploads/               # File uploads
    └── reports/
```

### Frontend Structure
```
client/
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── types/             # TypeScript types
├── public/                # Static assets
└── package.json
```

## 🚨 Troubleshooting

### Common Issues:

1. **Port already in use**
   - Change PORT in .env file
   - Kill existing processes using the port

2. **MongoDB connection error**
   - Check MONGODB_URI in .env
   - Ensure MongoDB Atlas cluster is running
   - Check network connectivity

3. **Frontend not loading**
   - Ensure backend is running on port 5000
   - Check CLIENT_URL in .env
   - Clear browser cache

4. **OTP not working**
   - Check console logs for OTP (development mode)
   - Configure Twilio for production SMS
   - Check mobile number format

### Logs and Debugging:
- Backend logs: Check terminal running `npm start`
- Frontend logs: Check browser console
- Database logs: Check MongoDB Atlas logs

## 📞 Support

### Emergency Contacts:
- **Ambulance**: 108
- **Police**: 100
- **Fire**: 101

### Health Helplines:
- **General Health**: 104
- **Mental Health**: 1800-599-0019
- **Women Health**: 181
- **Child Health**: 1098

### Technical Support:
- Email: migrant@kerala.gov.in
- Phone: +91-471-2321133

## 🔒 Security Features

- JWT token authentication
- OTP verification for all logins
- Encrypted data storage
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure file upload handling

## 📊 Database Schema

### User Model
- Personal information (name, mobile, Aadhaar)
- Health information (blood group, allergies)
- Work details and emergency contacts
- Authentication and security data

### HealthRecord Model
- Checkup details and vital signs
- Doctor and hospital information
- Diagnosis and treatment history
- Follow-up appointments

### MedicalReport Model
- Report metadata and file information
- Access control and sharing
- Report types and categories
- Download and verification

### QRCode Model
- QR code generation and settings
- Access levels and permissions
- Scan history and tracking
- Emergency information

## 🚀 Production Deployment

### Backend Deployment:
1. Set NODE_ENV=production
2. Configure production MongoDB URI
3. Set up proper JWT secrets
4. Configure Twilio for SMS
5. Set up file storage (AWS S3, etc.)

### Frontend Deployment:
1. Run `npm run build` in client directory
2. Serve build folder with web server
3. Configure API URLs for production
4. Set up HTTPS certificates

### Environment Variables for Production:
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
CLIENT_URL=https://your-domain.com
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Kerala Migrant Health Storage System v1.0.0**  
*Digital Health Management for Migrant Workers*

