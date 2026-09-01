import { getDb } from "@/lib/db";
import {
  getOrCreateUser,
  userStats,
  wordCountTotal,
  rootCountTotal,
  reviewsLastDays,
  gardenData,
} from "@/lib/data";
import { levelForWordCount } from "@/lib/types";
import { stageMeta } from "@/lib/stage";
import {
  getDailyActiveDays,
  getRetentionCohort,
  getSessionStats,
  getLearningVelocity,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  const db = getDb();
  const user = getOrCreateUser();
  const stats = userStats(user.id);
  const total = wordCountTotal();
  const { level, next } = levelForWordCount(stats.introduced);
  const days = reviewsLastDays(user.id, 14);
  const trees = gardenData(user.id);

  const stageCounts = new Map<string, number>();
  for (const t of trees) {
    for (const w of t.words) {
      stageCounts.set(w.stage, (stageCounts.get(w.stage) ?? 0) + 1);
    }
  }

  const avgStability =
    (db
      .prepare("SELECT AVG(stability) AS s FROM progress WHERE user_id = ? AND state = 2")
      .get(user.id) as { s: number | null }).s ?? 0;

  const ratings = db
    .prepare(
      `SELECT r.rating, COUNT(*) AS n FROM review_logs r WHERE r.user_id = ? GROUP BY r.rating`
    )
    .all(user.id) as { rating: number; n: number }[];
  const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  ratings.forEach((r) => (ratingMap[r.rating] = r.n));
  const totalReviews = ratings.reduce((n, r) => n + r.n, 0);

  const maxDay = Math.max(...days.map((d) => d.n), 1);

  const accuracy = totalReviews > 0
    ? Math.round(((ratingMap[3] + ratingMap[4]) / totalReviews) * 100)
    : 0;

  const achievements = [
    { icon: "🌱", label: "First Word", done: stats.introduced >= 1 },
    { icon: "🌲", label: "Root Explorer", done: stats.rootsExplored >= 3 },
    { icon: "🔥", label: "On Fire", done: user.streak >= 7 },
    { icon: "🏆", label: "First Master", done: stats.mastered >= 1 },
    { icon: "✍️", label: "Producer", done: stats.produced >= 5 },
    { icon: "🧠", label: "Review Streak", done: stats.reviewsTotal >= 20 },
    { icon: "💎", label: "Scholar", done: stats.introduced >= 40 },
    { icon: "👑", label: "Erudite", done: stats.introduced >= 600 },
  ];

  const unlockedCount = achievements.filter((a) => a.done).length;

  const activityDays = getDailyActiveDays(user.id, 7);
  const retention = getRetentionCohort(user.id);
  const session = getSessionStats(user.id);
  const velocity = getLearningVelocity(user.id);

  return (
    <div className="rise space-y-8">
      <header>
        <h1 className="font-[var(--font-lora)] text-4xl font-bold">Your stats</h1>
        <p className="mt-1 text-zinc-400">Progress is the best motivation. Watch the numbers climb.</p>
      </header>

      {/* Top metrics */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Level" value={level.name} accent />
        <Metric label="Vocabulary" value={`${stats.introduced}`} sub={`/ ${total} words`} />
        <Metric label="Mastered" value={String(stats.mastered)} sub="mastery gate" />
        <Metric label="Roots" value={`${stats.rootsExplored}`} sub={`/ ${rootCountTotal()}`} />
      </section>

      {/* Secondary metrics */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Streak" value={`${user.streak} days`} icon="🔥" />
        <Metric label="Total XP" value={String(user.xp)} icon="⚡" />
        <Metric label="Reviews" value={String(stats.reviewsTotal)} icon="🧠" />
        <Metric
          label="Accuracy"
          value={totalReviews > 0 ? `${accuracy}%` : "—"}
          sub={totalReviews > 0 ? `${ratingMap[3] + ratingMap[4]}/${totalReviews} correct` : "no reviews yet"}
          icon="🎯"
        />
      </section>

      {/* Achievements */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-lora)] text-xl font-semibold">Achievements</h2>
          <span className="text-sm text-zinc-500">{unlockedCount}/{achievements.length} unlocked</span>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {achievements.map((a, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all ${
                a.done
                  ? "bg-amber-200/[0.08] border border-amber-200/20"
                  : "bg-white/[0.02] border border-white/5 opacity-40"
              }`}
              title={a.label}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-[10px] text-zinc-500 text-center leading-tight">{a.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mastery ladder */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 font-[var(--font-lora)] text-xl font-semibold">Mastery ladder</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Mastery needs three productive recalls across 14+ days, a natural production, a Precision Duel pass, and a
          transfer. Recognition alone never counts.
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "unseen",
            "recognised",
            "recalled",
            "discriminated",
            "produced",
            "transferred",
            "mastered",
            "lapsed",
          ].map((s) => {
            const meta = stageMeta(s as Parameters<typeof stageMeta>[0]);
            const n = stageCounts.get(s) ?? 0;
            return (
              <span key={s} className={`rounded-full border px-3 py-1 text-sm ${meta.ring} ${meta.color}`}>
                {meta.icon} {meta.label} <span className="opacity-70">· {n}</span>
              </span>
            );
          })}
        </div>
      </section>

      {/* Next level */}
      {next && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-3 flex items-end justify-between">
            <p className="font-[var(--font-lora)] text-xl font-semibold">Next level: {next.name}</p>
            <p className="text-sm text-zinc-500">{next.min - stats.introduced} words to go</p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300"
              style={{
                width: `${Math.max(
                  Math.min(((stats.introduced - level.min) / (next.min - level.min)) * 100, 100),
                  3
                )}%`,
              }}
            />
          </div>
        </section>
      )}

      {/* Review chart */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 font-[var(--font-lora)] text-xl font-semibold">Reviews — last 14 days</h2>
        {days.length === 0 ? (
          <p className="text-sm text-zinc-500 py-8 text-center">No reviews yet. Complete a session to start building your review history.</p>
        ) : (
          <div className="flex h-40 items-end gap-2">
            {days.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-emerald-300/70 transition-all"
                  style={{ height: `${Math.max((d.n / maxDay) * 100, 4)}%` }}
                  title={`${d.day}: ${d.n} reviews`}
                />
                <span className="text-[10px] text-zinc-600">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review quality */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 font-[var(--font-lora)] text-xl font-semibold">Review quality</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <QualityBar label="Again" count={ratingMap[1]} total={totalReviews} color="bg-rose-300" desc="Forgot" />
          <QualityBar label="Hard" count={ratingMap[2]} total={totalReviews} color="bg-orange-300" desc="Struggled" />
          <QualityBar label="Good" count={ratingMap[3]} total={totalReviews} color="bg-emerald-300" desc="Recalled" />
          <QualityBar label="Easy" count={ratingMap[4]} total={totalReviews} color="bg-sky-300" desc="Instant" />
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          Average stability of mastered words: <span className="text-zinc-200">{avgStability.toFixed(1)} days</span> —
          how long your strongest memories are expected to hold.
        </p>
      </section>

      {/* Analytics Section */}
      <section className="space-y-6">
        <h2 className="font-[var(--font-lora)] text-2xl font-bold">Learning Activity</h2>

        {/* 7-Day Activity Chart */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-4 font-[var(--font-lora)] text-lg font-semibold">Words learned this week</h3>
          <div className="flex h-32 items-end gap-2">
            {activityDays.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    d.active ? "bg-amber-200/70" : "bg-white/5"
                  }`}
                  style={{ height: d.active ? "100%" : "8%" }}
                  title={`${d.date}: ${d.active ? "active" : "inactive"}`}
                />
                <span className="text-[10px] text-zinc-600">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Retention + Velocity row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="mb-4 font-[var(--font-lora)] text-lg font-semibold">Retention</h3>
            <div className="space-y-3">
              <RetRow label="Day 1" value={retention.day1} />
              <RetRow label="Day 7" value={retention.day7} />
              <RetRow label="Day 30" value={retention.day30} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="mb-4 font-[var(--font-lora)] text-lg font-semibold">Velocity</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="font-[var(--font-lora)] text-2xl font-bold text-amber-200">{velocity.wordsThisWeek}</p>
                <p className="text-xs text-zinc-500">this week</p>
              </div>
              <div className="text-3xl">
                {velocity.trend === "up" && "↑"}
                {velocity.trend === "down" && "↓"}
                {velocity.trend === "stable" && "→"}
              </div>
              <div className="text-center">
                <p className="font-[var(--font-lora)] text-2xl font-bold">{velocity.wordsLastWeek}</p>
                <p className="text-xs text-zinc-500">last week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Activity */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-4 font-[var(--font-lora)] text-lg font-semibold">Total Activity</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-[var(--font-lora)] text-2xl font-bold">{session.totalSessions}</p>
              <p className="text-xs text-zinc-500">sessions</p>
            </div>
            <div>
              <p className="font-[var(--font-lora)] text-2xl font-bold">{session.totalWordsLearned}</p>
              <p className="text-xs text-zinc-500">words</p>
            </div>
            <div>
              <p className="font-[var(--font-lora)] text-2xl font-bold">{session.totalReviews}</p>
              <p className="text-xs text-zinc-500">reviews</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-amber-200/30 bg-amber-200/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
      {icon && <div className="mb-1 text-lg">{icon}</div>}
      <p className={`font-[var(--font-lora)] text-2xl font-semibold ${accent ? "text-amber-200" : ""}`}>{value}</p>
      <p className="mt-1 text-sm text-zinc-500">
        {label} {sub && <span className="text-zinc-600">· {sub}</span>}
      </p>
    </div>
  );
}

function QualityBar({ label, count, total, color, desc }: { label: string; count: number; total: number; color: string; desc: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-20">
        <p className="text-zinc-400">{label}</p>
        <p className="text-[10px] text-zinc-600">{desc}</p>
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-zinc-300">{count}</span>
    </div>
  );
}

function RetRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-sm text-zinc-400">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${value > 0 ? "bg-amber-200" : "bg-white/5"}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm text-zinc-300">{value}%</span>
    </div>
  );
}
