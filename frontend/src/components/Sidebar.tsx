import clsx from "clsx";
import { ArrowUpRight, History, MessageSquareText } from "lucide-react";
import type { AppPage } from "../types";

const navItems: Array<{ id: AppPage; label: string; description: string; icon: typeof History }> = [
  {
    id: "analyze",
    label: "분석하기",
    description: "협업 텍스트 분석",
    icon: MessageSquareText,
  },
  {
    id: "history",
    label: "분석 이력",
    description: "완료 보고서 조회",
    icon: History,
  },
];

export function Sidebar({
  activePage,
  onNavigate,
}: {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}) {
  return (
    <aside className="relative z-40 flex w-full shrink-0 flex-col border-b border-white/70 bg-white/65 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:sticky lg:top-0 lg:h-dvh lg:w-[248px] lg:border-b-0 lg:border-r lg:border-line/70 lg:px-5 lg:py-6">
      <div className="flex items-center justify-between lg:block">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#7379e9] to-[#555bc8] text-sm font-semibold tracking-[-0.04em] text-white shadow-[0_8px_20px_rgba(98,105,217,0.25)]">
            CB
          </span>
          <div>
            <p className="text-base font-semibold tracking-[-0.025em] text-ink">ContextBridge</p>
            <p className="mt-0.5 text-[10px] font-semibold tracking-[0.04em] text-muted">
              서로의 맥락을 잇는 공간
            </p>
          </div>
        </div>
        <span className="hidden text-[11px] font-semibold text-muted lg:mt-8 lg:block">
          메뉴
        </span>
      </div>

      <nav className="mt-4 flex gap-2 overflow-x-auto lg:mt-3 lg:grid lg:gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={clsx(
                "group flex min-w-max items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all duration-300 ease-out active:scale-[0.98] lg:min-w-0 lg:px-3 lg:py-3",
                isActive
                  ? "border-[#d8dbff] bg-action-soft text-action shadow-[0_8px_22px_rgba(98,105,217,0.12)]"
                  : "border-transparent bg-transparent text-muted hover:border-[#e6e8f7] hover:bg-white hover:text-action",
              )}
            >
              <span
                className={clsx(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors duration-300",
                  isActive
                    ? "border-action/10 bg-action text-white shadow-sm"
                    : "border-line bg-white text-muted group-hover:border-action/30 group-hover:text-action",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{item.label}</span>
                <span
                  className={clsx(
                    "mt-0.5 hidden text-[11px] font-medium lg:block",
                    isActive ? "text-action/65" : "text-muted",
                  )}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-line pt-5 lg:block">
        <p className="text-[11px] font-semibold text-muted">ContextBridge는</p>
        <p className="mt-3 text-xs font-medium leading-5 text-ink">
          문장 속 모호한 표현을 찾고,
          <br />
          합의 질문과 체크리스트로 정리합니다.
        </p>
        <a
          href="#main-report"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-action-soft px-3 py-2 text-xs font-semibold text-action transition-all duration-300 hover:gap-2.5 hover:bg-[#e5e7ff] hover:text-action-hover"
        >
          보고서 영역
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
        </a>
      </div>
    </aside>
  );
}
