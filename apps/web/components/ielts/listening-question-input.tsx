"use client";

import type { ListeningOption, ListeningQuestion } from "@/lib/listening-practice";
import { cn } from "@/lib/utils";

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
  labelledBy,
  describedBy,
}: {
  question: ListeningQuestion;
  value: ListeningAnswerValue | undefined;
  onChange: (value: ListeningAnswerValue) => void;
  disabled?: boolean;
  typeAnswerLabel: string;
  labelledBy: string;
  describedBy?: string;
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
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
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
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
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
      <fieldset
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className="min-w-0 space-y-1.5 border-0 p-0"
      >
        {(question.options ?? []).map((option: ListeningOption) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm text-ink focus-within:ring-2 focus-within:ring-focus",
                checked ? "border-brand-500 bg-brand-600/10" : "border-line",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-line/40"
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() =>
                  onChange(
                    checked ? selected.filter((v) => v !== option.value) : [...selected, option.value]
                  )
                }
                className="sr-only"
              />
              <span className="font-bold">{option.value}</span>
              {option.label}
            </label>
          );
        })}
      </fieldset>
    );
  }

  // multiple-choice fallback
  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="min-w-0 space-y-1.5 border-0 p-0"
    >
      {(question.options ?? []).map((option: ListeningOption) => (
        <label
          key={option.value}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm text-ink focus-within:ring-2 focus-within:ring-focus",
            value === option.value ? "border-brand-500 bg-brand-600/10" : "border-line",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-line/40"
          )}
        >
          <input
            type="radio"
            name={question.id}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span className="font-bold">{option.value}</span>
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
