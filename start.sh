#!/bin/bash

echo "Starting Blood on the Clocktower Script Builder..."

# Check if node_modules exists for main project
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Check if server/node_modules exists
if [ ! -d "server/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd server
    npm install
    cd ..
fi

echo "Starting both frontend and backend..."
npm run dev:all
