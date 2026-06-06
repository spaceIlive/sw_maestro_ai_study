from langgraph.graph import StateGraph, END
from langgraph.types import Send
from workflow.state import GraphState, WorkerState
from workflow.agents.context_intake import context_intake_node
from workflow.agents.term_extractor import term_extractor_node
from workflow.agents.role_worker import role_worker_node
from workflow.agents.risk_term import risk_term_node
from workflow.agents.synthesis import synthesis_node
from workflow.agents.report import report_node


def check_context_sufficiency(state: GraphState) -> str:
    sufficiency = state.get("context_analysis", {}).get("contextSufficiency", "sufficient")
    if sufficiency == "insufficient":
        return "insufficient"
    return "sufficient"


def raise_insufficient_context(state: GraphState) -> dict:
    notes = state.get("context_analysis", {}).get("contextNotes", "")
    message = "분석할 텍스트의 문맥 정보가 부족합니다."
    if notes:
        message += f" {notes}"
    raise ValueError(message)


def route_after_word_extractor(state: GraphState):
    """
    추출된 단어가 없으면 report로 바로 이동.
    있으면 역할별 워커를 Send로 동적 생성해서 병렬 실행.
    """
    if not state.get("extracted_words"):
        return "report"

    roles = list({state["sender_role"]} | set(state["receiver_roles"]))
    return [
        Send(
            "role_worker",
            WorkerState(
                role=role,
                extracted_words=state["extracted_words"],
                input_text=state["input_text"],
                sender_role=state["sender_role"],
                receiver_roles=state["receiver_roles"],
            ),
        )
        for role in roles
    ]


def route_after_risk_term(state: GraphState) -> str:
    """위험 용어가 없으면 report로 바로 이동, 있으면 synthesis로."""
    if not state.get("risk_terms"):
        return "report"
    return "synthesis"


def build_graph():
    graph = StateGraph(GraphState)

    graph.add_node("context_intake", context_intake_node)
    graph.add_node("insufficient_context", raise_insufficient_context)
    graph.add_node("word_extractor", term_extractor_node)
    graph.add_node("role_worker", role_worker_node)
    graph.add_node("risk_term", risk_term_node)
    graph.add_node("synthesis", synthesis_node)
    graph.add_node("report", report_node)

    graph.set_entry_point("context_intake")

    graph.add_conditional_edges(
        "context_intake",
        check_context_sufficiency,
        {
            "insufficient": "insufficient_context",
            "sufficient": "word_extractor",
        },
    )

    graph.add_conditional_edges("word_extractor", route_after_word_extractor)

    graph.add_edge("role_worker", "risk_term")

    graph.add_conditional_edges(
        "risk_term",
        route_after_risk_term,
        {
            "synthesis": "synthesis",
            "report": "report",
        },
    )

    graph.add_edge("synthesis", "report")
    graph.add_edge("report", END)

    return graph.compile()


workflow = build_graph()

# 노드 이름 → 사용자 표시용 한국어 레이블
NODE_LABELS: dict[str, str] = {
    "context_intake":       "문맥 분석 완료",
    "word_extractor":       "핵심 단어 추출 완료",
    "role_worker":          "직군별 의미 해석 완료",
    "risk_term":            "위험 용어 선별 완료",
    "synthesis":            "위험도 종합 분석 완료",
    "report":               "최종 보고서 생성 완료",
    "insufficient_context": "문맥 부족 감지됨",
}

WORKFLOW_STEPS = [
    "context_intake",
    "word_extractor",
    "role_worker",
    "risk_term",
    "synthesis",
    "report",
]


async def run_workflow_stream(input_data: dict, queue: "asyncio.Queue") -> dict | None:
    """
    astream(stream_mode="updates")으로 워크플로우를 실행한다.
    노드가 완료될 때마다 progress 이벤트를 queue에 push하고,
    최종 결과(final_report)를 반환한다.
    """
    import asyncio

    final_report: dict | None = None

    try:
        async for chunk in workflow.astream(input_data, stream_mode="updates"):
            # chunk = { "node_name": { ...해당 노드가 업데이트한 state 필드들... } }
            for node_name, node_output in chunk.items():
                if node_name in NODE_LABELS:
                    await queue.put({
                        "type": "progress",
                        "step": node_name,
                        "label": NODE_LABELS[node_name],
                    })
                if node_name == "report":
                    final_report = node_output.get("final_report")

    except ValueError as e:
        await queue.put({"type": "error", "message": str(e)})
    except Exception:
        await queue.put({
            "type": "error",
            "message": "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        })

    return final_report
