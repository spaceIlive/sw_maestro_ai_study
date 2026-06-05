import { useMemo, useState } from "react";
import { AlertTriangle, Database, Server } from "lucide-react";
import { analyzeText } from "./api/client";
import { AnalyzeForm } from "./components/AnalyzeForm";
import { ReportView } from "./components/ReportView";
import { Sidebar } from "./components/Sidebar";
import { WorkflowStatus } from "./components/WorkflowStatus";
import { testCases } from "./data/testCases";
import type { AnalyzeRequest, AnalyzeResponse, AnalyzeState, TestCase } from "./types";

const initialCase = testCases[0];

export default function App() {
  const [request, setRequest] = useState<AnalyzeRequest>(initialCase.request);
  const [report, setReport] = useState<AnalyzeResponse | null>(initialCase.response);
  const [state, setState] = useState<AnalyzeState>("success");
  const [error, setError] = useState("");

  const selectedCase = useMemo(
    () => testCases.find((item) => item.request.text === request.text) ?? initialCase,
    [request.text],
  );

  const handleSelectCase = (testCase: TestCase) => {
    setRequest(testCase.request);
    setReport(testCase.response);
    setState("success");
    setError("");
  };

  const handleAnalyze = async () => {
    if (!request.text.trim() || !request.communicationType) {
      setError("분석할 텍스트와 소통 유형을 입력해주세요.");
      setState("error");
      return;
    }

    setState("loading");
    setError("");

    try {
      const response = await analyzeText(request);
      setReport(response);
      setState("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석 중 오류가 발생했습니다.");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-ink">
      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-8 py-7">
          <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-brand">ContextBridge MVP</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
                협업 텍스트 오해 가능 용어 분석
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                MVP 범위를 POST /api/analyze 하나로 맞춘 React 프론트엔드입니다. 실제
                백엔드 base URL이 없으면 테스트케이스 mock으로 데모합니다.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white px-4 py-3 text-right shadow-sm">
              <p className="inline-flex items-center gap-1.5 text-xs font-bold text-muted">
                <Database className="h-3.5 w-3.5" />
                현재 시나리오
              </p>
              <p className="mt-1 text-sm font-black text-ink">
                {selectedCase.id} · {selectedCase.scenarioName}
              </p>
            </div>
          </header>

          {error ? (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          ) : null}

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-xs font-black text-muted">
            <Server className="h-4 w-4 text-brand" />
            VITE_API_BASE_URL 미설정 시 mock mode로 동작
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.7fr)]">
            <AnalyzeForm
              value={request}
              testCases={testCases}
              isLoading={state === "loading"}
              onChange={setRequest}
              onSubmit={handleAnalyze}
              onSelectCase={handleSelectCase}
            />
            <WorkflowStatus state={state} route={report?.route ?? selectedCase.route} />
          </div>

          <div className="mt-6">
            <ReportView report={report} />
          </div>
        </main>
      </div>
    </div>
  );
}
