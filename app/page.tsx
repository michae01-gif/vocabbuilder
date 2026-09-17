import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { currentRoot, newWordsForRoot, userStats, wordCountTotal, rootCountTotal, todayString } from "@/lib/data";
import { levelForWordCount } from "@/lib/types";
import { bannerCss, frameStyle, nameStyle } from "@/data/shop";
import { getTodayQuests, claimableRoots, ROOT_COMPLETION_REWARD } from "@/lib/rewards";
import { getTutorialStepDb } from "@/lib/tutorial";
import Wheel from "@/components/wheel";
import Quests from "@/components/quests";
import Mascot from "@/components/mascot";
import TutorialGate from "@/components/tutorial-gate";

export const dynamic = "force-dynamic";

const GREETINGS = [
  "Ready to forge some words? 🔨",
  "New roots await, boss! 🌱",
  "Big words, big brain 🧠",
  "Your vocabulary misses you 📚",
  "Erudite o'clock! ⏰",
  "Let's get loquacious! 🗣️",
  "One session a day keeps the blank mind away 🌱",
];

export default async function Home() {
  const user = await requireUser();
  const stats = userStats(user.id);
  const total = wordCountTotal();
  const root = currentRoot(user.id);
  const fresh = newWordsForRoot(user.id, root.id);
  const quests = getTodayQuests(user.id);
  const claimableTrees = claimableRoots(user.id);
  const tutorial = getTutorialStepDb(user.id);
  const { level } = levelForWordCount(stats.introduced);
  const pct = Math.round((stats.introduced / total) * 100);
  const doneForToday = fresh.length === 0;
  const greeting = GREETINGS[new Date().getDay() % GREETINGS.length];
  const z = (id: string) => (tutorial?.targetId === id ? "relative z-[80]" : "relative");

  return (
    <div className="rise space-y-8">
      {/* Hero: animated profile card */}
      <section className="relative flex flex-col items-center gap-4 pt-4 text-center">
        <span className="float-slow pointer-events-none absolute left-[6%] top-6 z-0 text-xl">✨</span>
        <span className="float-slow pointer-events-none absolute right-[8%] top-14 z-0 text-lg" style={{ animationDelay: "0.7s" }}>⭐</span>
        <span className="float-slow pointer-events-none absolute left-[14%] bottom-0 z-0 text-base" style={{ animationDelay: "1.4s" }}>💫</span>
        <span className="float-slow pointer-events-none absolute right-[16%] bottom-2 z-0 text-lg" style={{ animationDelay: "2s" }}>✨</span>

        <div className="pop relative z-20 rounded-2xl rounded-bl-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-zinc-100 backdrop-blur">
          {greeting}
        </div>

        <div
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 shadow-2xl"
          style={{ background: bannerCss(user.banner), ...frameStyle(user.frame) }}
        >
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative flex items-center gap-4 p-5 sm:gap-5 sm:p-6">
            <div className="mascot-bob -ml-1 shrink-0">
              <Mascot emoji={user.avatar} size={108} dance className="drop-shadow-xl" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate font-[var(--font-lora)] text-2xl font-bold drop-shadow" style={nameStyle(user.name_style)}>
                {user.name}
              </p>
              <p className="truncate text-sm font-medium text-white/90">
                {level.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                  🔥 {user.streak}-day streak
                </span>
                <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                  📚 {stats.introduced} words
                </span>
                <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                  ⚡ {user.xp} XP
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border border-white/25 bg-black/40 px-4 py-3 shadow-lg">
              <span className="text-2xl">🪙</span>
              <span className="font-[var(--font-lora)] text-xl font-bold leading-none text-amber-200">{user.coins}</span>
            </div>
          </div>
        </div>

        <h1 className="font-[var(--font-lora)] text-3xl font-bold tracking-tight text-shadow-soft sm:text-4xl">
          Forge your <span className="text-amber-200">erudite</span> vocabulary
        </h1>
      </section>

      {/* START HERE — the one obvious thing to do */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">⚡</span>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Start here</h2>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-500">
            ~5 min
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          {/* Primary: today's session */}
          <Link
            id="tutorial-session"
            href="/session"
            className={`group flex flex-col justify-between gap-3 rounded-2xl bg-amber-200 p-5 text-black shadow-lg shadow-amber-200/20 transition-all hover:bg-amber-100 active:scale-[0.99] ${z("tutorial-session")}`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-3xl">{root.emoji}</span>
              {fresh.length > 0 && (
                <span className="rounded-full bg-black/15 px-2 py-0.5 text-[11px] font-bold">
                  {fresh.length} new words
                </span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/60">
                {doneForToday ? "Next root" : "Today's session"}
              </p>
              <h3 className="font-[var(--font-lora)] text-xl font-bold leading-tight">
                {doneForToday ? `Explore “${root.root}”` : `Learn “${root.root}” — ${root.meaning}`}
              </h3>
              <p className="mt-1 text-[13px] font-medium text-black/70 group-hover:underline">
                ▶ START session →
              </p>
            </div>
          </Link>

          {/* Secondary: read */}
          <Link
            id="tutorial-read"
            href="/read"
            className={`group flex flex-col justify-between gap-3 rounded-2xl border border-violet-300/30 bg-gradient-to-br from-violet-300/15 to-transparent p-5 transition-all hover:border-violet-300/60 ${z("tutorial-read")}`}
          >
            <span className="text-2xl">📖</span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-300/80">Read</p>
              <h3 className="mt-0.5 font-[var(--font-lora)] text-lg font-semibold leading-tight">A passage with your words</h3>
              <p className="mt-1 text-[12px] font-medium text-violet-300 group-hover:underline">Read a passage →</p>
            </div>
          </Link>

          {/* Secondary: review */}
          <Link
            id="tutorial-review"
            href="/review"
            className={`group flex flex-col justify-between gap-3 rounded-2xl border border-emerald-300/30 bg-gradient-to-br from-emerald-300/15 to-transparent p-5 transition-all hover:border-emerald-300/60 ${z("tutorial-review")}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">🔄</span>
              {stats.due > 0 && (
                <span className="rounded-full bg-emerald-300/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                  {stats.due} due
                </span>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300/80">Review</p>
              <h3 className="mt-0.5 font-[var(--font-lora)] text-lg font-semibold leading-tight">Lock in what you learned</h3>
              <p className="mt-1 text-[12px] font-medium text-emerald-300 group-hover:underline">Review words →</p>
            </div>
          </Link>

          {/* Secondary: rewards */}
          <Link
            id="tutorial-rewards"
            href="/rewards"
            className={`group flex flex-col justify-between gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.07] to-transparent p-5 transition-all hover:border-amber-200/40 ${z("tutorial-rewards")}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">🪙</span>
              <span className="rounded-full border border-amber-200/30 bg-amber-200/10 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                {user.coins}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-200/70">Rewards</p>
              <h3 className="mt-0.5 font-[var(--font-lora)] text-lg font-semibold leading-tight">Spend coins on mascots &amp; themes</h3>
              <p className="mt-1 text-[12px] font-medium text-amber-200/90 group-hover:underline">Open shop →</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Daily rewards: wheel + quests (demoted below the fold) */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Wheel
          coins={user.coins}
          spunToday={user.last_spin_date === todayString()}
          avatar={user.avatar}
        />
        <Quests quests={quests} />
      </section>

      {/* Root tree rewards banner */}
      {claimableTrees.length > 0 && (
        <section>
          <Link
            href="/garden"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-200/15 to-transparent p-5 shadow-lg shadow-amber-200/10 transition-all hover:border-amber-200/70"
          >
            <div className="flex items-center gap-4">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <span className="claim-badge absolute inset-0 flex items-center justify-center rounded-full border-2 border-amber-200 bg-rose-500 text-lg font-black text-white shadow-lg">
                  !
                </span>
              </span>
              <div>
                <p className="font-[var(--font-lora)] text-lg font-semibold">
                  {claimableTrees.length === 1
                    ? `“${claimableTrees[0].root}” tree complete!`
                    : `${claimableTrees.length} family trees complete!`}
                </p>
                <p className="text-sm text-zinc-400">
                  Claim your {claimableTrees.length * ROOT_COMPLETION_REWARD} 🪙 in the garden.
                </p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-semibold text-amber-200 group-hover:underline">
              Claim →
            </span>
          </Link>
        </section>
      )}

      {/* Quick Stats */}
      <section className="grid gap-4 sm:grid-cols-4">
        <StatCard
          label="Word families"
          value={`${stats.rootsExplored} / ${rootCountTotal()}`}
          icon="🌲"
          sub="explored"
        />
        <StatCard
          label="Mastered"
          value={String(stats.mastered)}
          icon="🏆"
          sub="words"
          accent={stats.mastered > 0}
        />
        <StatCard
          label="Producing"
          value={String(stats.produced + stats.recalled)}
          icon="✍️"
          sub="active recall"
        />
        <StatCard
          label="Total XP"
          value={String(user.xp)}
          icon="⚡"
          sub={`~${Math.round(user.xp / 10)} min studied`}
        />
      </section>

      {/* Mastery ladder mini */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-zinc-400">Mastery journey</p>
          <Link href="/garden" className="text-xs text-amber-200/70 hover:text-amber-200">View garden →</Link>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {["🌱", "🌿", "💧", "⚖️", "✍️", "🔀", "🏆"].map((icon, i) => {
            const count = stats.introduced > 0 ? Math.min(1, Math.max(0, (stats.mastered / Math.max(stats.introduced, 1)) * 7 - i)) : 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className={`text-lg ${count > 0 ? "" : "opacity-30"}`}>{icon}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300 transition-all duration-700"
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </section>

      {/* CoD-style forced tutorial overlay */}
      {tutorial && <TutorialGate def={tutorial} />}
    </div>
  );
}

function StatCard({ label, value, icon, sub, accent }: { label: string; value: string; icon: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-amber-200/30 bg-amber-200/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
      <div className="mb-2 text-xl">{icon}</div>
      <p className="font-[var(--font-lora)] text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">
        {label} {sub && <span className="text-zinc-600">· {sub}</span>}
      </p>
    </div>
  );
}
