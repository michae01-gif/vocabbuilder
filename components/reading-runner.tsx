"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { skipPassage, saveReadingState, clearReadingState, finishReadingPassage } from "@/lib/actions";
import LessonRunner from "./lesson-runner";
import type { LessonWord, VocabMatch } from "@/lib/reading";
import type { Passage } from "@/data/passages";

export type ReadingInitial = {
  selectedIds: number[];
  view: "passage" | "lesson";
  lesson: {
    phase: "teach" | "produce" | "test";
    sentences: Record<number, string>;
    testResults: { wordId: number; word: string; correct: boolean; guessed: string }[];
    testIdx: number;
  };
};

export default function ReadingRunner({
  passage,
  matches,
  words,
  pool,
  level,
  initial,
}: {
  passage: Passage;
  matches: VocabMatch[];
  words: LessonWord[];
  pool: string[];
  level: number;
  initial?: ReadingInitial;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(() => new Set(initial?.selectedIds ?? []));
  const [view, setView] = useState<"passage" | "lesson" | "post">(
    initial?.view === "lesson" ? "lesson" : "passage"
  );
  const [pending, startTransition] = useTransition();
  const [skipNote, setSkipNote] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ correct: number; total: number; coins: number } | null>(null);

  const wordById = useMemo(() => {
    const m = new Map<number, LessonWord>();
    for (const w of words) m.set(w.id, w);
    return m;
  }, [words]);

  function persistPassage(nextSelected: Set<number>) {
    void saveReadingState({
      passageId: passage.id,
      selectedIds: [...nextSelected],
      view: "passage",
      lessonPhase: "teach",
      sentences: {},
      testResults: [],
      testIdx: 0,
    });
  }

  const persistLesson = useCallback(
    (p: {
      phase: "teach" | "produce" | "test";
      sentences: Record<number, string>;
      testResults: { wordId: number; word: string; correct: boolean; guessed: string }[];
      testIdx: number;
    }) => {
      void saveReadingState({
        passageId: passage.id,
        selectedIds: [...selected],
        view: "lesson",
        lessonPhase: p.phase,
        sentences: Object.fromEntries(Object.entries(p.sentences)),
        testResults: p.testResults,
        testIdx: p.testIdx,
      });
    },
    [passage.id, selected]
  );

  function toggleWord(wordId: number) {
    const next = new Set(selected);
    if (next.has(wordId)) next.delete(wordId);
    else next.add(wordId);
    setSelected(next);
    persistPassage(next);
  }

  function startLesson() {
    setView("lesson");
    persistLesson({
      phase: "teach",
      sentences: initial?.lesson.sentences ?? {},
      testResults: [],
      testIdx: 0,
    });
  }

  function handleSkip() {
    startTransition(async () => {
      const res = await skipPassage();
      setSkipNote(
        `+${res.coins} 🪙 passage bonus — ${
          res.capped
            ? "you're already at the highest tier — here's another summit-level passage."
            : `moved up to tier ${res.level} — harder words await.`
        }`
      );
      setSelected(new Set());
      setSummary(null);
      router.refresh();
    });
  }

  function handleLessonComplete(s: { correct: number; total: number }) {
    startTransition(async () => {
      const res = await finishReadingPassage();
      setSummary({ ...s, coins: res.coins });
      setView("post");
    });
  }

  function nextPassage() {
    void clearReadingState();
    setSelected(new Set());
    setSummary(null);
    setSkipNote(null);
    setView("passage");
    router.refresh();
  }

  // Render the passage with clickable vocab spans
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((match, i) => {
    if (match.start > cursor) {
      parts.push(<span key={`t${i}`}>{passage.text.slice(cursor, match.start)}</span>);
    }
    const isSel = selected.has(match.wordId);
    const w = wordById.get(match.wordId);
    parts.push(
      <button
        key={`w${i}`}
        type="button"
        onClick={() => toggleWord(match.wordId)}
        title={w ? `${w.word} — ${w.definition}` : match.base}
        className={`rounded px-0.5 transition-all ${
          isSel
            ? "bg-amber-200/25 text-amber-100 underline decoration-amber-200 decoration-wavy underline-offset-4"
            : "text-zinc-100 underline decoration-zinc-600 decoration-dotted underline-offset-4 hover:decoration-amber-200/70 hover:text-amber-100"
        }`}
      >
        {match.form}
      </button>
    );
    cursor = match.end;
  });
  if (cursor < passage.text.length) {
    parts.push(<span key="tail">{passage.text.slice(cursor)}</span>);
  }

  const selectedWords = words.filter((w) => selected.has(w.id));

  if (view === "lesson") {
    return (
      <div className="space-y-6">
        <LessonRunner
          key={passage.id}
          words={selectedWords}
          header={{
            emoji: "📖",
            title: passage.title,
            subtitle: `Reading challenge · Tier ${level}`,
            note: "Forged from the words you tapped in the passage.",
          }}
          distractorPool={pool}
          initial={initial?.lesson}
          onProgress={persistLesson}
          onComplete={handleLessonComplete}
        />
      </div>
    );
  }

  if (view === "post") {
    const accuracy = summary && summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : null;
    return (
      <div className="flex flex-col items-center gap-6 pt-12 text-center">
        <div className="pop text-6xl">📖</div>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Reading lesson complete!</h1>
        {accuracy !== null && (
          <p className="text-zinc-400">
            Recall score: <span className="text-amber-200 font-semibold">{accuracy}%</span>
          </p>
        )}
        {summary && summary.coins > 0 && (
          <p className="pop rounded-full border border-amber-200/40 bg-amber-200/10 px-5 py-2 text-lg font-bold text-amber-200">
            +{summary.coins} 🪙 passage bonus
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {selectedWords.map((w) => (
            <span
              key={w.word}
              className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1.5 text-sm text-amber-100"
            >
              {w.word}
            </span>
          ))}
        </div>
        <p className="max-w-md text-sm text-zinc-500">
          These words are now on your spaced-repetition curve — wrong answers return sooner, right ones get spaced out.
        </p>
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

  return (
    <div className="rise mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-200/80">
            Reading challenge · Tier {level} of 5
          </p>
          <h1 className="font-[var(--font-lora)] text-3xl font-bold">{passage.title}</h1>
          <p className="text-sm text-zinc-500">{passage.flavor}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400">
          {matches.length} forge words hidden
        </span>
      </header>

      {skipNote && (
        <p className="pop rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2.5 text-sm text-emerald-200">
          {skipNote}
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="font-[var(--font-lora)] text-xl leading-relaxed text-zinc-100">{parts}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-400">
        <p>
          <span className="text-amber-200">Dotted words</span> are from the forge library.{" "}
          <span className="text-amber-100 underline decoration-amber-200 decoration-wavy underline-offset-4">
            Wavy and highlighted
          </span>{" "}
          means you marked it to learn. Your progress is saved if you leave and come back.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleSkip}
          disabled={pending}
          className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-emerald-300/40 hover:text-emerald-200 disabled:opacity-50"
        >
          {pending ? "Forging a harder passage…" : "I knew all these words — harder passage →"}
        </button>
        <button
          type="button"
          onClick={startLesson}
          disabled={selected.size === 0}
          className="flex-1 rounded-xl bg-amber-200 py-3 font-semibold text-black transition-all hover:bg-amber-100 disabled:opacity-40"
        >
          {selected.size === 0
            ? "Tap words you don't know…"
            : `Start lesson — ${selected.size} word${selected.size === 1 ? "" : "s"} →`}
        </button>
      </div>
    </div>
  );
}
