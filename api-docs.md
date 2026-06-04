# ContextBridge API 문서

## 1. 협업 텍스트 분석 API

### Method

```http
POST
```

### URL

```http
/api/analyze
```

### 설명

사용자가 입력한 협업 텍스트와 소통 상황 정보를 서버로 전달하면, 서버는 Agent Workflow를 실행하여 오해 가능 용어, 직군별 해석 차이, 위험도, 합의 질문, 체크리스트를 포함한 보고서형 결과를 반환한다.

---

## 요청 Body

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

---

## 요청 필드 설명

| 필드명               | 타입     | 필수 여부 | 설명                                           |
| ----------------- | ------ | ----- | -------------------------------------------- |
| text              | string | 필수    | 분석할 협업 텍스트                                   |
| participants      | array  | 필수    | 참여자 목록. 첫 번째 항목이 발화자, 나머지는 수신자로 처리됨          |
| communicationType | string | 필수    | 입력 텍스트의 소통 유형                                |

### participants 항목 필드

| 필드명  | 타입     | 필수 여부 | 설명              |
| ---- | ------ | ----- | --------------- |
| name | string | 필수    | 참여자 이름 (내부에서 미사용) |
| role | string | 필수    | 참여자 직군          |

---

## 입력값 예시

### role 예시

```text
기획자
개발자
디자이너
PM
```

### communicationType 예시

```text
슬랙 메시지
회의록
기획서 일부
이메일
Jira 이슈
GitHub PR 설명
업무 요청 문장
```

---

## 성공 응답

### Status Code

```http
200 OK
```

### Response Body

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
    },
    {
      "term": "정책 반영",
      "context": "우선 정책만 반영",
      "currentMeaning": "로그인 관련 정책을 우선 적용하자는 의미로 추정됩니다.",
      "plannerView": "기획 문서에 정의된 정책을 반영하는 것으로 이해할 수 있습니다.",
      "developerView": "권한, 예외 처리, 상태값 등의 실제 로직 구현으로 이해할 수 있습니다.",
      "designerView": "정책에 맞는 화면 상태나 문구를 반영하는 것으로 이해할 수 있습니다.",
      "pmView": "전체 구현 전에 우선 처리할 최소 작업 범위로 이해할 수 있습니다.",
      "riskLevel": "높음",
      "riskReason": "문서 수정인지 실제 기능 구현인지에 따라 작업 결과물이 달라질 수 있습니다.",
      "confirmationQuestion": "정책 반영은 기획 문서 수정인가요, 아니면 실제 권한/상태 로직 구현까지 포함하나요?"
    }
  ],
  "agreementQuestions": [
    "여기서 말한 로그인 도메인은 로그인 기능 전체를 의미하나요, 아니면 백엔드 인증 로직을 의미하나요?",
    "정책 반영은 기획 문서 수정인가요, 아니면 실제 권한/상태 로직 구현까지 포함하나요?",
    "공수는 개발 시간만 의미하나요, 아니면 기획·디자인·QA를 포함한 전체 작업량을 의미하나요?"
  ],
  "checklist": [
    "로그인 작업 범위를 먼저 확정한다.",
    "정책 반영의 기준이 문서인지 실제 구현인지 확인한다.",
    "공수 산정 범위에 포함되는 역할을 확인한다.",
    "이번 주 안에 완료해야 하는 최소 결과물을 합의한다."
  ]
}
```

---

## 응답 필드 설명

| 필드명                | 타입     | 설명             |
| ------------------ | ------ | -------------- |
| summary            | string | 입력 내용 요약       |
| keyRequest         | string | 핵심 요청 또는 합의 내용 |
| terms              | array  | 오해 가능 용어 분석 목록 |
| agreementQuestions | array  | 합의 필요 질문 목록    |
| checklist          | array  | 업무 시작 전 체크리스트  |

---

## terms 필드 설명

| 필드명                  | 타입     | 설명                    |
| -------------------- | ------ | --------------------- |
| term                 | string | 오해 가능 용어              |
| context              | string | 해당 용어가 사용된 문맥         |
| currentMeaning       | string | 현재 문맥상 가장 가능성 높은 의미   |
| plannerView          | string | 기획자 관점 해석             |
| developerView        | string | 개발자 관점 해석             |
| designerView         | string | 디자이너 관점 해석            |
| pmView               | string | PM 관점 해석              |
| riskLevel            | string | 오해 위험도                |
| riskReason           | string | 위험도 판단 이유             |
| confirmationQuestion | string | 해당 용어에 대한 합의 필요 질문    |

---

## 실패 응답

### 400 Bad Request

입력 텍스트가 너무 짧거나 필수값이 누락된 경우

```json
{
  "message": "분석할 텍스트와 필수 소통 정보를 입력해주세요."
}
```

### 500 Internal Server Error

서버 내부 또는 Agent 분석 중 오류가 발생한 경우

```json
{
  "message": "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
}
```

---

## 프론트 화면 매핑

| 화면 영역           | 응답 필드              |
| --------------- | ------------------ |
| 입력 내용 요약        | summary            |
| 핵심 요청 / 합의 내용   | keyRequest         |
| 오해 가능 용어 분석 표   | terms              |
| 합의 필요 질문        | agreementQuestions |
| 업무 시작 전 체크리스트   | checklist          |
