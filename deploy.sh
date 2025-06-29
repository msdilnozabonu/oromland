#!/bin/bash

# Oromland Frontend Deployment Script
# This script builds and deploys the Oromland frontend application

set -e

echo "🚀 Starting Oromland Frontend Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "📦 Installing Angular CLI..."
    npm install -g @angular/cli
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests (optional, uncomment if you have tests)
# echo "🧪 Running tests..."
# npm run test:ci

# Build for production
echo "🏗️ Building for production..."
ng build --configuration production

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are located in: dist/oromland/"
    
    # Optional: Deploy to server
    # Uncomment and modify the following lines for your deployment target
    
    # Deploy to Firebase Hosting
    # echo "🚀 Deploying to Firebase..."
    # firebase deploy --only hosting
    
    # Deploy to Netlify
    # echo "🚀 Deploying to Netlify..."
    # netlify deploy --prod --dir=dist/oromland
    
    # Deploy to AWS S3
    # echo "🚀 Deploying to AWS S3..."
    # aws s3 sync dist/oromland/ s3://your-bucket-name --delete
    
    # Deploy to custom server via SCP
    # echo "🚀 Deploying to server..."
    # scp -r dist/oromland/* user@your-server.com:/var/www/html/
    
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Your application should be available at: https://oromland.uz"
    
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi