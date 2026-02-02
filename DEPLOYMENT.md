# Deployment Guide with Traefik

This guide explains how to deploy your application with Traefik reverse proxy and automatic HTTPS certificates.

## Prerequisites

1. A server with Docker and Docker Compose installed
2. Domain name `fereshteh-hosseini.com` pointing to your server's IP address
3. Ports 80 and 443 open on your firewall

## DNS Configuration

Configure your DNS records to point to your server:

```
A    fereshteh-hosseini.com        -> YOUR_SERVER_IP
A    www.fereshteh-hosseini.com    -> YOUR_SERVER_IP
A    traefik.fereshteh-hosseini.com -> YOUR_SERVER_IP
```

## Setup Instructions

### 1. Update Traefik Email

Edit `traefik.yml` and replace `your-email@example.com` with your actual email:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com  # <- Change this
```

### 2. Create Docker Network

Create the external network for Traefik:

```bash
docker network create traefik-public
```

### 3. Create SSL Certificate Directory

```bash
mkdir -p letsencrypt
chmod 600 letsencrypt
```

### 4. Start the Services

```bash
docker-compose up -d
```

This will:
- Build your Next.js application
- Start Traefik reverse proxy
- Automatically obtain SSL certificates from Let's Encrypt
- Redirect HTTP to HTTPS
- Redirect www to non-www

### 5. Check the Status

```bash
# View logs
docker-compose logs -f

# Check running containers
docker ps
```

## Accessing Your Application

- **Main site**: https://fereshteh-hosseini.com
- **Traefik dashboard**: https://traefik.fereshteh-hosseini.com
  - Default username: `admin`
  - Default password: `changeme`

## Updating the Application

To update your application:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Changing Dashboard Password

To change the Traefik dashboard password:

1. Install Apache utilities (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt-get install apache2-utils

   # Alpine
   apk add apache2-utils
   ```

2. Generate a new password hash:
   ```bash
   echo $(htpasswd -nb admin your-new-password) | sed -e s/\\$/\\$\\$/g
   ```

3. Update the `basicauth.users` label in `docker-compose.yml` with the output

4. Restart Traefik:
   ```bash
   docker-compose up -d traefik
   ```

## SSL Certificate Management

- Certificates are stored in `./letsencrypt/acme.json`
- Traefik automatically renews certificates before they expire
- Let's Encrypt certificates are valid for 90 days

## Monitoring

View Traefik logs:
```bash
docker-compose logs -f traefik
```

View application logs:
```bash
docker-compose logs -f web
```

## Troubleshooting

### Certificate Issues

If SSL certificates fail to generate:

1. Ensure ports 80 and 443 are accessible from the internet
2. Verify DNS records are correctly configured
3. Check Traefik logs: `docker-compose logs traefik`
4. Delete `letsencrypt/acme.json` and restart: `docker-compose restart traefik`

### Application Not Accessible

1. Check container status: `docker ps`
2. Verify network: `docker network inspect traefik-public`
3. Check labels: `docker inspect fereshteh-website | grep traefik`

### Port Conflicts

If ports 80 or 443 are already in use:

```bash
# Check what's using the ports
sudo lsof -i :80
sudo lsof -i :443

# Stop conflicting services (e.g., nginx, apache)
sudo systemctl stop nginx
sudo systemctl stop apache2
```

## Production Best Practices

1. **Backup regularly**:
   ```bash
   # Backup CMS content and uploads
   tar -czf backup-$(date +%Y%m%d).tar.gz \
     src/content/data \
     public/projects \
     public/profile-picture \
     letsencrypt
   ```

2. **Enable firewall**:
   ```bash
   # UFW example
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Set up automatic updates** using watchtower or similar tools

4. **Monitor logs** and set up alerts for errors

## Stopping the Application

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Additional Configuration

### Adding More Domains

To add additional domains, update the router rule in `docker-compose.yml`:

```yaml
- "traefik.http.routers.fereshteh-web.rule=Host(`fereshteh-hosseini.com`) || Host(`www.fereshteh-hosseini.com`) || Host(`additional-domain.com`)"
```

### Custom Headers

Add security headers by creating a middleware:

```yaml
labels:
  - "traefik.http.middlewares.security-headers.headers.customResponseHeaders.X-Frame-Options=SAMEORIGIN"
  - "traefik.http.middlewares.security-headers.headers.customResponseHeaders.X-Content-Type-Options=nosniff"
  - "traefik.http.routers.fereshteh-web.middlewares=www-redirect,security-headers"
```

## Support

For issues specific to:
- Traefik: https://doc.traefik.io/traefik/
- Let's Encrypt: https://letsencrypt.org/docs/
- Docker: https://docs.docker.com/
