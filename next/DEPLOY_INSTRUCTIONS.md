# 🚀 Next.js Projects — Deployment Instructions

## 📦 Установка из архива

### 1. Распаковка архива

```bash
# Скопируйте архив на сервер
scp nextjs-projects-backup.tar.gz user@your-server:/home/user/

# Распакуйте
cd /home/user
tar -xzvf nextjs-projects-backup.tar.gz
```

### 2. Настройка переменных окружения

#### Admin Panel

```bash
cd admin_panel/docker
cp .env.example .env
nano .env  # Отредактируйте значения
```

**Необходимые значения:**
- `DATABASE_URL` — подключение к PostgreSQL
- `AUTHENTIK_CLIENT_ID` — Client ID из Authentik
- `AUTHENTIK_CLIENT_SECRET` — Client Secret из Authentik
- `AUTHENTIK_ISSUER` — URL Issuer из Authentik
- `NEXTAUTH_URL` — URL админ-панели
- `NEXTAUTH_SECRET` — сгенерируйте: `openssl rand -base64 32`

#### Portfolio

```bash
cd portfolio/docker
cp .env.example .env
nano .env  # Отредактируйте значения
```

**Необходимые значения:**
- `NEXT_PUBLIC_ADMIN_API_URL` — URL Admin Panel (в Docker: `http://admin-panel:3000`)
- `DATA_SOURCE` — `"api"` или `"static"`

### 3. Создание Docker сети

```bash
docker network inspect proxy &> /dev/null || docker network create proxy
```

### 4. Развёртывание

#### Вариант A: Оба проекта

```bash
cd /home/user
chmod +x deploy-all.sh
./deploy-all.sh
```

#### Вариант B: По отдельности

```bash
# Admin Panel
cd admin_panel/docker
chmod +x deploy.sh
./deploy.sh

# Portfolio
cd portfolio/docker
chmod +x deploy.sh
./deploy.sh
```

### 5. Проверка

```bash
# Проверка статуса
docker compose -f admin_panel/docker/docker-compose.yml ps
docker compose -f portfolio/docker/docker-compose.yml ps

# Проверка доступности
curl http://localhost:3001/api/health  # Admin Panel
curl http://localhost:3000             # Portfolio
```

### 6. Применение миграций (если нужно)

```bash
cd admin_panel/docker
docker compose --profile migrate up prisma-migrate
```

---

## 🔧 Управление

### Логи

```bash
# Оба проекта
cd admin_panel/docker && docker compose logs -f
cd portfolio/docker && docker compose logs -f

# Один сервис
docker compose logs -f admin-panel
docker compose logs -f portfolio
```

### Перезапуск

```bash
# Оба проекта
cd admin_panel/docker && docker compose restart
cd portfolio/docker && docker compose restart

# Один сервис
docker compose restart admin-panel
docker compose restart portfolio
```

### Остановка

```bash
# Оба проекта
./stop-all.sh

# По отдельности
cd admin_panel/docker && docker compose down
cd portfolio/docker && docker compose down
```

---

## 📊 Структура проекта

```
nextjs-projects/
├── admin_panel/
│   ├── docker/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── .env.example
│   │   ├── deploy.sh
│   │   └── stop.sh
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── prisma/
│
├── portfolio/
│   ├── docker/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   ├── .env.example
│   │   ├── deploy.sh
│   │   └── stop.sh
│   ├── app/
│   ├── components/
│   └── lib/
│
├── deploy-all.sh
├── stop-all.sh
├── README.md
└── .gitignore
```

---

## 🔐 Authentik настройка

1. **Создайте OAuth Provider:**
   - Authentik Admin → Applications → Providers → Create
   - Provider type: OAuth2 Provider
   - Client ID: сгенерируйте
   - Client Secret: сгенерируйте
   - Redirect URI: `https://admin.example.com/api/auth/callback/authentik`

2. **Создайте Application:**
   - Applications → Create Application
   - Provider: выберите созданный
   - Issuer URL: скопируйте

3. **Обновите `.env` Admin Panel:**
   ```bash
   AUTHENTIK_CLIENT_ID="your-client-id"
   AUTHENTIK_CLIENT_SECRET="your-client-secret"
   AUTHENTIK_ISSUER="https://auth.example.com/application/o/admin-web/"
   ```

---

## 📝 Переменные окружения

### Admin Panel

| Переменная | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | Подключение к PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `AUTHENTIK_CLIENT_ID` | Client ID из Authentik | `abc123...` |
| `AUTHENTIK_CLIENT_SECRET` | Client Secret из Authentik | `xyz789...` |
| `AUTHENTIK_ISSUER` | URL Issuer | `https://auth.example.com/application/o/...` |
| `NEXTAUTH_URL` | URL админ-панели | `https://admin.example.com` |
| `NEXTAUTH_SECRET` | Секрет для сессий | `openssl rand -base64 32` |

### Portfolio

| Переменная | Описание | Пример |
|------------|----------|--------|
| `NEXT_PUBLIC_ADMIN_API_URL` | URL Admin Panel | `http://admin-panel:3000` |
| `DATA_SOURCE` | Источник данных | `api` или `static` |

---

## 🐛 Troubleshooting

### Ошибка: "Network 'proxy' not found"

```bash
docker network create proxy
```

### Ошибка: "Can't reach database server"

Проверьте подключение к БД:
```bash
cd admin_panel/docker
docker compose exec admin-panel ping -c 3 postgres
```

### Ошибка: "NEXTAUTH_SECRET not set"

Сгенерируйте новый:
```bash
openssl rand -base64 32
```

Добавьте в `.env`:
```bash
NEXTAUTH_SECRET="..."
```

Перезапустите:
```bash
docker compose restart admin-panel
```

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker compose logs -f`
2. Проверьте переменные окружения
3. Убедитесь что сеть `proxy` существует
4. Проверьте доступность PostgreSQL

---

**Версия:** 2.0
**Дата:** Март 2026
