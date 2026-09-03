#!/bin/bash

# ===========================================
# Portfolio — Stop Script
# ===========================================

set -e

echo "🛑 Stopping Portfolio..."

# Определение команды docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD down

echo "✅ Services stopped"
