#!/bin/bash

echo "🏥 Kerala Migrant Health Storage System - Quick Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Installing MongoDB..."
    
    # Install MongoDB (Ubuntu/Debian)
    if command -v apt &> /dev/null; then
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
        sudo systemctl start mongod
        sudo systemctl enable mongod
        echo "✅ MongoDB installed and started"
    else
        echo "❌ Please install MongoDB manually:"
        echo "   Visit: https://docs.mongodb.com/manual/installation/"
        exit 1
    fi
else
    echo "✅ MongoDB found: $(mongod --version | head -n1)"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update .env file with your API credentials"
    echo "   Required: MONGODB_URI, JWT_SECRET, TWILIO credentials"
else
    echo "✅ .env file exists"
fi

# Create client .env file
if [ ! -f client/.env ]; then
    echo "📋 Creating client .env file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > client/.env
    echo "✅ Client .env file created"
else
    echo "✅ Client .env file exists"
fi

# Create uploads directory
mkdir -p uploads/reports
chmod 755 uploads/reports
echo "✅ Uploads directory created"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo "1. Update .env file with your API credentials:"
echo "   - MONGODB_URI (MongoDB connection string)"
echo "   - JWT_SECRET (strong random string)"
echo "   - TWILIO_ACCOUNT_SID (from Twilio console)"
echo "   - TWILIO_AUTH_TOKEN (from Twilio console)"
echo "   - TWILIO_PHONE_NUMBER (from Twilio console)"
echo ""
echo "2. Start the application:"
echo "   Backend:  npm start"
echo "   Frontend: cd client && npm start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For detailed setup instructions, see SETUP_GUIDE.md"
echo "📞 For support, see README.md"
