import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { WritingFeedbackReport } from "@/components/ielts/writing-feedback-report";
import { WRITING_SCORE } from "./writing-feedback-fixture";

const t = {
  improved: "Model answer (Band 8)",
  tryAgain: "Try another",
} as unknown as Dictionary["ielts"];

describe("WritingFeedbackReport", () => {
  it("shows a clearly qualified estimate and all four criterion explanations", () => {
    render(
      <WritingFeedbackReport lang="en" taskType="task2" score={WRITING_SCORE} t={t} onRetry={() => {}} />
    );

    expect(screen.getByRole("heading", { name: "IELTS Writing Feedback" })).toBeInTheDocument();
    expect(screen.getByText("AI Estimated Band")).toBeInTheDocument();
    expect(screen.getByText("An AI estimate for practice — not an official IELTS result.")).toBeInTheDocument();
    expect(screen.getByText("Academic Writing Task 2")).toBeInTheDocument();
    expect(screen.getAllByText("6.5").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("heading", { name: "Task Response" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Coherence & Cohesion" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lexical Resource" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Grammatical Range & Accuracy" })).toBeInTheDocument();
    expect(screen.getByText(/Your response is easy to follow/)).toBeInTheDocument();
  });

  it("marks only the exact phrase and filters sentence cards by status", async () => {
    const user = userEvent.setup();
    render(
      <WritingFeedbackReport lang="en" taskType="task1" score={WRITING_SCORE} t={t} onRetry={() => {}} />
    );

    const heading = screen.getByRole("heading", { name: "Sentence-by-sentence feedback" });
    const section = heading.closest("section");
    expect(section).not.toBeNull();
    const feedback = within(section as HTMLElement);

    const goodMark = feedback.getByText("improve access");
    expect(goodMark.tagName).toBe("MARK");
    expect(goodMark.closest("p")).toHaveTextContent("Digital technology can improve access to education.");

    const errorsFilter = feedback.getByRole("button", { name: /Errors\s+1/i });
    expect(errorsFilter).toHaveAttribute("aria-pressed", "false");
    await user.click(errorsFilter);

    expect(errorsFilter).toHaveAttribute("aria-pressed", "true");
    expect(feedback.queryByText("improve access")).not.toBeInTheDocument();
    expect(feedback.getByText("people sometimes uses").tagName).toBe("MARK");
    expect(feedback.getByText("people sometimes use")).toBeInTheDocument();
  });

  it("connects corrections, repetition, grammar, and the band plan to the submitted language", () => {
    render(
      <WritingFeedbackReport lang="en" taskType="task2" score={WRITING_SCORE} t={t} onRetry={() => {}} />
    );

    expect(screen.getAllByText(/people sometimes uses/).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/people sometimes use/).length).toBeGreaterThan(1);
    expect(screen.getByText("“technology”")).toBeInTheDocument();
    expect(screen.getByText("3 times")).toBeInTheDocument();
    expect(screen.getByText("digital tools · these systems")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cohesion analysis" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Grammar profile" })).toBeInTheDocument();
    expect(screen.getAllByText("7.0").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Rewrite sentence 3 with correct agreement.")).toBeInTheDocument();
  });
});
