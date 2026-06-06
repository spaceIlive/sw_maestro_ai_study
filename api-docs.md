# ContextBridge API 문서

---

## 1. 분석 시작

```http
POST /api/analyze
```

분석 작업을 백그라운드에서 시작하고 `job_id`를 즉시 반환한다.  
진행 상황과 최종 결과는 SSE 스트림(`/api/analyze/{job_id}/stream`)으로 수신한다.

### Request Body

```json
{
  "text": "이번 주 안에 로그인 도메인 쪽 디벨롭 가능할까요? 공수 크면 우선 정책만 반영해도 됩니다.",
  "participants": [
    { "name": "김기획", "role": "기획자" },
    { "name": "김개발", "role": "개발자" }
  ],
  "communicationType": "슬랙 메시지"
}
```

| 필드명 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| text | string | ✅ | 분석할 협업 텍스트 |
| participants | array | ✅ | 참여자 목록. **첫 번째 항목이 발화자**, 나머지는 수신자 |
| communicationType | string | ✅ | 소통 유형 (예: 슬랙 메시지, 회의록, 이메일 등) |

**participants 항목**

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| name | string | 참여자 이름 (서버 내부에서 미사용) |
| role | string | 참여자 직군 (예: 기획자, 개발자, 디자이너, PM) |

### Response `202 Accepted`

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Response

| Status | 조건 | 예시 |
| --- | --- | --- |
| 400 | 텍스트가 너무 짧거나 참여자가 1명 이하 | `{"detail": "분석할 텍스트와 필수 소통 정보를 입력해주세요."}` |

---

## 2. 분석 진행 상황 SSE 스트림

```http
GET /api/analyze/{job_id}/stream
```

`Content-Type: text/event-stream`으로 분석 진행 이벤트와 최종 결과를 스트리밍한다.  
각 **노드가 완료될 때마다** `progress` 이벤트가 전송되고, 모든 노드가 끝나면 `done` 이벤트로 최종 결과가 전송된다.

### SSE 이벤트 형식

#### `progress` — 노드 완료 시

```
data: {"type": "progress", "step": "word_extractor", "label": "핵심 단어 추출 완료"}
```

| 필드 | 설명 |
| --- | --- |
| type | `"progress"` 고정 |
| step | 완료된 노드 이름 (아래 목록 참고) |
| label | 사용자 표시용 한국어 레이블 |

**step 목록 (워크플로우 순서)**

| step | label |
| --- | --- |
| `context_intake` | 문맥 분석 완료 |
| `word_extractor` | 핵심 단어 추출 완료 |
| `role_worker` | 직군별 의미 해석 완료 |
| `risk_term` | 위험 용어 선별 완료 |
| `synthesis` | 위험도 종합 분석 완료 |
| `report` | 최종 보고서 생성 완료 |

> `role_worker`는 직군 수만큼 병렬로 실행되므로 `progress` 이벤트가 여러 번 전송될 수 있다.

#### `done` — 분석 완료 시

```
data: {"type": "done", "result": { ...AnalyzeResponse 구조... }}
```

`result` 필드 구조는 아래 **분석 결과 구조** 섹션 참고.

#### `error` — 오류 발생 시

```
data: {"type": "error", "message": "분석 중 오류가 발생했습니다."}
```

### Error Response

| Status | 조건 |
| --- | --- |
| 404 | 존재하지 않는 `job_id` |

---

## 3. 분석 이력 목록 조회

```http
GET /api/analyses
```

완료된 분석 이력을 최신순으로 반환한다.  
> 인메모리 저장 방식으로, 서버 재시작 시 초기화된다.

