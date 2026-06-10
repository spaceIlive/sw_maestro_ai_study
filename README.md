# ContextBridge (SyncLab 프로젝트)

**👩‍💻 프로젝트 참여자:** 김인성, 김정현, 윤관, 임정훈, 정지원

ContextBridge는 협업 과정에서 발생하는 '용어 해석 차이' 문제를 해결하기 위해, 입력된 소통 문맥을 통찰력 있게 분석하고 오해 가능성 있는 용어 및 합의 사항을 찾아내는 **Agentic Workflow 기반 소통 보조 솔루션**입니다.

## 1. 프로젝트 개요

IT 협업(기획자, 개발자, 디자이너, PM 등) 과정에서는 '도메인', '정책', '공수', '디벨롭' 등의 단어가 직군마다 다르게 해석되어 재작업이나 소통 오류가 빈번히 발생합니다. ContextBridge는 단순 내용 요약을 넘어 **문맥 상 어떤 단어가 다르게 이해될 수 있는지 짚어내고, 업무 시작 전 합의해야 할 질문을 제공**하여 효율적이고 오해 없는 협업을 돕습니다.

- **대상 타깃:** 주니어 기획자, 개발자, PM, 디자이너 및 신규 입사자 등
- **핵심 가치:** 업무 착수 전 해석 차이를 극복하기 위한 오해 가능 용어 추출 및 확인 질문 자동 생성

---

## 2. 프로젝트 아키텍처 및 폴더 구조

본 프로젝트는 **FastAPI + LangGraph** 기반의 백엔드와 **React + Vite** 기반의 프론트엔드로 나뉘어 있습니다.

```text
sw_maestro_ai_study/
├── backend/                # 백엔드 및 Agentic Workflow 서비스
│   ├── main.py             # FastAPI 엔트리 포인트
│   ├── workflow/           # LangGraph 기반 Agent Workflow 정의 (graph.py, agents 등)
│   ├── prompts/            # 각 Agent 단계별 프롬프트 정의
│   └── tests/              # 평가 및 테스트 스크립트
│
├── frontend/               # 프론트엔드 서비스 (React, TypeScript, Tailwind CSS)
│   ├── src/                # UI 컴포넌트 및 API 통신 (MSW 통합)
│   ├── public/             # Mock Service Worker, 정적 파일
│   └── package.json        # 프론트엔드 의존성
│
└── api-docs.md             # API 명세 문서
```

### 기술 스택

- **Backend:** FastAPI, Python, LangGraph, LangChain (Upstage AI 적용)
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, MSW (Mocking)

---

## 3. 핵심 Agent Workflow (LangGraph)

ContextBridge 백엔드의 에이전트들은 사용자가 제공한 텍스트를 단계별로 심층 분석합니다.

1. **Context Intake Agent (`context_intake.py`):** 입력 문맥(슬랙, 회의록 등) 및 발화자/수신자 의도, 목적 파악
2. **Ambiguous Term Detector Agent (`term_extractor.py`):** 해석 차이를 유발할 수 있는 모호한 용어 탐지
3. **Role Perspective Agent (`role_worker.py`):** 기획, 개발, 디자인, PM 등 각 직군별 용어 해석 차이 도출
4. **Meaning Disambiguation Agent (`synthesis.py`):** 현재 문맥상 가장 가능성 높은 의미 추론
5. **Miscommunication Risk Agent (`risk_term.py`):** 용어별 오해 시 발생 위험도(일정, 범위 등) 판단
6. **Consensus Report Agent (`report.py`):** 업무 시작 전 체크리스트와 확인 질문이 포함된 최종 결과 보고서 조립

---

## 4. 로컬 환경 실행 방법

### 4.1 Backend

백엔드 실행 전 환경변수 세팅이 필요합니다.

```bash
cd backend

# 1. 패키지 설치
pip install -r requirements.txt

# 2. 환경변수 설정
# .env.example 등을 참고하거나 직접 .env 파일을 생성합니다.
# UPSTAGE_API_KEY=발급받은_키_입력
# LANGSMITH_API_KEY=선택사항

# 3. 로컬 서버 실행
uvicorn main:app --reload
```

- API 서버: `http://localhost:8000`

### 4.2 Frontend

프론트엔드는 MSW가 탑재되어 있어 백엔드 서버 없이도 자체 동작을 테스트할 수 있도록 설계되어 있습니다.

```bash
cd frontend

# 1. 패키지 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

- 클라이언트: `http://localhost:5173`

> **Note:** `.env` 파일에 `VITE_API_BASE_URL`를 설정하면 MSW를 건너뛰고 백엔드 개발 서버(`http://localhost:8000`)의 포트를 직접 호출합니다. 비워둘 경우 내장된 MSW 모의 API를 통해 데이터 처리 결과 및 SSE(Server-Sent Events) 스트리밍 과정을 확인할 수 있습니다.

### 4.3 Docker Compose

루트에서 백엔드와 프론트엔드를 함께 실행할 수 있습니다.

```bash
# backend/.env에 UPSTAGE_API_KEY를 먼저 설정합니다.
docker compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

Compose 실행 시 프론트엔드는 `VITE_API_BASE_URL=http://localhost:8000`,
`VITE_ENABLE_MSW=false`로 동작하여 실제 백엔드 SSE API를 호출합니다.

---

## 5. 주요 기능

- **협업 문맥 분석 폼:** 직군, 소통 유형 선택 기능 및 입력 텍스트 전송
- **실시간 워크플로우 진행:** SSE(Server-Sent Events) 스트림을 통해 에이전트들의 단계별 분석 과정을 UI에 반영
- **최종 합의 보고서 도출:** 용어별 직군 해석 차이, 오해 위험도 표시, 그리고 팀에 즉시 공유할 수 있는 합의 질문 제안기능
- **분석 이력 보관 및 출력:** 이전 결과 조회 및 PDF/DOCX 형태의 레포트 내보내기
