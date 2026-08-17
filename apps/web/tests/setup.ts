import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom ships no matchMedia. Components that branch on a breakpoint need one,
// and the default of "no match" puts them on the wide layout under test.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Nor does jsdom implement scrolling; components that keep an active item in
// view call this and only care that it is there.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// RTL auto-cleanup needs vitest globals; we don't use them, so do it explicitly.
afterEach(() => {
  cleanup();
});
