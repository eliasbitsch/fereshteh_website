#!/bin/bash

# Fix 413 Request Entity Too Large error on VPS
# This updates nginx configuration to allow larger uploads

echo "🔧 Fixing nginx upload size limit for VPS deployment..."
echo ""
echo "📋 Current setup:"
echo "   Internet → Nginx → Next.js (standalone on VPS)"
echo ""

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ nginx is not installed!"
    echo "   Please install nginx first: sudo apt install nginx"
    exit 1
fi

# Backup existing nginx config
echo "📦 Creating backup..."
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"
echo ""

# Check if client_max_body_size already exists
if grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
    echo "⚠️  client_max_body_size already exists in nginx.conf"
    echo "   Current value:"
    grep "client_max_body_size" /etc/nginx/nginx.conf
    echo ""
    echo "   To update it manually, run:"
    echo "   sudo nano /etc/nginx/nginx.conf"
    echo "   And change the value to: client_max_body_size 20M;"
else
    echo "➕ Adding client_max_body_size to nginx.conf..."
    
    # Add client_max_body_size in http block (after http {)
    sudo sed -i '/http {/a\    # Allow file uploads up to 20MB\n    client_max_body_size 20M;' /etc/nginx/nginx.conf
    
    echo "✅ Added client_max_body_size 20M"
fi

# Test nginx configuration
echo ""
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Configuration is valid"
    
    # Reload nginx
    echo ""
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "✅ Nginx reloaded successfully!"
    echo ""
    echo "📝 Summary:"
    echo "   - Max upload size: 20MB"
    echo "   - Backup saved: /etc/nginx/nginx.conf.backup.*"
    echo ""
    echo "🎉 Upload fix applied! Try uploading your PDF again."
    echo "   URL: https://fereshteh-hosseini.com/admin"
else
    echo "❌ Configuration test failed!"
    echo "   Restoring from backup..."
    sudo cp /etc/nginx/nginx.conf.backup.* /etc/nginx/nginx.conf
    echo "   Please check the configuration manually."
    exit 1
fi

