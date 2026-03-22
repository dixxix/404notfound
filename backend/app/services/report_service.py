from jinja2 import Environment, select_autoescape

from app.services.reports import build_report_context, build_report_docx, build_report_html


def generate_professional_report_html(attempt, test, template: str | None):
    ctx = build_report_context(attempt, test)
    return build_report_html("Профессиональный отчет", template, ctx, "professional")


def generate_client_report_html(attempt, test, template: str | None):
    ctx = build_report_context(attempt, test)
    return build_report_html("Отчет для клиента", template, ctx, "client")


def generate_professional_report_docx(attempt, test, template: str | None):
    ctx = build_report_context(attempt, test)
    return build_report_docx("Профессиональный отчет", template, ctx, "professional")


def generate_docx_in_memory(
    attempt,
    test,
    template: str | None,
    title: str = "Профессиональный отчет",
    kind: str = "professional",
) -> bytes:
    """Возвращает DOCX как bytes для корректной отдачи через Response."""
    ctx = build_report_context(attempt, test)
    try:
        payload = build_report_docx(title, template, ctx, "client" if kind == "client" else "professional")
    except Exception:
        # Fallback to default templates if user template is broken.
        payload = build_report_docx(title, None, ctx, "client" if kind == "client" else "professional")
    return payload


def generate_html(
    attempt,
    test,
    template: str | None,
    title: str = "Профессиональный отчет",
    kind: str = "professional",
) -> str:
    """Генерирует HTML отчёт. Всегда возвращает валидную HTML-строку."""
    try:
        ctx = build_report_context(attempt, test)
    except Exception:
        cd = getattr(attempt, "client_data", None) or {}
        ctx = {
            "client_name": str(cd.get("name", "—")),
            "client_age": str(cd.get("age", "") or ""),
            "completion_date": "",
            "completion_datetime": "",
            "test_name": getattr(test, "title", "Тест"),
            "metrics": [],
            "metrics_ascii_bars": "—",
            "recommendations": ["Данные временно недоступны."],
            "psychologist_recommendations": [],
            "answers": [],
            "chart_labels": [],
            "chart_values": [],
            "leading_scale": "",
            "leading_norm": 0,
            "leading_description": "",
            "interpretation": "",
            "session_id": str(getattr(attempt, "id", "")),
            "test_version": "1",
            "metrics_breakdown": [],
        }
    if template and template.strip():
        try:
            env = Environment(autoescape=select_autoescape(["html", "xml"]))
            return env.from_string(template).render(**ctx, title=title)
        except Exception:
            pass
    return build_report_html(title, None, ctx, "client" if kind == "client" else "professional")
