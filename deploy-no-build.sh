#!/bin/bash
set -e

echo "🚀 Deploying website (no build, just code update)..."

cd /home/apps/fereshteh_website

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
bun install --frozen-lockfile

# Skip build - use pre-built .next folder
echo "⏭️  Skipping build (use pre-built files)..."

# Restart service
echo "🔄 Restarting service..."
sudo systemctl restart fereshteh-website

echo "✅ Done! Check status with: sudo systemctl status fereshteh-website"
echo ""
echo "⚠️  Note: Make sure .next folder is built and committed to git,"
echo "   or use 'deploy.sh' when you have enough free RAM to build."
