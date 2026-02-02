# Automatic Deployment Setup

This guide shows you how to set up automatic deployment when you push to the `main` branch.

## Option 1: SSH Deployment (Recommended - Simpler)

GitHub Actions SSH into your VPS and runs deployment commands automatically.

### Setup Steps

#### 1. Generate SSH Key on Your VPS

On your VPS:

```bash
# Generate a new SSH key (press Enter for all prompts)
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N ""

# Add the public key to authorized_keys
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# Display the private key (copy this)
cat ~/.ssh/github-actions
```

#### 2. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `VPS_HOST` | Your VPS IP address | `123.45.67.89` |
| `VPS_USERNAME` | SSH username | `root` |
| `VPS_SSH_KEY` | Private key from step 1 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | SSH port (optional) | `22` |

#### 3. Ensure Deployment Directory Exists

On your VPS:

```bash
mkdir -p /home/apps/fereshteh_website
cd /home/apps/fereshteh_website

# Copy docker-compose.prod.yml and other files here
```

#### 4. Make Package Public (or setup auth)

GitHub Container Registry authentication:

**Option A**: Make package public (easier)
- After first build, go to GitHub → Packages → Your package → Package settings → Change visibility → Public

**Option B**: Use authentication
```bash
# On VPS, login to GHCR
echo YOUR_PAT | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

#### 5. Test the Deployment

Push to main branch:

```bash
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Watch the GitHub Actions run in your repository's "Actions" tab. It will:
1. Build the Docker image
2. Push to GitHub Container Registry
3. SSH to your VPS
4. Pull the new image
5. Restart the container

### Workflow File

The workflow is in [.github/workflows/docker-build.yml](.github/workflows/docker-build.yml)

---

## Option 2: Webhook Deployment (More Elegant)

Your VPS runs a webhook server that listens for GitHub events and deploys automatically.

### Setup Steps

#### 1. Install Webhook Server on VPS

Copy files to VPS:

```bash
cd /home/apps/fereshteh_website

# Copy webhook-server.js and webhook.service from your repo
```

#### 2. Generate Webhook Secret

```bash
# Generate a random secret
openssl rand -hex 32
# Save this for later
```

#### 3. Configure Systemd Service

```bash
# Edit webhook.service and set your secret
nano webhook.service

# Change this line:
Environment="WEBHOOK_SECRET=your-webhook-secret-here"

# Copy service file
sudo cp webhook.service /etc/systemd/system/

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable webhook
sudo systemctl start webhook

# Check status
sudo systemctl status webhook
```

#### 4. Configure Firewall

Allow webhook port:

```bash
sudo ufw allow 9000/tcp
```

#### 5. Add Traefik Route for Webhook (Optional - for HTTPS)

Add to `docker-compose.prod.yml` under traefik labels:

```yaml
# Webhook endpoint
- "traefik.http.routers.webhook.rule=Host(`webhook.fereshteh-hosseini.com`)"
- "traefik.http.routers.webhook.entrypoints=websecure"
- "traefik.http.routers.webhook.tls.certresolver=letsencrypt"
- "traefik.http.services.webhook.loadbalancer.server.port=9000"
```

Or use direct HTTP (simpler):
- Webhook URL: `http://YOUR_VPS_IP:9000/webhook`

#### 6. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add:

| Secret Name | Value |
|------------|-------|
| `WEBHOOK_URL` | `http://YOUR_VPS_IP:9000/webhook` or `https://webhook.fereshteh-hosseini.com/webhook` |
| `WEBHOOK_SECRET` | Secret from step 2 |

#### 7. Use Webhook Workflow

Rename the workflow file:

```bash
# Disable SSH workflow
mv .github/workflows/docker-build.yml .github/workflows/docker-build.yml.disabled

# Enable webhook workflow
mv .github/workflows/deploy-webhook.yml .github/workflows/deploy-webhook.yml
```

Or just use the webhook workflow filename in your commits.

#### 8. Alternative: Use GitHub Webhook (Native)

Instead of the workflow triggering, use GitHub's built-in webhooks:

1. Go to GitHub repo → Settings → Webhooks → Add webhook
2. Payload URL: `http://YOUR_VPS_IP:9000/webhook`
3. Content type: `application/json`
4. Secret: Your webhook secret
5. Events: Just the push event
6. Active: ✓

