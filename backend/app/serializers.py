from app.models.attempt import Attempt
from app.models.test import Test
from app.models.user import User
from app.services.metrics_service import extract_metrics_list


def user_public(u: User) -> dict:
    return {
        "id": str(u.id),
        "email": u.email,
        "name": u.name,
        "avatar": getattr(u, "avatar", None),
        "role": u.role.value,
        "createdAt": u.created_at.isoformat() if u.created_at else "",
    }


def test_config_defaults() -> dict:
    return {
        "questions": [],
        "formulas": [],
        "requiresPersonalData": True,
        "showClientReport": True,
        "clientReportTemplate": None,
        "professionalReportTemplate": None,
        "clientReportHtmlTemplate": None,
        "professionalReportHtmlTemplate": None,
    }


def merge_config(raw: dict | None) -> dict:
    base = test_config_defaults()
    if raw:
        base.update({k: v for k, v in raw.items() if v is not None})
    return base


def test_out(t: Test, attempts_count: int = 0) -> dict:
    c = merge_config(t.config)
    return {
        "id": str(t.id),
        "title": t.title,
        "description": t.description or "",
        "instruction": t.instruction or "",
        "metrics": extract_metrics_list(t.metrics),
        "publicSlug": t.public_slug,
        "showResultsImmediately": bool(getattr(t, "show_results_immediately", False)),
        "questions": c.get("questions", []),
        "formulas": c.get("formulas", []),
        "clientReportTemplate": c.get("clientReportTemplate"),
        "professionalReportTemplate": c.get("professionalReportTemplate"),
        "clientReportHtmlTemplate": c.get("clientReportHtmlTemplate"),
        "professionalReportHtmlTemplate": c.get("professionalReportHtmlTemplate"),
        "scaleInterpretations": c.get("scaleInterpretations"),
        "showClientReport": c.get("showClientReport", True),
        "requiresPersonalData": c.get("requiresPersonalData", True),
        "createdAt": t.created_at.isoformat() if t.created_at else "",
        "updatedAt": t.updated_at.isoformat() if t.updated_at else "",
        "attemptsCount": attempts_count,
    }


def attempt_out(a: Attempt, test_title: str, include_answers: bool = True, include_metrics: bool = True) -> dict:
    cd = a.client_data or {}
    out: dict = {
        "id": str(a.id),
        "testId": str(a.test_id),
        "testTitle": test_title,
        "clientName": cd.get("name", "Гость"),
        "clientEmail": cd.get("email"),
        "clientAge": cd.get("age"),
        "status": "completed" if a.status == "completed" else "in_progress",
        "startedAt": a.started_at.isoformat() if a.started_at else "",
        "completedAt": a.completed_at.isoformat() if a.completed_at else None,
        "reportGeneratedAt": a.report_generated_at.isoformat() if a.report_generated_at else None,
        "reportSentAt": a.report_sent_at.isoformat() if a.report_sent_at else None,
        "answers": a.answers if include_answers else [],
    }
    if include_metrics:
        out["metrics"] = a.metrics or []
    if a.results is not None:
        out["results"] = a.results
    qs = a.question_snapshot
    if qs:
        out["questions"] = qs
    return out


def psychologist_out(u: User, tests_count: int) -> dict:
    return {
        "id": str(u.id),
        "email": u.email,
        "name": u.name,
        "isBlocked": not u.is_active,
        "accessExpiresAt": u.access_expires_at.isoformat() if getattr(u, "access_expires_at", None) else None,
        "blockedAt": u.blocked_at.isoformat() if getattr(u, "blocked_at", None) else None,
        "blockedReason": getattr(u, "blocked_reason", None),
        "createdAt": u.created_at.isoformat() if u.created_at else "",
        "testsCount": tests_count,
    }


def public_test_out(t: Test) -> dict:
    c = merge_config(t.config)
    return {
        "id": str(t.id),
        "title": t.title,
        "slug": t.public_slug,
        "description": t.description or "",
        "instruction": t.instruction or "",
        "questions": c.get("questions", []),
        "requiresPersonalData": c.get("requiresPersonalData", True),
    }
