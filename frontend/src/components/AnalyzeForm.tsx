import type { ReactNode } from "react";
import { Loader2, Play, Sparkles } from "lucide-react";
import type { AnalyzeRequest, TestCase } from "../types";
import { communicationTypes, roles } from "../utils";

type AnalyzeFormProps = {
  value: AnalyzeRequest;
  testCases: TestCase[];
  isLoading: boolean;
  onChange: (next: AnalyzeRequest) => void;
  onSubmit: () => void;
  onSelectCase: (testCase: TestCase) => void;
};

export function AnalyzeForm({
  value,
  testCases,
  isLoading,
  onChange,
  onSubmit,
  onSelectCase,
}: AnalyzeFormProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink">협업 텍스트 입력</h2>
          <p className="mt-1 text-sm text-muted">
            API 문서의 요청 필드만 사용합니다: text, senderRole, receiverRole, communicationType.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-brand">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          MVP
        </span>
      </div>

      <textarea
        className="mt-5 min-h-44 w-full resize-none rounded-lg border border-line bg-slate-50 p-4 text-sm leading-7 text-ink outline-none transition focus:border-brand focus:bg-white"
        value={value.text}
        onChange={(event) => onChange({ ...value, text: event.target.value })}
        placeholder="분석할 협업 텍스트를 입력하세요."
      />

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Field label="발화자 직군">
          <Select
            value={value.senderRole}
            options={roles}
            placeholder="선택"
            onChange={(senderRole) => onChange({ ...value, senderRole })}
          />
        </Field>
        <Field label="수신자 직군">
          <Select
            value={value.receiverRole}
            options={roles}
            placeholder="선택"
            onChange={(receiverRole) => onChange({ ...value, receiverRole })}
          />
        </Field>
        <Field label="소통 유형">
          <Select
            value={value.communicationType}
            options={communicationTypes}
            placeholder="선택"
            onChange={(communicationType) => onChange({ ...value, communicationType })}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {testCases.slice(0, 4).map((testCase) => (
            <button
              key={testCase.id}
              type="button"
              className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-muted transition hover:border-brand hover:text-brand"
              onClick={() => onSelectCase(testCase)}
            >
              {testCase.id} {testCase.scenarioName}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={onSubmit}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {isLoading ? "분석 중..." : "분석 시작"}
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-black text-muted">
      {label}
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
    <select
      className="h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none focus:border-brand"
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
  );
}
