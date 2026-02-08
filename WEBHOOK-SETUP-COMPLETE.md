# 🎉 Webhook Auto-Deploy Setup Complete!

## ✅ What's Been Configured

Your webhook server is now running and listening for GitHub pushes!

### Service Status
```
✅ Node.js 20.20.0 installed
✅ Webhook service running on port 9000
✅ Firewall configured
✅ Auto-restart enabled
```

### Webhook Details
- **URL**: `http://YOUR_VPS_IP:9000/webhook`
- **Secret**: `efcfd96e961c94a826aaeb5652551e5dddc231e3e805db833a5850b55ac2458e`
- **Logs**: `/var/log/webhook-deploy.log`

---

## 🔧 Next Steps: Configure GitHub Webhook

### 1. Go to Your GitHub Repository

Navigate to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/hooks`

### 2. Click "Add webhook"

### 3. Fill in the form:

| Field | Value |
|-------|-------|
| **Payload URL** | `http://YOUR_VPS_IP:9000/webhook` |
| **Content type** | `application/json` |
| **Secret** | `efcfd96e961c94a826aaeb5652551e5dddc231e3e805db833a5850b55ac2458e` |
| **Which events?** | Just the push event |
| **Active** | ✅ Checked |

### 4. Click "Add webhook"

---

## 🧪 Test It!

### Option 1: Push to main branch
```bash
git commit --allow-empty -m "Test auto-deploy"
git push origin main
```

### Option 2: Manual test with curl
```bash
curl -X POST http://YOUR_VPS_IP:9000/webhook \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main"}'
```

### Check deployment logs:
```bash
tail -f /var/log/webhook-deploy.log
```

---

## 🎯 How It Works Now

1. **You push to `main`** → GitHub sends webhook
2. **Webhook server receives it** → Verifies secret
3. **Pulls latest Docker image** → From GitHub Container Registry
4. **Restarts container** → Zero-downtime deployment
5. **Done!** → Your site is updated! 🚀

---

## 📊 Useful Commands

```bash
# Check webhook service status
systemctl status webhook-deploy

# View logs in real-time
tail -f /var/log/webhook-deploy.log

# Restart webhook service
systemctl restart webhook-deploy

# Stop webhook service
systemctl stop webhook-deploy
```

---

## 🔒 Security Notes

- ✅ Webhook secret is configured for security
- ✅ Only `main` branch triggers deployment
- ✅ Service auto-restarts on failure
- ⚠️ Port 9000 is now open - ensure your firewall is properly configured

---

## 🐛 Troubleshooting

### Webhook not triggering?
1. Check GitHub webhook delivery history for errors
2. Verify secret matches exactly
3. Check logs: `tail -f /var/log/webhook-deploy.log`
4. Test health: `curl http://localhost:9000/health` (should return "OK")

### Deployment failing?
1. Check if Docker is running: `docker ps`
2. Verify image exists: `docker images | grep fereshteh`
3. Check compose file exists: `ls -la /home/apps/fereshteh_website/docker-compose.prod.yml`

---

**Your deployment is now FULLY AUTOMATED!** 🎉

Every push to `main` will automatically deploy to production.
