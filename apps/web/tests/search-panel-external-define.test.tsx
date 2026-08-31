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

const EXTERNAL_WORD = {
  id: "w-hello",
  headword: "hello",
  slug: "hello-interjection",
  pos: "interjection",
  ipa: "/həˈloʊ/",
  audio_url: null,
  image_url: null,
  cefr_level: "B1",
  frequency_rank: null,
  word_family: null,
  common_mistake: null,
  status: "review",
  ai_generated: false,
  category: null,
  senses: [
    {
      id: "s-1",
      sense_order: 1,
      definition_en: "A greeting.",
      translation_uz: "hello",
      translation_ru: "hello",
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

function stubFetch(externalResponse: Response) {
  const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/words/define-external")) return Promise.resolve(externalResponse);
    if (url.includes("/api/v1/words")) return Promise.resolve(json(200, EMPTY_PAGE));
    return Promise.resolve(json(404, { detail: "not found" }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("SearchPanel free-dictionary fallback", () => {
  it("auto-tries the free dictionary on a search miss and opens the word directly, no click needed", async () => {
    const user = userEvent.setup();
    stubFetch(json(201, EXTERNAL_WORD));

    render(<SearchPanel lang="en" t={en.library} vocab={en.vocab} />);

    await user.type(screen.getByPlaceholderText(en.library.searchAll), "hello");

    // Opens straight to the word detail — no click needed, unlike the AI
    // fallback which stays behind an explicit button.
    await waitFor(() => expect(screen.getByRole("heading", { name: "hello" })).toBeInTheDocument());
  });

  it("falls through to the AI-lookup button when the free dictionary also has nothing", async () => {
    const user = userEvent.setup();
    stubFetch(json(404, { detail: "not found" }));

    render(<SearchPanel lang="en" t={en.library} vocab={en.vocab} />);

    await user.type(screen.getByPlaceholderText(en.library.searchAll), "asdkjhaskjdh");

    expect(await screen.findByText(en.library.noResults)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.library.aiDefineCta })).toBeInTheDocument();
  });
});
