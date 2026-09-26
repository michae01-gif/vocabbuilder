import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { currentRoot, newWordsForRoot, userStats } from "@/lib/data";
import { levelForWordCount } from "@/lib/types";
import { nameStyle } from "@/data/shop";
import { getTodayQuests, claimableRoots, ROOT_COMPLETION_REWARD } from "@/lib/rewards";
import { getTutorialStepDb } from "@/lib/tutorial";
import { weeklyTestStatus } from "@/lib/weekly";
import Mascot from "@/components/mascot";
import TutorialGate from "@/components/tutorial-gate";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireUser();
  const stats = userStats(user.id);
  const root = currentRoot(user.id);
  const fresh = newWordsForRoot(user.id, root.id);
  const tutorial = getTutorialStepDb(user.id);
  const { level } = levelForWordCount(stats.introduced);
  const doneForToday = fresh.length === 0;
  const z = (id: string) => (tutorial?.targetId === id ? "relative z-[80]" : "relative");

  const quests = getTodayQuests(user.id);
  const claimableQuests = quests.filter((q) => !q.claimed && q.progress >= q.target);
  const claimableTrees = claimableRoots(user.id);
  const weekly = weeklyTestStatus(user.id);

  /* Secondary prompts. They stay out of the way entirely unless there is
     something to act on — except during the tutorial, which spotlights the
     rewards pill (step 3) and would softlock if the target didn't exist. */
  const extras: { href: string; icon: string; label: string; cls: string }[] = [];
  if (weekly.eligible > 0) {
    extras.push({
      href: "/weekly-test",
      icon: "🧪",
      label: `Weekly test — ${weekly.eligible} word${weekly.eligible === 1 ? "" : "s"} to reset`,
      cls: "border-sky-300/50 bg-sky-300/10 text-sky-200",
    });
  }
  if (claimableQuests.length > 0) {
    extras.push({
      href: "/rewards",
      icon: "🎁",
      label: `${claimableQuests.length} quest reward${claimableQuests.length === 1 ? "" : "s"} to claim`,
      cls: "border-emerald-300/50 bg-emerald-300/10 text-emerald-200",
    });
  }
  if (claimableTrees.length > 0) {
    extras.push({
      href: "/garden",
      icon: "🌲",
      label: `Claim ${claimableTrees.length * ROOT_COMPLETION_REWARD} 🪙 in the garden`,
      cls: "border-amber-200/50 bg-amber-200/10 text-amber-200",
    });
  }
  if (tutorial?.targetId === "tutorial-rewards") {
    extras.push({
      href: "/rewards",
      icon: "🪙",
      label: "Rewards shop",
      cls: "border-amber-200/50 bg-amber-200/10 text-amber-200",
    });
  }

  return (
    <div className="space-y-5">
      {/* NOTE: no transform-based entrance animation here (e.g. "rise") —
          it creates a stacking context that traps the tutorial overlay
          underneath the sticky nav, breaking the tutorial lockdown. */}

      {/* Compact profile strip */}
      <section className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="mascot-bob shrink-0">
            <Mascot emoji={user.avatar} size={40} />
          </div>
          <div className="min-w-0">
            <p
              className="truncate font-[var(--font-lora)] text-base font-bold leading-tight"
              style={nameStyle(user.name_style)}
            >
              {user.name}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {level.name} · 📚 {stats.introduced} words
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium">
          <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-zinc-300">🔥 {user.streak}</span>
          <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-zinc-300">⚡ {user.xp}</span>
        </div>
      </section>

      {/* TODAY'S SESSION — the dominant element, always */}
      <section>
        <Link
          id="tutorial-session"
          href="/session"
          className={`group flex flex-col items-center gap-4 rounded-3xl bg-amber-200 p-8 text-center text-black shadow-2xl shadow-amber-200/25 transition-all hover:bg-amber-100 active:scale-[0.995] sm:p-12 ${z("tutorial-session")}`}
        >
          <span className="text-6xl sm:text-7xl">{root.emoji}</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/60 sm:text-sm">
              {doneForToday ? "Next root" : "Today's session"}
            </p>
            <h2 className="mt-1 font-[var(--font-lora)] text-3xl font-bold leading-tight sm:text-5xl">
              {doneForToday ? `Explore “${root.root}”` : `Learn “${root.root}”`}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm font-medium text-black/70 sm:text-lg">
              {root.meaning}
              {fresh.length > 0 && (
                <span className="ml-2 rounded-full bg-black/15 px-2.5 py-1 text-xs font-bold">
                  {fresh.length} new word{fresh.length === 1 ? "" : "s"}
                </span>
              )}
            </p>
          </div>
          <span className="rounded-full bg-black px-8 py-4 text-lg font-bold text-amber-100 transition-transform group-hover:scale-105 sm:text-xl">
            ▶ START SESSION
          </span>
          <span className="text-xs font-semibold text-black/50">~5 min</span>
        </Link>
      </section>

      {/* TODAY'S PASSAGE — massive CTA */}
      <section>
        <Link
          id="tutorial-read"
          href="/read"
          className={`group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-4 border-violet-300/70 bg-gradient-to-br from-violet-400/25 via-violet-500/15 to-fuchsia-500/10 px-6 py-12 text-center shadow-2xl shadow-violet-500/20 transition-all hover:border-violet-300 hover:from-violet-400/35 hover:via-violet-500/25 hover:to-fuchsia-500/20 active:scale-[0.995] sm:py-16 ${z("tutorial-read")}`}
        >
          <span className="text-5xl sm:text-6xl">📖</span>
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-violet-200/80">
            Today&apos;s passage
          </span>
          <span className="font-[var(--font-lora)] text-4xl font-bold leading-none text-white sm:text-6xl">
            START A PASSAGE
          </span>
          <span className="max-w-md text-sm text-zinc-300 sm:text-base">
            Meet your words alive in a real passage — tap each one you recognize.
          </span>
          <span className="mt-1 rounded-full bg-violet-300 px-7 py-3 text-base font-bold text-black transition-transform group-hover:scale-105 sm:text-lg">
            Start reading →
          </span>
        </Link>
      </section>

      {/* Secondary prompts — only when there is something to act on */}
      {extras.length > 0 && (
        <section className="flex flex-wrap justify-center gap-2.5">
          {extras.map((e) => (
            <Link
              key={e.href + e.label}
              id={e.label === "Rewards shop" ? "tutorial-rewards" : undefined}
              href={e.href}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all hover:brightness-125 ${e.cls}`}
            >
              <span>{e.icon}</span>
              {e.label}
            </Link>
          ))}
        </section>
      )}

      {/* CoD-style forced tutorial overlay */}
      {tutorial && <TutorialGate def={tutorial} />}
    </div>
  );
}
