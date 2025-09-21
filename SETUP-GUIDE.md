# 🏥 Kerala Migrant Health Storage - Complete Setup Guide

## 📋 **System Requirements**

### **Minimum Hardware Requirements:**
- **RAM**: 4GB (8GB recommended)
- **Storage**: 5GB free space
- **CPU**: Dual-core processor
- **Network**: Internet connection for dependencies

### **Operating System Support:**
- ✅ **Ubuntu/Debian Linux** (Recommended)
- ✅ **Windows 10/11** (with WSL or native)
- ✅ **macOS** (10.14+)
- ✅ **CentOS/RHEL**

---

## 🛠️ **Software Dependencies**

### **Essential Requirements:**

1. **Node.js** (v16.0+ required, v18.0+ recommended)
2. **npm** (comes with Node.js) 
3. **Git** (for version control)
4. **MongoDB** (local or cloud access)
5. **Text Editor/IDE** (VS Code recommended)

### **Optional but Recommended:**
- **MongoDB Compass** (GUI for database)
- **Postman** (API testing)
- **Terminal/Command Prompt**

---

## 📦 **Step-by-Step Installation**

### **Step 1: Install Node.js**

#### **Ubuntu/Debian:**
```bash
# Update package manager
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify installation
node --version    # Should be v16.0+
npm --version     # Should be 8.0+
```

#### **Windows:**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run installer (includes npm)
3. Open Command Prompt and verify:
   ```cmd
   node --version
   npm --version
   ```

#### **macOS:**
```bash
# Using Homebrew (install Homebrew first if needed)
brew install node npm

# Verify installation
node --version
npm --version
```

### **Step 2: Install Git**

#### **Ubuntu/Debian:**
```bash
sudo apt install git
```

