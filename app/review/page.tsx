import { requireUser } from "@/lib/auth";
import { dueReviews } from "@/lib/data";
import ReviewRunner from "@/components/review-runner";
import { advanceTutorialDb } from "@/lib/tutorial";
import { definitionMcqDb } from "@/lib/reading";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const user = await requireUser();
  advanceTutorialDb(user.id, 3);
  const cards = dueReviews(user.id, 50);
  const mcq = definitionMcqDb(cards.slice(0, 5).map((c) => c.word_id));

  return (
    <div>
      <ReviewRunner cards={cards} mcq={mcq} remainingDue={cards.length} />
    </div>
  );
}
