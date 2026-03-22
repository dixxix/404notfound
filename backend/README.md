# PsyTests API (FastAPI)

## Локально

1. PostgreSQL (или `docker compose up -d postgres` из корня репозитория).
2. Скопируйте `.env.example` в `.env` и при необходимости поправьте `DATABASE_URL`.
3. Установка и миграции:

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

При пустой БД создаются пользователи: `admin@admin.com` / `admin123`, `psycho@psycho.com` / `psycho123`.

## Docker

Из корня проекта (нужен запущенный Docker Desktop):

```bash
docker compose up -d --build
```

Бэкенд: `http://localhost:8000`, health: `GET /health`. Миграции выполняются при старте контейнера.

## Фронтенд

Укажите базовый URL API (префикс `/api` уже в роутерах FastAPI):

```bash
set NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Для профиля `full` (nginx + фронт в Docker на одном origin, `/api` через прокси):

```bash
docker compose --profile full up -d --build
```

Откройте `http://localhost:8080`.

## Полный стек в Docker

- `postgres` — порт `5432`
- `backend` — порт `8000`
- `nginx` + `frontend` — только с `--profile full` (порты `8080` и `3000`)
