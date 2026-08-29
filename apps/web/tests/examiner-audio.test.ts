import { describe, expect, it } from "vitest";

import { examinerPhraseUrl, planVoice } from "@/lib/examiner-audio";
import type { TurnResponse } from "@/lib/coach";

function turn(over: Partial<TurnResponse>): TurnResponse {
  return {
    reply: "Tell me about your hometown.",
    corrections: [],
    reward: { xp_gained: 0, total_xp: 0, level: 1, leveled_up: false },
    audio_type: "dynamic",
    static_audio_id: null,
    ielts_part: null,
    ...over,
  };
}

describe("examiner audio routing", () => {
  it("plays a scripted line from its pre-rendered recording", () => {
    const plan = planVoice(turn({ audio_type: "static", static_audio_id: "part3_intro" }));
    expect(plan).toEqual({
      kind: "static",
      url: "/api/v1/tts/examiner/part3_intro",
      text: "Tell me about your hometown.",
    });
  });

  it("synthesizes a line written for this learner", () => {
    const plan = planVoice(turn({ reply: "Why do you think that is?" }));
    expect(plan).toEqual({ kind: "dynamic", text: "Why do you think that is?" });
  });

  it("falls back to live synthesis when static is claimed without an id", () => {
    // Always correct, just not free — better than requesting /undefined.
    const plan = planVoice(turn({ audio_type: "static", static_audio_id: null }));
    expect(plan.kind).toBe("dynamic");
  });

  it("escapes the id rather than pasting it into the path", () => {
    expect(examinerPhraseUrl("../../etc/passwd")).toBe(
      "/api/v1/tts/examiner/..%2F..%2Fetc%2Fpasswd"
    );
  });
});
