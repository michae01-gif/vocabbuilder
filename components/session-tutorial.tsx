"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import LessonRunner, { type LessonHeader, type LessonProgress } from "./lesson-runner";
import CoachMark from "./coach-mark";
import { finishTutorialSession } from "@/lib/actions";
import type { LessonWord } from "@/lib/reading";

export default function SessionTutorial({
  words,
  pool,
  header,
  avatar,
}: {
  words: LessonWord[];
  pool: string[];
  header: LessonHeader;
  avatar: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"intro" | "lesson" | "outro">("intro");
  const [pause, setPause] = useState<null | "produce" | "test">(null);
  const [summary, setSummary] = useState<{ correct: number; total: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const seen = useRef(new Set<string>());

  function handleProgress(p: LessonProgress) {
    if ((p.phase === "produce" || p.phase === "test") && !seen.current.has(p.phase)) {
      seen.current.add(p.phase);
      setPause(p.phase);
    }
  }

  function handleComplete(s: { correct: number; total: number }) {
    setSummary(s);
    setStage("outro");
  }

  function finishOutro() {
    startTransition(async () => {
      await finishTutorialSession();
      router.push("/");
    });
  }

  return (
    <div className="relative">
      {stage === "intro" && (
        <CoachMark
          avatar={avatar}
          label="Welcome to your first lesson"
          cta="Meet your first words"
          onContinue={() => setStage("lesson")}
        >
          <p>
            This is <span className="font-semibold text-amber-100">DUC / DUCT</span> — Latin for{" "}
            <em>“to lead.”</em> It hides inside <span className="text-amber-100">conduct</span>,{" "}
            <span className="text-amber-100">educate</span>, even <span className="text-amber-100">reduce</span>.
            One root grows a whole family of words — let&apos;s forge your first few together!
          </p>
        </CoachMark>
      )}

      {stage === "lesson" && (
        <>
          <LessonRunner
            words={words}
            header={header}
            distractorPool={pool}
            onProgress={handleProgress}
            onComplete={handleComplete}
          />

          {pause === "produce" && (
            <CoachMark avatar={avatar} label="Your turn to write" onContinue={() => setPause(null)}>
              <p>
                Now <span className="font-semibold text-amber-100">use each word in your own sentence</span>{" "}
                — producing a word is how it truly sticks. No copying the examples; push the word into a
                new context. Perfect grammar optional. 😄
              </p>
            </CoachMark>
          )}

          {pause === "test" && (
            <CoachMark avatar={avatar} label="Quick recall test" onContinue={() => setPause(null)}>
              <p>
                Pick the word that fits each blank. Wrong answers aren&apos;t failures — they just come
                back sooner in your next session and in the weekly test. That&apos;s the system working!
              </p>
            </CoachMark>
          )}
        </>
      )}

      {stage === "outro" && (
        <CoachMark
          avatar={avatar}
          label="Lesson complete!"
          cta={pending ? "Saving…" : "Next: read a passage"}
          onContinue={finishOutro}
        >
          <p>
            🎉 You just learned{" "}
            <span className="font-semibold text-amber-100">{summary?.total ?? words.length} words</span>{" "}
            from DUC / DUCT — and your garden is growing already. Next, let&apos;s meet them alive in
            a real passage!
          </p>
        </CoachMark>
      )}
    </div>
  );
}
