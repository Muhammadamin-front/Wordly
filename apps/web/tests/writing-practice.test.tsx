import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Dictionary } from "@/app/[lang]/dictionaries";
import { WritingPractice } from "@/components/ielts/writing-practice";

const { writingTasksMock } = vi.hoisted(() => ({ writingTasksMock: vi.fn() }));

vi.mock("@/lib/ielts", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/ielts")>();
  return {
    ...original,
    ieltsApi: {
      ...original.ieltsApi,
      writingTasks: writingTasksMock,
    },
  };
});

const t = {
  task1: "Task 1",
  task2: "Task 2",
  newPrompt: "New prompt",
  writingPlaceholder: "Write your response here…",
  words: "words",
  min: "min",
  getBand: "Get band score",
  quotaOut: "Quota exceeded",
  notConfigured: "Not configured",
  error: "Something went wrong",
} as unknown as Dictionary["ielts"];

describe("WritingPractice", () => {
  beforeEach(() => {
    writingTasksMock.mockResolvedValue({
      task1: [
        {
          title: "Task 1 — Bar chart",
          prompt: "Summarise the bar chart.",
          visual: {
            kind: "bar",
            title: "Study hours",
            categories: ["Brazil", "Japan"],
            series: [{ name: "2023", values: [9, 8.5] }],
          },
        },
      ],
      task2: [{ title: "Task 2 — Opinion", prompt: "Give your opinion." }],
    });
  });

  it("opens on Academic Task 1 with its visual", async () => {
    render(<WritingPractice lang="en" t={t} />);

    expect(await screen.findByText("Summarise the bar chart.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Study hours" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Task 1/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Academic report · 150 words")).toBeInTheDocument();
  });

  it("reports task changes so the matching guide can be shown", async () => {
    const onTaskChange = vi.fn();
    const user = userEvent.setup();
    render(<WritingPractice lang="en" t={t} onTaskChange={onTaskChange} />);

    await screen.findByText("Summarise the bar chart.");
    await user.click(screen.getByRole("button", { name: /Task 2/ }));

    expect(screen.getByText("Give your opinion.")).toBeInTheDocument();
    expect(onTaskChange).toHaveBeenCalledWith("task2");
  });
});
