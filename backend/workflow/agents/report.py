from workflow.state import GraphState


def report_node(state: GraphState) -> dict:
    print("[6/6] report 실행 중...")

    # risk_terms에서 term → {context_snippet, interpretations} 조회
    risk_term_lookup: dict[str, dict] = {
        rt["term"]: rt for rt in state.get("risk_terms", [])
    }

    terms = []
    for t in state.get("terms_with_risk", []):
        if t.get("riskLevel") == "낮음":
            continue
        term_name = t["term"]
        rt = risk_term_lookup.get(term_name, {})
        interpretations = rt.get("interpretations", {})

        terms.append({
            "term": term_name,
            "context": rt.get("context_snippet", ""),
            "currentMeaning": t.get("currentMeaning", ""),
            "plannerView": interpretations.get("기획자"),
            "developerView": interpretations.get("개발자"),
            "designerView": interpretations.get("디자이너"),
            "pmView": interpretations.get("PM"),
            "riskLevel": t.get("riskLevel", "낮음"),
            "riskReason": t.get("riskReason", ""),
            "confirmationQuestion": t.get("confirmationQuestion", ""),
        })

    final_report = {
        "summary": state["summary"],
        "keyRequest": state["key_request"],
        "terms": terms,
        "agreementQuestions": state.get("agreement_questions", []),
        "checklist": state.get("checklist", []),
    }
    print("[6/6] report 완료")
    return {"final_report": final_report}
