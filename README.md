# Fereshteh Website

## VPS Deployment (826MB RAM)

Your VPS is too small to build Next.js. Use one of these methods:

### Option 1: Build Locally (Recommended)

**First time setup:**
Edit [deploy-from-local.sh](deploy-from-local.sh) and update:
- `VPS_HOST="your-vps-ip-or-domain"`

**Then run:**
```bash
# On your local machine:
./deploy-from-local.sh
```

This will:
1. Build the app locally
2. Upload `.next/`, `public/`, and `node_modules/` to VPS
3. Restart the service

**Manual method:**
```bash
bun install && bun run build
rsync -avz --delete .next/ root@your-vps:/home/apps/fereshteh_website/.next/
rsync -avz --delete public/ root@your-vps:/home/apps/fereshteh_website/public/
rsync -avz --delete node_modules/ root@your-vps:/home/apps/fereshteh_website/node_modules/
ssh root@your-vps "sudo systemctl restart fereshteh-website"
```

### Option 2: Build on VPS (when VSCode is closed)

Close VSCode to free ~400MB RAM, then:

```bash
# SSH into VPS
./deploy.sh
```

This will work but is slow due to swap usage.

### Option 3: Deploy Without Building

If `.next` folder exists:

```bash
./deploy-no-build.sh
```

## Manual Commands

```bash
# Build (requires ~1GB RAM)
NODE_OPTIONS='--max-old-space-size=1024' bun run build

# Start server
bun run start

# Check status
sudo systemctl status fereshteh-website
sudo journalctl -u fereshteh-website -f
```

## Memory Info

- RAM: 826MB
- Swap: 2GB
- VSCode uses: ~400MB
- Next.js build needs: ~600-800MB minimum
