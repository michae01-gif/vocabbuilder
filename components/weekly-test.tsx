"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitWeeklyTest } from "@/lib/actions";
import type { WeeklyQuestion } from "@/lib/weekly";

export default function WeeklyTest({ questions }: { questions: WeeklyQuestion[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ wordId: number; correct: boolean }[]>([]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ coins: number; correct: number; total: number } | null>(null);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <div className="text-5xl">🧪</div>
        <h1 className="font-[var(--font-lora)] text-2xl font-bold">No safe words to test this week</h1>
        <p className="max-w-md text-zinc-400">
          Miss a word in a lesson and it lands here. Keep learning — your test will fill up.
        </p>
        <Link href="/session" className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black">
          Back to learning
        </Link>
      </div>
    );
  }

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  function choose(opt: string) {
    if (selected) return;
    setSelected(opt);
    setAnswers((a) => [...a, { wordId: q.wordId, correct: opt === q.definition }]);
  }

  function next() {
    if (isLast) {
      startTransition(async () => {
        const res = await submitWeeklyTest(answers);
        if (res.ok) setResult({ coins: res.coins, correct: res.correct, total: res.total });
        router.refresh();
      });
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  }

  if (result) {
    const perfect = result.correct === result.total;
    return (
      <div className="flex flex-col items-center gap-5 pt-10 text-center">
        <div className="text-6xl">{perfect ? "🏆" : result.correct >= result.total / 2 ? "💪" : "🌱"}</div>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">
          {perfect ? "Perfect score!" : "Weekly test complete!"}
        </h1>
        <p className="text-zinc-400">
          You got <span className="font-semibold text-amber-200">{result.correct}/{result.total}</span> right.
          {result.correct < result.total &&
            " Missed words stay in the pool — pick them up again next week."}
        </p>
        <div className="rounded-2xl border border-amber-200/40 bg-amber-200/10 px-6 py-4">
          <p className="text-sm text-amber-200">+{result.coins} 🪙 banked</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black">
            Back home
          </Link>
          <Link href="/mastered" className="rounded-full border border-white/15 px-6 py-2.5 font-medium hover:bg-white/5">
            🏆 Mastered words
          </Link>
        </div>
      </div>
    );
  }

  const answered = selected !== null;
  const correctCount = answers.filter((a) => a.correct).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          Question {idx + 1} of {questions.length}
        </span>
        <span className="text-emerald-300">✓ {correctCount} so far</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-500"
          style={{ width: `${((idx + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200/70">Pick the meaning</p>
        <h2 className="mt-2 font-[var(--font-lora)] text-3xl font-bold">{q.word}</h2>
        <p className="mt-1 text-sm text-zinc-500">Which one of these is the right meaning?</p>

        <div className="mt-5 grid gap-2.5">
          {q.options.map((opt) => {
            const isCorrect = opt === q.definition;
            const isPicked = selected === opt;
            let cls =
              "border-white/15 bg-white/[0.04] text-zinc-200 hover:border-amber-200/40 hover:bg-white/[0.07]";
            if (answered) {
              if (isCorrect) cls = "border-emerald-300/60 bg-emerald-300/15 text-emerald-100";
              else if (isPicked) cls = "border-rose-400/60 bg-rose-500/15 text-rose-100";
              else cls = "border-white/10 bg-white/[0.02] text-zinc-500";
            }
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={answered}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${cls}`}
              >
                {opt}
                {answered && isCorrect && <span className="ml-2 text-emerald-300">✓</span>}
                {answered && isPicked && !isCorrect && <span className="ml-2 text-rose-300">✗</span>}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-400">
              {selected === q.definition
                ? "Locked in. 💫"
                : `Not quite — the meaning is: ${q.definition}`}
            </p>
            <button
              onClick={next}
              disabled={pending}
              className="shrink-0 rounded-full bg-amber-200 px-6 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 disabled:opacity-60"
            >
              {isLast ? (pending ? "Submitting…" : "Finish test") : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}