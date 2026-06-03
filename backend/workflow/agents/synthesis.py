import json
import os
from langchain_upstage import ChatUpstage
from workflow.state import GraphState
from workflow.utils import call_llm_with_json_retry

_llm = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatUpstage(model="solar-pro3-260323")
    return _llm

def _load_prompt() -> str:
    path = os.path.join(os.path.dirname(__file__), "../../prompts/synthesis.txt")
    with open(os.path.normpath(path), "r", encoding="utf-8") as f:
        return f.read()

def synthesis_node(state: GraphState) -> dict:
    print("[5/6] synthesis 실행 중...")
    prompt = _load_prompt().format(
        input_text=state["input_text"],
        sender_role=state["sender_role"],
        receiver_role=", ".join(state["receiver_roles"]),
        risk_terms=json.dumps(state["risk_terms"], ensure_ascii=False, indent=2),
    )
    result = call_llm_with_json_retry(_get_llm(), prompt)
    print("[5/6] synthesis 완료")
    return {
        "terms_with_risk": result.get("terms", []),
        "agreement_questions": result.get("agreementQuestions", []),
        "checklist": result.get("checklist", []),
    }
