import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.resolve(HERE, "../lib/ielts-resources.ts");
const OUTPUT = path.resolve(HERE, "../lib/ielts-localized.json");
const CACHE = path.resolve(HERE, "../../api/scripts/data/ielts_translation_cache.json");

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translate(text, target, cache) {
  const key = `${target}:${text}`;
  if (cache[key]) return cache[key];
  const query = new URLSearchParams({ client: "gtx", sl: "en", tl: target, dt: "t", q: text });
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?${query}`, {
        headers: { "User-Agent": "Vocora/1.0" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const value = payload[0].map((part) => part[0]).join("").trim();
      if (value) {
        cache[key] = value;
        fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
        await sleep(100);
        return value;
      }
    } catch {
      await sleep(1000 + attempt * 2000);
    }
  }
  throw new Error(`Translation failed (${target}): ${text}`);
}

async function localizeSection(section, target, cache) {
  return {
    ...section,
    title: await translate(section.title, target, cache),
    eyebrow: await translate(section.eyebrow, target, cache),
    description: await translate(section.description, target, cache),
    steps: section.steps
      ? await Promise.all(section.steps.map((item) => translate(item, target, cache)))
      : undefined,
    traps: section.traps
      ? await Promise.all(section.traps.map((item) => translate(item, target, cache)))
      : undefined,
  };
}

async function localizeSkill(content, target, cache) {
  return {
    ...content,
    title: await translate(content.title, target, cache),
    eyebrow: await translate(content.eyebrow, target, cache),
    description: await translate(content.description, target, cache),
    stats: await Promise.all(
      content.stats.map(async (stat) => ({
        ...stat,
        label: await translate(stat.label, target, cache),
      }))
    ),
    sections: await Promise.all(
      content.sections.map((section) => localizeSection(section, target, cache))
    ),
  };
}

async function localizeResource(resource, target, cache) {
  return {
    ...resource,
    title: await translate(resource.title, target, cache),
    eyebrow: await translate(resource.eyebrow, target, cache),
    description: await translate(resource.description, target, cache),
    groups: await Promise.all(
      resource.groups.map(async (group) => ({
        ...group,
        title: await translate(group.title, target, cache),
        note: await translate(group.note, target, cache),
      }))
    ),
  };
}

async function main() {
  const source = loadSource();
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
  const output = {};
  for (const target of ["uz", "ru"]) {
    output[target] = {
      skills: Object.fromEntries(
        await Promise.all(
          Object.entries(source.IELTS_SKILL_CONTENT).map(async ([key, content]) => [
            key,
            await localizeSkill(content, target, cache),
          ])
        )
      ),
      resources: await Promise.all(
        source.IELTS_VOCABULARY_RESOURCES.map((resource) =>
          localizeResource(resource, target, cache)
        )
      ),
      topicGroups: Object.fromEntries(
        await Promise.all(
          Object.keys(source.SPEAKING_TOPICS).map(async (group) => [
            group,
            await translate(group, target, cache),
          ])
        )
      ),
    };
  }
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`IELTS locale data written: ${OUTPUT}`);
}

await main();
