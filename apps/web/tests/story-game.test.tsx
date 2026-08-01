import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { StoryGame } from "@/components/games/story-game";

const items = [
  {
    question: {
      card_id: "card-one",
      prompt: "The explorer found a ____ behind the wall.",
      answer: "passage",
      distractors: ["promise", "package"],
      audio_text: null,
    },
    options: ["passage", "promise", "package"],
  },
  {
    question: {
      card_id: "card-two",
      prompt: "A soft light began to ____ from the map.",
      answer: "glow",
      distractors: ["grow", "throw"],
      audio_text: null,
    },
    options: ["glow", "grow", "throw"],
  },
];

describe("StoryGame", () => {
  it("grades a word and lets the learner choose the next story branch", async () => {
    const onAnswer = vi.fn();
    const onComplete = vi.fn();
    render(
      <StoryGame
        items={items}
        games={en.games}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "passage" }));
    expect(onAnswer).toHaveBeenCalledWith("card-one", true, expect.any(Number), "passage");
    expect(screen.getByText(en.games.storyChooseDirection)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Take the bold path/i }));
    expect(screen.getByText(`${en.games.storyChapter} 2`)).toBeInTheDocument();
    expect(screen.getByText(en.games.storyBraveScene)).toBeInTheDocument();
    expect(await screen.findByText(items[1].question.prompt)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
