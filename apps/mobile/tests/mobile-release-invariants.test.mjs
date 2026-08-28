import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const mobileRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function source(relativePath) {
  return readFile(path.join(mobileRoot, relativePath), "utf8");
}

async function tsxFiles(directory) {
  const absolute = path.join(mobileRoot, directory);
  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) return tsxFiles(relative);
    return entry.isFile() && entry.name.endsWith(".tsx") ? [relative] : [];
  }));
  return nested.flat();
}

test("custom IELTS word highlighting does not also activate native multi-word selection", async () => {
  const file = await source("src/components/ielts/reading-practice-native.tsx");
  const component = file.slice(file.indexOf("function InteractiveParagraph"), file.indexOf("function hasAnswer"));
  assert.ok(component.includes("onLongPress"), "word-level long press must remain available");
  assert.doesNotMatch(component, /<Text\s+selectable\b/, "native selectable text expands the same gesture to neighbouring words");
});

test("accent foregrounds use a semantic token instead of the raised surface token", async () => {
  const files = [...await tsxFiles("app"), ...await tsxFiles("src")];
  const offenders = [];
  for (const file of files) {
    const contents = await source(file);
    if (/color\s*:\s*colors\.raised\b|color=\{colors\.raised\}/.test(contents)) offenders.push(file);
  }
  assert.deepEqual(offenders, [], `raised is a surface token and becomes dark in dark mode: ${offenders.join(", ")}`);
});

test("dark hero surfaces do not reuse the theme-swapped ink foreground token", async () => {
  const files = [...await tsxFiles("app"), ...await tsxFiles("src")];
  const offenders = [];
  for (const relative of files) {
    const file = await source(relative);
    if (/backgroundColor:\s*colors\.brand950/.test(file)) offenders.push(relative);
  }
  assert.deepEqual(offenders, []);
});

test("delayed game callbacks use the unmount-safe timeout registry", async () => {
  const files = [
    "src/components/games/memory-game.tsx",
    "src/components/games/match-game.tsx",
    "src/components/games/word-search-game.tsx",
    "src/components/games/crossword-game.tsx",
  ];
  for (const file of files) {
    const contents = await source(file);
    assert.ok(contents.includes("useTimeoutRegistry"), `${file} must clear delayed callbacks on unmount`);
    assert.doesNotMatch(contents, /\bsetTimeout\s*\(/, `${file} still contains an unmanaged timer`);
  }
});

test("logout clears local credentials before best-effort network cleanup", async () => {
  const file = await source("src/providers/auth-provider.tsx");
  const logout = file.slice(file.indexOf("const logout ="), file.indexOf("const updateUser ="));
  assert.doesNotMatch(logout, /await pushTokenApi\.unregister/);
  assert.doesNotMatch(logout, /await authApi\.logout/);
  assert.ok(logout.indexOf("clearCredentials()") < logout.indexOf("pushTokenApi.unregister"));
});
