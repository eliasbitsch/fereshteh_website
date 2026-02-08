# Fix 413 Request Entity Too Large Error

**Your setup**: Next.js running standalone on VPS with nginx as reverse proxy (no containers).

## Your Architecture

```
Internet → Nginx (reverse proxy) → Next.js (port 3000)
```

The 413 error is from nginx's default 1MB upload limit. Your PDF is ~2.8MB.

## Quick Fix (Run on VPS)

SSH into your VPS and run:

```bash
# Navigate to project directory
cd ~/fereshteh_website

# Run the fix script
./fix-nginx-upload.sh
```

## Manual Fix

```bash
# Edit nginx config
sudo nano /etc/nginx/nginx.conf

# Add inside the http block:
http {
    # Allow file uploads up to 20MB
    client_max_body_size 20M;
    
    # ... rest of config
}

# Or in site-specific config
sudo nano /etc/nginx/sites-available/fereshteh-hosseini.com

server {
    # Add anywhere inside server block
    client_max_body_size 20M;
}

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Verify

```bash
# Check nginx status
sudo systemctl status nginx

# Check current config
sudo nginx -T | grep client_max_body_size
```

## After Fix

Upload should work at: https://fereshteh-hosseini.com/admin

Files up to 20MB will be accepted.
