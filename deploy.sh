#!/bin/bash
# ─────────────────────────────────────────────────────────────
# AgriTech B2B Platform — Ubuntu Server Deployment Script
# ─────────────────────────────────────────────────────────────
# Usage: chmod +x deploy.sh && ./deploy.sh
# Prerequisites: Docker, Docker Compose installed on Ubuntu
# ─────────────────────────────────────────────────────────────

set -e

echo "══════════════════════════════════════════════════════════"
echo "  AgriTech B2B — Deployment Script for Ubuntu Server"
echo "══════════════════════════════════════════════════════════"

# ─── Step 1: Check prerequisites ───
echo ""
echo "🔍 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | sudo gpg --yes --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "✅ Docker installed."
fi

if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose not found. Installing plugin..."
    sudo apt-get install -y docker-compose-plugin
fi

echo "✅ Docker: $(docker --version)"
echo "✅ Compose: $(docker compose version)"

# ─── Step 2: Create .env from template ───
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env from template..."
    cp .env.example .env
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/change-this-in-production-to-a-secure-random-string/$JWT_SECRET/" .env
    echo "✅ .env created with random JWT secret."
    echo "⚠️  Review .env and update database credentials if needed."
fi

# ─── Step 3: Build and start containers ───
echo ""
echo "🏗️  Building Docker images..."
docker compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker compose up -d

# ─── Step 4: Wait for health checks ───
echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if services are running
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "══════════════════════════════════════════════════════════"
echo "  ✅ Deployment Complete!"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "  🌐 Frontend:  http://$(hostname -I | awk '{print $1}'):8080"
echo "  🔧 Backend:   http://$(hostname -I | awk '{print $1}'):3000/api/v1"
echo "  🗄️  Database:  PostgreSQL on port 5432"
echo ""
echo "  Useful commands:"
echo "    docker compose logs -f          # View logs"
echo "    docker compose down             # Stop services"
echo "    docker compose up -d --build    # Rebuild & restart"
echo ""
