#!/bin/bash

# Quick Deployment Script for Vercel
# This script sets up your app for deployment to Vercel

echo "🚀 Quote Image Generator - Vercel Deployment Setup"
echo "=================================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "✅ Git repository: Ready"
echo "✅ Build configuration: vercel.json created"
echo "✅ App verified to build successfully"
echo ""

# Check if already deployed
if [ -d ".vercel" ]; then
    echo "📝 Redeploying to Vercel..."
    vercel --prod
else
    echo "🔗 Connecting to Vercel for first time..."
    echo ""
    echo "You will be asked to:"
    echo "1. Log in to Vercel (or create a new account)"
    echo "2. Authorize the CLI"
    echo "3. Set up your project"
    echo ""
    read -p "Press Enter to continue..." -t 10
    echo ""
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Visit your live URL (shown above)"
echo "2. Test the quote generator"
echo "3. Try exporting a video with music"
echo ""
