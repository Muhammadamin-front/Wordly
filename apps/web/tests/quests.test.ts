import { describe, expect, it } from "vitest";

import type { DailyQuest } from "@/lib/gamification";
import { questHref, questProgressPercent } from "@/lib/quests";

const quest: DailyQuest = {
  code: "phrasal_5",
  progress: 3,
  target: 5,
  xp_reward: 25,
  completed: false,
  game_type: "speed_quiz",
  source_category: "phrasal",
};

describe("daily quest helpers", () => {
  it("opens the requested game with its vocabulary source", () => {
    expect(questHref("uz", quest)).toBe("/uz/games/speed_quiz?category=phrasal");
    expect(questHref("en", { ...quest, source_category: null })).toBe(
      "/en/games/speed_quiz"
    );
  });

  it("keeps visual progress within the progress bar", () => {
    expect(questProgressPercent(quest)).toBe(60);
    expect(questProgressPercent({ ...quest, progress: 9 })).toBe(100);
  });
});
