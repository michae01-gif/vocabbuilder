import { getDb } from "./db";
import "./seed";
import type { DuelWithWords, Progress, Root, Word, WordStage } from "./types";
import { computeStage } from "./stage";

export type User = {
  id: number;
  name: string;
  created_at: string;
  xp: number;
  streak: number;
  last_study_date: string | null;
  reading_level: number;
  coins: number;
  last_spin_date: string | null;
  avatar: string;
  title: string;
  banner: string;
  frame: string;
  name_style: string;
  background: string;
  username: string | null;
};

const db = getDb();

export function getOrCreateUser(): User {
  let user = db.prepare("SELECT * FROM users WHERE id = 1").get() as User | undefined;
  if (!user) {
    db.prepare("INSERT INTO users (id) VALUES (1)").run();
    user = db.prepare("SELECT * FROM users WHERE id = 1").get() as User;
  }
  return user;
}

export function todayString(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function wordCountTotal(): number {
  return (db.prepare("SELECT COUNT(*) AS n FROM words").get() as { n: number }).n;
}

export function rootCountTotal(): number {
  return (db.prepare("SELECT COUNT(*) AS n FROM roots").get() as { n: number }).n;
}

export function userStats(userId: number) {
  const introduced = (db.prepare("SELECT COUNT(*) AS n FROM progress WHERE user_id = ?").get(userId) as { n: number }).n;
  const progressRows = db.prepare("SELECT * FROM progress WHERE user_id = ?").all(userId) as Progress[];
  const stages = progressRows.map((p) => computeStage(p));
  const mastered = stages.filter((s) => s === "mastered").length;
  const produced = stages.filter((s) => s === "produced" || s === "transferred" || s === "mastered").length;
  const recalled = stages.filter((s) => s === "recalled").length;
  const lapsed = stages.filter((s) => s === "lapsed").length;
  const due = (
    db
      .prepare("SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND due <= ?")
      .get(userId, new Date().toISOString()) as { n: number }
  ).n;
  const rootsExplored = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT w.root_id) AS n FROM progress p JOIN words w ON w.id = p.word_id WHERE p.user_id = ?"
      )
      .get(userId) as { n: number }
  ).n;
  const reviewsTotal = (db.prepare("SELECT COUNT(*) AS n FROM review_logs WHERE user_id = ?").get(userId) as { n: number }).n;
  const productiveReviews = (
    db
      .prepare("SELECT COUNT(*) AS n FROM review_logs WHERE user_id = ? AND task_type = 'productive'")
      .get(userId) as { n: number }
  ).n;
  return { introduced, mastered, produced, recalled, lapsed, due, rootsExplored, reviewsTotal, productiveReviews };
}

export function currentRoot(userId: number): Root {
  const allRoots = db.prepare("SELECT * FROM roots ORDER BY order_idx").all() as Root[];
  for (const root of allRoots) {
    const total = (db.prepare("SELECT COUNT(*) AS n FROM words WHERE root_id = ?").get(root.id) as { n: number }).n;
    const done = (
      db
        .prepare(
          "SELECT COUNT(*) AS n FROM words w JOIN progress p ON p.word_id = w.id AND p.user_id = ? WHERE w.root_id = ?"
        )
        .get(userId, root.id) as { n: number }
    ).n;
    if (done < total) return root;
  }
  return allRoots[allRoots.length - 1];
}

export function wordsForRoot(rootId: number): Word[] {
  return db.prepare("SELECT * FROM words WHERE root_id = ? ORDER BY frequency").all(rootId) as Word[];
}

export function newWordsForRoot(userId: number, rootId: number): Word[] {
  return db
    .prepare(
      `SELECT * FROM words WHERE root_id = ? AND id NOT IN (SELECT word_id FROM progress WHERE user_id = ?) ORDER BY frequency`
    )
    .all(rootId, userId) as Word[];
}

export function newWordsBatch(userId: number, rootId: number, limit = 5): Word[] {
  return db
    .prepare(
      `SELECT * FROM words WHERE root_id = ? AND id NOT IN (SELECT word_id FROM progress WHERE user_id = ?) ORDER BY frequency LIMIT ?`
    )
    .all(rootId, userId, limit) as Word[];
}

export function masteredWordsForRoot(userId: number, rootId: number): Word[] {
  return db
    .prepare(
      `SELECT w.* FROM words w JOIN progress p ON p.word_id = w.id AND p.user_id = ? WHERE w.root_id = ? AND p.state = 2`
    )
    .all(userId, rootId) as Word[];
}

