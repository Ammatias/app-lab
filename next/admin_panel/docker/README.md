# 🐳 Admin Panel — Docker Quick Start

## Быстрый старт

Все переменные окружения уже заполнены!

### 1. Проверка сети

```bash
# Убедитесь что сеть 'proxy' существует
docker network inspect proxy
```

Если сети нет, создайте:
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
docker compose ps
docker compose logs -f
```

### 4. Доступ

```
http://localhost:3001
```

---

## Команды управления

```bash
# Запуск
docker compose up -d

# Остановка
docker compose down

# Перезапуск
docker compose restart

# Логи
docker compose logs -f

# Применение миграций
docker compose --profile migrate up prisma-migrate
```

---

## npm скрипты

```bash
npm run docker:build
npm run docker:up
npm run docker:down
npm run docker:logs
npm run docker:migrate
```

---

## Структура

```
docker/
├── Dockerfile              # Образ приложения
├── docker-compose.yml      # Оркестрация
├── .env                    ✅ Заполнен (данные из external.md)
├── .env.example            # Шаблон
├── deploy.sh               # Скрипт развёртывания
├── stop.sh                 # Скрипт остановки
├── README.md               # Этот файл
└── DEPLOY.md               # Полная документация
```

---

## Сеть

Проект использует внешнюю сеть `proxy`:

```bash
# Создать сеть (если не существует)
docker network create proxy
```

---

## Что такое NextAuth?

**NextAuth** — библиотека аутентификации для Next.js (OAuth 2.0 / OIDC).

**Возможности:**
- OAuth провайдеры (Authentik, Google, GitHub)
- Session management
- JWT токены
- Database интеграция

**Файлы:**
- `src/lib/auth.ts` — конфигурация
- `src/app/api/auth/[...nextauth]/route.ts` — API
- `src/app/(auth)/login/page.tsx` — страница входа

**NEXTAUTH_SECRET** — секрет для подписи JWT токенов (генерация: `openssl rand -base64 32`).

---

## Решение проблем

### БД недоступна

**Ошибка:** `Can't reach database server at <DATABASE_HOST>:5432`

**Проверка:**
```bash
# Проверить подключение
ping <DATABASE_HOST>

# Проверить порт
telnet <DATABASE_HOST> 5432
```

### Миграции не применяются

```bash
docker compose --profile migrate up prisma-migrate
```

---

**Дата:** 26 марта 2026
