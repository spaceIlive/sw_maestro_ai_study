import json
import httpx
import asyncio

API_URL = "http://localhost:8000/api/analyze"
TEST_CASES_PATH = "tests/test_cases.json"


def check_term_extracted(extracted_terms: list[dict], expected_term: str) -> bool:
    """추출된 용어 목록에 기대 용어가 부분 일치로 포함됐는지 확인"""
    for t in extracted_terms:
        if expected_term in t["term"] or t["term"] in expected_term:
            return True
    return False


async def run_case(client: httpx.AsyncClient, case: dict) -> dict:
    tc_id = case["id"]
    desc = case["description"]
    expected = case["expected"]

    try:
        response = await client.post(API_URL, json=case["input"], timeout=300.0)
        status = response.status_code
        status_ok = status == expected["status"]

        if status == 200:
            data = response.json()
            extracted_terms = data.get("terms", [])
            must_terms = expected.get("must_extract_terms", [])

            term_results = {
                term: check_term_extracted(extracted_terms, term)
                for term in must_terms
            }

            passed = status_ok and all(term_results.values())

            return {
                "id": tc_id,
                "description": desc,
                "passed": passed,
                "status_ok": status_ok,
                "term_results": term_results,
                "actual_terms": [t["term"] for t in extracted_terms],
                "error": None,
            }

        else:
            # 400/500 실패 케이스
            return {
                "id": tc_id,
                "description": desc,
                "passed": status_ok,
                "status_ok": status_ok,
                "term_results": {},
                "actual_terms": [],
                "error": response.json().get("detail") if not status_ok else None,
            }

    except Exception as e:
        return {
            "id": tc_id,
            "description": desc,
            "passed": False,
            "status_ok": False,
            "term_results": {},
            "actual_terms": [],
            "error": str(e),
        }


def print_result(result: dict):
    icon = "✅" if result["passed"] else "❌"
    print(f"\n{icon} [{result['id']}] {result['description']}")
    print(f"   상태 코드: {'✅' if result['status_ok'] else '❌'}")

    if result["term_results"]:
        for term, ok in result["term_results"].items():
            print(f"   {'✅' if ok else '❌'} 필수 용어: {term}")

    if result["actual_terms"]:
        print(f"   추출된 용어: {', '.join(result['actual_terms'])}")

    if result["error"]:
        print(f"   오류: {result['error']}")


async def main():
    with open(TEST_CASES_PATH, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    print("=" * 60)
    print(f"ContextBridge 자동 평가 시작 — 총 {len(test_cases)}개 케이스")
    print("=" * 60)

    async with httpx.AsyncClient() as client:
        results = []
        for case in test_cases:
            print(f"\n  → [{case['id']}] 실행 중...", end="", flush=True)
            result = await run_case(client, case)
            results.append(result)
            print(" 완료")

    print("\n" + "=" * 60)
    print("결과 상세")
    print("=" * 60)
    for result in results:
        print_result(result)

    passed = sum(1 for r in results if r["passed"])
    total = len(results)
    print("\n" + "=" * 60)
    print(f"최종 결과: {passed}/{total} 통과 ({passed/total*100:.0f}%)")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
