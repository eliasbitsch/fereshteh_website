# Deployment Guide - GitHub Actions + Container Registry

This guide explains how to deploy your application using GitHub Actions to build Docker images, and your VPS to pull and run them with Traefik.

## Overview

1. GitHub Actions builds the Docker image on every push to `main`
2. Image is pushed to GitHub Container Registry (GHCR)
3. VPS pulls the latest image and deploys with Traefik
4. Traefik handles SSL certificates and routing

## Prerequisites

1. A VPS with Docker and Docker Compose installed
2. Domain `fereshteh-hosseini.com` pointing to your VPS IP
3. GitHub repository with Actions enabled
4. Ports 80 and 443 open on your firewall

## Step 1: Configure GitHub Container Registry

### 1.1 Make Repository Package Public (Recommended)

After the first build completes:

1. Go to your GitHub repository
2. Click on "Packages" in the right sidebar
3. Click on your package (fereshteh_website)
4. Click "Package settings"
5. Scroll to "Danger Zone"
6. Click "Change visibility" → "Public"

This allows pulling without authentication.

### 1.2 Or Use Personal Access Token (Private)

If you want to keep the package private:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "VPS Docker Pull"
4. Select scopes: `read:packages`
5. Generate and save the token

## Step 2: Configure DNS

Point these domains to your VPS IP:

```
A    fereshteh-hosseini.com        -> YOUR_VPS_IP
A    www.fereshteh-hosseini.com    -> YOUR_VPS_IP
A    traefik.fereshteh-hosseini.com -> YOUR_VPS_IP
```

## Step 3: Setup on VPS

### 3.1 Clone Repository Configuration Files

On your VPS, create a deployment directory:

```bash
mkdir -p /home/apps/fereshteh_website
cd /home/apps/fereshteh_website
```

Copy these files from your repository:
- `docker-compose.prod.yml`
- `traefik.yml`
- `deploy.sh`
- `.env.prod.example`

Or clone the repository and copy them:

```bash
git clone https://github.com/YOUR_USERNAME/fereshteh_website.git temp
cp temp/docker-compose.prod.yml .
cp temp/traefik.yml .
cp temp/deploy.sh .
cp temp/.env.prod.example .env.prod
rm -rf temp
```

### 3.2 Configure Environment

Edit `.env.prod` and set your GitHub repository:

```bash
nano .env.prod
```

```env
GITHUB_REPOSITORY=your-username/fereshteh_website
```

Replace `your-username` with your actual GitHub username (lowercase).

### 3.3 Update Traefik Email

Edit `traefik.yml` and set your email for Let's Encrypt:

```bash
nano traefik.yml
```

Change line 24:
```yaml
email: your-actual-email@example.com
```

### 3.4 Create Required Directories

```bash
# Create Docker network
docker network create traefik-public

# Create directories for persistent data
mkdir -p letsencrypt
mkdir -p src/content/data
mkdir -p public/projects
mkdir -p public/projects-jpg
mkdir -p public/projects-thumbnails
mkdir -p public/profile-picture

# Set permissions
chmod 600 letsencrypt
```

## Step 4: Initial Deployment

### Option A: Public Package (No Authentication)

If you made the package public:

```bash
chmod +x deploy.sh
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Option B: Private Package (With Token)

If using a private package with PAT:

```bash
# Login to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull and start
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Step 5: Verify Deployment

Check the status:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

Access your site:
- Main site: https://fereshteh-hosseini.com
- Traefik dashboard: https://traefik.fereshteh-hosseini.com (admin/changeme)

## Automated Updates

### Method 1: Manual Pull and Restart

Whenever you push to `main`, GitHub Actions builds a new image. To update on your VPS:

```bash
cd /home/apps/fereshteh_website
docker compose -f docker-compose.prod.yml pull web
docker compose -f docker-compose.prod.yml up -d
```

### Method 2: Using Deploy Script

Create environment variables for the deploy script:

```bash
nano ~/.bashrc
```

Add:
```bash
export GITHUB_USERNAME="your-username"
export GITHUB_TOKEN="your-pat-token"  # Only if private
```

