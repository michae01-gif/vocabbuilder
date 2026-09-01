"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { completeWordBatch } from "@/lib/actions";
import type { LessonWord } from "@/lib/reading";
import SpeakButton from "./speak-button";

type Phase = "teach" | "produce" | "test" | "done";
type LessonPhase = "teach" | "produce" | "test";

type TestResult = { wordId: number; word: string; correct: boolean; guessed: string };

export type LessonHeader = {
  emoji: string;
  title: string;
  subtitle: string;
  note?: string;
};

export type LessonProgress = {
  phase: LessonPhase;
  sentences: Record<number, string>;
  testResults: TestResult[];
  testIdx: number;
};

export default function LessonRunner({
  words,
  header,
  distractorPool,
  doneFooter,
  initial,
  onProgress,
  onComplete,
}: {
  words: LessonWord[];
  header: LessonHeader;
  distractorPool: string[];
  doneFooter?: { href: string; label: string }[];
  initial?: LessonProgress;
  onProgress?: (progress: LessonProgress) => void;
  onComplete?: (summary: { correct: number; total: number }) => void;
}) {
  const [phase, setPhase] = useState<Phase>(initial?.phase ?? "teach");
  const [sentences, setSentences] = useState<Record<number, string>>(initial?.sentences ?? {});
  const [testResults, setTestResults] = useState<TestResult[]>(initial?.testResults ?? []);
  const [currentTestIdx, setCurrentTestIdx] = useState(initial?.testIdx ?? 0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showTestResult, setShowTestResult] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!onProgress || phase === "done") return;
    const t = setTimeout(() => {
      onProgress({ phase, sentences, testResults, testIdx: currentTestIdx });
    }, 400);
    return () => clearTimeout(t);
  }, [phase, sentences, testResults, currentTestIdx, onProgress]);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Nothing to learn here!</h1>
        <p className="max-w-md text-zinc-400">These words are already in your keeping.</p>
        <Link href="/review" className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black">
          Go to review
        </Link>
      </div>
    );
  }

  const testItems = buildTestItems(words, distractorPool);

  function handleSentenceChange(wordId: number, value: string) {
    setSentences((s) => ({ ...s, [wordId]: value }));
  }

  function submitSentences() {
    const completed = words.filter((w) => (sentences[w.id] ?? "").trim().length >= 3);
    if (completed.length < Math.ceil(words.length / 2)) {
      alert("Try to write at least a few sentences before testing.");
      return;
    }
    setPhase("test");
    setCurrentTestIdx(0);
    setSelectedAnswer(null);
    setShowTestResult(false);
  }

  function handleSelectAnswer(word: string) {
    setSelectedAnswer(word);
    setShowTestResult(true);
  }

  function completeAll(allResults: TestResult[]) {
    startTransition(async () => {
      for (const w of words) {
        const sentence = sentences[w.id] ?? "";
        const result = allResults.find((r) => r.wordId === w.id);
        await completeWordBatch(w.id, sentence, result?.correct ?? false);
      }
      setPhase("done");
      onComplete?.({ correct: allResults.filter((r) => r.correct).length, total: testItems.length });
    });
  }

  function handleNextTest(latestResults: TestResult[]) {
    if (currentTestIdx >= testItems.length - 1) {
      completeAll(latestResults);
      return;
    }
    setCurrentTestIdx((i) => i + 1);
    setSelectedAnswer(null);
    setShowTestResult(false);
  }

  if (phase === "done") {
    const correct = testResults.filter((r) => r.correct).length;
    const accuracy = testItems.length > 0 ? Math.round((correct / testItems.length) * 100) : 100;
    return (
      <div className="flex flex-col items-center gap-6 pt-12 text-center">
        <div className="pop text-7xl">🌳</div>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">{header.title} — complete!</h1>
        <p className="text-zinc-400">
          You learned{" "}
          <span className="text-zinc-200 font-semibold">{words.length}</span>{" "}
          word{words.length === 1 ? "" : "s"} and scored{" "}
          <span className="text-amber-200 font-semibold">{accuracy}%</span> on the recall test.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {words.map((w) => (
            <span
              key={w.word}
              className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1.5 text-sm text-amber-100"
            >
              {w.word}
            </span>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 max-w-sm">
          <p className="text-sm text-zinc-400">
            {accuracy >= 80
              ? "🌟 Strong recall — these words will surface in review spaced out over time."
              : accuracy >= 60
                ? "👍 Good start — review will strengthen what you missed."
                : "📖 Review will help — you'll see these again soon."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {(doneFooter ?? [
            { href: "/read", label: "📖 Reading challenge" },
            { href: "/review", label: "Start review" },
            { href: "/", label: "Back home" },
          ]).map((f) => (
            <Link
              key={f.href + f.label}
              href={f.href}
              className={
                f.href === "/review"
                  ? "rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black"
                  : "rounded-full border border-white/15 px-6 py-2.5 font-medium hover:bg-white/5"
              }
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rise mx-auto max-w-3xl space-y-6">
      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-3 text-xs">
        {phase === "teach" && <span className="text-amber-200">📖 Learning</span>}
        {phase === "produce" && <span className="text-sky-300">✍️ Writing</span>}
        {phase === "test" && <span className="text-emerald-300">🎯 Testing</span>}
        <span className="text-zinc-600">·</span>
        <span className="text-zinc-500">
          {phase === "teach" ? `Study ${words.length} words` :
           phase === "produce" ? `${Object.values(sentences).filter((v) => v.trim().length >= 3).length}/${words.length} sentences` :
           `Question ${currentTestIdx + 1} / ${testItems.length}`}
        </span>
      </div>

      {/* Shared header card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{header.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-200/80">{header.subtitle}</p>
            <p className="text-sm text-zinc-300">{header.title}</p>
          </div>
        </div>
        {header.note && <p className="mt-2 text-xs text-zinc-500">{header.note}</p>}
      </div>

      {/* Phase: TEACH */}
      {phase === "teach" && (
        <div className="space-y-5">
          <h2 className="font-[var(--font-lora)] text-xl font-semibold">Meet the words</h2>
          {words.map((w) => (
            <div key={w.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-[var(--font-lora)] text-2xl font-bold text-shadow-soft">{w.word}</h3>
                    <span className="text-xs text-zinc-500">{w.pos}</span>
                    <span className="rounded-full bg-amber-200/10 border border-amber-200/20 px-2 py-0.5 text-[10px] text-amber-200/80">
                      {w.root_emoji} {w.root} — {w.root_meaning}
                    </span>
                  </div>
                  <p className="mt-1 text-lg text-zinc-200">{w.definition}</p>
                  <p className="mt-2 text-sm italic text-zinc-400">💡 {w.etymology}</p>
                </div>
                <SpeakButton text={w.word} />
              </div>
              <div className="mt-3 space-y-2">
                {[w.example1, w.example2, w.example3].map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] p-2.5 text-sm text-zinc-300">
                    <SpeakButton text={ex} className="h-6 w-6 text-xs" />
                    <span>{ex}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPhase("produce")}
            className="w-full rounded-xl bg-amber-200 py-3 font-semibold text-black transition-all hover:bg-amber-100"
          >
            I&apos;ve studied them — write sentences →
          </button>
        </div>
      )}

      {/* Phase: PRODUCE */}
      {phase === "produce" && (
        <div className="space-y-5">
          <h2 className="font-[var(--font-lora)] text-xl font-semibold">Use the words</h2>
          <p className="text-sm text-zinc-400">
            Write a sentence using each word. No copying the examples — push the word into a new context.
          </p>
          {words.map((w, i) => (
            <div key={w.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-medium text-amber-200">#{i + 1}</span>
                <span className="font-semibold">{w.word}</span>
                <span className="text-xs text-zinc-500">— {w.definition}</span>
              </div>
              <textarea
                value={sentences[w.id] ?? ""}
                onChange={(e) => handleSentenceChange(w.id, e.target.value)}
                rows={2}
                placeholder={`A sentence using "${w.word}" that shows you understand it...`}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-amber-200/50"
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPhase("teach")}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-200"
            >
              ← Back to words
            </button>
            <button
              type="button"
              onClick={submitSentences}
              className="flex-1 rounded-xl bg-amber-200 py-3 font-semibold text-black transition-all hover:bg-amber-100"
            >
              Ready to test — recall from context →
            </button>
          </div>
        </div>
      )}

      {/* Phase: TEST */}
      {phase === "test" && testItems.length > 0 && (() => {
        const item = testItems[Math.min(currentTestIdx, testItems.length - 1)];
        const shuffled = shuffleStable(item.options, item.wordId);
        return (
          <div className="space-y-5">
            <h2 className="font-[var(--font-lora)] text-xl font-semibold">Word recall test</h2>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <p className="text-sm text-zinc-400 mb-2">Fill the blank with the right word:</p>
              <p className="rounded-lg border border-white/5 bg-black/20 p-4 text-lg text-zinc-100">
                {item.before}
                <span className="inline-block mx-1 min-w-[6ch] border-b-2 border-amber-200/60 text-amber-200/30 text-center font-mono text-sm">
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
                {item.after}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Root: {item.root} — Hint: {item.hint}
              </p>
            </div>

            {!showTestResult ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {shuffled.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectAnswer(opt)}
                    className="rounded-xl border border-white/15 py-4 px-4 text-left font-medium transition-all hover:border-amber-200/50 hover:bg-amber-200/10"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="pop space-y-4">
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    selectedAnswer === item.correct
                      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
                      : "border-rose-300/40 bg-rose-400/10 text-rose-200"
                  }`}
                >
                  {selectedAnswer === item.correct
                    ? `✓ Correct — "${item.correct}"`
                    : `✗ Incorrect — the answer is "${item.correct}".`}
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-xs text-zinc-500">Definition</p>
                  <p className="text-sm text-zinc-300">{item.definition}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-600">
                {showTestResult && selectedAnswer !== item.correct && "You'll see this again in review"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!showTestResult) return;
                  const result: TestResult = {
                    wordId: item.wordId,
                    word: item.correct,
                    correct: selectedAnswer === item.correct,
                    guessed: selectedAnswer ?? "",
                  };
                  const allResults = [...testResults.filter((x) => x.wordId !== item.wordId), result];
                  setTestResults(allResults);
                  handleNextTest(allResults);
                }}
                disabled={!showTestResult || pending}
                className="rounded-xl bg-emerald-200 px-4 py-2 font-medium text-black transition-all hover:bg-emerald-100 disabled:opacity-40"
              >
                {pending ? "Forging…" : currentTestIdx >= testItems.length - 1 ? "Finish 🌳" : "Next →"}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

type TestItem = {
  wordId: number;
  correct: string;
  options: string[];
  before: string;
  after: string;
  hint: string;
  definition: string;
  root: string;
};

function buildTestItems(words: LessonWord[], pool: string[]): TestItem[] {
  const result: TestItem[] = [];
  for (const w of words) {
    const examples = [w.example1, w.example2, w.example3].filter(Boolean);
    const forms = new Set(inflectionForms(w.word).map((f) => f.toLowerCase()));
    const example = examples.find((ex) => {
      const tokens = ex.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
      return tokens.some((t) => forms.has(t));
    }) ?? examples[0];
    if (!example) continue;

    let matchIdx = -1;
    let matchLen = 0;
    const re = /[A-Za-z]+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(example)) !== null) {
      if (forms.has(m[0].toLowerCase())) {
        matchIdx = m.index;
        matchLen = m[0].length;
        break;
      }
    }
    if (matchIdx === -1) continue;

    const before = example.slice(0, matchIdx);
    const after = example.slice(matchIdx + matchLen);

    const distractors = words.filter((o) => o.id !== w.id).map((o) => o.word);
    let di = 0;
    while (distractors.length < 3 && di < pool.length) {
      const cand = pool[di++];
      if (cand !== w.word && !distractors.includes(cand)) distractors.push(cand);
    }

    result.push({
      wordId: w.id,
      correct: w.word,
      options: [w.word, ...distractors.slice(0, 3)],
      before,
      after,
      hint: w.definition.split(" — ")[0]?.slice(0, 60) ?? w.definition.slice(0, 60),
      definition: w.definition,
      root: `${w.root_emoji} ${w.root} (${w.root_meaning})`,
    });
  }
  return result;
}

function shuffleStable<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed + 7;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function inflectionForms(word: string): string[] {
  const w = word.toLowerCase();
  const forms = new Set<string>([w]);
  if (w.endsWith("y")) {
    forms.add(w.slice(0, -1) + "ies");
    forms.add(w.slice(0, -1) + "ied");
  }
  if (w.endsWith("e")) {
    forms.add(w.slice(0, -1) + "ing");
    forms.add(w + "d");
  }
  forms.add(w + "s");
  forms.add(w + "es");
  forms.add(w + "ed");
  forms.add(w + "d");
  forms.add(w + "ing");
  return [...forms];
}
