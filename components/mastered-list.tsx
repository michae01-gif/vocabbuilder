"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmMasteredWord, demoteMasteredWord } from "@/lib/actions";
import SpeakButton from "./speak-button";
import type { MasteredWord } from "@/lib/data";

export default function MasteredList({
  words,
  options,
}: {
  words: MasteredWord[];
  options: Record<number, string[]>;
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<number | null>(null);
  const [quiz, setQuiz] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { kind: "correct" | "wrong" | "confirmed"; msg: string }>(null);
  const [pending, startTransition] = useTransition();

  const w = words.find((x) => x.id === openId);

  function open(id: number) {
    setOpenId(id);
    setQuiz(false);
    setPicked(null);
    setFeedback(null);
  }

  function toggle(id: number) {
    if (openId === id) setOpenId(null);
    else open(id);
  }

  function startQuiz() {
    setQuiz(true);
    setPicked(null);
    setFeedback(null);
  }

  function confirm() {
    if (!w || pending) return;
    startTransition(async () => {
      await confirmMasteredWord(w.id);
      setFeedback({ kind: "confirmed", msg: "Nice — locked in. 💪" });
      router.refresh();
    });
  }

  function pick(opt: string) {
    if (!w || picked) return;
    setPicked(opt);
    if (opt === w.definition) {
      setFeedback({ kind: "correct", msg: "Correct — you still know this one. 💫" });
      startTransition(async () => {
        await confirmMasteredWord(w.id);
        router.refresh();
      });
    } else {
      setFeedback({
        kind: "wrong",
        msg: "It happens! This word is back in your rotation — you'll see it in Learn and in next week's test.",
      });
      startTransition(async () => {
        await demoteMasteredWord(w.id);
        router.refresh();
      });
    }
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {words.map((item) => {
        const expanded = openId === item.id;
        const isQuiz = expanded && quiz;
        const isWrong = picked !== null && picked !== item.definition;
        return (
          <div
            key={item.id}
            className={`overflow-hidden rounded-2xl border transition-all ${
              expanded
                ? isWrong
                  ? "border-rose-300/50 bg-rose-500/[0.05]"
                  : "border-amber-200/40 bg-amber-200/[0.05]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            }`}
          >
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-[var(--font-lora)] text-lg font-bold">{item.word}</p>
                  {isWrong && <span className="shrink-0 text-xs">🥀</span>}
                </div>
                <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {item.root_emoji} {item.root} · {item.root_meaning} — mastered{" "}
                  {(item.mastered_at ?? "").split(" ")[0] || "recently"}
                </p>
              </div>
              <span className={`shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>

            {expanded && (
              <div className="space-y-3 border-t border-white/10 px-4 py-4">
                <div className="flex items-center gap-2">
                  <SpeakButton text={item.word} />
                  <p className="text-xs text-zinc-400">/{item.pronunciation}/</p>
                </div>

                {!isQuiz ? (
                  <>
                    <p className="text-sm leading-relaxed text-zinc-200">{item.definition}</p>
                    {item.example1 && (
                      <p className="text-[13px] italic text-zinc-400">“{item.example1}”</p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={confirm}
                        disabled={pending || feedback?.kind === "confirmed"}
                        className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-200 transition-all hover:bg-emerald-300/20 disabled:opacity-60"
                      >
                        ✅ I still know it
                      </button>
                      <button
                        onClick={startQuiz}
                        className="rounded-full border border-amber-200/40 bg-amber-200/10 px-4 py-2 text-sm font-medium text-amber-200 transition-all hover:bg-amber-200/20"
                      >
                        🤔 Test me
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-amber-200">Which meaning is right?</p>
                    <div className="grid gap-2">
                      {(options[item.id] ?? []).map((opt) => {
                        const isCorrect = opt === item.definition;
                        const isPicked = picked === opt;
                        let cls = "border-white/15 bg-white/[0.04] text-zinc-200 hover:border-amber-200/40";
                        if (picked) {
                          if (isCorrect) cls = "border-emerald-300/60 bg-emerald-300/15 text-emerald-100";
                          else if (isPicked) cls = "border-rose-400/60 bg-rose-500/15 text-rose-100";
                          else cls = "border-white/10 bg-white/[0.02] text-zinc-500";
                        }
                        return (
                          <button
                            key={opt}
                            onClick={() => pick(opt)}
                            disabled={picked !== null}
                            className={`rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all ${cls}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {feedback && <p className="text-sm text-zinc-300">{feedback.msg}</p>}
                    {picked && (
                      <button
                        onClick={() => setOpenId(null)}
                        className="w-full rounded-full border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/5"
                      >
                        Done
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}