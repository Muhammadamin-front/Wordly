import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ListeningAudioLibrary } from "@/components/ielts/listening-audio-library";

/** Tracks were grouped by their position in the list — the first thirty were
 *  "Foundation", the last thirty "Work & travel" — so the filter said nothing
 *  about the content. "A Death", "A Birth" and "Talking About Pets" sat under
 *  work and travel; "Getting A Visa" and "At The Customs" sat under
 *  foundation.
 *
 *  The library renders each track in both a compact and a full list, so every
 *  lookup here counts matches rather than expecting exactly one node. */
async function chooseGroup(name: RegExp) {
  const [button] = screen.getAllByRole("button", { name });
  await userEvent.click(button);
}

const shown = (text: RegExp) => screen.queryAllByText(text).length;

describe("listening library grouping", () => {
  it("files travel and admin conversations under Work & travel", async () => {
    render(<ListeningAudioLibrary />);
    await chooseGroup(/Work & travel/i);

    expect(shown(/Getting A Visa/i)).toBeGreaterThan(0);
    expect(shown(/At The Customs/i)).toBeGreaterThan(0);
    expect(shown(/Travelling By Air/i)).toBeGreaterThan(0);

    // The ones the old index-based split misfiled into this group.
    expect(shown(/Talking About Pets/i)).toBe(0);
    expect(shown(/Weekend Plans/i)).toBe(0);
  });

  it("files personal news under Social & feelings", async () => {
    render(<ListeningAudioLibrary />);
    await chooseGroup(/Social & feelings/i);

    expect(shown(/A Death/i)).toBeGreaterThan(0);
    expect(shown(/A Birth/i)).toBeGreaterThan(0);
    expect(shown(/At The Customs/i)).toBe(0);
  });

  it("files health and service conversations under Health & services", async () => {
    render(<ListeningAudioLibrary />);
    await chooseGroup(/Health & services/i);

    expect(shown(/Doctors Appointment/i)).toBeGreaterThan(0);
    expect(shown(/I Have A Sore Throat/i)).toBeGreaterThan(0);
    expect(shown(/Getting A Visa/i)).toBe(0);
  });

  it("does not match a keyword inside a longer word", async () => {
    // "im-busy-on-friday" contains "bus"; segment matching keeps it out of travel.
    render(<ListeningAudioLibrary />);
    await chooseGroup(/Work & travel/i);
    expect(shown(/Im Busy On Friday/i)).toBe(0);
  });

  it("keeps every track reachable from All", async () => {
    render(<ListeningAudioLibrary />);
    await chooseGroup(/^All$/i);
    expect(shown(/At Home 1/i)).toBeGreaterThan(0);
    expect(shown(/Photography Class/i)).toBeGreaterThan(0);
    expect(shown(/A Death/i)).toBeGreaterThan(0);
  });
});
