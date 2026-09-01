"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimRoot } from "@/lib/actions";

export default function RootClaimButton({ rootId, reward = 150 }: { rootId: number; reward?: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClaim() {
    startTransition(async () => {
      const res = await claimRoot(rootId);
      if (res.ok) {
        setDone(true);
      } else {
        setError(res.error ?? "Could not claim.");
      }
      router.refresh();
    });
  }

  if (done) {
    return (
      <span className="pop rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
        ✓ +{reward} coins claimed
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClaim}
        disabled={pending}
        className="claim-badge rounded-lg bg-gradient-to-b from-amber-200 to-amber-300 px-4 py-2 text-xs font-bold text-black shadow-lg transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
      >
        {pending ? "…" : `Claim +${reward} 🪙`}
      </button>
      {error && <span className="text-[10px] text-rose-300">{error}</span>}
    </div>
  );
}
