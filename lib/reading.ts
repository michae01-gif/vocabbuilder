import { getDb } from "./db";
import "./seed";
import { inflections } from "./evaluate";
import { passages, MAX_READING_TIER, type Passage } from "@/data/passages";
import type { Word } from "./types";

export type VocabMatch = {
  wordId: number;
  base: string;
  form: string;
  start: number;
  end: number;
};

export type LessonWord = Word & {
  root: string;
  root_meaning: string;
  root_language: string;
  root_emoji: string;
};

let formIndex: Map<string, { id: number; word: string }> | null = null;

function getFormIndex(): Map<string, { id: number; word: string }> {
  if (formIndex) return formIndex;
  const db = getDb();
  const rows = db.prepare("SELECT id, word FROM words").all() as { id: number; word: string }[];
  const map = new Map<string, { id: number; word: string }>();
  for (const row of rows) {
    for (const form of inflections(row.word)) {
      if (!map.has(form)) map.set(form, row);
    }
    if (!map.has(row.word.toLowerCase())) map.set(row.word.toLowerCase(), row);
  }
  formIndex = map;
  return map;
}

export function passageMatches(passage: Passage): VocabMatch[] {
  const index = getFormIndex();
  const matches: VocabMatch[] = [];
  const re = /[A-Za-z]+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(passage.text)) !== null) {
    const token = m[0].toLowerCase();
    if (token.length < 3) continue;
    const hit = index.get(token);
    if (hit) {
      matches.push({
        wordId: hit.id,
        base: hit.word,
        form: m[0],
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }
  return matches;
}

export function pickPassage(level: number): Passage {
  const lv = Math.max(1, Math.min(MAX_READING_TIER, level));
  const tier = passages.filter((p) => p.difficulty === lv);
  return tier[Math.floor(Math.random() * tier.length)];
}

export function passageById(id: string): Passage | undefined {
  return passages.find((p) => p.id === id);
}

export type ReadingStateInput = {
  passageId: string;
  selectedIds: number[];
  view: "passage" | "lesson";
  lessonPhase: "teach" | "produce" | "test";
  sentences: Record<string, string>;
  testResults: { wordId: number; word: string; correct: boolean; guessed: string }[];
  testIdx: number;
};

export type SavedReadingState = ReadingStateInput;

export function saveReadingStateDb(userId: number, state: ReadingStateInput) {
  const db = getDb();
  db.prepare(
    `INSERT INTO reading_state (user_id, passage_id, selected_ids, view, lesson_phase, sentences, test_results, test_idx, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET
       passage_id = excluded.passage_id,
       selected_ids = excluded.selected_ids,
       view = excluded.view,
       lesson_phase = excluded.lesson_phase,
       sentences = excluded.sentences,
       test_results = excluded.test_results,
       test_idx = excluded.test_idx,
       updated_at = datetime('now')`
  ).run(
    userId,
    state.passageId,
    JSON.stringify(state.selectedIds),
    state.view,
    state.lessonPhase,
    JSON.stringify(state.sentences),
    JSON.stringify(state.testResults),
    state.testIdx
  );
}

export function clearReadingStateDb(userId: number) {
  getDb().prepare("DELETE FROM reading_state WHERE user_id = ?").run(userId);
}

export function getReadingState(userId: number): SavedReadingState | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT passage_id, selected_ids, view, lesson_phase, sentences, test_results, test_idx FROM reading_state WHERE user_id = ?"
    )
    .get(userId) as
    | {
        passage_id: string;
        selected_ids: string;
        view: string;
        lesson_phase: string;
        sentences: string;
        test_results: string;
        test_idx: number;
      }
    | undefined;
  if (!row) return null;
  try {
    const selectedIds = JSON.parse(row.selected_ids) as number[];
    const view = row.view === "lesson" ? "lesson" : "passage";
    const lessonPhase = (["teach", "produce", "test"].includes(row.lesson_phase)
      ? row.lesson_phase
      : "teach") as ReadingStateInput["lessonPhase"];
    return {
      passageId: row.passage_id,
      selectedIds,
      view,
      lessonPhase,
      sentences: JSON.parse(row.sentences) as Record<string, string>,
      testResults: JSON.parse(row.test_results) as ReadingStateInput["testResults"],
      testIdx: row.test_idx ?? 0,
    };
  } catch {
    return null;
  }
}

export function lessonWordsByIds(ids: number[]): LessonWord[] {
  if (ids.length === 0) return [];
  const db = getDb();
  const placeholders = ids.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT w.*, r.root, r.meaning AS root_meaning, r.language AS root_language, r.emoji AS root_emoji
       FROM words w JOIN roots r ON r.id = w.root_id
       WHERE w.id IN (${placeholders})
       ORDER BY w.difficulty DESC, w.word`
    )
    .all(...ids) as LessonWord[];
  return rows;
}

export function distractorPool(excludeIds: number[], n = 40): string[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT word FROM words WHERE id NOT IN (SELECT word_id FROM progress WHERE user_id = 1)
       ${excludeIds.length ? `AND id NOT IN (${excludeIds.map(() => "?").join(",")})` : ""}
       ORDER BY RANDOM() LIMIT ?`
    )
    .all(...excludeIds, n) as { word: string }[];
  return rows.map((r) => r.word);
}
