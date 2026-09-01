"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimQuest } from "@/lib/actions";
import type { QuestView } from "@/lib/rewards";

export default function Quests({ quests }: { quests: QuestView[] }) {
  const router = useRouter();
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleClaim(type: QuestView["type"]) {
    setPendingType(type);
    setError(null);
    startTransition(async () => {
      const res = await claimQuest(type);
      if (!res.ok) setError(res.error ?? "Could not claim.");
      setPendingType(null);
      router.refresh();
    });
  }

  const allDone = quests.length > 0 && quests.every((q) => q.claimed);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[var(--font-lora)] text-xl font-semibold">Daily quests</h2>
        <span className="text-sm text-zinc-500">Resets at midnight</span>
      </div>

      {error && (
        <p className="mb-3 rounded-xl border border-rose-300/40 bg-rose-400/10 px-4 py-2 text-sm text-rose-200">{error}</p>
      )}

      <div className="space-y-3">
        {quests.map((q) => {
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
          const complete = q.progress >= q.target;
          const canClaim = complete && !q.claimed;
          return (
            <div
              key={q.type}
              className={`relative flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                q.claimed
                  ? "border-emerald-300/30 bg-emerald-300/[0.06]"
                  : complete
                    ? "border-amber-200/40 bg-amber-200/[0.06]"
                    : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {canClaim && (
                <span className="claim-badge absolute -top-2 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-amber-200 bg-rose-500 text-sm font-black text-white shadow-lg">
                  !
                </span>
              )}
              <span className="text-2xl">{q.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">{q.label}</p>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {q.progress}/{q.target}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      q.claimed ? "bg-emerald-300" : complete ? "bg-amber-200" : "bg-sky-300"
                    }`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
              </div>
              {q.claimed ? (
                <span className="shrink-0 text-sm text-emerald-300">✓ Claimed</span>
              ) : complete ? (
                <button
                  type="button"
                  onClick={() => handleClaim(q.type)}
                  disabled={pendingType === q.type}
                  className="shrink-0 rounded-lg bg-amber-200 px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-amber-100 disabled:opacity-50"
                >
                  {pendingType === q.type ? "…" : `Claim +${q.reward}`}
                </button>
              ) : (
                <span className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400">
                  🪙 {q.reward}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <p className="pop mt-4 text-center text-sm text-emerald-300">
          All quests claimed — you&apos;re on fire today! 🔥
        </p>
      )}
    </section>
  );
}
