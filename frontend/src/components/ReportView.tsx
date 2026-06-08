import type { ReactNode } from "react";
import { Download, FileText, Printer } from "lucide-react";
import { useState } from "react";
import type { AnalyzeResponse } from "../types";
import { riskClass, routeLabel } from "../utils";

type ReportViewProps = {
  report: AnalyzeResponse | null;
  emptyMessage?: string;
};

export function ReportView({
  report,
  emptyMessage = "분석이 끝나면 합의 질문과 체크리스트가 이곳에 정리됩니다.",
}: ReportViewProps) {
  const [isDocxExporting, setIsDocxExporting] = useState(false);

  if (!report) {
    return (
      <section id="main-report" className="empty-report overflow-hidden border border-line/80 bg-white/75">
        <div className="grid min-h-64 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between border-b border-[#dfe1fa] bg-gradient-to-br from-action-soft to-[#f9edff] p-6 lg:border-b-0 lg:border-r sm:p-8">
            <p className="editorial-kicker">결과 미리보기</p>
            <span className="mt-12 font-mono text-6xl font-medium tracking-[-0.08em] text-[#c8caee]">
              00
            </span>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
            <p className="max-w-xl text-balance text-2xl font-semibold leading-snug tracking-[-0.025em] text-ink sm:text-3xl">
              {emptyMessage}
            </p>
            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {["핵심 용어", "합의 질문", "착수 체크"].map((label, index) => (
                <div key={label} className="rounded-2xl bg-[#f6f7ff] p-3">
                  <span className="font-mono text-[10px] text-action">0{index + 1}</span>
                  <p className="mt-1 text-xs font-semibold text-ink">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const handleDocxDownload = async () => {
    setIsDocxExporting(true);
    try {
      const { downloadReportDocx } = await import("../export/reportExport");
      await downloadReportDocx(report);
    } finally {
      setIsDocxExporting(false);
    }
  };

  return (
    <section id="main-report" className="print-report report-paper border border-line/80 bg-white">
      <div className="grid border-b border-line lg:grid-cols-[1fr_auto]">
        <div className="bg-gradient-to-br from-white to-[#faf9ff] p-6 sm:p-9 lg:p-11">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#fff0ed] px-3 py-2 text-[11px] font-semibold text-brand">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
            ContextBridge 분석 리포트
          </p>
          <h2 className="mt-5 max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
            협업 문맥 오해 가능성 분석
          </h2>
          <p className="mt-4 text-sm font-medium text-muted">
            분석 경로 · <span className="text-ink">{routeLabel(report.route)}</span>
          </p>
        </div>

        <div className="flex flex-col justify-between border-t border-line bg-[#f5f6ff] p-6 lg:min-w-[320px] lg:border-l lg:border-t-0 sm:p-8">
          <div className="print-hidden flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-action/25 bg-white px-3 py-2.5 text-xs font-semibold text-action transition-all duration-300 hover:border-action hover:bg-action-soft active:scale-[0.98]"
              title="보고서 영역만 인쇄하거나 PDF로 저장합니다."
            >
              <Printer className="h-4 w-4" strokeWidth={1.8} />
              PDF 저장
            </button>
            <button
              type="button"
              onClick={handleDocxDownload}
              disabled={isDocxExporting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-action px-3 py-2.5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(98,105,217,0.2)] transition-all duration-300 hover:bg-action-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              title="보고서를 Word 문서로 다운로드합니다."
            >
              <Download className="h-4 w-4" strokeWidth={1.8} />
              {isDocxExporting ? "생성 중" : "DOCX"}
            </button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-2 lg:mt-12">
            <Metric label="용어" value={report.terms.length} />
            <Metric label="질문" value={report.agreementQuestions.length} />
            <Metric label="체크" value={report.checklist.length} />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-9 lg:p-11">
        <div className="grid gap-4 lg:grid-cols-2">
          <ReportSection number="01" title="입력 내용 요약">
            <p>{report.summary}</p>
          </ReportSection>
          <ReportSection number="02" title="핵심 요청과 합의 내용">
            <p>{report.keyRequest}</p>
          </ReportSection>
        </div>

        {report.terms.length > 0 ? (
          <ReportSection number="03" title="오해 가능 용어 분석" spacious>
            <div className="overflow-x-auto rounded-3xl border border-line">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-[#686fce] text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85">
                  <tr>
                    <th className="p-4 font-semibold">용어</th>
                    <th className="p-4 font-semibold">문맥 / 현재 의미</th>
                    <th className="p-4 font-semibold">직군별 해석</th>
                    <th className="p-4 font-semibold">위험도 / 확인 질문</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {report.terms.map((term, index) => (
                    <tr
                      key={`${term.term}-${term.context}`}
                      className="align-top transition-colors hover:bg-[#f8f8ff]"
                    >
                      <td className="w-36 p-4">
                        <span className="font-mono text-[10px] text-action">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="mt-2 text-base font-semibold text-ink">{term.term}</p>
                      </td>
                      <td className="p-4 text-muted">
                        <p className="font-semibold text-ink">{term.context}</p>
                        <p className="mt-2 leading-6">{term.currentMeaning}</p>
                        <p className="mt-4 rounded-2xl bg-amber-50/80 px-3 py-2.5 text-xs font-medium leading-5 text-ink">
                          {term.riskReason}
                        </p>
                      </td>
                      <td className="p-4 text-xs leading-6 text-muted">
                        <RoleView role="기획" value={term.plannerView} />
                        <RoleView role="개발" value={term.developerView} />
                        <RoleView role="디자인" value={term.designerView} />
                        <RoleView role="PM" value={term.pmView} />
                      </td>
                      <td className="w-56 p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-[10px] font-semibold ring-1 ${riskClass(
                            term.riskLevel,
                          )}`}
                        >
                          위험도 {term.riskLevel}
                        </span>
                        <p className="mt-4 text-xs font-semibold leading-5 text-ink">
                          {term.confirmationQuestion}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportSection>
        ) : (
          <ReportSection number="03" title="추가 문맥이 필요합니다" spacious>
            <p className="max-w-2xl text-muted">
              현재 입력만으로는 용어의 실제 의미를 확정하기 어렵습니다. 아래 질문에 답한 뒤 다시
              분석해 주세요.
            </p>
          </ReportSection>
        )}

        <div className="mt-12 grid gap-4 border-t border-line pt-8 lg:grid-cols-2">
          <ListSection
            number="04"
            title="합의가 필요한 질문"
            items={report.agreementQuestions}
            accent
          />
          <ListSection number="05" title="업무 시작 전 체크" items={report.checklist} />
        </div>
      </div>
    </section>
  );
}

function ReportSection({
  number,
  title,
  children,
  spacious = false,
}: {
  number: string;
  title: string;
  children: ReactNode;
  spacious?: boolean;
}) {
  return (
    <section
      className={
        spacious
          ? "mt-10"
          : "rounded-3xl border border-[#e8e9f5] bg-[#fafaff] p-5 sm:p-6"
      }
    >
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-[10px] font-medium text-action">{number}</span>
        <h3 className="text-lg font-semibold tracking-[-0.025em] text-ink">{title}</h3>
      </div>
      <div className="text-[15px] font-medium leading-7 text-ink">{children}</div>
    </section>
  );
}

function ListSection({
  number,
  title,
  items,
  accent = false,
}: {
  number: string;
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-3xl border p-5 sm:p-6 ${
        accent
          ? "border-amber-200 bg-amber-50/70"
          : "border-emerald-200 bg-emerald-50/70"
      }`}
    >
      <div className="flex items-baseline gap-3">
        <span
          className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 font-mono text-[10px] font-semibold text-white ${
            accent ? "bg-warning" : "bg-success"
          }`}
        >
          {number}
        </span>
        <h3 className="text-lg font-semibold tracking-[-0.025em] text-ink">{title}</h3>
      </div>
      <ol className="mt-6 grid gap-0">
        {items.map((item, index) => (
          <li
            key={item}
            className="mt-2 grid grid-cols-[2rem_1fr] gap-3 rounded-2xl bg-white/70 px-3 py-3 text-sm font-medium leading-6"
          >
            <span className={`font-mono text-xs ${accent ? "text-warning" : "text-success"}`}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-ink">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RoleView({ role, value }: { role: string; value: string | null }) {
  return (
    <p className="border-b border-line/60 py-1.5 last:border-b-0">
      <strong className="mr-2 font-semibold text-ink">{role}</strong>
      {value ?? "해당 없음"}
    </p>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
      <p className="font-mono text-xl font-medium tabular-nums text-ink">
        {value.toString().padStart(2, "0")}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
    </div>
  );
}
