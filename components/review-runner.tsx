"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { rateWord } from "@/lib/actions";
import type { DuelWithWords, ProgressWithWord } from "@/lib/types";
import { makeClozeHighlight } from "@/lib/evaluate";
import SpeakButton from "./speak-button";

type Card = ProgressWithWord & { task_type: "receptive" | "productive" };

type Item =
  | { kind: "card"; card: Card }
  | { kind: "duel"; duel: DuelWithWords; card: Card };

export default function ReviewRunner({ cards, duels }: { cards: Card[]; duels: DuelWithWords[] }) {
  const [items] = useState<Item[]>(() => buildItems(cards, duels));
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [typed, setTyped] = useState("");
  const [typedCorrect, setTypedCorrect] = useState<boolean | null>(null);
  const [pickedDuel, setPickedDuel] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ word: string; rating: number }[]>([]);
  const [pending, startTransition] = useTransition();
  const busy = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (items.length === 0) {
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

  const item = items[idx];
  const card = item.kind === "card" ? item.card : item.card;
  const duel = item.kind === "duel" ? item.duel : undefined;
  const examples = [card.example1, card.example2, card.example3];
  const example = examples[card.reps % examples.length];
  const productive = item.kind === "card" ? card.task_type === "productive" : true;
  const clozeParts = makeClozeHighlight(example, card.word);

  function reveal() {
    setRevealed(true);
  }

  function checkTyped() {
    const guess = typed.trim().toLowerCase().replace(/[^a-z\s]/g, "").trim();
    const target = card.word.toLowerCase();
    setTypedCorrect(guess === target);
    setRevealed(true);
  }

  function donKnow() {
    setTypedCorrect(false);
    setRevealed(true);
  }

  function pickDuel(word: string) {
    if (busy.current || revealed) return;
    setPickedDuel(word === duel?.word);
    setRevealed(true);
  }

  function rate(rating: number) {
    if (pending || !revealed || busy.current) return;
    busy.current = true;
    startTransition(async () => {
      const taskType = item.kind === "duel" ? "duel" : card.task_type;
      await rateWord(card.word_id, rating, taskType);
      setResults((r) => [...r, { word: card.word, rating }]);
      setRevealed(false);
      setTyped("");
      setTypedCorrect(null);
      setPickedDuel(null);
      setIdx((i) => i + 1);
      busy.current = false;
    });
  }

  const ratingButtons = [
    { rating: 1, label: "Again", icon: "🔁", cls: "hover:border-rose-300/50 hover:bg-rose-400/10", desc: "Forgot completely" },
    { rating: 2, label: "Hard", icon: "😅", cls: "hover:border-orange-300/50 hover:bg-orange-400/10", desc: "Struggled to recall" },
    { rating: 3, label: "Good", icon: "👍", cls: "hover:border-emerald-300/50 hover:bg-emerald-400/10", desc: "Recalled with effort" },
    { rating: 4, label: "Easy", icon: "🚀", cls: "hover:border-sky-300/50 hover:bg-sky-400/10", desc: "Instant recall" },
  ];

  const correct = results.filter((r) => r.rating >= 3).length;

  if (idx >= items.length) {
    const accuracy = items.length > 0 ? Math.round((correct / items.length) * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-5 pt-12 text-center">
        <div className="pop text-6xl">🧠</div>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Review complete!</h1>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
          <p className="text-zinc-400">
            You reviewed <span className="text-zinc-200 font-semibold">{items.length}</span> card{items.length === 1 ? "" : "s"}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-300">{correct}</p>
              <p className="text-zinc-500">Recalled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-300">{items.length - correct}</p>
              <p className="text-zinc-500">Missed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-200">{accuracy}%</p>
              <p className="text-zinc-500">Accuracy</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black">
            Back home
          </Link>
          <Link href="/garden" className="rounded-full border border-white/15 px-6 py-2.5 font-medium hover:bg-white/5">
            View your garden
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rise mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300 transition-all duration-500"
            style={{ width: `${((idx + 1) / items.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-zinc-500">
          {idx + 1} / {items.length}
        </span>
      </div>

      <div key={`${card.word_id}-${idx}`} className="pop rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
          <span>{card.root_emoji}</span>
          <span>{card.root}</span>
          <span className="text-zinc-700">·</span>
          <span>{card.pos}</span>
          {item.kind === "duel" ? (
            <span className="rounded-full bg-violet-300/10 px-2 py-0.5 text-violet-300">⚖️ Precision duel</span>
          ) : productive ? (
            <span className="rounded-full bg-sky-300/10 px-2 py-0.5 text-sky-300">✍️ Productive recall</span>
          ) : (
            <span className="rounded-full bg-amber-200/10 px-2 py-0.5 text-amber-200">👁️ Receptive recall</span>
          )}
        </div>

        {item.kind === "duel" && duel && (
          <div className="space-y-5">
            <p className="text-sm text-zinc-500">Which word fits the scenario? Choose precisely.</p>
            <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-lg text-zinc-100">{duel.prompt}</p>
            {!revealed && (
              <div className="grid gap-2 sm:grid-cols-2">
                {[duel.word, duel.foil_word].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => pickDuel(w)}
                    className="rounded-xl border border-white/15 py-3 font-medium transition-all hover:border-violet-300/50 hover:bg-violet-400/10"
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
            {revealed && (
              <div className="pop space-y-4">
                <p
                  className={`rounded-xl border px-4 py-2.5 text-sm ${
                    pickedDuel
                      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
                      : "border-rose-300/40 bg-rose-400/10 text-rose-200"
                  }`}
                >
                  {pickedDuel
                    ? `✓ Correct — "${duel.word}" is the precise choice.`
                    : `"${duel.word}" fits — "${duel.foil_word}" doesn't.`}
                </p>
                <p className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm text-zinc-300">
                  ⚖️ {duel.distinction}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ratingButtons.map((b) => (
                    <button
                      key={b.rating}
                      type="button"
                      onClick={() => rate(b.rating)}
                      disabled={pending}
                      className={`rounded-xl border border-white/15 py-3 text-sm font-medium transition-all disabled:opacity-50 ${b.cls}`}
                    >
                      <span className="mr-1">{b.icon}</span>
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {item.kind === "card" && (
          <>
            {productive ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 space-y-1">
                  <p className="text-sm text-zinc-500">Recall the word from its meaning</p>
                  <p className="text-lg text-zinc-100">
                    A <span className="text-zinc-400">{card.pos}</span> meaning{" "}
                    <span className="text-zinc-200">&ldquo;{card.definition}&rdquo;</span>
                  </p>
                  <p className="text-xs text-zinc-600">
                    Root {card.root} ({card.root_meaning})
                  </p>
                </div>

                {clozeParts && (
                  <p className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm italic text-zinc-400">
                    {clozeParts.before}
                    <span className="inline-block mx-1 min-w-[4ch] border-b border-amber-200/40 text-amber-200/30 text-center font-mono">
                      &nbsp;&nbsp;&nbsp;
                    </span>
                    {clozeParts.after}
                  </p>
                )}

                {!revealed && (
                  <>
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && typed.trim()) checkTyped();
                        }}
                        placeholder="Type the word…"
                        className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-300/50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={checkTyped}
                        disabled={!typed.trim()}
                        className="rounded-xl bg-emerald-200 px-4 py-2.5 font-medium text-black transition-all hover:bg-emerald-100 disabled:opacity-40"
                      >
                        Check
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={donKnow}
                      className="w-full rounded-xl border border-white/10 py-2 text-sm text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-200"
                    >
                      I don&apos;t know
                    </button>
                  </>
                )}
                {revealed && (
                  <div className="pop space-y-4">
                    <p
                      className={`rounded-xl border px-4 py-2.5 text-sm ${
                        typedCorrect
                          ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
                          : "border-rose-300/40 bg-rose-400/10 text-rose-200"
                      }`}
                    >
                      {typedCorrect ? "✓ Recalled from meaning — productive memory." : `The word is "${card.word}".`}
                    </p>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-xs text-zinc-500 mb-1">Etymology</p>
                      <p className="text-sm italic text-zinc-300">{card.etymology}</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 text-sm text-zinc-300">
                      <SpeakButton text={card.word} className="h-7 w-7 text-xs" />
                      <span>{example}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {ratingButtons.map((b) => (
                        <button
                          key={b.rating}
                          type="button"
                          onClick={() => rate(b.rating)}
                          disabled={pending}
                          className={`rounded-xl border border-white/15 py-3 text-sm font-medium transition-all disabled:opacity-50 ${b.cls}`}
                        >
                          <span className="mr-1">{b.icon}</span>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-500">Recall the meaning before revealing</p>
                    <h1 className="font-[var(--font-lora)] text-4xl font-bold text-shadow-soft sm:text-5xl">{card.word}</h1>
                  </div>
                  <SpeakButton text={card.word} />
                </div>

                {revealed && (
                  <div className="pop mt-6 space-y-4">
                    <p className="text-lg text-zinc-100">{card.definition}</p>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-xs text-zinc-500 mb-1">Etymology</p>
                      <p className="text-sm italic text-zinc-300">{card.etymology}</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 text-sm text-zinc-300">
                      <SpeakButton text={example} className="h-7 w-7 text-xs" />
                      <span>{example}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {ratingButtons.map((b) => (
                        <button
                          key={b.rating}
                          type="button"
                          onClick={() => rate(b.rating)}
                          disabled={pending}
                          className={`rounded-xl border border-white/15 py-3 text-sm font-medium transition-all disabled:opacity-50 ${b.cls}`}
                        >
                          <span className="mr-1">{b.icon}</span>
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!revealed && (
                  <div className="mt-6 space-y-2">
                    <button
                      type="button"
                      onClick={reveal}
                      className="w-full rounded-xl bg-emerald-200 py-3 font-semibold text-black transition-all hover:bg-emerald-100"
                    >
                      Show meaning →
                    </button>
                    <button
                      type="button"
                      onClick={donKnow}
                      className="w-full rounded-xl border border-white/10 py-2 text-sm text-zinc-400 transition-colors hover:border-white/25 hover:text-zinc-200"
                    >
                      I don&apos;t know
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function buildItems(cards: Card[], duels: DuelWithWords[]): Item[] {
  const items: Item[] = [];
  const duelByWord = new Map<number, DuelWithWords>();
  for (const d of duels) {
    if (!duelByWord.has(d.word_id)) duelByWord.set(d.word_id, d);
  }
  for (const card of cards) {
    items.push({ kind: "card", card });
    const duel = duelByWord.get(card.word_id);
    if (duel) {
      items.push({ kind: "duel", duel, card });
      duelByWord.delete(card.word_id);
    }
  }
  return items;
}