export function dueReviews(userId: number, limit = 40): (Progress & Word & {
  root: string;
  root_emoji: string;
  root_meaning: string;
  task_type: "receptive" | "productive";
})[] {
  const rows = db
    .prepare(
      `SELECT p.*, w.* FROM progress p
       JOIN words w ON w.id = p.word_id
       JOIN roots r ON r.id = w.root_id
       WHERE p.user_id = ? AND p.due <= ?
       ORDER BY p.due ASC
       LIMIT ?`
    )
    .all(userId, new Date().toISOString(), limit) as (Progress & Word & {
    root: string;
    root_emoji: string;
    root_meaning: string;
  })[];
  return rows.map((row, i) => ({
    ...row,
    task_type: i % 2 === 0 ? "productive" : "receptive",
  }));
}

export function duelForWord(userId: number, wordId: number): DuelWithWords | undefined {
  const duel = db
    .prepare(
      `SELECT d.*, wa.word, wa.definition AS word_definition, fb.word AS foil_word, fb.definition AS foil_definition,
              r.root, r.emoji AS root_emoji
       FROM duels d
       JOIN words wa ON wa.id = d.word_id
       JOIN words fb ON fb.id = d.foil_word_id
       JOIN roots r ON r.id = wa.root_id
       WHERE d.word_id = ?
       ORDER BY d.order_idx LIMIT 1`
    )
    .get(wordId) as DuelWithWords | undefined;
  if (!duel) return undefined;
  const done = (
    db
      .prepare("SELECT COUNT(*) AS n FROM review_logs WHERE user_id = ? AND word_id = ? AND task_type = 'duel'")
      .get(userId, wordId) as { n: number }
  ).n;
  if (done > 0) return undefined;
  return duel;
}

export function productionAttemptsForWord(userId: number, wordId: number) {
  return db
    .prepare(
      "SELECT * FROM production_attempts WHERE user_id = ? AND word_id = ? ORDER BY created_at DESC LIMIT 5"
    )
    .all(userId, wordId) as {
    id: number;
    sentence: string;
    verdict: string;
    issues: string;
    score: number;
    max_score: number;
    passed: number;
    repaired: number;
    created_at: string;
  }[];
}

export function productiveRecallStats(userId: number) {
  const total = (
    db
      .prepare("SELECT COUNT(*) AS n FROM review_logs WHERE user_id = ? AND task_type = 'productive'")
      .get(userId) as { n: number }
  ).n;
  const good = (
    db
      .prepare(
        "SELECT COUNT(*) AS n FROM review_logs WHERE user_id = ? AND task_type = 'productive' AND rating >= 3"
      )
      .get(userId) as { n: number }
  ).n;
  return { total, good };
}

export function progressForWord(userId: number, wordId: number): Progress | undefined {
  return db.prepare("SELECT * FROM progress WHERE user_id = ? AND word_id = ?").get(userId, wordId) as
    | Progress
    | undefined;
}

export function allProgressWithWords(userId: number) {
  return db
    .prepare(
      `SELECT p.*, w.*, r.root, r.emoji AS root_emoji, r.meaning AS root_meaning
       FROM progress p
       JOIN words w ON w.id = p.word_id
       JOIN roots r ON r.id = w.root_id
       WHERE p.user_id = ?
       ORDER BY w.root_id, w.frequency`
    )
    .all(userId) as (Progress & Word & { root: string; root_emoji: string; root_meaning: string })[];
}

export function gardenData(userId: number) {
  const roots = db.prepare("SELECT * FROM roots ORDER BY order_idx").all() as Root[];
  const progressRows = db.prepare("SELECT * FROM progress WHERE user_id = ?").all(userId) as Progress[];
  const stageById = new Map<number, WordStage>();
  for (const p of progressRows) stageById.set(p.word_id, computeStage(p));
  return roots.map((root) => {
    const rows = db
      .prepare(`SELECT id, word FROM words WHERE root_id = ? ORDER BY frequency`)
      .all(root.id) as { id: number; word: string }[];
    const words = rows.map((r) => ({
      word: r.word,
      stage: (stageById.get(r.id) ?? "unseen") as WordStage,
    }));
    const learned = words.filter((w) => w.stage !== "unseen").length;
    return { root, words, learned };
  });
}

export function reviewLoad(userId: number): { due: number; newCap: number; message: string | null } {
  const due = (
    db
      .prepare("SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND due <= ?")
      .get(userId, new Date().toISOString()) as { n: number }
  ).n;
  if (due >= 20) return { due, newCap: 1, message: "Big review backlog — learn just one new word today." };
  if (due >= 12) return { due, newCap: 3, message: "Several reviews due — we'll keep new words light." };
  return { due, newCap: 5, message: null };
}

export function reviewsLastDays(userId: number, days = 14) {
  const rows = db
    .prepare(
      `SELECT date(reviewed_at) AS day, COUNT(*) AS n FROM review_logs WHERE user_id = ? AND reviewed_at >= ? GROUP BY day`
    )
    .all(userId, new Date(Date.now() - days * 86400000).toISOString()) as { day: string; n: number }[];
  return rows;
}