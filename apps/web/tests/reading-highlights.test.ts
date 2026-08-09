import { describe, expect, it } from "vitest";

import { restoreHighlights } from "@/components/ielts/reading-practice-view";
import { READING_PRACTICE_TESTS } from "@/lib/reading-practice";

describe("reading highlights", () => {
  it("repairs highlights saved with the old paragraph-label offset", () => {
    const test = READING_PRACTICE_TESTS[0];
    const source = test.passages[0].paragraphs[0].text;
    const word = "For";
    const start = source.indexOf(word);

    window.localStorage.setItem(
      `vocora-reading-practice:${test.id}:highlights`,
      JSON.stringify([
        {
          id: "legacy-highlight",
          passageId: test.passages[0].id,
          paragraphIndex: 0,
          start: start + 1,
          end: start + 1 + word.length,
          text: word,
          color: "yellow",
        },
      ])
    );

    expect(restoreHighlights(test)).toMatchObject([{ start, end: start + word.length }]);
  });
});
