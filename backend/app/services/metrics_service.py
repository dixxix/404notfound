from __future__ import annotations

from typing import Any


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _answers_map(answers: list[dict[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for answer in answers or []:
        qid = answer.get("questionId")
        if qid is None:
            continue
        out[str(qid)] = answer.get("value")
    return out


def get_metric_details(metric: dict[str, Any], answers: list[dict[str, Any]]) -> dict[str, Any]:
    by_question = _answers_map(answers)
    details: list[dict[str, Any]] = []
    total = 0.0
    for rule in metric.get("rules") or []:
        question_id = str(rule.get("question_id") or "")
        if not question_id:
            continue
        answer_value = by_question.get(question_id)
        delta = 0.0
        rule_type = str(rule.get("type") or "choice")
        if rule_type == "scale":
            multiplier = _to_float(rule.get("multiplier"), 0.0)
            delta = _to_float(answer_value, 0.0) * multiplier
        else:
            scores = rule.get("scores") or {}
            if isinstance(answer_value, list):
                delta = sum(_to_float(scores.get(str(item), 0.0), 0.0) for item in answer_value)
            elif answer_value is not None:
                delta = _to_float(scores.get(str(answer_value), 0.0), 0.0)
        total += delta
        details.append(
            {
                "questionId": question_id,
                "type": rule_type,
                "answer": answer_value,
                "score": round(delta, 2),
            }
        )
    return {"total": round(total, 2), "details": details}


def calculate_metrics(metrics: list[dict[str, Any]], answers: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for metric in metrics or []:
        computed = get_metric_details(metric, answers)
        out.append(
            {
                "id": str(metric.get("id") or ""),
                "name": str(metric.get("name") or "Метрика"),
                "description": str(metric.get("description") or ""),
                "value": computed["total"],
                "details": computed["details"],
            }
        )
    return out


def calculate_all(metrics: list[dict[str, Any]], answers: list[dict[str, Any]]) -> list[dict[str, Any]]:
    # Backward compatibility for older callers.
    return calculate_metrics(metrics, answers)


def extract_metrics_list(raw_metrics: Any) -> list[dict[str, Any]]:
    if isinstance(raw_metrics, dict):
        metrics = raw_metrics.get("metrics")
        return metrics if isinstance(metrics, list) else []
    if isinstance(raw_metrics, list):
        return raw_metrics
    return []


def wrap_metrics(metrics: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "metrics": metrics or [],
    }
