import type { ReactNode } from "react";
import { ArrowUpRight, Check, ChevronDown, Loader2, MessageSquareText } from "lucide-react";
import type { AnalyzeRequest } from "../types";
import { communicationTypes, roles } from "../utils";

type AnalyzeFormProps = {
  value: AnalyzeRequest;
  isLoading: boolean;
  onChange: (next: AnalyzeRequest) => void;
  onSubmit: () => void;
};

export function AnalyzeForm({
  value,
  isLoading,
  onChange,
  onSubmit,
}: AnalyzeFormProps) {
  return (
    <section className="surface-panel overflow-hidden">
      <div className="flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="editorial-kicker">대화 입력</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-ink sm:text-[1.75rem]">
              분석할 대화를 붙여 넣으세요.
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-muted">
              업무 맥락과 참여 직군을 함께 알려주면 해석 차이를 더 정확하게 찾습니다.
            </p>
          </div>
          <span className="mt-1 font-mono text-xs text-muted">
            {value.text.length.toLocaleString("ko-KR")} chars
          </span>
        </div>

        <label className="group block">
          <span className="mb-2 flex items-center justify-between text-xs font-semibold text-ink">
            <span className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-action" strokeWidth={2} />
              대화 내용
              <span className="text-danger">*</span>
            </span>
            {value.text.trim() ? (
              <span className="flex items-center gap-1 text-success">
                <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                입력됨
              </span>
            ) : (
              <span className="text-action">필수 입력</span>
            )}
          </span>
          <textarea
            className="min-h-56 w-full resize-y rounded-3xl border-2 border-[#e1e4f5] bg-[#f8f8ff] p-5 text-[15px] font-medium leading-7 text-ink outline-none transition-all duration-300 ease-out placeholder:text-[#9aa0b3] hover:border-action/40 hover:bg-white focus:border-action focus:bg-white focus:shadow-input sm:min-h-64 sm:p-6"
            value={value.text}
            onChange={(event) => onChange({ ...value, text: event.target.value })}
            placeholder={
              "예: 이번 주 안에 로그인 도메인 쪽 디벨롭 가능할까요?\n공수가 크면 우선 정책만 반영해도 됩니다."
            }
          />
        </label>
      </div>

      <div className="grid gap-3 bg-[#fafbff] px-5 pb-5 sm:px-7 md:grid-cols-3">
        <Field label="발화자 직군" index="01" complete={Boolean(value.senderRole)}>
          <Select
            value={value.senderRole}
            options={roles}
            placeholder="직군 선택"
            onChange={(senderRole) => onChange({ ...value, senderRole })}
          />
        </Field>
        <Field label="수신자 직군" index="02" complete={Boolean(value.receiverRole)}>
          <Select
            value={value.receiverRole}
            options={roles}
            placeholder="직군 선택"
            onChange={(receiverRole) => onChange({ ...value, receiverRole })}
          />
        </Field>
        <Field label="소통 유형" index="03" complete={Boolean(value.communicationType)}>
          <Select
            value={value.communicationType}
            options={communicationTypes}
            placeholder="유형 선택"
            onChange={(communicationType) => onChange({ ...value, communicationType })}
          />
        </Field>
      </div>

      <div className="mx-3 mb-3 flex flex-col gap-4 rounded-3xl bg-action-soft px-5 py-5 sm:mx-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold text-ink">6단계 Agent workflow</p>
          <p className="mt-1 text-xs font-medium text-muted">
            진행 상태는 오른쪽 패널에서 실시간으로 확인할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-action px-7 py-3 text-sm font-semibold text-white shadow-button transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-action-hover hover:shadow-[0_16px_34px_rgba(98,105,217,0.3)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#abb0d9] disabled:shadow-none disabled:hover:translate-y-0 sm:min-w-44"
          disabled={isLoading}
          onClick={onSubmit}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isLoading ? "문맥 분석 중" : "분석 시작"}
          {!isLoading ? (
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.8}
            />
          ) : null}
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  index,
  complete,
  children,
}: {
  label: string;
  index: string;
  complete: boolean;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-3 rounded-2xl border border-[#e6e8f4] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(73,82,125,0.04)]">
      <span className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        <span className="flex items-center gap-2">
          <span className="font-mono text-action">{index}</span>
          {label}
          <span className="text-danger">*</span>
        </span>
        {complete ? <Check className="h-4 w-4 text-success" strokeWidth={2.4} /> : null}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <span className="field-control relative block rounded-xl">
      <select
        className="h-11 w-full cursor-pointer appearance-none border-0 bg-transparent px-3 pr-10 text-sm font-semibold text-ink outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-action"
        strokeWidth={2.2}
      />
    </span>
  );
}
