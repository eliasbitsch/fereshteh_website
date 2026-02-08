# Fix 413 Request Entity Too Large Error

The error occurs because nginx has a default upload size limit of 1MB.

## Solution: Update nginx configuration on your VPS

SSH into your VPS and edit the nginx configuration:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add this line inside the `http` block:

```nginx
http {
    # ... existing config ...
    
    # Increase upload size limit to 20MB
    client_max_body_size 20M;
    
    # ... rest of config ...
}
```

Or if you have a site-specific config at `/etc/nginx/sites-available/default` or `/etc/nginx/sites-available/fereshteh-hosseini.com`:

```nginx
server {
    # ... existing config ...
    
    # Increase upload size limit to 20MB
    client_max_body_size 20M;
    
    # ... rest of config ...
}
```

Then test and reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Alternative: Update Traefik middleware

If you want to handle this at the Traefik level, you can add a buffering middleware.
