#!/bin/bash

# ===========================================
# Admin Panel — Deploy Script
# ===========================================
# Скрипт для развёртывания на сервере
# Все переменные окружения уже заполнены

set -e

echo "🚀 Starting Admin Panel deployment..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed${NC}"
    exit 1
fi

# Проверка наличия docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Error: docker-compose is not installed${NC}"
    exit 1
fi

# Определение команды docker-compose
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"

# Создание сети
echo -e "${YELLOW}📡 Setting up network...${NC}"
docker network inspect admin-network &> /dev/null || docker network create admin-network

# Применение миграций Prisma
echo -e "${YELLOW}🗄 Running database migrations...${NC}"
$COMPOSE_CMD --profile migrate up prisma-migrate || {
    echo -e "${YELLOW}⚠ Migration failed or already applied${NC}"
}

# Сборка и запуск контейнеров
echo -e "${YELLOW}🔨 Building containers...${NC}"
$COMPOSE_CMD build

echo -e "${YELLOW}🚀 Starting services...${NC}"
$COMPOSE_CMD up -d

# Ожидание запуска
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Проверка статуса
echo -e "${YELLOW}📊 Checking service status...${NC}"
$COMPOSE_CMD ps

# Вывод логов
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Admin Panel available at: http://localhost:3001"
echo "View logs with: $COMPOSE_CMD logs -f"
echo "Stop services with: $COMPOSE_CMD down"
