# Fixing 413 Request Entity Too Large

## Problem
When uploading files larger than ~1MB, nginx returns a 413 error.

## Solutions Implemented

### 1. Next.js Configuration
Added body size limit in [next.config.ts](next.config.ts):
```typescript
experimental: {
  serverActions: {
    bodySizeLimit: "20mb",
  },
}
```

### 2. Traefik Configuration
Updated [traefik.yml](traefik.yml) with increased timeouts and [docker-compose.prod.yml](docker-compose.prod.yml) with buffering middleware:
```yaml
# Allows up to 20MB uploads
maxRequestBodyBytes: 20971520
memRequestBodyBytes: 2097152
```

### 3. Nginx Configuration (VPS Server)
**You must do this manually on your VPS:**

SSH into your server and edit nginx config:
```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:
```nginx
client_max_body_size 20M;
```

Or in site-specific config (`/etc/nginx/sites-available/fereshteh-hosseini.com`):
```nginx
server {
    client_max_body_size 20M;
}
```

Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Deploy Changes

1. Commit and push changes
2. SSH to VPS and update nginx config (see above)
3. Restart containers:
```bash
cd /path/to/project
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Verify

Try uploading a file >2MB through the admin panel. It should now work!
