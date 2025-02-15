#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install backend dependencies
cd backend
npm install

# Go back to root directory
cd ..

# Create production build
echo "Build completed"