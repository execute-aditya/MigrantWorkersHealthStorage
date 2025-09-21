# ✅ Installation Checklist - Kerala Migrant Health Storage

## 📋 **Pre-Installation Requirements**

### **System Check:**
- [ ] **Operating System**: Ubuntu/Windows/macOS
- [ ] **RAM**: 4GB minimum (8GB recommended)
- [ ] **Storage**: 5GB free space
- [ ] **Internet Connection**: Active

### **Software Installation:**
- [ ] **Node.js** (v16+) - [Download here](https://nodejs.org/)
- [ ] **npm** (comes with Node.js)
- [ ] **Git** (for version control)
- [ ] **Text Editor** (VS Code recommended)

---

## 🚀 **Installation Steps**

### **Step 1: Verify Prerequisites**
```bash
# Check Node.js version (should be v16+)
node --version

# Check npm version  
npm --version

# Check Git
git --version
```

### **Step 2: Set Up Project**
- [ ] Copy `MigrantHealthStorage` folder to new PC
- [ ] Open terminal/command prompt in project directory
- [ ] Navigate to project folder: `cd MigrantHealthStorage`

### **Step 3: Install Dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies  
cd client
npm install
cd ..
```

### **Step 4: Environment Configuration**
- [ ] Create `.env` file in root directory
- [ ] Copy environment variables from existing setup
- [ ] **IMPORTANT**: Generate new JWT secret for security

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **Step 5: Database Setup**
Choose one option:

**Option A: Use Existing MongoDB Atlas (Easiest)**
- [ ] Use provided MongoDB connection string
- [ ] No additional setup needed

**Option B: Set Up New MongoDB Atlas**
- [ ] Create account at [mongodb.com](https://mongodb.com)
- [ ] Create new cluster (free tier)
- [ ] Get connection string
- [ ] Update `.env` file

**Option C: Local MongoDB**
- [ ] Install MongoDB locally
- [ ] Start MongoDB service
- [ ] Update `.env` with local connection string

### **Step 6: SMS Configuration**
**For Production:**
- [ ] Create Twilio account at [twilio.com](https://twilio.com)
- [ ] Get Account SID, Auth Token, and Phone Number
- [ ] Update `.env` file with Twilio credentials

**For Development/Testing:**
- [ ] System works without Twilio (OTPs shown in console)

---

## 🧪 **Testing Installation**

### **Step 7: Start Services**

**Terminal 1 - Backend:**
```bash
# In project root directory
npm start
```
Expected output: `Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
# Navigate to client directory
cd client
npm start
```
Expected output: Frontend starts on `http://localhost:3000`

### **Step 8: Verify Installation**

**Test API Health:**
```bash
curl http://localhost:5000/api/health-check
```
Expected response: `{"status":"OK","message":"Migrant Health Storage API is running"}`

**Test Database:**
```bash
node manage-users.js
```

**Test Login:**
- [ ] Open `http://localhost:3000` in browser
- [ ] Enter Aadhar: `123456789012`
- [ ] Click "Send OTP"
- [ ] Check for success message

---

## 📊 **Sample Data Setup** (Optional)

```bash
# Create test users with health records
node create-sample-health-records.js

# Or create new user interactively
node complete-registration.js
```

---

## ⚠️ **Common Issues & Quick Fixes**

### **Port Already in Use:**
```bash
pkill -f "node server.js"
lsof -ti:5000 | xargs kill -9 2>/dev/null
```

### **Permission Errors (Linux/Mac):**
```bash
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules/
```

### **Frontend Not Loading:**
- [ ] Ensure both backend (port 5000) and frontend (port 3000) are running
- [ ] Check browser console for errors
- [ ] Clear browser cache

### **MongoDB Connection Failed:**
- [ ] Check internet connection
- [ ] Verify MongoDB URI in `.env`
- [ ] Check MongoDB Atlas IP whitelist

---

## ✅ **Installation Complete Checklist**

- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install` completed)
- [ ] Environment variables configured (`.env` file created)
- [ ] Database connection working
- [ ] Backend server starts successfully (`npm start`)
- [ ] Frontend server starts successfully (`cd client && npm start`)
- [ ] API health check passes
- [ ] Login system works with test data
- [ ] Sample data created (optional)

---

## 🎯 **Test Data for Quick Verification**

| Aadhar Number | Mobile | User | Status |
|--------------|---------|------|--------|
| `123456789012` | 8424972423 | Test User1 | ✅ SMS Working |
| `549861084965` | 9702551757 | Test User3 | ⚠️ Dev Mode |
| `314619230736` | 9004381020 | Adi adi | ⚠️ Dev Mode |

---

## 🆘 **If You Need Help**

1. **Check server console** for error messages
2. **Check browser console** (F12) for frontend errors  
3. **Verify all checkboxes above** are completed
4. **Review the full SETUP-GUIDE.md** for detailed instructions
5. **Test API endpoints individually** using provided test scripts

---

**🎉 Once all items are checked, your Kerala Migrant Health Storage system is ready to use!**