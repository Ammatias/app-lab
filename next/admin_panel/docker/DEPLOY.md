# 🚀 Admin Panel — Deployment Guide

## Быстрый старт


### 1. Проверка сети

```bash
# Проверить наличие сети proxy
docker network inspect proxy
```

Если сети нет:
```bash
docker network create proxy
```

### 2. Запуск

```bash
cd docker
chmod +x deploy.sh
./deploy.sh
```

### 3. Проверка

```bash
# Статус сервисов
docker compose ps

# Логи
docker compose logs -f admin-panel

# Проверка доступности
curl http://localhost:3001/api/health
```

---

## Конфигурация (уже заполнена)

### База данных

| Параметр | Значение |
|----------|----------|
| Host | `<DATABASE_HOST>:5432` |
| Database | admindashboard |
| User | `<DATABASE_USER>` |

### Authentik OAuth

| Параметр | Значение |
|----------|----------|
| Client ID | `<YOUR_CLIENT_ID>` |
| Client Secret | `<YOUR_CLIENT_SECRET>` |
| Issuer | `https://auth.example.com/application/o/admin-web/` |

### URLs

| Сервис | URL |
|--------|-----|
| Admin Panel | http://localhost:3001 |
| Authentik | https://auth.example.com |
| Portfolio | https://portfolio.example.com |

---

## Архитектура

```
┌─────────────────────────────────────────┐
│         Docker Compose                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Admin Panel (Next.js)         │   │
│  │   Port: 3000 (внешний: 3001)    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Network: proxy (external)     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│   External PostgreSQL                   │
│   <DATABASE_HOST>:5432                  │
└─────────────────────────────────────────┘
```

---

## Управление

### Команды

```bash
# Запуск
docker compose up -d

# Остановка
docker compose down

# Перезапуск
docker compose restart

# Сборка
docker compose build

# Логи
docker compose logs -f

# Применение миграций
docker compose --profile migrate up prisma-migrate
```

### npm скрипты

```bash
npm run docker:build        # Сборка образов
npm run docker:up           # Запуск сервисов
npm run docker:down         # Остановка сервисов
npm run docker:logs         # Просмотр логов
npm run docker:migrate      # Применение миграций БД
```

---

## Health Check

**Endpoint:** `/api/health`

```bash
curl http://localhost:3001/api/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-03-26T00:00:00.000Z",
  "service": "admin-panel"
}
```

---

## Решение проблем

### Ошибка: "Can't reach database server at <DATABASE_HOST>:5432"

**Причина:** Сервер БД недоступен из сети где запущен Docker

**Проверка:**
```bash
# Проверить подключение
ping <DATABASE_HOST>

# Проверить порт
telnet <DATABASE_HOST> 5432
# или
nc -zv <DATABASE_HOST> 5432
```

### Ошибка: "Network 'proxy' not found"

**Решение:**
```bash
docker network create proxy
```

### Миграции не применяются

```bash
# Применить вручную
docker compose --profile migrate up prisma-migrate

# Или внутри контейнера
docker compose exec admin-panel npx prisma migrate deploy
```

### Ошибка: "NEXTAUTH_SECRET not set"

```bash
# Сгенерировать новый
openssl rand -base64 32

# Обновить в .env
nano docker/.env

# Перезапустить
docker compose restart
```

---

## Обновление

```bash
# Обновить код
git pull

# Пересобрать и перезапустить
docker compose build
docker compose up -d
```

---

## Production Checklist

- [ ] Docker установлен
- [ ] docker-compose установлен
- [ ] Сеть `proxy` существует
- [ ] Сервер `<DATABASE_HOST>` доступен
- [ ] .env файл существует
- [ ] NEXTAUTH_SECRET установлен
- [ ] Миграции применены
- [ ] Health check проходит

---

## Что такое NextAuth?

**NextAuth** — библиотека аутентификации для Next.js с поддержкой OAuth 2.0 / OIDC.

### Возможности

- **OAuth провайдеры** — Authentik, Google, GitHub, и др.
- **Session management** — управление сессиями
- **JWT токены** — безопасное хранение данных
- **Database интеграция** — Prisma, PostgreSQL

### Как работает

```
Пользователь → NextAuth → Authentik → Session (JWT)
```

### Файлы конфигурации

- `src/lib/auth.ts` — настройки NextAuth
- `src/app/api/auth/[...nextauth]/route.ts` — API endpoints
- `src/app/(auth)/login/page.tsx` — страница входа

### Переменные окружения

```bash
AUTHENTIK_CLIENT_ID="your-client-id"
AUTHENTIK_CLIENT_SECRET="your-client-secret"
AUTHENTIK_ISSUER="https://auth.example.com/application/o/admin-web/"
NEXTAUTH_URL="https://admin.example.com"
NEXTAUTH_SECRET="..."  # openssl rand -base64 32
```

**NEXTAUTH_SECRET** — секрет для подписи JWT токенов и защиты сессий.

---

**Дата:** 26 марта 2026
**Статус:** ✅ Готово к развёртыванию
