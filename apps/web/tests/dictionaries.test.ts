import { describe, expect, it } from "vitest";

import en from "@/app/[lang]/dictionaries/en.json";
import ru from "@/app/[lang]/dictionaries/ru.json";
import uz from "@/app/[lang]/dictionaries/uz.json";

type Tree = { [key: string]: string | Tree };

function keyPaths(tree: Tree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : keyPaths(value as Tree, path);
  });
}

describe("dictionaries", () => {
  const enKeys = keyPaths(en as Tree).sort();

  it.each([
    ["uz", uz],
    ["ru", ru],
  ])("locale %s has exactly the same keys as en", (_name, dict) => {
    expect(keyPaths(dict as Tree).sort()).toEqual(enKeys);
  });

  it("has no empty translations", () => {
    for (const dict of [en, ru, uz]) {
      const walk = (tree: Tree, path: string) => {
        for (const [key, value] of Object.entries(tree)) {
          if (typeof value === "string") {
            expect(value.trim(), `${path}.${key}`).not.toHaveLength(0);
          } else {
            walk(value as Tree, `${path}.${key}`);
          }
        }
      };
      walk(dict as Tree, "");
    }
  });
});
