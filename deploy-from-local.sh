#!/bin/bash
set -e

# Configuration - UPDATE THESE!
VPS_USER="root"
VPS_HOST="your-vps-ip-or-domain"
VPS_PATH="/home/apps/fereshteh_website"

echo "🚀 Building and deploying to VPS..."
echo ""

# Build locally
echo "🔨 Building locally..."
bun install --frozen-lockfile
bun run build

# Copy built files to VPS
echo "📤 Uploading .next folder to VPS..."
rsync -avz --delete .next/ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/.next/

echo "📤 Uploading public folder to VPS..."
rsync -avz --delete public/ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/public/

echo "📤 Uploading node_modules to VPS..."
rsync -avz --delete node_modules/ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/node_modules/

# Restart service on VPS
echo "🔄 Restarting service on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "sudo systemctl restart fereshteh-website"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Check: https://fereshteh-hosseini.com"
echo "📊 Status: ssh ${VPS_USER}@${VPS_HOST} 'sudo systemctl status fereshteh-website'"
