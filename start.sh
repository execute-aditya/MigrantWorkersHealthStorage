#!/bin/bash

# Kerala Migrant Health Storage System Startup Script

echo "🏥 Starting Kerala Migrant Health Storage System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   You can start MongoDB with: sudo systemctl start mongod"
    echo "   Or install MongoDB if not installed."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/reports

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 uploads
chmod 755 uploads/reports

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating environment file..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your configuration before starting the application."
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   Backend:  npm start"
echo "   Frontend: cd client && npm start"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For more information, see README.md"
