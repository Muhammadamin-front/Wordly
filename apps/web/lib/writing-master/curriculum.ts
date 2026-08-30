import { type WritingTask, type WritingTaskVisual } from "@/lib/ielts";

/** Master Writing units, in teaching order — process first, since a
 *  process diagram is the most visually distinct and forgiving starting
 *  point, then the four data-chart types. Kept in step with
 *  FREE_WRITING_MASTER_UNITS in apps/api/app/services/plans.py (only
 *  "process" is free) and with WritingTaskVisual["kind"] — each unit is
 *  just a filter over the existing WRITING_TASKS bank, no new prompt
 *  content. */
export interface MasterUnit {
  slug: string;
  kind: WritingTaskVisual["kind"];
  title: string;
  titleUz: string;
  vocabularySlug: string; // apps/web/lib/ielts-resources.ts VocabularyResource slug
}

export const MASTER_UNITS: MasterUnit[] = [
  { slug: "process", kind: "image", title: "Process diagrams", titleUz: "Process diagrammalar", vocabularySlug: "task1-process-language" },
  { slug: "bar-chart", kind: "bar", title: "Bar charts", titleUz: "Bar chartlar", vocabularySlug: "task1-trend-vocabulary" },
  { slug: "line-graph", kind: "line", title: "Line graphs", titleUz: "Line grafiklar", vocabularySlug: "task1-trend-vocabulary" },
  { slug: "table", kind: "table", title: "Tables", titleUz: "Jadvallar", vocabularySlug: "task1-comparison-vocabulary" },
  { slug: "pie-chart", kind: "pie-pair", title: "Pie charts", titleUz: "Pie chartlar", vocabularySlug: "task1-proportion-vocabulary" },
];

/** Frontend mirror of FREE_WRITING_MASTER_UNITS in
 *  apps/api/app/services/plans.py — UI-only signpost, same caveat as
 *  FREE_GRAMMAR_LEVELS: the real gate is server-side on every route that
 *  spends anything (the drill endpoints, the attempt endpoint). */
export const FREE_WRITING_MASTER_UNITS: readonly string[] = ["process"];

export function unitBySlug(slug: string): MasterUnit | undefined {
  return MASTER_UNITS.find((u) => u.slug === slug);
}

export function tasksForUnit(unit: MasterUnit, tasks: Record<string, WritingTask[]>): WritingTask[] {
  return (tasks.task1 ?? []).filter((t) => t.visual?.kind === unit.kind);
}

/** Training threshold: pass the full-practice step at goal minus a realistic
 *  margin, not the goal itself — a learner working toward 7 should not need
 *  a 7 in practice to move on. Falls back to a sensible default (6.0, i.e.
 *  a 5.0 pass mark) when no goal is set yet. */
export function passBand(targetBandScore: number | null): number {
  return (targetBandScore ?? 6.0) - 1.0;
}
