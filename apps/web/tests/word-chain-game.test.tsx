import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { GameLobby } from "@/components/word-chain/game-lobby";
import { GameMenu } from "@/components/word-chain/game-menu";
import { GameTable, seatPosition } from "@/components/word-chain/game-table";
import type { WordChainState } from "@/lib/word-chain";

const state: WordChainState = {
  code: "ABC123",
  status: "playing",
  host_id: "p1",
  round: 1,
  turn: 1,
  current_player_id: "p1",
  current_letter: "B",
  last_word: null,
  time_limit: 15,
  turn_started_at: 1_000,
  turn_ends_at: 16_000,
  server_now: 1_000,
  used_words: [],
  players: [
    { id: "p1", username: "Ali", avatar_url: null, is_bot: false, status: "active", lives_remaining: 2, streak: 2, words_submitted: 0, word_history: [], eliminated_at_round: null, eliminated_reason: null },
    { id: "p2", username: "Lexi Bot", avatar_url: null, is_bot: true, status: "active", lives_remaining: 2, streak: 0, words_submitted: 0, word_history: [], eliminated_at_round: null, eliminated_reason: null },
  ],
  active_players: 2,
  eliminated_players: 0,
  winner_id: null,
  started_at: 1_000,
  finished_at: null,
  duration_seconds: null,
  letter_stats: {
    B: { letter: "B", available_words: 100, used_words: 0, remaining_words: 100, is_restricted: false },
  },
  challenge: { kind: "min_length", target: 5 },
  matchmaking_status: null,
  last_event: null,
  config: { starting_time: 15, minimum_time: 5, minimum_word_length: 3, difficult_letter_threshold: 15, min_players: 2, max_players: 8, lives_per_player: 2, streak_bonus_threshold: 3, streak_time_bonus: 2 },
};

describe("word-chain game table", () => {
  it("places two players on opposite sides of the table", () => {
    const first = seatPosition(0, 2);
    const second = seatPosition(1, 2);
    expect(first.x).toBeCloseTo(second.x);
    expect(first.y).toBeGreaterThan(50);
    expect(second.y).toBeLessThan(50);
  });

  it("keeps every circular seat within responsive safe bounds", () => {
    for (const count of [3, 4, 5, 6, 7, 8]) {
      for (let index = 0; index < count; index += 1) {
        const position = seatPosition(index, count);
        expect(position.x).toBeGreaterThanOrEqual(10);
        expect(position.x).toBeLessThanOrEqual(90);
        expect(position.y).toBeGreaterThanOrEqual(16);
        expect(position.y).toBeLessThanOrEqual(84);
      }
    }
  });

  it("disables browser writing assistance on the live word input", () => {
    render(
      <GameTable
        copy={en.wordChain}
        state={state}
        myUserId="p1"
        feedback={null}
        reconnecting={false}
        onSubmit={vi.fn()}
        onLeave={vi.fn()}
      />
    );
    const input = screen.getByPlaceholderText(en.wordChain.enterWord);
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("autocapitalize", "none");
    expect(input).toHaveAttribute("spellcheck", "false");
    expect(input).toHaveFocus();
  });

  it("makes lives, combo progress, and the current bonus challenge visible", () => {
    render(
      <GameTable
        copy={en.wordChain}
        state={state}
        myUserId="p1"
        feedback={null}
        reconnecting={false}
        onSubmit={vi.fn()}
        onLeave={vi.fn()}
      />
    );

    expect(screen.getByLabelText(en.wordChain.bonusChallenge)).toHaveTextContent(
      "Use 5+ letters"
    );
    expect(screen.getByText(en.wordChain.challengeReward)).toBeVisible();
    expect(screen.getByLabelText(/Ali, Your turn, Lives: 2. Combo: 2/)).toBeVisible();
    expect(screen.getByText("Reach 3 combo for +2s")).toBeVisible();
  });

  it("starts online matchmaking and gives a searching player a clear cancellation state", () => {
    const findMatch = vi.fn();
    render(
      <GameMenu
        copy={en.wordChain}
        connecting={false}
        invitationTransition={null}
        onCreate={vi.fn()}
        onFindMatch={findMatch}
        onJoin={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: en.wordChain.playOnline }));
    expect(findMatch).toHaveBeenCalledOnce();

    const leave = vi.fn();
    render(
      <GameLobby
        copy={en.wordChain}
        state={{
          ...state,
          status: "waiting",
          active_players: 1,
          matchmaking_status: "searching",
          players: [state.players[0]],
        }}
        myUserId="p1"
        onAddBot={vi.fn()}
        onStart={vi.fn()}
        onLeave={leave}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent(en.wordChain.findingOpponent);
    expect(screen.queryByText(state.code)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: en.wordChain.cancelSearch }));
    expect(leave).toHaveBeenCalledOnce();
  });

  it("makes a friend invitation transition explicit while a private room is prepared", () => {
    render(
      <GameMenu
        copy={en.wordChain}
        connecting
        invitationTransition="creating"
        onCreate={vi.fn()}
        onFindMatch={vi.fn()}
        onJoin={vi.fn()}
      />
    );

    expect(screen.getByText(en.wordChain.creatingFriendInviteHint)).toHaveAttribute("role", "status");
  });
});
