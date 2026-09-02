"use client";

import type { ReviewItem } from "@/lib/multiplayer";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/app/[lang]/dictionaries";

export function ReviewMistakes({ mp, items }: { mp: Dictionary["mp"]; items: ReviewItem[] }) {
  if (items.length === 0) {
    return <p className="text-center text-sm text-ink-soft">{mp.noMistakes}</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {items.map((item) => (
        <div key={item.index} className="rounded-xl2 border border-line bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            {mp.question} {item.index + 1}
          </p>
          <p className="mt-1 text-base font-bold text-ink">{item.prompt}</p>

          <div className="mt-3 space-y-1.5">
            {item.options.map((opt, i) => {
              const isAnswer = i === item.answer_index;
              const isYours = i === item.your_answer_index;
              return (
                <div
                  key={opt}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-semibold",
                    isAnswer && "border-success bg-success/10 text-success-text",
                    !isAnswer && isYours && "border-danger bg-danger/10 text-danger-text",
                    !isAnswer && !isYours && "border-line bg-raised text-ink-soft"
                  )}
                >
                  {opt}
                  {isAnswer && <span className="ml-2">✓</span>}
                  {!isAnswer && isYours && <span className="ml-2">✕ {mp.yourAnswer}</span>}
                </div>
              );
            })}
          </div>

          {item.explanation && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="text-sm font-bold text-ink">{item.explanation.translation_uz}</p>
              {item.explanation.example_en && (
                <p className="mt-1 text-sm italic text-ink-soft">“{item.explanation.example_en}”</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
