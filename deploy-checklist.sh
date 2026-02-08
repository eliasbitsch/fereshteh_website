#!/bin/bash
# Deployment script for upload fix and tests

set -e  # Exit on error

echo "🚀 Deployment Checklist for Upload Fix & Tests"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

echo "✅ Step 1: Verify all files are committed"
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Warning: You have uncommitted changes"
    git status -s
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "✅ Step 2: Run tests locally"
read -p "Run tests now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running unit tests..."
    bun run test:run || { echo "❌ Tests failed!"; exit 1; }
    echo "✅ Unit tests passed"
fi

echo ""
echo "✅ Step 3: Build application"
read -p "Build application? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Building..."
    bun run build || { echo "❌ Build failed!"; exit 1; }
    echo "✅ Build successful"
fi

echo ""
echo "📋 Manual Steps Required:"
echo "========================"
echo ""
echo "1. SSH to VPS and configure nginx:"
echo "   ssh user@fereshteh-hosseini.com"
echo "   sudo nano /etc/nginx/nginx.conf"
echo "   # Add in http block: client_max_body_size 20M;"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "2. Commit and push changes:"
echo "   git add ."
echo "   git commit -m 'Fix 413 upload error and add comprehensive tests'"
echo "   git push origin main"
echo ""
echo "3. Deploy on VPS:"
echo "   cd /path/to/project"
echo "   git pull"
echo "   docker-compose -f docker-compose.prod.yml pull"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "4. Test upload:"
echo "   - Go to https://fereshteh-hosseini.com/admin"
echo "   - Try uploading a file >2MB"
echo "   - Should now work! ✅"
echo ""
echo "✅ Deployment checklist complete!"
