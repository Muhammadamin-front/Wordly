/** Mirrors LISTENING_FULL_TESTS' audio-relevant content (title + per-section
 *  turns only — never questions/answers) into apps/api/app/content/listening/
 *  as one JSON file per test, so the backend can synthesize section audio
 *  from a fixed, checked-in catalog without ever seeing an answer key.
 *
 *  Run manually after any edit to lib/listening-practice.ts:
 *    node apps/web/scripts/emit-listening-audio-content.mjs
 *  (same technique as localize-ielts.mjs: transpile the TS module in-process
 *  and evaluate it to get the real exported data, no build step required.)
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.resolve(HERE, "../lib/listening-practice.ts");
const OUTPUT_DIR = path.resolve(HERE, "../../api/app/content/listening");

function loadSource() {
  const source = fs.readFileSync(SOURCE, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(`(function(exports,module){${code}\n})(module.exports,module);`, {
    module: compiledModule,
  });
  return compiledModule.exports;
}

function main() {
  const { LISTENING_FULL_TESTS } = loadSource();
  if (!Array.isArray(LISTENING_FULL_TESTS)) {
    throw new Error("LISTENING_FULL_TESTS not found — did the export name change?");
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const test of LISTENING_FULL_TESTS) {
    const payload = {
      slug: test.slug,
      title: test.title,
      sections: test.sections.map((section) => ({
        number: section.number,
        turns: section.turns,
      })),
    };
    const outPath = path.join(OUTPUT_DIR, `${test.slug}.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`Wrote ${outPath}`);
  }
}

main();
