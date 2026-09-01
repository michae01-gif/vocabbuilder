import { getOrCreateUser, currentRoot, newWordsForRoot, reviewLoad } from "@/lib/data";
import LessonRunner from "@/components/lesson-runner";
import { lessonWordsByIds, distractorPool } from "@/lib/reading";

export const dynamic = "force-dynamic";

export default function SessionPage() {
  const user = getOrCreateUser();
  const root = currentRoot(user.id);
  const all = newWordsForRoot(user.id, root.id);
  const load = reviewLoad(user.id);
  const batch = all.slice(0, load.newCap);
  const words = lessonWordsByIds(batch.map((w) => w.id));
  const capped = batch.length < all.length;

  return (
    <div className="rise mx-auto max-w-3xl space-y-4">
      {capped && (
        <p className="rounded-xl border border-amber-200/30 bg-amber-200/10 px-4 py-2.5 text-sm text-amber-200">
          {load.message ?? "We'll keep new words light today."}{" "}
          <span className="text-amber-200/70">({all.length - batch.length} more waiting in this root)</span>
        </p>
      )}
      <LessonRunner
        words={words}
        header={{
          emoji: root.emoji,
          title: `${root.root} — ${root.meaning}`,
          subtitle: `${root.language} root family`,
          note: root.story,
        }}
        distractorPool={distractorPool(batch.map((w) => w.id), 40)}
      />
    </div>
  );
}
