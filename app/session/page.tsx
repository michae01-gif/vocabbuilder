import { requireUser } from "@/lib/auth";
import { currentRoot, newWordsForRoot, reviewLoad } from "@/lib/data";
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
  const batch = all.slice(0, load.newCap);
  const words = lessonWordsByIds(batch.map((w) => w.id));
  const capped = batch.length < all.length;
  const tutorial = getTutorialStepDb(user.id);
  const header = {
    emoji: root.emoji,
    title: `${root.root} — ${root.meaning}`,
    subtitle: `${root.language} root family`,
    note: root.story,
  };
  const pool = distractorPool(user.id, batch.map((w) => w.id), 40);

  return (
    <div className="rise mx-auto max-w-3xl space-y-4">
      {capped && (
        <p className="rounded-xl border border-amber-200/30 bg-amber-200/10 px-4 py-2.5 text-sm text-amber-200">
          {load.message ?? "We'll keep new words light today."}{" "}
          <span className="text-amber-200/70">({all.length - batch.length} more waiting in this root)</span>
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
