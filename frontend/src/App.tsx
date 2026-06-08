import { useState } from "react";
import { AlertTriangle, ArrowDown, Check, Server } from "lucide-react";
import { analyzeText } from "./api/client";
import { AnalyzeForm } from "./components/AnalyzeForm";
import { AnalysisHistory } from "./components/AnalysisHistory";
import { ReportView } from "./components/ReportView";
import { Sidebar } from "./components/Sidebar";
import { WorkflowStatus } from "./components/WorkflowStatus";
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  AnalyzeState,
  AppPage,
  WorkflowProgressEvent,
  WorkflowStep,
} from "./types";

const initialRequest: AnalyzeRequest = {
  text: "",
  senderRole: "",
  receiverRole: "",
  communicationType: "",
};

export default function App() {
  const [request, setRequest] = useState<AnalyzeRequest>(initialRequest);
  const [report, setReport] = useState<AnalyzeResponse | null>(null);
  const [historyReport, setHistoryReport] = useState<AnalyzeResponse | null>(null);
  const [state, setState] = useState<AnalyzeState>("idle");
  const [error, setError] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [activePage, setActivePage] = useState<AppPage>("analyze");
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>([]);
  const [progressLabel, setProgressLabel] = useState("");

  const handleAnalyze = async () => {
    if (
      !request.text.trim() ||
      !request.senderRole ||
      !request.receiverRole ||
      !request.communicationType
    ) {
      setError("분석할 텍스트, 발화자·수신자 직군, 소통 유형을 모두 입력해주세요.");
      setState("error");
      return;
    }

    setState("loading");
    setError("");
    setReport(null);
    setCompletedSteps([]);
    setProgressLabel("분석 작업을 시작하는 중입니다.");

    try {
      const response = await analyzeText(request, handleProgress);
      setReport(response);
      setState("success");
      setProgressLabel("최종 보고서 생성 완료");
      setHistoryRefreshKey((current) => current + 1);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "분석 중 오류가 발생했습니다.");
      setState("error");
    }
  };

  const handleProgress = (event: WorkflowProgressEvent) => {
    setProgressLabel(event.label);
    setCompletedSteps((current) =>
      current.includes(event.step) ? current : [...current, event.step],
    );
  };

  const handleHistorySelect = (selectedReport: AnalyzeResponse) => {
    setHistoryReport(selectedReport);
    setError("");
  };

  const isAnalyzePage = activePage === "analyze";

  return (
    <div className="app-shell min-h-screen text-ink">
      <div className="app-glow app-glow-left" aria-hidden="true" />
      <div className="app-glow app-glow-right" aria-hidden="true" />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        <main className="min-w-0 flex-1 px-4 pb-16 sm:px-6 lg:px-10 xl:px-14">
          <div className="mx-auto max-w-[1440px]">
            <header className="motion-rise flex flex-col gap-7 pb-7 pt-9 md:pt-12 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-4xl">
                <p className="editorial-kicker">
                  {isAnalyzePage ? "협업 문장 살펴보기" : "지난 분석 돌아보기"}
                </p>
                <h1 className="mt-4 max-w-3xl text-balance text-[clamp(2.25rem,4vw,4rem)] font-semibold leading-[1.13] tracking-[-0.04em] text-ink">
                  {isAnalyzePage ? (
                    <>
                      말이 다르게 들리는 순간을
                      <br />
                      <span className="text-action">부드럽게 맞춰보세요.</span>
                    </>
                  ) : (
                    <>
                      지난 분석을
                      <br />
                      다시 이어보세요.
                    </>
                  )}
                </h1>
                <p className="mt-5 max-w-2xl text-[15px] font-medium leading-7 text-muted sm:text-base">
                  {isAnalyzePage
                    ? "같은 단어를 다르게 이해하는 순간을 찾아, 업무를 시작하기 전에 확인할 질문과 기준을 정리합니다."
                    : "완료된 분석의 핵심 맥락과 합의 항목을 다시 열어보고, 필요한 보고서를 바로 내려받을 수 있습니다."}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 xl:mb-1 xl:self-auto">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-30" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
                    System ready
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                    <Server className="h-3.5 w-3.5" strokeWidth={1.8} />
                    API 미설정 시 로컬 샘플로 실행
                  </p>
                </div>
              </div>
            </header>

            {error ? (
              <div className="motion-rise mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3.5 text-sm font-semibold text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                {error}
              </div>
            ) : null}

            {isAnalyzePage ? (
              <>
                <div className="action-hint motion-rise motion-delay-1 mt-3 flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-action text-white shadow-sm">
                      <ArrowDown className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">먼저 아래 3가지를 입력하세요</p>
                      <p className="mt-0.5 text-xs font-medium text-muted">
                        대화 내용 · 참여 직군 · 소통 유형
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-action">
                    <Check className="h-4 w-4" strokeWidth={2.2} />
                    입력 후 파란색 ‘분석 시작’ 버튼을 누르세요
                  </div>
                </div>

                <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
                  <div className="motion-rise motion-delay-1">
                    <AnalyzeForm
                      value={request}
                      isLoading={state === "loading"}
                      onChange={setRequest}
                      onSubmit={handleAnalyze}
                    />
                  </div>
                  <div className="motion-rise motion-delay-2 xl:sticky xl:top-8">
                    <WorkflowStatus
                      state={state}
                      route={report?.route}
                      completedSteps={completedSteps}
                      progressLabel={progressLabel}
                    />
                  </div>
                </div>

                <div className="motion-rise motion-delay-3 mt-8">
                  <ReportView report={report} />
                </div>
              </>
            ) : (
              <div className="mt-8 grid gap-8">
                <div className="motion-rise motion-delay-1">
                  <AnalysisHistory
                    refreshKey={historyRefreshKey}
                    onSelect={handleHistorySelect}
                    onError={setError}
                  />
                </div>
                <div className="motion-rise motion-delay-2">
                  <ReportView
                    report={historyReport}
                    emptyMessage="위의 분석 기록을 선택하면 상세 보고서가 이곳에 이어집니다."
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
