# 🚀 Next.js Projects — Complete Deployment Guide

## Проекты

| Проект | URL | Порт | Статус |
|--------|-----|------|--------|
| **Admin Panel** | https://admin.example.com | 3001 | ✅ Готов |
| **Portfolio** | https://portfolio.example.com | 3000 | ✅ Готов |

---

## 📋 Быстрое развёртывание

### 1. Проверка требований

```bash
# Проверка Docker
docker --version
docker compose version

# Проверка/создание сети
docker network inspect proxy || docker network create proxy
```

### 2. Развёртывание

```bash
cd /home/user
chmod +x deploy-all.sh
./deploy-all.sh
```

### 3. Проверка

```bash
# Проверка статуса
cd admin_panel/docker && docker compose ps
cd portfolio/docker && docker compose ps

# Проверка доступности
curl http://localhost:3001/api/health  # Admin Panel
curl http://localhost:3000             # Portfolio
```

---

## 🏗 Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                             │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Reverse Proxy (Traefik)            │   │
│  │         SSL termination (Let's Encrypt)         │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Network: proxy (external)               │   │
│  └─────────────────────────────────────────────────┘   │
│           ↓                    ↓                       │
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │  Admin Panel    │  │    Portfolio    │            │
│  │  (port 3001)    │  │   (port 3000)   │            │
│  │                 │  │                 │            │
│  │  - NextAuth     │  │  - API Client   │            │
│  │  - Prisma       │  │  - Dynamic API  │            │
│  │  - Content Mgmt │  │  - No Cache     │            │
│  └─────────────────┘  └─────────────────┘            │
│           ↓                                           │
│  ┌─────────────────────────────────────────────────┐  │
│  │         PostgreSQL (Local Docker)               │  │
│  │         Database: admindashboard                │  │
│  │         Port: 5432                              │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Структура проекта

```
<your-home-directory>/
├── admin_panel/
│   ├── docker/
│   │   ├── Dockerfile              ✅ Образ Next.js
│   │   ├── Dockerfile.migrate      ✅ Миграции Prisma
│   │   ├── docker-compose.yml      ✅ Конфигурация Docker
│   │   ├── .env                    ✅ Переменные окружения
│   │   ├── deploy.sh               ✅ Скрипт развёртывания
│   │   └── stop.sh                 ✅ Скрипт остановки
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/      ✅ Страница статистики
│   │   │   │   ├── projects/       ✅ Управление проектами
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── content/✅ Редактирование контента
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── builds/
│   │   │   ├── (auth)/
│   │   │   │   └── login/          ✅ Страница входа
│   │   │   └── api/
│   │   │       ├── auth/           ✅ NextAuth OAuth
│   │   │       ├── projects/       ✅ CRUD проектов
│   │   │       └── public/[slug]/  ✅ Публичный API
│   │   ├── components/
│   │   │   ├── forms/
│   │   │   │   ├── edit-project-form.tsx    ✅ Форма проекта
│   │   │   │   └── edit-content-form.tsx    ✅ Форма контента
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx     ✅ Боковое меню
│   │   │   │   └── header.tsx      ✅ Шапка
│   │   │   ├── tables/
│   │   │   │   ├── projects-table.tsx  ✅ Таблица проектов
│   │   │   │   └── builds-table.tsx    ✅ Таблица сборок
│   │   │   └── ui/                 ✅ UI компоненты
│   │   └── lib/
│   │       ├── auth.ts             ✅ NextAuth конфиг
│   │       └── db.ts               ✅ Prisma клиент
│   └── prisma/
│       └── schema.prisma           ✅ Схема БД
│
├── portfolio/
│   ├── docker/
│   │   ├── Dockerfile              ✅ Образ Next.js
│   │   ├── docker-compose.yml      ✅ Конфигурация Docker
│   │   ├── .env                    ✅ API настройки
│   │   ├── deploy.sh               ✅ Скрипт развёртывания
│   │   └── stop.sh                 ✅ Скрипт остановки
│   ├── app/
│   │   ├── page.tsx                ✅ Главная (API)
│   │   ├── resume/
│   │   │   ├── page.tsx            ✅ Страница резюме (API)
│   │   │   └── ResumeClient.tsx    ✅ Клиент компонент
│   │   └── layout.tsx              ✅ Корневой layout
│   ├── components/
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx     ✅ Hero с API
│   │   │   └── ProjectsSection.tsx ✅ Проекты с API
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   └── lib/
│       └── api-client.ts           ✅ API клиент
│
├── deploy-all.sh                   ✅ Развёртывание обоих
├── stop-all.sh                     ✅ Остановка обоих
└── README.md                       ✅ Эта документация
```

---

## ⚙️ Конфигурация

### Admin Panel

**Файл:** `admin_panel/docker/.env`

```bash
# Database (PostgreSQL в Docker)
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASS@postgres:5432/admindashboard?schema=public"

# Authentik OAuth
AUTHENTIK_CLIENT_ID="your-client-id"
AUTHENTIK_CLIENT_SECRET="your-client-secret"
AUTHENTIK_ISSUER="https://auth.example.com/application/o/admin-web/"

# NextAuth
NEXTAUTH_URL="https://admin.example.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Public URLs
NEXT_PUBLIC_ADMIN_API_URL="https://admin.example.com"
NEXT_PUBLIC_PORTFOLIO_URL="https://portfolio.example.com"
```

### Portfolio

**Файл:** `portfolio/docker/.env`

```bash
# Admin Panel API (внутри Docker сети порт 3000!)
NEXT_PUBLIC_ADMIN_API_URL="http://admin-panel:3000"

# Источник данных: "api" или "static"
DATA_SOURCE="api"
```

---

## 🔧 Управление

### Развёртывание

```bash
# Оба проекта
./deploy-all.sh

# Только Admin Panel
cd admin_panel/docker && ./deploy.sh

# Только Portfolio
cd portfolio/docker && ./deploy.sh
```

### Остановка

```bash
# Оба проекта
./stop-all.sh

# Только Admin Panel
cd admin_panel/docker && docker compose down

# Только Portfolio
cd portfolio/docker && docker compose down
```

### Логи

```bash
# Оба проекта
cd admin_panel/docker && docker compose logs -f
cd portfolio/docker && docker compose logs -f

# Только один сервис
docker compose logs -f admin-panel
docker compose logs -f portfolio
```

### Перезапуск

```bash
# Перезапуск обоих
docker compose restart

# Перезапуск одного
cd admin_panel/docker && docker compose restart
cd portfolio/docker && docker compose restart
```

---

## 🔐 Authentik настройка

### 1. Создать OAuth Provider

**Authentik Admin → Applications → Providers → Create**

- **Name:** Admin Panel
- **Provider type:** OAuth2 Provider
- **Client ID:** `your-client-id`
- **Client Secret:** `your-client-secret`
- **Redirect URI:** `https://admin.example.com/api/auth/callback/authentik`

### 2. Создать Application

**Applications → Create Application**

- **Name:** Admin Panel
- **Provider:** Admin Panel
- **Issuer URL:** `https://auth.example.com/application/o/admin-web/`

---

## 🛠 Troubleshooting

### Ошибка: "Network 'proxy' not found"

```bash
docker network create proxy
```

### Ошибка: "Can't reach database server"

**Проверка подключения:**

```bash
# Из контейнера Admin Panel
docker compose exec admin-panel ping -c 3 postgres
docker compose exec admin-panel wget -q -O- http://postgres:5432
```

**Решение:**
- Убедитесь что PostgreSQL контейнер запущен
- Проверьте сеть proxy

### Ошибка: "NEXTAUTH_SECRET not set"

```bash
# Сгенерировать новый
openssl rand -base64 32

# Обновить в .env
nano admin_panel/docker/.env

# Перезапустить
cd admin_panel/docker && docker compose restart
```

### Portfolio не получает данные из Admin Panel

**Проверка:**

```bash
# Проверить переменные
docker compose exec portfolio env | grep NEXT_PUBLIC_ADMIN_API_URL

# Проверить доступность Admin Panel
docker compose exec portfolio wget -q -O- http://admin-panel:3000/api/health
```

**Решение:**
```bash
# Убедиться что оба проекта в одной сети
docker network inspect proxy

# Перезапустить
docker compose restart admin-panel
docker compose restart portfolio
```

### Данные не обновляются на Portfolio

**Причина:** Кэш Next.js

**Решение:**
1. Очистить кэш браузера: `Ctrl+Shift+R`
2. Перезапустить Portfolio: `docker compose restart portfolio`

---

## 📊 Production Checklist

- [x] Docker установлен
- [x] docker-compose установлен
- [x] Сеть `proxy` существует
- [x] PostgreSQL в Docker запущен
- [x] Миграции применены
- [x] Authentik OAuth настроен
- [x] NEXTAUTH_SECRET установлен
- [x] DATA_SOURCE="api" в Portfolio
- [x] NEXT_PUBLIC_ADMIN_API_URL="http://admin-panel:3000"
- [x] Traefik настроен (SSL сертификаты)
- [x] Firewall настроен (порты 80, 443)

---

## 🔗 Документация

### Admin Panel
- `admin_panel/docker/README.md` — быстрый старт
- `admin_panel/docker/DEPLOY.md` — полная документация

### Portfolio
- `portfolio/docker/README.md` — быстрый старт
- `portfolio/docker/DEPLOY.md` — полная документация

---

## 📍 URLs

| Сервис | URL | Порт | Статус |
|--------|-----|------|--------|
| Admin Panel | https://admin.example.com | 3001 | ✅ Работает |
| Portfolio | https://portfolio.example.com | 3000 | ✅ Работает |
| Authentik | https://auth.example.com | 443 | ✅ Настроен |
| PostgreSQL | postgres:5432 (внутри Docker) | 5432 | ✅ Работает |

---

## 📝 Функционал

### Admin Panel

| Функция | Статус | URL |
|---------|--------|-----|
| Аутентификация Authentik | ✅ | `/login` |
| Список проектов | ✅ | `/projects` |
| Создание проекта | ✅ | `/projects/new` |
| Редактирование проекта | ✅ | `/projects/[id]` |
| **Редактирование контента** | ✅ | `/projects/[id]/content` |
| История сборок | ✅ | `/builds` |
| Dashboard | ✅ | `/dashboard` |
| Health Check | ✅ | `/api/health` |
| Public API | ✅ | `/api/public/[slug]/content` |

### Portfolio

| Страница | Обновляется из API | URL |
|----------|-------------------|-----|
| Главная | ✅ Да | `/` |
| Резюме | ✅ Да | `/resume` |

---

## 🎯 Редактирование контента

### Через Admin Panel

1. Откройте `http://localhost:3001/projects`
2. Найдите проект **Portfolio**
3. Нажмите 📄 (Edit Content)
4. Измените:
   - **Hero Section** — заголовок, подзаголовок
   - **Resume - About** — описание о себе
   - **Skills** — навыки (через запятую)
   - **Theme** — тема оформления
5. Нажмите **"Save Changes"**
6. Обновите Portfolio (`Ctrl+Shift+R`)

### Через API

```bash
# Обновить весь контент
curl -X PUT http://localhost:3001/api/public/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "hero": {
        "title": "Привет, я Дмитрий",
        "subtitle": "Full-stack разработчик",
        "ctaPrimary": {"text": "Проекты", "href": "#projects"},
        "ctaSecondary": {"text": "Резюме", "href": "/resume"}
      },
      "resume": {
        "about": "О себе...",
        "skills": ["JavaScript", "TypeScript"],
        "experience": [...],
        "education": [...],
        "courses": [...],
        "contacts": {...}
      },
      "projects": [...]
    },
    "settings": {"theme": "dark"}
  }'
```

---

**Дата:** 28 марта 2026
**Статус:** ✅ Полностью готово к production
**Версия:** 2.0 (с интеграцией API)
