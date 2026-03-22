from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from starlette.exceptions import HTTPException as StarletteHTTPException

import logging
import time

from app.api import admin, attempts, auth, dashboard, profile, psychologist_attempts, public, tests
from app.config import settings
from app.core.security import hash_password
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.seed_demo import run_seeds

# Import models so Alembic / metadata see them
from app.models import attempt as attempt_m  # noqa: F401
from app.models import test as test_m  # noqa: F401
from app.models import test_link as test_link_m  # noqa: F401
from app.models import user as user_m  # noqa: F401


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        n = db.scalar(select(func.count()).select_from(User))
        if n and n > 0:
            return
        db.add(
            User(
                email="admin@admin.com",
                name="Сидоров Алексей Админович",
                hashed_password=hash_password("admin123"),
                role=UserRole.admin,
                is_active=True,
            )
        )
        db.add(
            User(
                email="psycho@psycho.com",
                name="Иванов Иван Иванович",
                hashed_password=hash_password("psycho123"),
                role=UserRole.psychologist,
                is_active=True,
            )
        )
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed_if_empty()
    db = SessionLocal()
    try:
        run_seeds(db)
    finally:
        db.close()
    yield


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(title="PsyTests API", lifespan=lifespan)


@app.middleware("http")
async def log_requests(request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    dur = time.perf_counter() - start
    logging.getLogger("psytests.access").info(
        "%s %s %s %.3fs",
        request.method,
        request.url.path,
        response.status_code,
        dur,
    )
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_: Request, exc: StarletteHTTPException):
    detail = exc.detail
    msg = detail if isinstance(detail, str) else str(detail)
    return JSONResponse(status_code=exc.status_code, content={"message": msg})


app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(tests.router, prefix="/api")
app.include_router(attempts.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(psychologist_attempts.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/health")
def health():
    return {"ok": True}