Then:
```bash
source ~/.bashrc
./deploy.sh
```

### Method 3: Webhook (Advanced)

Set up a webhook listener on your VPS that pulls and restarts when GitHub Actions completes.

## Monitoring

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f traefik
```

### Check Container Status

```bash
docker compose -f docker-compose.prod.yml ps
```

### View Resource Usage

```bash
docker stats
```

## Troubleshooting

### Image Pull Fails

**Error**: "unauthorized: authentication required"

**Solution**:
1. Make package public, OR
2. Login with: `echo TOKEN | docker login ghcr.io -u USERNAME --password-stdin`

### SSL Certificate Issues

**Error**: Certificate not generating

**Solution**:
1. Verify DNS points to your VPS
2. Check ports 80/443 are open: `sudo netstat -tulpn | grep -E ':(80|443)'`
3. Check Traefik logs: `docker compose -f docker-compose.prod.yml logs traefik`
4. Delete and retry: `rm -rf letsencrypt/acme.json && docker compose -f docker-compose.prod.yml restart traefik`

### Application Not Starting

Check logs for errors:
```bash
docker compose -f docker-compose.prod.yml logs web
```

Common issues:
- Missing environment variables
- Volume mount permission issues
- Port conflicts

### Update Not Reflecting

Force pull and recreate:
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

Clear browser cache or use incognito mode.

## Security Best Practices

### 1. Change Traefik Dashboard Password

```bash
# Generate new password hash
echo $(htpasswd -nb admin your-new-password) | sed -e s/\\$/\\$\\$/g

# Update in docker-compose.prod.yml
nano docker-compose.prod.yml
# Replace the basicauth.users value
```

### 2. Use Secrets for Sensitive Data

Don't commit `.env.prod` with real values to the repository.

### 3. Enable Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Regular Updates

Keep Docker and system packages updated:

```bash
sudo apt update && sudo apt upgrade -y
```

### 5. Backup Data

Regular backups of persistent volumes:

```bash
tar -czf backup-$(date +%Y%m%d).tar.gz \
  src/content/data \
  public/projects* \
  public/profile-picture \
  letsencrypt
```

## CI/CD Workflow

The automated workflow:

1. **Developer**: Push code to `main` branch
2. **GitHub Actions**:
   - Checkout code
   - Build Docker image
   - Run tests (if configured)
   - Push to GHCR with tags: `latest`, `main-SHA`
3. **VPS**: Pull and deploy new image

## Rollback

To rollback to a specific version:

```bash
# List available tags
docker image ls ghcr.io/your-username/fereshteh_website

# Or check GitHub Packages for SHA tags

# Pull specific version
docker pull ghcr.io/your-username/fereshteh_website:main-abc123

# Update docker-compose.prod.yml temporarily
# Change: image: ghcr.io/.../fereshteh_website:main-abc123

# Restart
docker compose -f docker-compose.prod.yml up -d
```

## Additional Configuration

### Add More Domains

Edit `docker-compose.prod.yml` router rule:

```yaml
- "traefik.http.routers.fereshteh-web.rule=Host(`fereshteh-hosseini.com`) || Host(`www.fereshteh-hosseini.com`) || Host(`additional.com`)"
```

### Environment Variables

Add to `docker-compose.prod.yml` under `web.environment`:

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=${DATABASE_URL}
  - API_KEY=${API_KEY}
```

Then create `.env.prod` with values:
```env
DATABASE_URL=postgresql://...
API_KEY=your-key
```

And load it:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Cost Optimization

- GitHub Actions: 2000 minutes/month free for public repos
- GitHub Container Registry: Unlimited public packages, 500MB free for private
- Consider arm64 builds if VPS is ARM-based (cheaper)

## Support Resources

- **Traefik Docs**: https://doc.traefik.io/traefik/
- **GitHub Actions**: https://docs.github.com/en/actions
- **GHCR**: https://docs.github.com/en/packages
- **Docker Compose**: https://docs.docker.com/compose/
