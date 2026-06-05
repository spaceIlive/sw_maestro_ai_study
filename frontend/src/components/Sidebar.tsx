import { ClipboardList, FileText, GitBranch, MessageSquareText } from "lucide-react";

const steps = ["입력", "워크플로우", "보고서"];
const icons = [MessageSquareText, GitBranch, FileText];

export function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-slate-950 px-5 py-7 text-white">
      <div>
        <p className="text-2xl font-black tracking-tight">ContextBridge</p>
        <p className="mt-2 text-xs font-medium text-slate-400">협업 문맥 오해 탐지 Agent</p>
      </div>

      <nav className="mt-12 grid gap-2">
        {steps.map((step, index) => {
          const Icon = icons[index];

          return (
          <div
            key={step}
            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold ${
              index === 0 ? "bg-slate-800 text-white" : "text-slate-400"
            }`}
          >
            <Icon className="h-4 w-4" />
            {index + 1}. {step}
          </div>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg bg-slate-900 p-4 text-xs leading-6 text-slate-300">
        <p className="mb-2 flex items-center gap-2 font-bold text-white">
          <ClipboardList className="h-4 w-4" />
          MVP 범위
        </p>
        <p>POST /api/analyze 단일 API</p>
        <p>텍스트 입력 기반 분석</p>
        <p>test_cases 기반 mock demo</p>
        <p>보고서형 결과 출력</p>
      </div>
    </aside>
  );
}
