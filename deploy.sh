#!/usr/bin/env bash

# ==============================================================================
# Order Portal Frontend Deployment Script
# Target Server Location: /var/www/portal-order-fe (or /var/www/order-portal-fe)
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

FE_DIR="${FE_DIR:-/var/www/portal-order-fe}"
BRANCH="${BRANCH:-dev}"

if [ ! -d "$FE_DIR" ]; then
  if [ -d "/var/www/order-portal-fe" ]; then
    FE_DIR="/var/www/order-portal-fe"
  elif [ -d "/var/www/order-fe" ]; then
    FE_DIR="/var/www/order-fe"
  fi
fi

echo -e "${CYAN}========================================================================${NC}"
echo -e "${CYAN}             Deploying Order Portal Frontend                            ${NC}"
echo -e "${CYAN}========================================================================${NC}"

if [ -d "$FE_DIR" ]; then
  cd "$FE_DIR"
else
  cd "$(dirname "$0")"
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo -e "${YELLOW}➜ Pulling latest frontend code (origin/${BRANCH})...${NC}"
  git fetch origin "$BRANCH" || true
  git checkout "$BRANCH" || true
  git pull origin "$BRANCH" || true
fi

if [ -f "package.json" ]; then
  echo -e "${YELLOW}➜ Installing Node dependencies...${NC}"
  npm install
fi

echo -e "${YELLOW}➜ Building production static assets (npm run build)...${NC}"
npm run build

echo -e "${GREEN}========================================================================${NC}"
echo -e "${GREEN}✓ Order Portal Frontend deployment completed successfully!               ${NC}"
echo -e "${GREEN}========================================================================${NC}"
