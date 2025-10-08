#!/bin/bash

# Blood on the Clocktower - Deployment Script
# Run this script on your home server to deploy the application

set -e  # Exit on any error

echo "🚀 Starting deployment of Blood on the Clocktower Script Builder..."

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Warning: Running as root. Consider using a non-root user."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 process manager..."
    npm install -g pm2
fi

# Note: We're now using Express to serve the frontend, so no need for serve

echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p server/data

echo "📦 Installing dependencies..."

# Install frontend dependencies
echo "   Installing frontend dependencies..."
npm install --production=false

# Install backend dependencies
echo "   Installing backend dependencies..."
cd server
npm install --production
cd ..

echo "🔧 Updating API URL for production..."
# Update API URL to use server's IP or domain
if [ ! -z "$API_URL" ]; then
    node update-api-url.js
else
    echo "   Using default API URL (localhost:3001)"
fi

echo "🏗️  Building frontend for production..."
npm run build

echo "🔄 Stopping existing processes (if any)..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.cjs

echo "💾 Saving PM2 configuration..."
pm2 save

echo "🔄 Setting up PM2 startup script..."
pm2 startup

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should now be running:"
echo "   Application: http://your-server-ip:3000"
echo "   API: http://your-server-ip:3000/api"
echo ""
echo "📊 Useful commands:"
echo "   pm2 status          - Check process status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart all processes"
echo "   pm2 stop all        - Stop all processes"
echo "   pm2 monit           - Monitor processes"
echo ""
echo "🔧 To update the application:"
echo "   1. Pull latest changes: git pull"
echo "   2. Run this script again: ./deploy.sh"
