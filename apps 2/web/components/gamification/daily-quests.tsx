"use client";

import { motion } from "framer-motion";
import { Award, BrainCircuit, Check, ChevronRight, Flame, Link2, Target, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  gamificationApi,
  QUESTS_CHANGED_EVENT,
  type DailyQuest,
  type DailyQuests,
} from "@/lib/gamification";
import { questHref, questProgressPercent } from "@/lib/quests";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

function questCopy(code: string, gam: Dictionary["gam"]): { title: string; body: string; icon: Icon } {
  switch (code) {
    case "correct_5":
      return { title: gam.questCorrect5, body: gam.questCorrect5Desc, icon: Target };
    case "combo_3":
      return { title: gam.questCombo3, body: gam.questCombo3Desc, icon: Flame };
    case "phrasal_5":
    case "phrasal_blank_5":
      return { title: gam.questPhrasal5, body: gam.questPhrasal5Desc, icon: Link2 };
    case "memory_1":
      return { title: gam.questMemory1, body: gam.questMemory1Desc, icon: BrainCircuit };
    case "complete_2":
      return { title: gam.questComplete2, body: gam.questComplete2Desc, icon: Award };
    case "perfect_1":
      return { title: gam.questPerfect1, body: gam.questPerfect1Desc, icon: Zap };
    // match_1 and story_1 are both "finish one round"; they differ only in
    // which game the card links to.
    default:
      return { title: gam.questComplete1, body: gam.questComplete1Desc, icon: Award };
  }
}

function QuestCard({ lang, quest, gam }: { lang: string; quest: DailyQuest; gam: Dictionary["gam"] }) {
  const copy = questCopy(quest.code, gam);
  const Icon = copy.icon;
  return (
    <Link
      href={questHref(lang, quest)}
      aria-label={`${copy.title}: ${quest.progress}/${quest.target}`}
      className="group relative overflow-hidden rounded-lg border border-line bg-card/82 p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-400/55 hover:shadow-[0_18px_45px_rgba(12,89,76,0.13)]"
    >
      <div className="flex items-start gap-3">
        <span className={quest.completed ? "icon-tile size-10 bg-success/12 text-success" : "icon-tile size-10 text-brand-600 dark:text-brand-300"}>
          {quest.completed ? <Check className="size-5" aria-hidden /> : <Icon className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-ink">{copy.title}</h3>
              <p className="mt-1 text-xs leading-5 text-ink-soft">{copy.body}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-accent-700 dark:text-accent-300">
              <Zap className="size-3.5" aria-hidden />+{quest.xp_reward}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <motion.div
                className={quest.completed ? "h-full rounded-full bg-success" : "h-full rounded-full bg-linear-to-r from-brand-500 to-accent-400"}
                initial={{ width: 0 }}
                animate={{ width: `${questProgressPercent(quest)}%` }}
              />
            </div>
            <span className="min-w-10 text-right text-xs font-black text-ink-soft">
              {quest.progress}/{quest.target}
            </span>
            <ChevronRight className="size-4 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function DailyQuestsPanel({ lang, gam }: { lang: string; gam: Dictionary["gam"] }) {
  const { ready, user } = useAuth();
  const [data, setData] = useState<DailyQuests | null>(null);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    const load = () => gamificationApi.dailyQuests().then((value) => !cancelled && setData(value)).catch(() => {});
    load();
    window.addEventListener(QUESTS_CHANGED_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(QUESTS_CHANGED_EVENT, load);
    };
  }, [ready, user]);

  if (!ready || !user || !data) return null;

  return (
    <section className="mt-6 border-y border-line py-6" aria-labelledby="daily-quests-title">
      <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,2.3fr)] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-accent-700 dark:text-accent-300">
            <Award className="size-4" aria-hidden />
            {gam.dailyQuests}
          </div>
          <h2 id="daily-quests-title" className="mt-2 text-2xl font-black text-ink">
            {data.completed_count}/{data.total_count} {gam.questsComplete}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-ink-soft">{gam.questsSubtitle}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-accent-400/35 bg-accent-400/10 px-3 py-2 text-sm font-black text-ink">
            <Zap className="size-4 text-accent-600 dark:text-accent-300" aria-hidden />
            {data.game_xp_today} {gam.gameXpToday}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {data.quests.map((quest) => <QuestCard key={quest.code} lang={lang} quest={quest} gam={gam} />)}
        </div>
      </div>
    </section>
  );
}
