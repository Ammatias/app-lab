# 🐳 Portfolio — Docker Quick Start

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
http://localhost:3000
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
```

---

## npm скрипты

```bash
npm run docker:build
npm run docker:up
npm run docker:down
npm run docker:logs
```

---

## Структура

```
docker/
├── Dockerfile              # Образ приложения
├── docker-compose.yml      # Оркестрация
├── .env                    ✅ Заполнен
├── .env.example            # Шаблон
├── deploy.sh               # Скрипт развёртывания
├── stop.sh                 # Скрипт остановки
├── README.md               # Этот файл
└── DEPLOY.md               # Полная документация
```

---

## Конфигурация

**Admin Panel API:**
- URL: `http://admin-panel:3000` (внутри Docker)
- DATA_SOURCE: static (по умолчанию)

**URL:**
- Portfolio: http://localhost:3000
- Admin Panel: http://localhost:3001 (внешний)

---

## Сеть

Проект использует внешнюю сеть `proxy`:

```bash
# Создать сеть (если не существует)
docker network create proxy
```

---

## Интеграция с Admin Panel

Для получения данных из админ-панели:

1. Убедитесь что админ-панель запущена
2. В `.env` установите:
   ```bash
   DATA_SOURCE="api"
   NEXT_PUBLIC_ADMIN_API_URL="http://admin-panel:3000"
   ```
3. Перезапустите:
   ```bash
   docker compose restart
   ```

---

## Решение проблем

### Портфолио не загружается

```bash
# Проверить логи
docker compose logs portfolio

# Проверить статус
docker compose ps
```

### Нет связи с Admin Panel

```bash
# Проверить доступность админ-панели
docker compose exec portfolio wget -q -O- http://admin-panel:3000/api/health

# Проверить сеть
docker network inspect proxy
```

### DATA_SOURCE не работает

```bash
# Проверить переменные
docker compose exec portfolio env | grep DATA_SOURCE

# Перезапустить с правильными переменными
docker compose down
docker compose up -d
```

---

**Дата:** 26 марта 2026
