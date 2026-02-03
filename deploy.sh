#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment...${NC}"

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo -e "${RED}Error: .env.prod file not found${NC}"
    echo "Please create .env.prod from .env.prod.example"
    exit 1
fi

# Load environment variables and export them for docker compose
set -a
source .env.prod
set +a

# Check if GITHUB_REPOSITORY is set
if [ -z "$GITHUB_REPOSITORY" ]; then
    echo -e "${RED}Error: GITHUB_REPOSITORY not set in .env.prod${NC}"
    exit 1
fi

echo -e "${YELLOW}Logging in to GitHub Container Registry...${NC}"
echo "Please enter your GitHub Personal Access Token (with read:packages scope):"
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

echo -e "${YELLOW}Pulling latest image from registry...${NC}"
docker compose -f docker-compose.prod.yml pull web

echo -e "${YELLOW}Stopping and removing old containers...${NC}"
docker compose -f docker-compose.prod.yml down

echo -e "${YELLOW}Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Services status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}Your site should be available at:${NC}"
echo "  https://fereshteh-hosseini.com"
echo "  https://traefik.fereshteh-hosseini.com (Traefik dashboard)"
echo ""
echo "To view logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