With this setup, GitHub will call your VPS directly after each push.

**Then use the simpler workflow** (just build, don't trigger webhook):

```yaml
# Just keep the build-and-push job, remove the webhook trigger step
```

### View Webhook Logs

```bash
# Live logs
sudo journalctl -u webhook -f

# All logs
sudo tail -f /var/log/webhook-deploy.log
```

---

## Comparison

| Feature | SSH Deployment | Webhook |
|---------|----------------|---------|
| Setup Complexity | Simple | Moderate |
| Security | Very Secure (SSH) | Good (HMAC signatures) |
| Dependencies | None | Node.js service |
| GitHub Minutes | Uses ~1 min | Uses ~1 min |
| VPS Resources | None | Minimal (Node.js) |
| Debugging | GitHub Actions logs | VPS logs |
| Reliability | Very High | High |

**Recommendation**: Use **SSH Deployment** (Option 1) for simplicity and reliability.

---

## Troubleshooting

### SSH Deployment Issues

**Error**: "Permission denied (publickey)"

**Solution**:
1. Verify SSH key is added to `~/.ssh/authorized_keys` on VPS
2. Check SSH key secret in GitHub has the full private key
3. Test SSH manually: `ssh -i ~/.ssh/github-actions user@vps-ip`

**Error**: "docker compose: command not found"

**Solution**:
Add docker installation to VPS, or use full path in workflow:
```yaml
script: |
  cd /home/apps/fereshteh_website
  /usr/bin/docker compose -f docker-compose.prod.yml pull web
```

### Webhook Issues

**Error**: Webhook not receiving requests

**Solution**:
1. Check firewall: `sudo ufw status`
2. Check service status: `sudo systemctl status webhook`
3. Test manually: `curl http://YOUR_VPS_IP:9000/health`
4. Check GitHub webhook deliveries in repo settings

**Error**: "Invalid signature"

**Solution**:
Ensure `WEBHOOK_SECRET` matches in:
1. VPS webhook service
2. GitHub Actions secret
3. GitHub webhook settings (if using native webhooks)

---

## Advanced: Blue-Green Deployment

For zero-downtime deployments, use blue-green strategy:

```yaml
# In docker-compose.prod.yml, use multiple containers
services:
  web-blue:
    # ... config
  web-green:
    # ... config
```

Then alternate between them during deployments.

---

## Monitoring

### GitHub Actions

View deployment status:
- Go to repository → Actions
- See real-time logs of build and deploy

### VPS

Monitor with:

```bash
# Container status
docker compose -f docker-compose.prod.yml ps

# Application logs
docker compose -f docker-compose.prod.yml logs -f web

# System resources
docker stats

# Webhook logs (if using)
sudo journalctl -u webhook -f
```

### Notifications

Add Slack/Discord notifications to GitHub Actions:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Security Best Practices

1. **SSH Keys**: Use dedicated keys for CI/CD, rotate regularly
2. **Secrets**: Never commit secrets, use GitHub Secrets
3. **Webhook Signatures**: Always verify HMAC signatures
4. **Firewall**: Restrict webhook port to GitHub IPs if possible
5. **Docker Registry**: Use private packages with authentication
6. **VPS Access**: Limit SSH access, use key-based auth only

---

## Rollback

If a deployment fails:

### Manual Rollback

```bash
# On VPS
cd /home/apps/fereshteh_website

# Pull specific version
docker pull ghcr.io/your-username/fereshteh_website:main-abc123

# Update docker-compose.prod.yml temporarily
# image: ghcr.io/.../fereshteh_website:main-abc123

# Restart
docker compose -f docker-compose.prod.yml up -d web
```

### Automated Rollback

Add health checks to workflow:

```yaml
- name: Health check
  run: |
    sleep 10
    curl -f https://fereshteh-hosseini.com || exit 1

- name: Rollback on failure
  if: failure()
  run: |
    # SSH and rollback to previous version
```

---

## Complete Workflow

The final automated flow:

1. **Developer**: `git push origin main`
2. **GitHub Actions**:
   - Checkout code
   - Build Docker image
   - Push to GHCR
   - Deploy to VPS (SSH or Webhook)
3. **VPS**:
   - Pull new image
   - Restart container
   - Clean old images
4. **Verification**: Visit https://fereshteh-hosseini.com

All automatic, hands-free! 🚀
