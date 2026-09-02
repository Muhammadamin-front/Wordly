import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { WordCard } from "@/components/library/word-card";
import { WordCarouselModal } from "@/components/library/word-carousel-modal";
import type { Word, WordListItem } from "@/lib/vocab";

const WORDS: WordListItem[] = [
  {
    id: "alpha",
    headword: "alpha",
    slug: "alpha",
    pos: "noun",
    ipa: "ˈælfə",
    cefr_level: "B1",
    frequency_rank: 100,
    status: "published",
    category: null,
    primary_translation_uz: "alfa",
    primary_translation_ru: "альфа",
    primary_example_en: "Alpha is the first letter.",
    image_url: null,
  },
  {
    id: "bravo",
    headword: "bravo",
    slug: "bravo",
    pos: "interjection",
    ipa: null,
    cefr_level: "B2",
    frequency_rank: 200,
    status: "published",
    category: null,
    primary_translation_uz: "barakalla",
    primary_translation_ru: "браво",
    primary_example_en: "Bravo, that was excellent.",
    image_url: null,
  },
  {
    id: "charlie",
    headword: "charlie",
    slug: "charlie",
    pos: "noun",
    ipa: null,
    cefr_level: "B2",
    frequency_rank: 300,
    status: "published",
    category: null,
    primary_translation_uz: "charli",
    primary_translation_ru: "чарли",
    primary_example_en: "Charlie arrived early.",
    image_url: null,
  },
];

const DETAILS = Object.fromEntries(
  WORDS.map((word) => [
    word.id,
    {
      ...word,
      audio_url: null,
      image_url: word.image_url ?? null,
      word_family: null,
      common_mistake: null,
      senses: [
        {
          id: `${word.id}-sense`,
          definition_en: `${word.headword} definition`,
          translation_uz: word.primary_translation_uz ?? "",
          translation_ru: word.primary_translation_ru ?? "",
          examples: [],
        },
      ],
      relations: [],
    } satisfies Word,
  ])
) as Record<string, Word>;

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("word library carousel", () => {
  it("opens directly from a word card while preserving a separate flip control", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(
      <WordCard
        word={WORDS[0]}
        lang="en"
        accentText="text-brand-600"
        added={false}
        onAdd={vi.fn()}
        onOpen={onOpen}
        labels={{
          add: en.library.addWord,
          addedLabel: en.library.addedWord,
          listen: en.library.listen,
          flip: en.library.flipCard,
          unflip: en.library.flipBack,
          details: en.library.viewDetails,
        }}
      />
    );

    await user.click(screen.getByRole("button", { name: `alpha. ${en.library.viewDetails}` }));
    expect(onOpen).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: en.library.flipCard })).toBeInTheDocument();
  });

  it("moves through words with controls and closes with Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onAdd = vi.fn();

    function Harness() {
      const [activeWord, setActiveWord] = useState(WORDS[0]);
      return (
        <WordCarouselModal
          words={WORDS}
          activeWord={activeWord}
          detail={DETAILS[activeWord.id]}
          loading={false}
          lang="en"
          labels={en.vocab}
          addedIds={new Set()}
          onAdd={onAdd}
          onSelect={setActiveWord}
          onClose={onClose}
        />
      );
    }

    render(<Harness />);

    expect(screen.getByRole("dialog", { name: "Word carousel" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "alpha" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "bravo" })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("heading", { name: "charlie" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add to my cards" }));
    expect(onAdd).toHaveBeenCalledWith(WORDS[2]);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps long vocabulary and mobile carousel controls responsive", () => {
    const longWord = {
      ...WORDS[0],
      headword: "достопримечательность",
    };

    render(
      <WordCarouselModal
        words={[longWord, ...WORDS.slice(1)]}
        activeWord={longWord}
        detail={{ ...DETAILS.alpha, headword: longWord.headword }}
        loading={false}
        lang="ru"
        labels={en.vocab}
        addedIds={new Set()}
        onAdd={vi.fn()}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: longWord.headword })).toHaveClass(
      "word-carousel-headword"
    );
    expect(screen.getByText(longWord.headword, { selector: ".word-carousel-slide-title" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Назад" })).toHaveClass("min-w-11");
    expect(screen.getByRole("button", { name: "Далее" })).toHaveClass("min-w-11");
  });
});
