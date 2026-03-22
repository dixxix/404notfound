"""Демо-тесты и публичные ссылки (синхрон с lib/demo-public-tests.ts)."""

import copy
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.demo_content import (
    DEMO_TEAM_TITLE,
    DEMO_TEAM_TOKEN,
    MOTIVATION_CONFIG,
    MOTIVATION_TITLE,
    MOTIVATION_TOKEN,
    PROF_CONFIG,
    TEAM_CONFIG,
)
from app.models.test import Test
from app.models.test_link import TestLink
from app.models.user import User

DEMO_LINK_TOKEN_PRIMARY = "demo"
DEMO_LINK_TOKEN_ALT = "demo-proforientation"
DEMO_TEST_TITLE = "Определение типа профессии (пример)"


def _prof_test_for_psycho(db: Session, psycho_id: uuid.UUID) -> Test:
    """Находит или создаёт основной демо-тест профориентации."""
    alt_link = db.scalars(select(TestLink).where(TestLink.token == DEMO_LINK_TOKEN_ALT)).first()
    if alt_link:
        t = db.get(Test, alt_link.test_id)
        if t and t.owner_id == psycho_id:
            if t.title != DEMO_TEST_TITLE or (t.config or {}).get("demoVersion") != PROF_CONFIG.get("demoVersion"):
                t.title = DEMO_TEST_TITLE
                t.description = (
                    "Разнообразный демо-тест: одиночный и множественный выбор, шкалы, числа и открытые ответы."
                )
                t.instruction = (
                    "Отвечайте так, как есть сейчас — нет «правильных» ответов. "
                    "Можно вернуться к предыдущему вопросу. Ответы сохраняются автоматически."
                )
                t.config = copy.deepcopy(PROF_CONFIG)
            return t

    t = db.scalars(
        select(Test).where(Test.owner_id == psycho_id, Test.title == DEMO_TEST_TITLE)
    ).first()
    if t:
        if (t.config or {}).get("demoVersion") != PROF_CONFIG.get("demoVersion"):
            t.config = copy.deepcopy(PROF_CONFIG)
        return t

    t = Test(
        id=uuid.uuid4(),
        owner_id=psycho_id,
        title=DEMO_TEST_TITLE,
        public_slug="demo-prof",
        show_results_immediately=False,
        description=(
            "Разнообразный демо-тест: одиночный и множественный выбор, шкалы, числа и открытые ответы."
        ),
        instruction=(
            "Отвечайте так, как есть сейчас — нет «правильных» ответов. "
            "Можно вернуться к предыдущему вопросу. Ответы сохраняются автоматически."
        ),
        config=copy.deepcopy(PROF_CONFIG),
    )
    db.add(t)
    db.flush()
    return t


def _ensure_link(db: Session, token: str, test_id: uuid.UUID) -> None:
    row = db.scalars(select(TestLink).where(TestLink.token == token)).first()
    if row:
        if row.test_id != test_id:
            row.test_id = test_id
        return
    db.add(TestLink(id=uuid.uuid4(), test_id=test_id, token=token))


def seed_demo_content(db: Session) -> None:
    psycho = db.scalars(select(User).where(User.email == "psycho@psycho.com")).first()
    if not psycho:
        return

    prof = _prof_test_for_psycho(db, psycho.id)
    _ensure_link(db, DEMO_LINK_TOKEN_PRIMARY, prof.id)
    _ensure_link(db, DEMO_LINK_TOKEN_ALT, prof.id)

    if not db.scalars(select(TestLink).where(TestLink.token == DEMO_TEAM_TOKEN)).first():
        tt = Test(
            id=uuid.uuid4(),
            owner_id=psycho.id,
            title=DEMO_TEAM_TITLE,
            public_slug="demo-team",
            show_results_immediately=False,
            description=(
                "Короткий пример: шкалы, число, открытый вопрос — другой сценарий, чем профориентация."
            ),
            instruction="Займёт около 3–5 минут. Заполните все обязательные вопросы перед завершением.",
            config=copy.deepcopy(TEAM_CONFIG),
        )
        db.add(tt)
        db.flush()
        db.add(TestLink(id=uuid.uuid4(), test_id=tt.id, token=DEMO_TEAM_TOKEN))

    if not db.scalars(select(TestLink).where(TestLink.token == MOTIVATION_TOKEN)).first():
        tm = Test(
            id=uuid.uuid4(),
            owner_id=psycho.id,
            title=MOTIVATION_TITLE,
            public_slug="demo-motivation",
            show_results_immediately=False,
            description=(
                "Краткая методика из 5 вопросов для оценки внутренней и внешней мотивации к обучению."
            ),
            instruction="Отвечайте искренне — нет правильных или неправильных ответов. Вопросы займут около 3 минут.",
            config=copy.deepcopy(MOTIVATION_CONFIG),
        )
        db.add(tm)
        db.flush()
        db.add(TestLink(id=uuid.uuid4(), test_id=tm.id, token=MOTIVATION_TOKEN))

    db.commit()


def run_seeds(db: Session) -> None:
    n_users = db.scalar(select(func.count()).select_from(User)) or 0
    if n_users == 0:
        return
    seed_demo_content(db)
