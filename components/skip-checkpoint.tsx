"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { completeSkipCheckpoint } from "@/lib/actions";
import type { CheckpointQuestion } from "@/lib/reading";

export default function SkipCheckpoint({ questions, level }: { questions: CheckpointQuestion[]; level: number }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const q = questions[idx];
  const total = questions.length;

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === q.definition) setCorrect((c) => c + 1);
  }

  function next() {
    if (idx + 1 >= total) {
      startTransition(async () => {
        const res = await completeSkipCheckpoint();
        setReward(res.ok ? res.coins : 0);
        setDone(true);
      });
    } else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  }

  function nextPassage() {
    router.refresh();
  }

  if (done) {
    const accuracy = Math.round((correct / total) * 100);
    return (
      <div className="flex flex-col items-center gap-6 pt-12 text-center">
        <div className="pop text-6xl">🏁</div>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Checkpoint cleared!</h1>
        <p className="text-zinc-400">
          You proved your knowledge of{" "}
          <span className="text-amber-200 font-semibold">{total} skipped words</span> — score:{" "}
          <span className="text-amber-200 font-semibold">{correct}/{total} ({accuracy}%)</span>
        </p>
        {reward !== null && reward > 0 && (
          <p className="pop rounded-full border border-amber-200/40 bg-amber-200/10 px-5 py-2 text-lg font-bold text-amber-200">
            +{reward} 🪙 skip-checkpoint bonus
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={nextPassage}
            className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black"
          >
            Next passage →
          </button>
          <Link href="/" className="rounded-full border border-white/15 px-6 py-2.5 font-medium hover:bg-white/5">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((idx + (picked ? 1 : 0)) / total) * 100;
  const isRight = picked === q.definition;

  return (
    <div className="rise mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-amber-200/80">
          Skip checkpoint · Tier {level}
        </p>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Prove you knew them 📝</h1>
        <p className="text-sm text-zinc-500">
          You skipped 3 passages claiming you knew every word — match each word to its meaning to earn the bonus.
        </p>
      </header>

      <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div
          className="h-full rounded-full bg-amber-200/80 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500">
        Question {idx + 1} of {total}
      </p>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-500">What does this word mean?</p>
          <h2 className="pop mt-2 font-[var(--font-lora)] text-4xl font-bold text-amber-100">{q.word}</h2>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt) => {
            const chosen = picked === opt;
            const showCorrect = picked !== null && opt === q.definition;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => pick(opt)}
                disabled={picked !== null}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  showCorrect
                    ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-200"
                    : chosen
                      ? "border-rose-400/60 bg-rose-400/10 text-rose-200"
                      : picked !== null
                        ? "border-white/10 bg-white/[0.02] text-zinc-500"
                        : "border-white/15 text-zinc-200 hover:border-amber-200/50 hover:bg-amber-200/[0.06] hover:text-amber-100"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className={`text-sm font-medium ${isRight ? "text-emerald-300" : "text-rose-300"}`}>
              {isRight ? "✓ Correct!" : "✗ Not quite — the green one was right."}
            </p>
            <button
              type="button"
              onClick={next}
              disabled={pending}
              className="rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {pending ? "Claiming…" : idx + 1 >= total ? "Claim bonus 🪙" : "Next word →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
