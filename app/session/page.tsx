import { requireUser } from "@/lib/auth";
import { currentRoot, newWordsForRoot, reviewLoad, redoLearningWordIds } from "@/lib/data";
import LessonRunner from "@/components/lesson-runner";
import SessionTutorial from "@/components/session-tutorial";
import { lessonWordsByIds, distractorPool } from "@/lib/reading";
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

  return (
    <div className="rise mx-auto max-w-3xl space-y-4">
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
        <LessonRunner words={words} header={header} distractorPool={pool} />
      )}
    </div>
  );
}
