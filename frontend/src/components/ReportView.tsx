import type { ReactNode } from "react";
import {
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  HelpCircle,
  ListChecks,
  Printer,
  TableProperties,
} from "lucide-react";
import { useState } from "react";
import type { AnalyzeResponse } from "../types";
import { riskClass, routeLabel } from "../utils";

type ReportViewProps = {
  report: AnalyzeResponse | null;
};

export function ReportView({ report }: ReportViewProps) {
  const [isDocxExporting, setIsDocxExporting] = useState(false);

  if (!report) {
    return (
      <section className="rounded-lg border border-dashed border-line bg-white p-8 text-center shadow-panel">
        <p className="text-sm font-bold text-muted">
          분석을 실행하면 이 영역에 보고서형 결과가 표시됩니다.
        </p>
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
    <section className="print-report rounded-lg border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-brand">
            <FileText className="h-4 w-4" />
            ContextBridge Report
          </p>
          <h2 className="mt-2 text-2xl font-black text-ink">협업 텍스트 오해 가능 용어 분석</h2>
          <p className="mt-2 text-sm text-muted">선택 경로: {routeLabel(report.route)}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="print-hidden flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-black text-ink transition hover:border-brand hover:text-brand"
              title="보고서 영역만 인쇄하거나 PDF로 저장합니다."
            >
              <Printer className="h-4 w-4" />
              PDF 저장
            </button>
            <button
              type="button"
              onClick={handleDocxDownload}
              disabled={isDocxExporting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              title="보고서를 Word 문서로 다운로드합니다."
            >
              <Download className="h-4 w-4" />
              {isDocxExporting ? "생성 중" : "DOCX 다운로드"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric label="용어" value={`${report.terms.length}개`} />
            <Metric label="질문" value={`${report.agreementQuestions.length}개`} />
            <Metric label="체크" value={`${report.checklist.length}개`} />
          </div>
        </div>
      </div>

      <ReportSection title="1. 입력 내용 요약" icon={<FileText className="h-5 w-5" />}>
        <p>{report.summary}</p>
      </ReportSection>

      <ReportSection title="2. 핵심 요청 / 합의 내용" icon={<ClipboardCheck className="h-5 w-5" />}>
        <p>{report.keyRequest}</p>
      </ReportSection>

      {report.terms.length > 0 ? (
        <ReportSection title="3. 오해 가능 용어 분석" icon={<TableProperties className="h-5 w-5" />}>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black text-muted">
                <tr>
                  <th className="p-3">용어</th>
                  <th className="p-3">문맥 / 현재 의미</th>
                  <th className="p-3">직군별 해석</th>
                  <th className="p-3">위험도</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.terms.map((term) => (
                  <tr key={`${term.term}-${term.context}`} className="align-top">
                    <td className="w-28 p-3 font-black text-ink">{term.term}</td>
                    <td className="p-3 text-muted">
                      <p className="font-bold text-ink">{term.context}</p>
                      <p className="mt-1">{term.currentMeaning}</p>
                      <p className="mt-3 text-xs font-bold text-ink">{term.riskReason}</p>
                    </td>
                    <td className="p-3 text-xs leading-6 text-muted">
                      <p>
                        <strong className="text-ink">기획:</strong> {term.plannerView}
                      </p>
                      <p>
                        <strong className="text-ink">개발:</strong> {term.developerView}
                      </p>
                      <p>
                        <strong className="text-ink">디자인:</strong> {term.designerView}
                      </p>
                      <p>
                        <strong className="text-ink">PM:</strong> {term.pmView}
                      </p>
                    </td>
                    <td className="w-36 p-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${riskClass(
                          term.riskLevel,
                        )}`}
                      >
                        {term.riskLevel}
                      </span>
                      <p className="mt-3 text-xs font-bold leading-5 text-ink">
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
        <ReportSection title="3. 추가 문맥 필요" icon={<HelpCircle className="h-5 w-5" />}>
          <p className="text-muted">
            현재 입력만으로는 용어의 실제 의미를 확정하기 어렵습니다. 아래 합의 질문에 답한 뒤
            다시 분석해 주세요.
          </p>
        </ReportSection>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <ReportSection title="4. 합의 필요 질문" icon={<Copy className="h-5 w-5" />} compact>
          <ul className="grid gap-3">
            {report.agreementQuestions.map((question) => (
              <li key={question} className="rounded-lg bg-blue-50 p-3 text-sm font-bold text-ink">
                {question}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="5. 업무 시작 전 체크리스트" icon={<ListChecks className="h-5 w-5" />} compact>
          <ul className="grid gap-3">
            {report.checklist.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 p-3 text-sm font-bold text-ink">
                <span className="mr-2 text-brand">□</span>
                {item}
              </li>
            ))}
          </ul>
        </ReportSection>
      </div>
    </section>
  );
}

function ReportSection({
  title,
  children,
  icon,
  compact = false,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "" : "mt-8"}>
      <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-ink">
        {icon ? <span className="text-brand">{icon}</span> : null}
        {title}
      </h3>
      <div className="text-sm leading-7 text-ink">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-20 rounded-lg border border-line bg-slate-50 px-3 py-2">
      <p className="text-lg font-black text-ink">{value}</p>
      <p className="text-xs font-bold text-muted">{label}</p>
    </div>
  );
}
