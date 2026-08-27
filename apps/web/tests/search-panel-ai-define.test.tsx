import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import { SearchPanel } from "@/components/library/search-panel";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const EMPTY_PAGE = { items: [], total: 0, page: 1, page_size: 24 };

const AI_WORD = {
  id: "w-slight",
  headword: "slight",
  slug: "slight-adjective",
  pos: "adjective",
  ipa: null,
  audio_url: null,
  image_url: null,
  cefr_level: "B1",
  frequency_rank: null,
  word_family: null,
  common_mistake: null,
  status: "review",
  ai_generated: true,
  category: null,
  senses: [
    {
      id: "s-1",
      sense_order: 1,
      definition_en: "very small in degree or amount.",
      translation_uz: "sezilarli emas",
      translation_ru: "незначительный",
      definition_uz: null,
      definition_ru: null,
      usage_note: null,
      examples: [],
    },
  ],
  relations: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(defineResponse: Response) {
  const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/ai/define-word")) return Promise.resolve(defineResponse);
    if (url.includes("/api/v1/words")) return Promise.resolve(json(200, EMPTY_PAGE));
    return Promise.resolve(json(404, { detail: "not found" }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("SearchPanel AI fallback", () => {
  it("offers an AI lookup on a search miss, and opens the word detail on success", async () => {
    const user = userEvent.setup();
    stubFetch(json(201, AI_WORD));

    render(<SearchPanel lang="en" t={en.library} vocab={en.vocab} />);

    await user.type(screen.getByPlaceholderText(en.library.searchAll), "slightly");
    expect(await screen.findByText(en.library.noResults)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: en.library.aiDefineCta }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "slight" })).toBeInTheDocument());
    // The badge text is component-local copy (word-detail-modal.tsx's
    // modalCopy), not a dictionary key — asserting the literal English
    // string it renders for an ai_generated word.
    expect(screen.getByText(/AI-generated/)).toBeInTheDocument();
  });

  it("shows a clear message when the AI doesn't recognize the term", async () => {
    const user = userEvent.setup();
    stubFetch(json(404, { detail: "not a word" }));

    render(<SearchPanel lang="en" t={en.library} vocab={en.vocab} />);

    await user.type(screen.getByPlaceholderText(en.library.searchAll), "asdkjhaskjdh");
    await user.click(await screen.findByRole("button", { name: en.library.aiDefineCta }));

    expect(await screen.findByText(en.library.aiDefineNotRecognized)).toBeInTheDocument();
  });
});
