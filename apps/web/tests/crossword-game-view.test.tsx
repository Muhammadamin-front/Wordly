import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { buildCrossword, CrosswordGame } from "@/components/games/crossword-game";

const crossword = buildCrossword([
  {
    card_id: "card-cat",
    prompt: "A small domesticated animal that often catches mice.",
    answer: "cat",
    distractors: [],
    audio_text: null,
  },
]);

describe("CrosswordGame", () => {
  it("lets a learner correct a wrong word before completing", async () => {
    const onAnswer = vi.fn();
    const onComplete = vi.fn();
    render(
      <CrosswordGame
        games={en.games}
        crossword={crossword}
        onAnswer={onAnswer}
        onComplete={onComplete}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "D" }));
    await userEvent.click(screen.getByRole("button", { name: "O" }));
    await userEvent.click(screen.getByRole("button", { name: "G" }));
    await userEvent.click(screen.getByRole("button", { name: en.games.crosswordCheck }));

    expect(screen.getByRole("status")).toHaveTextContent(en.games.crosswordTryAgain);
    expect(onAnswer).toHaveBeenLastCalledWith("card-cat", false, expect.any(Number), "dog");
    expect(onComplete).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: en.games.crosswordClear }));
    await userEvent.click(screen.getByRole("button", { name: "C" }));
    await userEvent.click(screen.getByRole("button", { name: "A" }));
    await userEvent.click(screen.getByRole("button", { name: "T" }));
    await userEvent.click(screen.getByRole("button", { name: en.games.crosswordCheck }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(en.games.crosswordSolved)
    );
    expect(onAnswer).toHaveBeenLastCalledWith("card-cat", true, expect.any(Number), "cat");
    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce(), { timeout: 1200 });
  });

  it("reveals a limited letter hint without exposing the whole answer", async () => {
    render(
      <CrosswordGame
        games={en.games}
        crossword={crossword}
        onAnswer={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: `${en.games.crosswordHint} · 2` })
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      en.games.crosswordHintUsed.replace("{count}", "1")
    );
    expect(
      screen.getByRole("button", { name: `${en.games.crosswordHint} · 1` })
    ).toBeEnabled();
  });
});
