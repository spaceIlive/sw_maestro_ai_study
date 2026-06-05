import clsx from "clsx";
import { Check, CircleDashed, GitBranch } from "lucide-react";
import type { AnalyzeState, RouteType } from "../types";
import { routeDescription, routeLabel } from "../utils";

const steps = [
  "Context Intake",
  "Ambiguous Term Detector",
  "Role Perspective",
  "Risk 판단",
  "Consensus Report",
];

export function WorkflowStatus({
  state,
  route,
}: {
  state: AnalyzeState;
  route?: RouteType;
}) {
  const activeIndex = state === "idle" ? 0 : state === "loading" ? 2 : 4;

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink">Agent Workflow</h2>
          <p className="mt-1 text-sm text-muted">{routeDescription(route)}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-bridge">
          <GitBranch className="h-3.5 w-3.5" />
          {routeLabel(route)}
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => {
          const isDone = state === "success" || index < activeIndex;
          const isActive = index === activeIndex && state !== "success";

          return (
            <div
              key={step}
              className={clsx(
                "grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border p-3",
                isActive && "border-brand bg-blue-50",
                isDone && !isActive && "border-green-100 bg-green-50",
                !isDone && !isActive && "border-line bg-slate-50",
              )}
            >
              <span
                className={clsx(
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-black",
                  isDone && "bg-success text-white",
                  isActive && !isDone && "bg-brand text-white",
                  !isDone && !isActive && "bg-slate-300",
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : isActive ? <CircleDashed className="h-4 w-4" /> : index + 1}
              </span>
              <div>
                <p className="text-sm font-black text-ink">{step}</p>
                <p className="text-xs text-muted">
                  {index === 4 ? "보고서형 결과를 생성합니다." : "JSON 상태를 다음 Agent로 전달합니다."}
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-muted ring-1 ring-line">
                {isDone ? "완료" : isActive ? "진행 중" : "대기"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
