from simpleeval import simple_eval

def _sanitize_id(s: str) -> str:
    return str(s or "").replace("-", "_").replace(".", "_")


def _build_variables(questions: list[dict], answers: list[dict]) -> dict[str, float]:
    by_q = {a["questionId"]: a.get("value") for a in answers}
    vars_: dict[str, float] = {}

    for q in questions:
        qid_raw = q["id"]
        qid = _sanitize_id(qid_raw)
        val = by_q.get(qid)
        qtype = q.get("type", "open")
        options = q.get("options") or []

        if qtype == "single":
            sid = val if isinstance(val, str) else ""
            for o in options:
                oid_raw = o.get("id", "")
                oid = _sanitize_id(oid_raw)
                vars_[f"{qid}_{oid}"] = 1.0 if sid == oid_raw else 0.0
            sel = next((o for o in options if o.get("id") == sid), None)
            w = float(sel.get("weight", 0)) if sel else 0.0
            vars_[f"{qid}_score"] = w
            vars_[f"{qid}_weight"] = w
        elif qtype == "multiple":
            arr = val if isinstance(val, list) else []
            for o in options:
                oid_raw = o.get("id", "")
                oid = _sanitize_id(oid_raw)
                vars_[f"{qid}_{oid}"] = 1.0 if oid_raw in arr else 0.0
            vars_[f"{qid}_score"] = float(len(arr))
            vars_[f"{qid}_weight"] = float(
                sum(o.get("weight", 0) for o in options if o.get("id") in arr)
            )
        elif qtype == "scale":
            n = float(val) if isinstance(val, (int, float)) else float(val or 0)
            vars_[f"{qid}_score"] = n
            vars_[f"{qid}_weight"] = n
        elif qtype == "number":
            try:
                n = float(val) if isinstance(val, (int, float)) else float(str(val or "0").replace(",", "."))
            except (ValueError, TypeError):
                n = 0.0
            vars_[f"{qid}_score"] = n
            vars_[f"{qid}_weight"] = n
        else:
            s = val if isinstance(val, str) else ""
            vars_[f"{qid}_score"] = float(len(s))
            vars_[f"{qid}_weight"] = 0.0

    return vars_


def clamp_pct(n: float) -> int:
    if n != n or n == float("inf") or n == float("-inf"):
        return 0
    return max(0, min(100, int(round(n))))


def _scale_interpretation_text(
    questions: list[dict],
    answers: list[dict],
    scale_interpretations: list[dict] | None,
) -> str | None:
    if not scale_interpretations:
        return None
    by_q = {a["questionId"]: a.get("value") for a in answers if a.get("questionId")}
    lines: list[str] = []
    for block in scale_interpretations:
        qid = block.get("questionId") or block.get("scaleId")
        if not qid:
            continue
        q = next((x for x in questions if x.get("id") == qid), None)
        if not q or q.get("type") not in ("scale", "number"):
            continue
        val = by_q.get(qid)
        try:
            n = float(val) if isinstance(val, (int, float)) else float(str(val or "0").replace(",", "."))
        except (ValueError, TypeError):
            continue
        ranges = block.get("ranges") or []
        for r in ranges:
            lo = float(r.get("min", 0))
            hi = float(r.get("max", 0))
            txt = (r.get("text") or r.get("label") or "").strip()
            if not txt:
                continue
            if lo <= n <= hi:
                lines.append(txt)
                break
    return "\n\n".join(lines) if lines else None


def evaluate_formulas(
    questions: list[dict],
    formulas: list[dict],
    answers: list[dict],
    scale_interpretations: list[dict] | None = None,
) -> tuple[list[dict], str | None]:
    vars_ = _build_variables(questions, answers)
    metrics: list[dict] = []
    interpretation: str | None = None

    for f in formulas or []:
        expr = (f.get("expression") or "").strip()
        name = f.get("name") or "Метрика"
        desc = f.get("description")
        if not expr:
            continue
        try:
            raw = float(simple_eval(expr, names=vars_))
            value = clamp_pct(raw)
            metrics.append({"name": name, "value": value, "raw": raw, "description": desc})
            if desc and not interpretation:
                interpretation = desc
        except Exception:
            metrics.append(
                {"name": name, "value": 0, "raw": 0.0, "description": desc or "Ошибка в формуле"}
            )

    scale_txt = _scale_interpretation_text(questions, answers, scale_interpretations)
    if scale_txt:
        interpretation = f"{interpretation}\n\n{scale_txt}".strip() if interpretation else scale_txt

    return metrics, interpretation
