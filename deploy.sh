#!/bin/bash
set -e

echo "🚀 Deploying website..."

cd /home/apps/fereshteh_website

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
bun install --frozen-lockfile

# Build with memory limit for VPS (826MB RAM + 2GB swap)
echo "🔨 Building..."
NODE_OPTIONS='--max-old-space-size=1024' bun run build

# Restart service
echo "🔄 Restarting service..."
sudo systemctl restart fereshteh-website

echo "✅ Done! Check status with: sudo systemctl status fereshteh-website"
