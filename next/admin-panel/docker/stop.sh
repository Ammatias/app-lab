#!/bin/bash

# ===========================================
# Admin Panel — Stop Script
# ===========================================

set -e

echo "🛑 Stopping Admin Panel..."

# Определение команды docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD down

echo "✅ Services stopped"
