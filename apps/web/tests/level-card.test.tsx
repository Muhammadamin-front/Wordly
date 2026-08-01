import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { LevelCard } from "@/components/library/level-card";
import { SHELVES } from "@/lib/library";

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterAll(() => vi.unstubAllGlobals());

describe("LevelCard", () => {
  it("shows the live expression count with its localized unit", () => {
    const meta = SHELVES.find((shelf) => shelf.slug === "expressions");
    expect(meta).toBeDefined();

    render(
      <LevelCard
        lang="uz"
        meta={meta!}
        strings={{
          name: "Iboralar",
          desc: "Ravon gapirish uchun native iboralar.",
          unit: "ibora",
        }}
        total={812}
        learned={0}
        labels={{
          words: "so'z",
          learned: "o'rganildi",
          continue: "Davom ettirish",
          start: "Boshlash",
          soon: "Tez kunda",
        }}
      />
    );

    expect(screen.getByText("812 ibora")).toBeInTheDocument();
  });
});
