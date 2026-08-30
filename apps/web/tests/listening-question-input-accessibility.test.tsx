import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ListeningQuestionInput } from "@/components/ielts/listening-question-input";
import type { ListeningQuestion } from "@/lib/listening-practice";

const baseQuestion = {
  id: "question-1",
  number: 1,
  section: 1,
  prompt: "Name: Daniel ______",
  instruction: "Write ONE WORD ONLY.",
  answer: "Osei",
  explanation: "The caller spells the surname.",
} satisfies Omit<ListeningQuestion, "kind">;

function QuestionLabels() {
  return (
    <>
      <p id="question-prompt">{baseQuestion.prompt}</p>
      <p id="question-instruction">{baseQuestion.instruction}</p>
    </>
  );
}

describe("ListeningQuestionInput accessibility", () => {
  it("uses the visible prompt and instruction as the text field's accessible description", () => {
    render(
      <>
        <QuestionLabels />
        <ListeningQuestionInput
          question={{ ...baseQuestion, kind: "form-completion" }}
          value=""
          onChange={vi.fn()}
          typeAnswerLabel="Type your answer"
          labelledBy="question-prompt"
          describedBy="question-instruction"
        />
      </>
    );

    const input = screen.getByRole("textbox", { name: baseQuestion.prompt });
    expect(input).toHaveAccessibleDescription(baseQuestion.instruction);
  });

  it("exposes multiple-choice options as a named radio group", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <QuestionLabels />
        <ListeningQuestionInput
          question={{
            ...baseQuestion,
            kind: "multiple-choice",
            answer: "B",
            options: [
              { value: "A", label: "Standard" },
              { value: "B", label: "Premium" },
            ],
          }}
          value="A"
          onChange={onChange}
          typeAnswerLabel="Type your answer"
          labelledBy="question-prompt"
          describedBy="question-instruction"
        />
      </>
    );

    const group = screen.getByRole("radiogroup", { name: baseQuestion.prompt });
    expect(group).toHaveAccessibleDescription(baseQuestion.instruction);
    expect(within(group).getByRole("radio", { name: /Standard/ })).toBeChecked();

    await user.click(within(group).getByRole("radio", { name: /Premium/ }));
    expect(onChange).toHaveBeenCalledWith("B");
  });
});
