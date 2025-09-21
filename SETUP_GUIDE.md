# 🚀 Kerala Migrant Health Storage System - Complete Setup Guide

## 📋 Prerequisites

Before setting up the system, ensure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **Git** (for cloning the repository)
4. **A text editor** (VS Code recommended)

## 🔧 Required APIs and Services

### 1. **MongoDB Database** (Required)
**Purpose**: Store all user data, health records, medical reports, and QR codes

**Options:**
- **Local MongoDB** (Free)
- **MongoDB Atlas** (Free tier available)

**Setup:**
```bash
# For local MongoDB (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# For MongoDB Atlas (Recommended for production)
# 1. Go to https://www.mongodb.com/atlas
# 2. Create free account
# 3. Create new cluster
# 4. Get connection string
```

### 2. **Twilio SMS Service** (Required for OTP)
**Purpose**: Send OTP verification codes via SMS

**Setup:**
1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for free account (includes $15 free credit)
3. Get your credentials from the console:
   - Account SID
   - Auth Token
   - Phone Number (from Twilio)

**Free Tier**: $15 credit (approximately 1,500 SMS messages)

### 3. **Gmail SMTP** (Optional - for email notifications)
**Purpose**: Send email notifications and reports

**Setup:**
1. Use your Gmail account
2. Enable 2-factor authentication
3. Generate App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

## ⚙️ Configuration Steps

### Step 1: Environment Setup

1. **Create environment file:**
```bash
cd /home/spidy/Downloads/MigrantHealthStorage
cp env.example .env
```

2. **Edit the .env file with your configurations:**
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/migrant_health_storage
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/migrant_health_storage

# JWT Secret (Generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random

# Twilio Configuration (Required for SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### Step 2: Frontend Environment Setup

1. **Create frontend environment file:**
```bash
cd client
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
cd ..
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 4: Create Required Directories

```bash
# Create uploads directory for medical reports
mkdir -p uploads/reports
chmod 755 uploads/reports
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server:**
```bash
# In terminal 1
npm start
# OR for development with auto-restart
npm run dev
```

2. **Start Frontend Server:**
```bash
# In terminal 2
cd client
npm start
```

3. **Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health-check

### Production Mode

1. **Build Frontend:**
```bash
cd client
npm run build
cd ..
```

2. **Start Production Server:**
```bash
NODE_ENV=production npm start
```

## 🔍 API Endpoints Overview

### Authentication APIs
- `POST /api/auth/send-otp-registration` - Send OTP for registration
- `POST /api/auth/verify-otp-registration` - Verify OTP and register
- `POST /api/auth/send-otp-login` - Send OTP for login
- `POST /api/auth/verify-otp-login` - Verify OTP and login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Health Records APIs
- `GET /api/health/records` - Get all health records
- `POST /api/health/records` - Create health record
- `GET /api/health/records/:id` - Get specific record
- `PUT /api/health/records/:id` - Update record
- `DELETE /api/health/records/:id` - Delete record
- `GET /api/health/summary` - Get health summary

### Medical Reports APIs
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Upload report
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/:id/download` - Download report
- `DELETE /api/reports/:id` - Delete report

### QR Code APIs
- `POST /api/qr/generate` - Generate QR code
- `GET /api/qr` - Get user's QR code
- `POST /api/qr/scan` - Scan QR code
- `PUT /api/qr/settings` - Update QR settings

### User Management APIs
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/statistics` - Get user statistics
- `PUT /api/users/profile` - Update profile

## 🧪 Testing the Setup

### 1. Test Backend Connection
```bash
curl http://localhost:5000/api/health-check
```
Expected response:
```json
{
  "status": "OK",
  "message": "Migrant Health Storage API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Database Connection
- Check MongoDB is running: `sudo systemctl status mongodb`
- Or check Atlas connection in MongoDB Compass

### 3. Test Frontend
- Open http://localhost:3000
- You should see the login page

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running: `sudo systemctl start mongodb`
   - Check connection string in .env file
   - For Atlas: Ensure IP is whitelisted

2. **Twilio SMS Not Working:**
   - Verify Account SID and Auth Token
   - Check phone number format (+1234567890)
   - Ensure account has sufficient balance

3. **Frontend Not Loading:**
   - Check if backend is running on port 5000
   - Verify REACT_APP_API_URL in client/.env
   - Clear browser cache

4. **File Upload Issues:**
   - Check uploads directory permissions
   - Verify file size limits (10MB max)
   - Check file type restrictions

### Port Conflicts:
- Backend default: 5000
- Frontend default: 3000
- Change in .env if needed

## 📱 Mobile Testing

The system is fully responsive and works on:
- **Android** (Chrome, Firefox)
- **iOS** (Safari, Chrome)
- **Desktop** (Chrome, Firefox, Safari, Edge)

## 🔒 Security Considerations

1. **Change JWT Secret** - Use a strong, random secret
2. **Use HTTPS in Production** - SSL certificates required
3. **Secure MongoDB** - Use authentication and IP whitelisting
4. **Environment Variables** - Never commit .env files
5. **File Upload Security** - Files are validated and stored securely

## 📊 Monitoring

### Health Check Endpoint
- `GET /api/health-check` - System status
- Monitor database connections
- Check API response times

### Logs
- Backend logs in console
- MongoDB logs: `/var/log/mongodb/mongod.log`
- Check for errors and warnings

## 🚀 Deployment Options

### 1. **Local Development**
- Use local MongoDB
- Run on localhost
- Good for testing and development

### 2. **Cloud Deployment**
- **Heroku** (Free tier available)
- **DigitalOcean** (Droplet)
- **AWS EC2** (Free tier available)
- **Vercel** (Frontend only)

### 3. **Database Options**
- **MongoDB Atlas** (Free tier: 512MB)
- **Local MongoDB** (For development)
- **Self-hosted MongoDB** (For production)

## 📞 Support

If you encounter issues:
1. Check this setup guide
2. Review error logs
3. Verify all environment variables
4. Test each service individually

## ✅ Quick Verification Checklist

- [ ] MongoDB running and accessible
- [ ] Twilio credentials configured
- [ ] .env file created with correct values
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] API health check returns OK
- [ ] Can register a new user
- [ ] Can login with Aadhaar + OTP
- [ ] Can access dashboard

---

**Your Kerala Migrant Health Storage System is now ready to use! 🎉**
