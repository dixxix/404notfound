from app.services.formulas import evaluate_formulas


def calculate_attempt_results(questions: list[dict], formulas: list[dict], answers: list[dict], scale_interpretations=None):
    metrics, interpretation = evaluate_formulas(questions, formulas, answers, scale_interpretations)
    return {
        "metrics": metrics or [],
        "interpretation": interpretation,
    }
