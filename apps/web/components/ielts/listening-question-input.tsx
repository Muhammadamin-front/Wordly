"use client";

import type { ListeningOption, ListeningQuestion } from "@/lib/listening-practice";

export type ListeningAnswerValue = string | string[];

/** Answer-capture UI for a Listening question — four branches cover all 8
 *  ListeningQuestionKinds, mirroring reading-practice-view.tsx's QuestionInput
 *  design (not imported from it — see listening-practice.ts's header comment
 *  for why this is a fresh, small component instead of a shared import). */
export function ListeningQuestionInput({
  question,
  value,
  onChange,
  disabled,
  typeAnswerLabel,
}: {
  question: ListeningQuestion;
  value: ListeningAnswerValue | undefined;
  onChange: (value: ListeningAnswerValue) => void;
  disabled?: boolean;
  typeAnswerLabel: string;
}) {
  const isText = (
    ["sentence-completion", "summary-completion", "table-completion", "form-completion", "short-answer"] as const
  ).includes(question.kind as never);

  if (isText) {
    return (
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={typeAnswerLabel}
        className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-brand-400 disabled:opacity-60"
      />
    );
  }

  if (question.kind === "matching-features") {
    return (
      <select
        value={typeof value === "string" ? value : ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-brand-400 disabled:opacity-60"
      >
        <option value="" disabled>
          —
        </option>
        {(question.options ?? []).map((option: ListeningOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (question.kind === "multiple-answer") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-1.5">
        {(question.options ?? []).map((option: ListeningOption) => {
          const checked = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(
                  checked ? selected.filter((v) => v !== option.value) : [...selected, option.value]
                )
              }
              className={
                checked
                  ? "flex w-full items-center gap-2 rounded-lg border border-brand-500 bg-brand-600/10 px-3 py-2 text-left text-sm text-ink"
                  : "flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-sm text-ink hover:bg-line/40"
              }
            >
              <span className="font-bold">{option.value}</span>
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  // multiple-choice fallback
  return (
    <div className="space-y-1.5">
      {(question.options ?? []).map((option: ListeningOption) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={
            value === option.value
              ? "flex w-full items-center gap-2 rounded-lg border border-brand-500 bg-brand-600/10 px-3 py-2 text-left text-sm text-ink"
              : "flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-sm text-ink hover:bg-line/40"
          }
        >
          <span className="font-bold">{option.value}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
