#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Webhook Deployment Setup for VPS ===${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (sudo)${NC}"
  exit 1
fi

# Variables
DEPLOY_DIR="/home/apps/fereshteh_website"
WEBHOOK_PORT=9000

echo -e "${YELLOW}Step 1: Installing Node.js (if needed)${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}Node.js installed successfully${NC}"
else
    echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
fi

echo -e "\n${YELLOW}Step 2: Creating deployment directory${NC}"
mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_DIR/letsencrypt
mkdir -p $DEPLOY_DIR/src/content/data
mkdir -p $DEPLOY_DIR/public/projects
mkdir -p $DEPLOY_DIR/public/projects-jpg
mkdir -p $DEPLOY_DIR/public/projects-thumbnails
mkdir -p $DEPLOY_DIR/public/profile-picture
echo -e "${GREEN}Directories created${NC}"

echo -e "\n${YELLOW}Step 3: Generating webhook secret${NC}"
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}Generated secret: ${WEBHOOK_SECRET}${NC}"
echo -e "${YELLOW}IMPORTANT: Save this secret! You'll need to add it to GitHub.${NC}"
echo ""
read -p "Press Enter to continue..."

echo -e "\n${YELLOW}Step 4: Creating webhook service file${NC}"
cat > /etc/systemd/system/webhook-deploy.service <<EOF
[Unit]
Description=GitHub Webhook Deployment Server
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_DIR
Environment="WEBHOOK_PORT=$WEBHOOK_PORT"
Environment="WEBHOOK_SECRET=$WEBHOOK_SECRET"
Environment="DEPLOY_PATH=$DEPLOY_DIR"
ExecStart=/usr/bin/node $DEPLOY_DIR/webhook-server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/webhook-deploy.log
StandardError=append:/var/log/webhook-deploy.log

[Install]
WantedBy=multi-user.target
EOF
echo -e "${GREEN}Service file created${NC}"

echo -e "\n${YELLOW}Step 5: Configuring firewall${NC}"
if command -v ufw &> /dev/null; then
    ufw allow $WEBHOOK_PORT/tcp
    echo -e "${GREEN}Firewall rule added for port $WEBHOOK_PORT${NC}"
else
    echo -e "${YELLOW}UFW not found, skipping firewall configuration${NC}"
fi

echo -e "\n${YELLOW}Step 6: Creating docker network${NC}"
if ! docker network inspect traefik-public &> /dev/null; then
    docker network create traefik-public
    echo -e "${GREEN}Docker network created${NC}"
else
    echo -e "${GREEN}Docker network already exists${NC}"
fi

echo -e "\n${YELLOW}Step 7: Installing deployment files${NC}"
echo "Please ensure these files are in $DEPLOY_DIR:"
echo "  - webhook-server.js"
echo "  - docker-compose.prod.yml"
echo "  - traefik.yml"
echo "  - .env.prod"
echo ""
read -p "Have you copied these files? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Please copy the required files first${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 8: Starting webhook service${NC}"
systemctl daemon-reload
systemctl enable webhook-deploy
systemctl start webhook-deploy
sleep 2

if systemctl is-active --quiet webhook-deploy; then
    echo -e "${GREEN}Webhook service started successfully${NC}"
else
    echo -e "${RED}Failed to start webhook service${NC}"
    systemctl status webhook-deploy
    exit 1
fi

echo -e "\n${YELLOW}Step 9: Testing webhook endpoint${NC}"
if curl -f http://localhost:$WEBHOOK_PORT/health &> /dev/null; then
    echo -e "${GREEN}Webhook server is responding${NC}"
else
    echo -e "${RED}Webhook server not responding${NC}"
    exit 1
fi

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me)

echo -e "\n${GREEN}=== Setup Complete! ===${NC}\n"
echo -e "Webhook server is running on port $WEBHOOK_PORT"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Add these secrets to your GitHub repository (Settings → Secrets):"
echo -e "   ${GREEN}WEBHOOK_URL${NC}: http://$PUBLIC_IP:$WEBHOOK_PORT/webhook"
echo -e "   ${GREEN}WEBHOOK_SECRET${NC}: $WEBHOOK_SECRET"
echo -e ""
echo -e "2. Or use GitHub's native webhook (Settings → Webhooks → Add webhook):"
echo -e "   Payload URL: http://$PUBLIC_IP:$WEBHOOK_PORT/webhook"
echo -e "   Content type: application/json"
echo -e "   Secret: $WEBHOOK_SECRET"
echo -e "   Events: Just the push event"
echo -e ""
echo -e "3. View logs with:"
echo -e "   ${GREEN}sudo journalctl -u webhook-deploy -f${NC}"
echo -e "   ${GREEN}sudo tail -f /var/log/webhook-deploy.log${NC}"
echo -e ""
echo -e "4. Check status with:"
echo -e "   ${GREEN}sudo systemctl status webhook-deploy${NC}"
echo -e ""
echo -e "Your VPS is ready for automatic deployments! 🚀"
