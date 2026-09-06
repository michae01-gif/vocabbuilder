import { getOrCreateUser } from "@/lib/data";
import {
  passageMatches,
  pickPassage,
  lessonWordsByIds,
  distractorPool,
  getReadingState,
  passageById,
  getSkipCheckpointDb,
  checkpointQuizDb,
} from "@/lib/reading";
import ReadingRunner from "@/components/reading-runner";
import SkipCheckpoint from "@/components/skip-checkpoint";

export const dynamic = "force-dynamic";

export default function ReadPage() {
  const user = getOrCreateUser();
  const level = user.reading_level ?? 1;

  const checkpoint = getSkipCheckpointDb(user.id);
  if (checkpoint) {
    const quiz = checkpointQuizDb(user.id);
    if (quiz.length > 0) {
      return <SkipCheckpoint questions={quiz} level={level} />;
    }
  }

  const saved = getReadingState(user.id);
  const savedPassage = saved ? passageById(saved.passageId) : undefined;
  const passage = savedPassage ?? pickPassage(level);

  const matches = passageMatches(passage);
  const uniqueIds = [...new Set(matches.map((m) => m.wordId))];
  const words = lessonWordsByIds(uniqueIds);
  const pool = distractorPool(uniqueIds, 40);

  const validSelected = saved
    ? saved.selectedIds.filter((id) => uniqueIds.includes(id))
    : [];

  const initial =
    saved && savedPassage && validSelected.length > 0
      ? {
          selectedIds: validSelected,
          view: saved.view === "lesson" ? ("lesson" as const) : ("passage" as const),
          lesson: {
            phase: saved.lessonPhase,
            sentences: saved.sentences as Record<number, string>,
            testResults: saved.testResults,
            testIdx: saved.testIdx,
          },
        }
      : undefined;

  return (
    <ReadingRunner
      passage={passage}
      matches={matches}
      words={words}
      pool={pool}
      level={level}
      initial={initial}
    />
  );
}
