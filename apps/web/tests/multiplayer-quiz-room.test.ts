import { describe, expect, it } from "vitest";

import { initialState, reducer, type Action, type State } from "@/components/multiplayer/quiz-room";
import type { ServerMessage } from "@/lib/multiplayer";

function server(message: ServerMessage): Action {
  return { source: "server", message };
}

describe("multiplayer quiz-room reducer", () => {
  it("moves to lobby and captures the roster", () => {
    const next = reducer(
      initialState,
      server({
        type: "lobby",
        code: "ABCD",
        host_id: "host-1",
        phase: "lobby",
        players: [{ user_id: "host-1", name: "Ali", connected: true }],
      })
    );
    expect(next.phase).toBe("lobby");
    expect(next.code).toBe("ABCD");
    expect(next.hostId).toBe("host-1");
    expect(next.players).toHaveLength(1);
  });

  it("clears the previous round's selection/result/leaderboard on a new question", () => {
    const midRound: State = {
      ...initialState,
      phase: "leaderboard",
      selected: 2,
      result: { type: "question_result", index: 0, answer_index: 1, explanation: null, results: [], ends_at: 0, server_now: 0 },
      leaderboard: { type: "leaderboard", index: 0, total: 8, board: [], ends_at: 0, server_now: 0 },
    };
    const next = reducer(
      midRound,
      server({
        type: "question",
        index: 1,
        total: 8,
        prompt: "book",
        options: ["a", "b", "c", "d"],
        mode: "vocab",
        category: "vocab",
        started_at: 0,
        ends_at: 1000,
        server_now: 0,
      })
    );
    expect(next.phase).toBe("question");
    expect(next.selected).toBeNull();
    expect(next.result).toBeNull();
    expect(next.leaderboard).toBeNull();
  });

  it("locks in the first local selection and ignores a second one", () => {
    const questionState: State = {
      ...initialState,
      phase: "question",
      question: {
        type: "question",
        index: 0,
        total: 8,
        prompt: "book",
        options: ["a", "b", "c", "d"],
        mode: "vocab",
        category: "vocab",
        started_at: 0,
        ends_at: 1000,
        server_now: 0,
      },
    };
    const firstPick = reducer(questionState, { source: "local", type: "select", option: 1 });
    expect(firstPick.selected).toBe(1);

    const secondPick = reducer(firstPick, { source: "local", type: "select", option: 3 });
    expect(secondPick.selected).toBe(1); // unchanged — an answer, once locked, cannot change
  });

  it("returns from a failed join to the menu, but leaves an active game's phase alone", () => {
    const connecting: State = { ...initialState, phase: "connecting" };
    const afterFailedJoin = reducer(connecting, server({ type: "error", error: "room_not_found" }));
    expect(afterFailedJoin.phase).toBe("menu");
    expect(afterFailedJoin.error).toBe("room_not_found");

    const inGame: State = { ...initialState, phase: "leaderboard" };
    const afterMidGameError = reducer(inGame, server({ type: "error", error: "round_closed" }));
    expect(afterMidGameError.phase).toBe("leaderboard");
  });

  it("promotes the new host without touching the rest of the game state", () => {
    const inGame: State = { ...initialState, phase: "question", hostId: "host-1" };
    const next = reducer(inGame, server({ type: "host_changed", host_id: "host-2", reason: "disconnected" }));
    expect(next.hostId).toBe("host-2");
    expect(next.phase).toBe("question");
  });

  it("updates only the matching player's connected flag", () => {
    const withPlayers: State = {
      ...initialState,
      players: [
        { user_id: "p1", name: "Ali", connected: true },
        { user_id: "p2", name: "Vali", connected: true },
      ],
    };
    const next = reducer(withPlayers, server({ type: "player_status", user_id: "p2", connected: false }));
    expect(next.players.find((p) => p.user_id === "p1")?.connected).toBe(true);
    expect(next.players.find((p) => p.user_id === "p2")?.connected).toBe(false);
  });

  it("leaving resets fully back to the initial menu state", () => {
    const deepInGame: State = { ...initialState, phase: "finished", code: "ABCD", players: [{ user_id: "p1", name: "Ali", connected: true }] };
    const next = reducer(deepInGame, { source: "local", type: "reset" });
    expect(next).toEqual(initialState);
  });
});
