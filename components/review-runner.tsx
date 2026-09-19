"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rateWord, completeReviewParagraph } from "@/lib/actions";
import { validateWriting } from "@/lib/validate-writing";
import { usePasteGuard } from "./use-paste-guard";
import GuardedTextarea from "./guarded-textarea";
import SpeakButton from "./speak-button";
import type { ProgressWithWord } from "@/lib/types";

type Card = ProgressWithWord;

const BATCH = 5;

export default function ReviewRunner({
  cards,
  mcq,
  remainingDue,
}: {
  cards: Card[];
  mcq: Record<number, string[]>;
  remainingDue: number;
}) {
  const router = useRouter();
  const batch = cards.slice(0, BATCH);
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"mcq" | "sentence">("mcq");
  const [picked, setPicked] = useState<string | null>(null);
  const [sentence, setSentence] = useState("");
  const [sentenceError, setSentenceError] = useState<string | null>(null);
  const [sentenceSaved, setSentenceSaved] = useState(false);
  const [phase, setPhase] = useState<"words" | "paragraph" | "done">("words");
  const [paragraph, setParagraph] = useState("");
  const [paragraphError, setParagraphError] = useState<string | null>(null);
  const [paragraphReward, setParagraphReward] = useState<number | null>(null);
  const [mcqCorrect, setMcqCorrect] = useState(0);
  const [pending, startTransition] = useTransition();
  const pasteGuard = usePasteGuard();

  if (batch.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <div className="text-5xl">🌤️</div>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">No reviews due</h1>
        <p className="max-w-md text-zinc-400">
          Your spaced-repetition schedule has nothing for you right now. Explore a new root instead.
        </p>
        <Link href="/session" className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black">
          Start a session
        </Link>
      </div>
    );
  }

  const card = batch[idx];
  const options = mcq[card.word_id] ?? [card.definition];
  const isRight = picked === card.definition;

  function pickOption(opt: string) {
    if (picked || pending) return;
    setPicked(opt);
    const correct = opt === card.definition;
    if (correct) setMcqCorrect((c) => c + 1);
    startTransition(async () => {
      await rateWord(card.word_id, correct ? 3 : 1, "receptive");
    });
  }

  function toSentence() {
    setMode("sentence");
    setSentence("");
    setSentenceError(null);
    setSentenceSaved(false);
  }

  function submitSentence() {
    const err = validateWriting(sentence, { minWords: 10, requireWord: card.word, label: "sentence" });
    if (err) {
      setSentenceError(err);
      return;
    }
    setSentenceError(null);
    startTransition(async () => {
      await rateWord(card.word_id, 3, "productive");
      setSentenceSaved(true);
    });
  }

  function nextWord() {
    if (idx + 1 >= batch.length) {
      setPhase("paragraph");
    } else {
      setIdx((i) => i + 1);
      setMode("mcq");
      setPicked(null);
      setSentence("");
      setSentenceError(null);
      setSentenceSaved(false);
    }
  }

  function submitParagraph() {
    const words = batch.map((c) => c.word);
    const err = validateWriting(paragraph, { minWords: 30, requireWords: words, label: "paragraph" });
    if (err) {
      setParagraphError(err);
      return;
    }
    setParagraphError(null);
    startTransition(async () => {
      const res = await completeReviewParagraph(paragraph, batch.map((c) => c.word_id));
      if (!res.ok) {
        setParagraphError(res.error);
        return;
      }
      setParagraphReward(res.reward);
      setPhase("done");
    });
  }

  if (phase === "done") {
    const accuracy = Math.round((mcqCorrect / batch.length) * 100);
    return (
      <div className="flex flex-col items-center gap-5 pt-12 text-center">
        <div className="pop text-6xl">🧠</div>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Review complete!</h1>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
          <p className="text-zinc-400">
            You reviewed <span className="font-semibold text-zinc-200">{batch.length} words</span> —
            meaning, sentence, and a full paragraph.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-300">{mcqCorrect}</p>
              <p className="text-zinc-500">Meanings nailed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-200">{accuracy}%</p>
              <p className="text-zinc-500">MCQ accuracy</p>
            </div>
            {paragraphReward !== null && (
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-200">+{paragraphReward} 🪙</p>
                <p className="text-zinc-500">Paragraph bonus</p>
              </div>
            )}
          </div>
        </div>
        {remainingDue > batch.length ? (
          <button
            type="button"
            onClick={() => router.refresh()}
            className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black"
          >
            Review the next {Math.min(BATCH, remainingDue - batch.length)} words →
          </button>
        ) : (
          <p className="text-sm text-zinc-500">All caught up — nothing else is due right now ✓</p>
        )}
        <Link href="/" className="rounded-full border border-white/15 px-6 py-2.5 font-medium hover:bg-white/5">
          Back home
        </Link>
      </div>
    );
  }

  if (phase === "paragraph") {
    const words = batch.map((c) => c.word);
    return (
      <div className="rise mx-auto max-w-2xl space-y-5">
        <header>
          <p className="text-xs uppercase tracking-widest text-amber-200/80">Final challenge · Paragraph</p>
          <h1 className="font-[var(--font-lora)] text-3xl font-bold">Weave all {words.length} words into one paragraph</h1>
          <p className="mt-2 text-sm text-zinc-500">
            A real paragraph — at least 30 words, using every word below (any form counts). Write it
            yourself: pasting is blocked and costs warnings.
          </p>
        </header>
        <div className="flex flex-wrap gap-1.5">
          {words.map((w) => (
            <span key={w} className="rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-sm text-amber-100">
              {w}
            </span>
          ))}
        </div>
        {pasteGuard.banner}
        <GuardedTextarea
          value={paragraph}
          onChange={(v) => {
            setParagraph(v);
            if (paragraphError) setParagraphError(null);
            pasteGuard.clear();
          }}
          onPasteBlocked={pasteGuard.trigger}
          rows={7}
          placeholder={`A short story, an opinion, a memory — anything that naturally uses ${words.slice(0, 3).join(", ")}…`}
        />
        {paragraphError && <p className="text-sm text-rose-300">{paragraphError}</p>}
        <button
          type="button"
          onClick={submitParagraph}
          disabled={pending || paragraph.trim().length === 0}
          className="w-full rounded-xl bg-amber-200 py-3 font-semibold text-black transition-colors hover:bg-amber-100 disabled:opacity-40"
        >
          {pending ? "Checking…" : "Submit paragraph →"}
        </button>
      </div>
    );
  }

  return (
    <div className="rise mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300 transition-all duration-500"
            style={{ width: `${(((idx + (sentenceSaved ? 1 : 0)) / batch.length) * 100).toFixed(0)}%` }}
          />
        </div>
        <span className="text-sm text-zinc-500">
          Word {idx + 1} / {batch.length}
        </span>
      </div>

      {pasteGuard.banner}

      <div key={`${card.word_id}-${mode}`} className="pop rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
          <span>{card.root_emoji}</span>
          <span>{card.root}</span>
          <span className="text-zinc-700">·</span>
          <span>{card.pos}</span>
          <span
            className={`ml-auto rounded-full px-2 py-0.5 ${
              mode === "mcq"
                ? "bg-amber-200/10 text-amber-200"
                : "bg-sky-300/10 text-sky-300"
            }`}
          >
            {mode === "mcq" ? "1 · Pick the meaning" : "2 · Use it in a sentence"}
          </span>
        </div>

        {mode === "mcq" ? (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-zinc-500">What does this word mean?</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <h2 className="font-[var(--font-lora)] text-4xl font-bold text-amber-100">{card.word}</h2>
                <SpeakButton text={card.word} />
              </div>
            </div>
            <div className="space-y-2.5">
              {options.map((opt) => {
                const chosen = picked === opt;
                const showCorrect = picked !== null && opt === card.definition;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => pickOption(opt)}
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
                  {isRight ? "✓ Correct meaning!" : "✗ Not quite — the green one was right."}
                </p>
                <button
                  type="button"
                  onClick={toSentence}
                  className="rounded-full bg-amber-200 px-5 py-2 text-sm font-semibold text-black"
                >
                  Now write a sentence →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">
                Write your own sentence with <span className="font-semibold text-amber-100">{card.word}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                At least 10 words, must make sense, and it has to genuinely use the word. Pasting is
                blocked — three warnings costs 500 🪙.
              </p>
            </div>
            <GuardedTextarea
              value={sentence}
              onChange={(v) => {
                setSentence(v);
                if (sentenceError) setSentenceError(null);
                pasteGuard.clear();
              }}
              onPasteBlocked={pasteGuard.trigger}
              rows={3}
              placeholder={`A sentence using "${card.word}" that shows you understand it…`}
            />
            {sentenceError && <p className="text-sm text-rose-300">{sentenceError}</p>}
            {sentenceSaved ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-3">
                <p className="text-sm font-medium text-emerald-200">✓ Saved — nicely done!</p>
                <button
                  type="button"
                  onClick={nextWord}
                  className="rounded-full bg-emerald-200 px-5 py-2 text-sm font-semibold text-black"
                >
                  {idx + 1 >= batch.length ? "Final challenge →" : "Next word →"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={submitSentence}
                disabled={pending || sentence.trim().length === 0}
                className="w-full rounded-xl bg-amber-200 py-3 font-semibold text-black transition-colors hover:bg-amber-100 disabled:opacity-40"
              >
                {pending ? "Checking…" : "Submit sentence →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
