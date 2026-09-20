import { getDb } from "./db";
import "./seed";
import { RATINGS } from "./srs";
import { definitionMcqDb } from "./reading";

const db = getDb();

export type WeeklyQuestion = {
  wordId: number;
  word: string;
  definition: string;
  options: string[];
};

/** Monday of the current week, as a YYYY-MM-DD (UTC). */
export function weekStartISO(d: Date = new Date()): string {
  const day = d.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  const mon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + offset));
  return mon.toISOString().slice(0, 10);
}

/**
 * Words the user got wrong this week (rating = Again) plus words they've
 * missed in previous weekly tests and never since answered correctly.
 * Excludes words already answered correctly in an earlier test.
 */
export function weeklyMissedWordIds(userId: number): number[] {
  const week = weekStartISO();
  const thisWeek = db
    .prepare(
      `SELECT word_id FROM review_logs
       WHERE user_id = ? AND rating <= ? AND reviewed_at >= datetime(?)
       GROUP BY word_id`
    )
    .all(userId, RATINGS.Again, week) as { word_id: number }[];

  const carried = db
    .prepare(
      `SELECT r.word_id FROM weekly_test_results r
       JOIN weekly_test_runs rn ON rn.id = r.run_id
       WHERE r.user_id = ? AND r.correct = 0
       AND NOT EXISTS (
         SELECT 1 FROM weekly_test_results r2
         JOIN weekly_test_runs rn2 ON rn2.id = r2.run_id
         WHERE r2.user_id = ? AND r2.word_id = r.word_id AND r2.correct = 1 AND rn2.id > rn.id
       )`
    )
    .all(userId, userId) as { word_id: number }[];

  const ids = new Set<number>([
    ...thisWeek.map((r) => r.word_id),
    ...carried.map((r) => r.word_id),
  ]);
  return [...ids];
}

export function weeklyTestStatus(
  userId: number
): { eligible: number; taken: boolean; correct: number | null; total: number | null; coins: number | null } {
  const week = weekStartISO();
  const run = db
    .prepare("SELECT * FROM weekly_test_runs WHERE user_id = ? AND week_start = ?")
    .get(userId, week) as { correct_count: number; total_count: number; coins_earned: number } | undefined;
  if (run) {
    return { eligible: 0, taken: true, correct: run.correct_count, total: run.total_count, coins: run.coins_earned };
  }
  const eligible = weeklyMissedWordIds(userId).length;
  return { eligible, taken: false, correct: null, total: null, coins: null };
}

export function weeklyTestQuestions(userId: number): WeeklyQuestion[] {
  const ids = weeklyMissedWordIds(userId);
  if (ids.length === 0) return [];
  const ph = ids.map(() => "?").join(",");
  const words = db
    .prepare(`SELECT id, word, definition FROM words WHERE id IN (${ph}) AND definition <> ''`)
    .all(...ids) as { id: number; word: string; definition: string }[];
  if (words.length === 0) return [];
  const opts = definitionMcqDb(words.map((w) => w.id));
  return words.map((w) => ({
    wordId: w.id,
    word: w.word,
    definition: w.definition,
    options: opts[w.id] ?? [w.definition],
  }));
}

export function createWeeklyTestRun(userId: number): number {
  const week = weekStartISO();
  const row = db
    .prepare("SELECT id FROM weekly_test_runs WHERE user_id = ? AND week_start = ?")
    .get(userId, week) as { id: number } | undefined;
  if (row) return row.id;
  const info = db
    .prepare("INSERT INTO weekly_test_runs (user_id, week_start) VALUES (?, ?)")
    .run(userId, week);
  return Number(info.lastInsertRowid);
}

export function recordWeeklyTestAnswer(runId: number, userId: number, wordId: number, correct: boolean) {
  db.prepare(
    "INSERT INTO weekly_test_results (run_id, user_id, word_id, correct) VALUES (?, ?, ?, ?)"
  ).run(runId, userId, wordId, correct ? 1 : 0);
}