#### **Windows:**
Download from [git-scm.com](https://git-scm.com/download/windows)

#### **macOS:**
```bash
brew install git
```

### **Step 3: Set Up Project**

#### **Option A: Download Project Files**
1. Copy the entire `MigrantHealthStorage` folder to your new PC
2. Navigate to the project directory

#### **Option B: Clone from Repository (if using Git)**
```bash
git clone <your-repository-url>
cd MigrantHealthStorage
```

---

## 🔧 **Project Configuration**

### **Step 4: Install Dependencies**

Navigate to the project root directory:

```bash
cd MigrantHealthStorage

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install

# Return to root directory
cd ..
```

### **Step 5: Environment Configuration**

Create/update the `.env` file in the root directory:

```bash
# Create .env file
nano .env
```

**Required Environment Variables:**
```env
# Database Configuration
MONGODB_URI=mongodb+srv://em4017077_db_user:eG51jHgNT0xj5mmd@migranthealth.dfm4djc.mongodb.net/MigrantHealthDB?retryWrites=true&w=majority&appName=migranthealth

# JWT Secret (generate a new one for security)
JWT_SECRET=your_super_secret_jwt_key_here_change_this

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
CLIENT_URL=http://localhost:3000
```

---

## 🗄️ **Database Setup Options**

### **Option 1: Use Existing MongoDB Atlas (Easiest)**
- Use the existing connection string in `.env`
- No additional setup required
- Data will be shared across installations

### **Option 2: Set Up Local MongoDB**

#### **Ubuntu/Debian:**
```bash
# Install MongoDB
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Update .env file
MONGODB_URI=mongodb://localhost:27017/MigrantHealthDB
```

#### **Windows:**
1. Download MongoDB Community Server
2. Install with default settings
3. Update `.env` with local connection string

### **Option 3: Create New MongoDB Atlas Account**
1. Go to [mongodb.com](https://mongodb.com)
2. Create free account
3. Create new cluster
4. Get connection string
5. Update `.env` file

---

## 🔐 **Security Configuration**

### **Generate New JWT Secret:**
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Twilio SMS Setup:**
1. Create account at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Get a Twilio phone number
4. Update `.env` file

**For Development/Testing:**
- System works in development mode without Twilio
- OTPs will be displayed in server console

---

## 🚀 **Running the Application**

### **Start Backend Server:**
```bash
# In project root directory
npm start
```

Server will run on: `http://localhost:5000`

### **Start Frontend (in new terminal):**
```bash
# Navigate to client directory
cd client

# Start React development server
npm start
```

Frontend will run on: `http://localhost:3000`

---

## 🧪 **Verify Installation**

### **Test Backend API:**
```bash
# Test server health
curl http://localhost:5000/api/health-check

# Expected response:
# {"status":"OK","message":"Migrant Health Storage API is running","timestamp":"..."}
```

### **Test Database Connection:**
```bash
# Run user management script
node manage-users.js
```

### **Test Login System:**
```bash
# Run login test
node test-login.js
```

---

## 📊 **Sample Data Setup**

### **Create Test Users:**
```bash
# Create sample users with health records
node create-sample-health-records.js

# Or create specific test user
node complete-registration.js
```

### **Available Test Data:**
| Aadhar | Mobile | Name | Status |
|--------|--------|------|--------|
| 123456789012 | 8424972423 | Test User1 | ✅ SMS Working |
| 549861084965 | 9702551757 | Test User3 | ⚠️ Dev Mode |
| 314619230736 | 9004381020 | Adi adi | ⚠️ Dev Mode |

---

## 📁 **Project Structure**

```
MigrantHealthStorage/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── routes/                   # API routes
│   ├── auth.js              # Authentication routes
│   ├── health.js            # Health records routes
│   ├── users.js             # User management routes
│   └── qr.js               # QR code routes
├── models/                   # Database models
│   ├── User.js              # User model
│   ├── HealthRecord.js      # Health records model
│   └── QRCode.js           # QR code model
├── services/                 # External services
│   └── twilio.js           # SMS service
├── middleware/               # Custom middleware
│   └── auth.js             # Authentication middleware
├── client/                   # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json        # Frontend dependencies
│   └── ...
└── docs/                    # Documentation and guides
```

---

## 🔧 **Troubleshooting**

### **Common Issues & Solutions:**

#### **Port Already in Use:**
```bash
# Kill existing processes
pkill -f "node server.js"
lsof -ti:5000 | xargs kill -9 2>/dev/null
```

#### **MongoDB Connection Failed:**
- Check internet connection
- Verify MongoDB URI in `.env`
- Check firewall settings

#### **Twilio SMS Not Working:**
- Verify credentials in `.env`
- Check Twilio account balance
- Verify phone numbers are verified (for trial accounts)

#### **Frontend Not Loading:**
- Ensure both backend (5000) and frontend (3000) are running
- Check browser console for errors
- Verify API_URL in frontend configuration

#### **Permission Errors (Linux/Mac):**
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules/
```

---

## 📖 **Additional Resources**

### **Development Tools:**
- **API Testing**: Use provided test scripts or Postman
- **Database GUI**: MongoDB Compass
- **Code Editor**: VS Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - MongoDB for VS Code
  - Thunder Client (API testing)

### **Useful Commands:**
```bash
# View logs
npm run logs

# Restart server
npm run restart

# Run tests
npm test

# Build for production
cd client && npm run build
```

---

## 🔒 **Production Deployment**

### **Environment Variables for Production:**
```env
NODE_ENV=production
PORT=80
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=very_secure_production_jwt_secret
CLIENT_URL=https://yourdomain.com
```

### **Security Checklist:**
- [ ] Change all default passwords
- [ ] Use HTTPS in production
- [ ] Set up proper firewall rules
- [ ] Use environment variables for secrets
- [ ] Set up database backups
- [ ] Configure logging and monitoring

---

## 💡 **Quick Start Summary**

1. **Install Node.js and npm**
2. **Copy project files to new PC**
3. **Run `npm install` in root and client directories**
4. **Configure `.env` file**
5. **Start backend: `npm start`**
6. **Start frontend: `cd client && npm start`**
7. **Access application at `http://localhost:3000`**

---

## 🆘 **Support**

If you encounter issues during setup:

1. **Check the troubleshooting section above**
2. **Review console logs for error messages**
3. **Verify all dependencies are installed correctly**
4. **Ensure environment variables are configured**
5. **Test API endpoints individually**

---

**🎉 Your Kerala Migrant Health Storage system will be ready to use after completing these steps!**