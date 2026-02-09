# Fereshteh Website

## Deploy to VPS

Simply run:
```bash
./deploy.sh
```

This will:
1. Pull latest code
2. Install dependencies
3. Build with memory optimization (for 2GB RAM VPS)
4. Restart the service

## Manual deployment

```bash
git pull origin main
bun install
NODE_OPTIONS='--max-old-space-size=1536' bun run build
sudo systemctl restart fereshteh-website
```

## Check status

```bash
sudo systemctl status fereshteh-website
sudo journalctl -u fereshteh-website -f
```
