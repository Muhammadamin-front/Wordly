import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import uz from "@/app/[lang]/dictionaries/uz.json";
import { SkillView } from "@/components/ielts/skill-view";

// The picker calls the API on mount; the wiring is what is under test here.
vi.mock("@/lib/ielts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ielts")>();
  return {
    ...actual,
    ieltsApi: { ...actual.ieltsApi, bank: () => Promise.resolve([]) },
  };
});

/** The listening test lost its render call during an unrelated rewrite and sat
 *  unreachable for weeks while it kept being improved. Assert it is mounted. */
describe("IELTS listening skill page", () => {
  it("mounts the comprehension test alongside the audio library", () => {
    render(<SkillView lang="uz" skill="listening" t={uz.ieltsHub} ieltsT={uz.ielts} />);

    expect(screen.getByText(uz.ieltsHub.listeningTestTitle)).toBeInTheDocument();
    expect(screen.getByText(uz.ielts.aiUnlimited, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(uz.ielts.listeningIntro)).toBeInTheDocument();
  });

  it("leaves the other skills without a comprehension test", () => {
    render(<SkillView lang="uz" skill="writing" t={uz.ieltsHub} ieltsT={uz.ielts} />);
    expect(screen.queryByText(uz.ieltsHub.listeningTestTitle)).not.toBeInTheDocument();
  });
});
