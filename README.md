# Kerala Migrant Health Storage System

Secure, Aadhaar-aware digital health record management for migrant workers in Kerala. Provides authentication via mobile OTP, comprehensive health record storage, medical report management, QR-based emergency access, and a printable digital health card.

- Backend: Node.js (Express) + MongoDB (Mongoose)
- Frontend: React (TypeScript, CRA) + MUI
- Auth: OTP (Twilio), JWT
- License: MIT

## Table of Contents
- Features
- Tech Stack
- Project Structure
- Getting Started
- Environment Variables
- Running
- Build
- API Overview
- Documentation
- Security Notes
- Contributing
- License

## Features
- Authentication: Mobile OTP registration and Aadhaar-based login, JWT sessions, account lockout
- Health Records: Vital signs, diagnoses, treatments, doctor info, follow-ups
- Medical Reports: Upload/download, verification, access control, search/filter
- QR Codes: Health QR generation, emergency access, scan history
- Digital Health Card: Government format, printable summary
- Dashboard: Stats, activity, conditions, follow-ups

## Tech Stack
- Backend: Node.js, Express, MongoDB, Mongoose, Helmet, Rate limiting, Multer
- Frontend: React 18, TypeScript, MUI, React Router, Axios, qrcode.react
- Services: Nodemailer (email), Twilio (SMS)

## Project Structure
```
MigrantHealthStorage/
├─ server.js               # Express entrypoint
├─ routes/                 # API routes (auth, users, health, reports, qr)
├─ models/                 # Mongoose models (User, HealthRecord, MedicalReport, QRCode)
├─ middleware/             # Custom middleware (auth, etc.)
├─ uploads/                # File uploads (reports)
├─ client/                 # React app (TypeScript, CRA)
├─ scripts & tools         # setup-test-user.js, manage-users.js, etc.
├─ env.example             # Example backend env
├─ .gitignore
└─ package.json
```

## Getting Started
Prerequisites
- Node.js v14+ (LTS recommended)
- MongoDB (local or Atlas)
- npm (or yarn)

Backend setup
```
git clone <repository-url>
cd MigrantHealthStorage
npm install
cp env.example .env
```

Frontend setup
```
cd client
npm install
```

## Environment Variables
Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/migrant_health_storage
JWT_SECRET=<your_jwt_secret>
TWILIO_ACCOUNT_SID=<your_twilio_sid>
TWILIO_AUTH_TOKEN=<your_twilio_token>
TWILIO_PHONE_NUMBER=<your_twilio_number>
EMAIL_USER=<your_email>
EMAIL_PASS=<your_email_app_password>
PORT=5000
CLIENT_URL=http://localhost:3000
```

Frontend (client/.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running
Backend
```
npm start        # production
npm run dev      # development (nodemon)
```

Frontend
```
cd client
npm start
```

Single-command helpers (from root)
```
npm run client   # starts React dev server
npm run build    # builds React app
```

## Build
Frontend production build
```
cd client
npm run build
```

## API Overview
Core routes (see docs for full list):
- Auth: send-otp-registration, verify-otp-registration, send-otp-login, verify-otp-login, profile
- Health: records CRUD, summary, timeline, search
- Reports: list, upload, update, delete, download, access by QR
- QR: generate, get, scan, settings, scan-history
- Users: dashboard, profile, statistics, search

## Documentation
- Project Summary: PROJECT_SUMMARY.md
- Setup Guide: SETUP_GUIDE.md
- System Guide: README-SYSTEM-GUIDE.md

## Security Notes
- Do not commit secrets. Use .env files (already ignored by .gitignore).
- Replace placeholders like <your_jwt_secret> before running.
- If any documentation contains real credentials, redact before publishing publicly.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes with tests when applicable
4. Open a pull request

## License
MIT