### Response `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "summary": "로그인 관련 작업 가능 여부와 우선 반영 범위를 확인하는 메시지입니다.",
    "keyRequest": "이번 주 안에 로그인 관련 작업이 가능한지 확인하는 요청입니다.",
    "senderRole": "기획자",
    "createdAt": "2026-06-06T01:00:00Z"
  }
]
```

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| id | string | 분석 고유 ID |
| summary | string | 입력 내용 요약 |
| keyRequest | string | 핵심 요청 요약 |
| senderRole | string | 발화자 직군 |
| createdAt | string (ISO 8601, UTC) | 분석 완료 시각 |

---

## 4. 분석 이력 상세 조회

```http
GET /api/analyses/{id}
```

특정 분석 결과를 반환한다. SSE `done` 이벤트의 `result`와 동일한 구조.

### Response `200 OK`

아래 **분석 결과 구조** 섹션과 동일.

### Error Response

| Status | 조건 |
| --- | --- |
| 404 | 존재하지 않는 분석 ID |

---

## 분석 결과 구조 (AnalyzeResponse)

`GET /api/analyses/{id}` 응답 및 SSE `done` 이벤트의 `result` 필드에 공통으로 사용되는 구조.

### 예시

```json
{
  "summary": "로그인 관련 작업 가능 여부와 우선 반영 범위를 확인하는 메시지입니다.",
  "keyRequest": "이번 주 안에 로그인 관련 작업이 가능한지 확인하고, 공수가 크면 정책 반영만 우선 진행하려는 요청입니다.",
  "terms": [
    {
      "term": "도메인",
      "context": "로그인 도메인",
      "currentMeaning": "로그인 관련 기능 영역으로 추정됩니다.",
      "plannerView": "로그인 기능 전체를 의미할 수 있습니다.",
      "developerView": "인증 도메인 로직 또는 도메인 모델을 의미할 수 있습니다.",
      "designerView": "로그인 화면 또는 사용자 흐름을 의미할 수 있습니다.",
      "pmView": "로그인 관련 업무 범위를 의미할 수 있습니다.",
      "riskLevel": "높음",
      "riskReason": "도메인의 의미가 다르면 실제 구현 범위와 일정 산정이 달라질 수 있습니다.",
      "confirmationQuestion": "여기서 말한 로그인 도메인은 로그인 기능 전체를 의미하나요, 아니면 백엔드 인증 로직을 의미하나요?"
    }
  ],
  "agreementQuestions": [
    "여기서 말한 로그인 도메인은 로그인 기능 전체를 의미하나요, 아니면 백엔드 인증 로직을 의미하나요?"
  ],
  "checklist": [
    "로그인 작업 범위를 먼저 확정한다."
  ]
}
```

### 필드 설명

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| summary | string | 입력 내용 요약 |
| keyRequest | string | 핵심 요청 또는 합의 내용 |
| terms | array | 오해 가능 용어 분석 목록 |
| agreementQuestions | array | 합의 필요 질문 목록 |
| checklist | array | 업무 시작 전 체크리스트 |

**terms 항목 필드**

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| term | string | 오해 가능 용어 |
| context | string | 해당 용어가 사용된 문맥 |
| currentMeaning | string | 현재 문맥상 가장 가능성 높은 의미 |
| plannerView | string \| null | 기획자 관점 해석 |
| developerView | string \| null | 개발자 관점 해석 |
| designerView | string \| null | 디자이너 관점 해석 |
| pmView | string \| null | PM 관점 해석 |
| riskLevel | string | 오해 위험도 |
| riskReason | string | 위험도 판단 이유 |
| confirmationQuestion | string | 해당 용어에 대한 합의 필요 질문 |

---

## 프론트 화면 매핑

| 화면 영역 | API / 필드 |
| --- | --- |
| 분석 시작 | `POST /api/analyze` → `job_id` 수신 |
| 로딩 진행 표시 | SSE `progress` 이벤트의 `label` |
| 분석 결과 표시 | SSE `done` 이벤트의 `result` |
| 이력 목록 | `GET /api/analyses` |
| 이력 상세 | `GET /api/analyses/{id}` |
