#!/bin/bash

# ===========================================
# Stop Both Projects — Admin Panel & Portfolio
# ===========================================

set -e

echo "🛑 Stopping Admin Panel & Portfolio..."

# Определение команды docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Остановка Admin Panel
echo "Stopping Admin Panel..."
cd "$(dirname "$0")/admin_panel/docker"
$COMPOSE_CMD down

# Остановка Portfolio
echo "Stopping Portfolio..."
cd ../../portfolio/docker
$COMPOSE_CMD down

echo "✅ All services stopped"
