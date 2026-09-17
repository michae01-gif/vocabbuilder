import { requireUser } from "@/lib/auth";
import { dueReviews, duelForWord } from "@/lib/data";
import ReviewRunner from "@/components/review-runner";
import { advanceTutorialDb } from "@/lib/tutorial";
import type { DuelWithWords } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await requireUser();
  advanceTutorialDb(user.id, 3);
  const cards = dueReviews(user.id, 50);

  const duels: DuelWithWords[] = [];
  for (const card of cards) {
    if (card.reps >= 1) {
      const duel = duelForWord(user.id, card.word_id);
      if (duel) duels.push(duel);
    }
  }

  return (
    <div>
      <ReviewRunner cards={cards} duels={duels} />
    </div>
  );
}
