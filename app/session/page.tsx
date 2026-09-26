import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { currentRoot, newWordsForRoot, reviewLoad, redoLearningWordIds } from "@/lib/data";
import LessonRunner from "@/components/lesson-runner";
import SessionTutorial from "@/components/session-tutorial";
import { lessonWordsByIds, distractorPool, quickCheckQuiz } from "@/lib/reading";
import { trackEvent } from "@/lib/analytics";
import { getTutorialStepDb } from "@/lib/tutorial";

export const dynamic = "force-dynamic";

export default async function SessionPage() {
  const user = await requireUser();
  trackEvent(user.id, "session_start");
  const root = currentRoot(user.id);
  const all = newWordsForRoot(user.id, root.id);
  const load = reviewLoad(user.id);
  const redoIds = redoLearningWordIds(user.id, 5);
  const redoWords = lessonWordsByIds(redoIds);
  const hasRedo = redoWords.length > 0;
  const batch = all.slice(0, load.newCap);
  const words = hasRedo ? redoWords : lessonWordsByIds(batch.map((w) => w.id));
  const capped = !hasRedo && batch.length < all.length;
  const tutorial = getTutorialStepDb(user.id);
  const header = hasRedo
    ? {
        emoji: "🗣️",
        title: "Words to reforge",
        subtitle: "You marked these as forgotten",
        note: `You didn't recognize ${redoWords.length === 1 ? "it" : "them"} in your vault — prove ${redoWords.length === 1 ? "it" : "them"} again to keep your keeping strong.`,
      }
    : {
        emoji: root.emoji,
        title: `${root.root} — ${root.meaning}`,
        subtitle: `${root.language} root family`,
        note: root.story,
      };
  const pool = distractorPool(user.id, words.map((w) => w.id), 40);
  const quick = quickCheckQuiz(words);

  return (
    <div className="rise mx-auto max-w-3xl space-y-4">
      {tutorial?.step !== 1 && (
        <Link
          href="/read"
          className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-violet-300/50 bg-gradient-to-br from-violet-300/20 to-transparent p-5 shadow-lg shadow-violet-500/10 transition-all hover:border-violet-300/80"
        >
          <div className="flex min-w-0 items-center gap-4">
            <span className="shrink-0 text-3xl sm:text-4xl">📖</span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300/80">
                Learn a passage
              </p>
              <h2 className="mt-0.5 font-[var(--font-lora)] text-xl font-bold leading-tight sm:text-2xl">
                Read your words in a real story
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Tap every word you recognize, then build a mini-lesson from them.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-violet-300 px-4 py-2.5 text-sm font-bold text-black transition-transform group-hover:scale-105">
            Start →
          </span>
        </Link>
      )}
      {capped && (
        <p className="rounded-xl border border-amber-200/30 bg-amber-200/10 px-4 py-2.5 text-sm text-amber-200">
          {load.message ?? "We'll keep new words light today."}{" "}
          <span className="text-amber-200/70">({all.length - batch.length} more waiting in this root)</span>
        </p>
      )}
      {hasRedo && (
        <p className="rounded-xl border border-sky-300/30 bg-sky-300/10 px-4 py-2.5 text-sm text-sky-200">
          {redoWords.length} word{redoWords.length === 1 ? "" : "s"} you forgot are back in the queue.
          Relearn {redoWords.length === 1 ? "it" : "them"} to lock {redoWords.length === 1 ? "it" : "them"} in again.
        </p>
      )}
      {tutorial?.step === 1 ? (
        <SessionTutorial words={words} pool={pool} header={header} avatar={user.avatar} />
      ) : (
        <LessonRunner words={words} header={header} distractorPool={pool} quickCheck={quick} />
      )}
    </div>
  );
}
