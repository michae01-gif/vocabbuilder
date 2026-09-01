import { getOrCreateUser, gardenData } from "@/lib/data";
import { claimableRoots, ROOT_COMPLETION_REWARD } from "@/lib/rewards";
import { stageMeta } from "@/lib/stage";
import RootClaimButton from "@/components/root-claim-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function GardenPage() {
  const user = getOrCreateUser();
  const trees = gardenData(user.id);
  const claimable = new Map(claimableRoots(user.id).map((r) => [r.rootId, r]));
  const totalLearned = trees.reduce((n, t) => n + t.learned, 0);
  const totalWords = trees.reduce((n, t) => n + t.words.length, 0);
  const totalMastered = trees.reduce(
    (n, t) => n + t.words.filter((w) => w.stage === "mastered").length,
    0
  );

  return (
    <div className="rise space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[var(--font-lora)] text-4xl font-bold">Your word garden</h1>
          <p className="mt-1 text-zinc-400">
            Each tree is a root family. Watch your vocabulary grow as you learn, recall, and master words.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-300">
            🌿 {totalLearned} / {totalWords} growing
          </p>
          {claimable.size > 0 && (
            <p className="rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-1.5 text-sm font-medium text-amber-200">
              ! {claimable.size} tree reward{claimable.size === 1 ? "" : "s"} ready
            </p>
          )}
          {totalMastered > 0 && (
            <p className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1.5 text-sm text-emerald-300">
              🏆 {totalMastered} mastered
            </p>
          )}
        </div>
      </header>

      {/* Stage legend */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Mastery stages</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400">
          <span>🌱 Unseen</span>
          <span>🌿 Recognised</span>
          <span>💧 Recalled</span>
          <span>⚖️ Discriminated</span>
          <span>✍️ Produced</span>
          <span>🔀 Transferred</span>
          <span>🏆 Mastered</span>
          <span>🥀 Lapsed</span>
        </div>
      </section>

      {/* Trees grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {trees.map(({ root, words, learned }) => {
          const pct = Math.round((learned / words.length) * 100);
          const mastered = words.filter((w) => w.stage === "mastered").length;
          const inProgress = words.filter((w) => w.stage !== "unseen" && w.stage !== "mastered").length;
          const claim = claimable.get(root.id);
          return (
            <div
              key={root.id}
              className={`relative rounded-2xl border p-5 transition-colors ${
                claim
                  ? "border-amber-200/50 bg-amber-200/[0.05] shadow-lg shadow-amber-200/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {claim && (
                <span className="claim-badge absolute -top-3 left-1/2 z-10 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-amber-200 bg-rose-500 text-base font-black text-white shadow-lg">
                  !
                </span>
              )}
              <div className="mb-3 flex items-center gap-3">
                <span className="text-2xl">{root.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-[var(--font-lora)] text-lg font-semibold leading-tight">
                    {root.root}
                    <span className="ml-2 text-sm font-normal text-zinc-500">{root.meaning}</span>
                  </p>
                </div>
                <span className="text-xs text-zinc-500">
                  {learned}/{words.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: pct === 100
                      ? "linear-gradient(90deg, #4ade80, #22d3ee)"
                      : pct > 50
                        ? "linear-gradient(90deg, #fbbf24, #4ade80)"
                        : "#fbbf24",
                  }}
                />
              </div>

              {/* Mini stats + claim */}
              {claim ? (
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-[10px] font-medium text-amber-200/90">
                    🌳 Family tree complete — reward ready!
                  </p>
                  <RootClaimButton rootId={root.id} reward={ROOT_COMPLETION_REWARD} />
                </div>
              ) : (
                learned > 0 && (
                  <div className="mb-3 flex items-center gap-3 text-[10px] text-zinc-600">
                    {mastered > 0 && <span>🏆 {mastered} mastered</span>}
                    {inProgress > 0 && <span>📖 {inProgress} in progress</span>}
                  </div>
                )
              )}

              {/* Word pills */}
              <div className="flex flex-wrap gap-1.5">
                {words.map((w) => {
                  const meta = stageMeta(w.stage);
                  return (
                    <span
                      key={w.word}
                      title={`${meta.label}`}
                      className={`rounded-full border px-2.5 py-1 text-xs ${meta.ring} ${meta.color}`}
                    >
                      {meta.icon} {w.word}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Link
          href="/session"
          className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black transition-all hover:bg-amber-100"
        >
          Grow your garden →
        </Link>
      </div>
    </div>
  );
}
