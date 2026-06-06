import asyncio
import json
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.request import AnalyzeRequest
from models.response import AnalyzeResponse, AnalysisListItem, JobResponse
from workflow.graph import run_workflow_stream

router = APIRouter()

# ── 인메모리 저장소 ────────────────────────────────────────────────────────────
# job_id → asyncio.Queue  (SSE 스트리밍용 이벤트 큐)
_job_queues: dict[str, asyncio.Queue] = {}

# job_id → 완료된 분석 결과 (이력 조회용)
_analyses: dict[str, dict] = {}

# 목록 조회용 메타데이터 (순서 보존)
_analysis_meta: list[dict] = []


# ── 분석 시작 ──────────────────────────────────────────────────────────────────
@router.post("/analyze", response_model=JobResponse, status_code=202)
async def analyze(body: AnalyzeRequest):
    """분석 작업을 시작하고 job_id를 즉시 반환한다."""
    sender_role = body.participants[0].role
    receiver_roles = [p.role for p in body.participants[1:]]

    input_data = {
        "input_text": body.text,
        "sender_role": sender_role,
        "receiver_roles": receiver_roles,
        "communication_type": body.communicationType,
        "role_interpretations": [],
    }

    job_id = str(uuid4())
    queue: asyncio.Queue = asyncio.Queue()
    _job_queues[job_id] = queue

    async def _run():
        try:
            # 워크플로우 실행 — 진행 이벤트를 queue에 push하면서 최종 결과 반환
            final_report = await run_workflow_stream(input_data, queue)

            if final_report is None:
                await queue.put({"type": "error", "message": "분석 결과를 생성하지 못했습니다."})
                return

            # 이력 저장
            _analyses[job_id] = final_report
            _analysis_meta.append({
                "id": job_id,
                "summary": final_report.get("summary", ""),
                "keyRequest": final_report.get("keyRequest", ""),
                "senderRole": sender_role,
                "createdAt": datetime.now(timezone.utc).isoformat(),
            })

            await queue.put({"type": "done", "result": final_report})
        except Exception:
            await queue.put({
                "type": "error",
                "message": "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            })
        finally:
            # sentinel: SSE generator가 종료를 감지하도록
            await queue.put(None)

    asyncio.create_task(_run())
    return JobResponse(job_id=job_id)


# ── SSE 스트림 ─────────────────────────────────────────────────────────────────
@router.get("/analyze/{job_id}/stream")
async def analyze_stream(job_id: str):
    """SSE로 분석 진행 상황과 최종 결과를 스트리밍한다."""
    queue = _job_queues.get(job_id)
    if queue is None:
        raise HTTPException(status_code=404, detail="존재하지 않는 job_id입니다.")

    async def event_generator():
        try:
            while True:
                item = await queue.get()
                if item is None:
                    # sentinel: 스트림 종료
                    break
                yield f"data: {json.dumps(item, ensure_ascii=False)}\n\n"
        finally:
            _job_queues.pop(job_id, None)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ── 이력 목록 조회 ─────────────────────────────────────────────────────────────
@router.get("/analyses", response_model=list[AnalysisListItem])
async def list_analyses():
    """완료된 분석 이력 목록을 최신순으로 반환한다."""
    return [
        AnalysisListItem(
            id=m["id"],
            summary=m["summary"],
            keyRequest=m["keyRequest"],
            senderRole=m["senderRole"],
            createdAt=datetime.fromisoformat(m["createdAt"]),
        )
        for m in reversed(_analysis_meta)
    ]


# ── 이력 상세 조회 ─────────────────────────────────────────────────────────────
@router.get("/analyses/{analysis_id}", response_model=AnalyzeResponse)
async def get_analysis(analysis_id: str):
    """특정 분석 결과를 /api/analyze 응답과 동일한 구조로 반환한다."""
    report = _analyses.get(analysis_id)
    if report is None:
        raise HTTPException(status_code=404, detail="존재하지 않는 분석 ID입니다.")
    return report
