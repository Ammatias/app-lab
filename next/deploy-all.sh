#!/bin/bash

# ===========================================
# Deploy Both Projects — Admin Panel & Portfolio
# ===========================================
# Скрипт для развёртывания обоих проектов одновременно

set -e

echo "🚀 Deploying Admin Panel & Portfolio..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Определение команды docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✅ Docker checked${NC}"

# Создание сети proxy
echo -e "${YELLOW}📡 Setting up network...${NC}"
docker network inspect proxy &> /dev/null || docker network create proxy
echo -e "${GREEN}✅ Network 'proxy' ready${NC}"

# Переход в директорию Admin Panel
cd "$(dirname "$0")/admin_panel/docker"

# Применение миграций Admin Panel
echo -e "${YELLOW}🗄 Running Admin Panel migrations...${NC}"
$COMPOSE_CMD --profile migrate up prisma-migrate || {
    echo -e "${YELLOW}⚠ Migrations may have already been applied${NC}"
}

# Сборка и запуск Admin Panel
echo -e "${YELLOW}🔨 Building Admin Panel...${NC}"
$COMPOSE_CMD build

echo -e "${YELLOW}🚀 Starting Admin Panel...${NC}"
$COMPOSE_CMD up -d

echo -e "${GREEN}✅ Admin Panel started${NC}"

# Переход в директорию Portfolio
cd ../../portfolio/docker

# Сборка и запуск Portfolio
echo -e "${YELLOW}🔨 Building Portfolio...${NC}"
$COMPOSE_CMD build

echo -e "${YELLOW}🚀 Starting Portfolio...${NC}"
$COMPOSE_CMD up -d

echo -e "${GREEN}✅ Portfolio started${NC}"

# Ожидание
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Проверка статуса
echo -e "${YELLOW}📊 Service status:${NC}"
echo ""
echo "=== Admin Panel ==="
docker compose ps
echo ""
cd ../../admin_panel/docker
$COMPOSE_CMD ps
echo ""
echo "=== Portfolio ==="
cd ../../portfolio/docker
$COMPOSE_CMD ps

# Вывод информации
echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📍 URLs:"
echo "   Admin Panel:  https://admin.example.com"
echo "   Portfolio:    https://portfolio.example.com"
echo ""
echo "📊 View logs:"
echo "   Admin Panel:  cd admin_panel/docker && docker compose logs -f"
echo "   Portfolio:    cd portfolio/docker && docker compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   Admin Panel:  cd admin_panel/docker && docker compose down"
echo "   Portfolio:    cd portfolio/docker && docker compose down"
echo ""
