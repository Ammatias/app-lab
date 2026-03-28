# 🚀 Portfolio — Deployment Guide

## Быстрый старт

Все переменные окружения уже заполнены.

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
docker compose logs -f portfolio

# Проверка доступности
curl http://localhost:3000
```

---

## Конфигурация (уже заполнена)

### Admin Panel API

| Параметр | Значение |
|----------|----------|
| URL | `http://admin-panel:3000` (внутри Docker) |
| DATA_SOURCE | static (по умолчанию) |

### URLs

| Сервис | URL |
|--------|-----|
| Portfolio | http://localhost:3000 |
| Admin Panel | http://localhost:3001 (внешний) |

---

## Архитектура

```
┌─────────────────────────────────────────┐
│         Docker Compose                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Portfolio (Next.js)           │   │
│  │   Port: 3000                    │   │
│  │                                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │  API Client             │   │   │
│  │  │  (Admin Panel API)      │   │   │
│  │  └─────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Network: proxy (external)     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│   Admin Panel                           │
│   http://admin-panel:3001               │
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
```

### npm скрипты

```bash
npm run docker:build        # Сборка образов
npm run docker:up           # Запуск сервисов
npm run docker:down         # Остановка сервисов
npm run docker:logs         # Просмотр логов
```

---

## Health Check

**Endpoint:** `/api/health` (не реализован, используется простой check)

```bash
curl http://localhost:3000
```

**Response:** HTML страница портфолио

---

## Решение проблем

### Ошибка: "Network 'proxy' not found"

**Решение:**
```bash
docker network create proxy
```

### Портфолио не загружается

**Проверка:**
```bash
# Проверить логи
docker compose logs portfolio

# Проверить статус
docker compose ps
```

### Нет связи с Admin Panel

**Проверка:**
```bash
# Проверить доступность админ-панели
docker compose exec portfolio wget -q -O- http://admin-panel:3001/api/health

# Проверить сеть
docker network inspect proxy
```

### DATA_SOURCE не работает

**Проверка:**
```bash
# Проверить переменные
docker compose exec portfolio env | grep DATA_SOURCE

# Перезапустить
docker compose down
docker compose up -d
```

---

## Переключение на API

По умолчанию Portfolio работает со статическими данными (`DATA_SOURCE=static`).

Для переключения на API админ-панели:

### 1. Обновить .env

```bash
# docker/.env
DATA_SOURCE="api"
NEXT_PUBLIC_ADMIN_API_URL="http://admin-panel:3000"
```

### 2. Перезапустить

```bash
docker compose restart
```

### 3. Проверить

Открыть `http://localhost:3000` — данные должны загружаться из админ-панели.

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
- [ ] Admin Panel запущена и доступна
- [ ] .env файл существует
- [ ] DATA_SOURCE установлен правильно
- [ ] Health check проходит

---

## Интеграция с Admin Panel

### Режимы работы

**1. Статические данные (по умолчанию)**

```bash
DATA_SOURCE="static"
```

Portfolio использует данные из `/data/*.ts`

**2. API Admin Panel**

```bash
DATA_SOURCE="api"
NEXT_PUBLIC_ADMIN_API_URL="http://admin-panel:3001"
```

Portfolio получает данные из админ-панели через API.

### API Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /api/public/portfolio/content` | Получить весь контент |
| `GET /api/resume/portfolio` | Получить резюме |
| `GET /api/hero/portfolio` | Получить Hero данные |
| `GET /api/projects/portfolio` | Получить проекты |

---

## Что такое NextAuth?

**NextAuth** используется в Admin Panel для аутентификации.

Portfolio не требует аутентификации — все API endpoints публичные.

---

**Дата:** 26 марта 2026
**Статус:** ✅ Готово к развёртыванию
