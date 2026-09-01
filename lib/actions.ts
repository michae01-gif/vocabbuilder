"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "./db";
import { getOrCreateUser, progressForWord, todayString } from "./data";
import { RATINGS, review, scheduleNew, type RatingValue } from "./srs";
import { computeStage } from "./stage";
import { evaluateSentence } from "./evaluate";
import { MAX_READING_TIER } from "@/data/passages";
import { saveReadingStateDb, clearReadingStateDb, type ReadingStateInput } from "./reading";
import { spinWheelDb, claimQuestDb, buyItemDb, equipItemDb, incrementQuest, claimRootDb, awardPassageCoinsDb, PASSAGE_COMPLETION_REWARD, type QuestType } from "./rewards";
import { registerUsername as registerUsernameDb, updateLeaderboardScore } from "./leaderboard";

const db = getDb();

function touchStreak(userId: number) {
  const user = getOrCreateUser();
  const today = todayString();
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
  let streak = user.streak;
  if (user.last_study_date !== today) {
    streak = user.last_study_date === yesterday ? streak + 1 : 1;
  }
  db.prepare("UPDATE users SET streak = ?, last_study_date = ? WHERE id = ?").run(streak, today, userId);
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/session");
  revalidatePath("/review");
  revalidatePath("/garden");
  revalidatePath("/stats");
  revalidatePath("/rewards");
  revalidatePath("/leaderboard");
}

export async function completeWord(wordId: number, sentence: string, repaired = false) {
  const user = getOrCreateUser();
  if (progressForWord(user.id, wordId)) return { ok: true };

  const info = scheduleNew(RATINGS.Good);
  const c = info.card;

  const word = db.prepare("SELECT * FROM words WHERE id = ?").get(wordId) as {
    word: string;
    definition: string;
    example1: string;
    example2: string;
    example3: string;
  } | undefined;

  let passed = 1;
  let issues = "";
  let feedback = "";
  let score = 20;
  if (word && sentence.trim().length > 2) {
    const verdict = evaluateSentence(sentence, {
      word: word.word,
      definition: word.definition,
      examples: [word.example1, word.example2, word.example3],
    });
    passed = verdict.passed ? 1 : 0;
    issues = verdict.issues.join(" · ");
    feedback = verdict.feedback;
    score = verdict.score;
  }

  db.prepare(
    `INSERT INTO progress (user_id, word_id, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review, stage,
       productive_successes, receptive_successes, discrimination_successes, transfer_successes, production_passes, critical_error_open,
       first_productive_at, last_productive_at, mastered_at, lapsed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    user.id,
    wordId,
    c.due.toISOString(),
    c.stability,
    c.difficulty,
    c.elapsed_days,
    c.scheduled_days,
    c.reps,
    c.lapses,
    c.state,
    c.last_review ? c.last_review.toISOString() : null,
    "recognised",
    0,
    0,
    0,
    0,
    passed,
    passed === 1 ? 0 : 1,
    null,
    null,
    null,
    null
  );

  db.prepare(
    `INSERT INTO production_attempts (user_id, word_id, sentence, verdict, issues, score, max_score, passed, repaired)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    user.id,
    wordId,
    sentence.trim().length > 2 ? sentence : "—",
    passed === 1 ? "passed" : "needs_repair",
    issues,
    score,
    20,
    passed,
    repaired ? 1 : 0
  );

  const xpGain = passed === 1 && sentence.trim().length > 2 ? 15 : 10;
  db.prepare("UPDATE users SET xp = xp + ? WHERE id = ?").run(xpGain, user.id);
  touchStreak(user.id);
  revalidateAll();
  return { ok: true, passed: passed === 1, feedback, score, maxScore: 20 };
}

export async function completeWordBatch(wordId: number, sentence: string, testCorrect: boolean) {
  const user = getOrCreateUser();
  if (progressForWord(user.id, wordId)) {
    return rateWord(wordId, testCorrect ? RATINGS.Good : RATINGS.Again, "productive");
  }

  const info = scheduleNew(
    testCorrect ? RATINGS.Good : RATINGS.Again
  );
  const c = info.card;

  const word = db.prepare("SELECT * FROM words WHERE id = ?").get(wordId) as {
    word: string;
    definition: string;
    example1: string;
    example2: string;
    example3: string;
  } | undefined;

  let passed = 0;
  let issues = "";
  let score = 0;
  if (word && sentence.trim().length > 2) {
    const verdict = evaluateSentence(sentence, {
      word: word.word,
      definition: word.definition,
      examples: [word.example1, word.example2, word.example3],
    });
    passed = verdict.passed ? 1 : 0;
    issues = verdict.issues.join(" · ");
    score = verdict.score;
  }

  const productive_successes = testCorrect ? 1 : 0;
  const first_productive_at = testCorrect ? new Date().toISOString() : null;
  const last_productive_at = testCorrect ? new Date().toISOString() : null;

  db.prepare(
    `INSERT INTO progress (user_id, word_id, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review, stage,
       productive_successes, receptive_successes, discrimination_successes, transfer_successes, production_passes, critical_error_open,
       first_productive_at, last_productive_at, mastered_at, lapsed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    user.id,
    wordId,
    c.due.toISOString(),
    c.stability,
    c.difficulty,
    c.elapsed_days,
    c.scheduled_days,
    c.reps,
    c.lapses,
    c.state,
    c.last_review ? c.last_review.toISOString() : null,
    "recognised",
    productive_successes,
    0,
    0,
    0,
    passed,
    testCorrect ? 0 : 1,
    first_productive_at,
    last_productive_at,
    null,
    null
  );

  db.prepare(
    `INSERT INTO production_attempts (user_id, word_id, sentence, verdict, issues, score, max_score, passed, repaired)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    user.id,
    wordId,
    sentence.trim().length > 2 ? sentence : "—",
    passed === 1 ? "passed" : "needs_repair",
    issues,
    score,
    20,
    passed,
    0
  );

  db.prepare("INSERT INTO review_logs (user_id, word_id, rating, task_type) VALUES (?, ?, ?, ?)").run(
    user.id,
    wordId,
    testCorrect ? RATINGS.Good : RATINGS.Again,
    "test"
  );

  incrementQuest(user.id, "learn_words");
  if (sentence.trim().length > 2) incrementQuest(user.id, "sentences");

  const xpGain = (testCorrect ? 6 : 2) + (passed ? 8 : 2);
  db.prepare("UPDATE users SET xp = xp + ? WHERE id = ?").run(xpGain, user.id);
  touchStreak(user.id);
  revalidateAll();
  return { ok: true };
}

export async function rateWord(wordId: number, rating: number, taskType: "receptive" | "productive" | "duel" = "receptive") {
  const user = getOrCreateUser();
  const p = progressForWord(user.id, wordId);
  if (!p) return { ok: false };

  const next = review(p, rating as RatingValue);
  db.prepare(
    `UPDATE progress SET due = ?, stability = ?, difficulty = ?, elapsed_days = ?, scheduled_days = ?, reps = ?, lapses = ?, state = ?, last_review = ? WHERE id = ?`
  ).run(
    next.due,
    next.stability,
    next.difficulty,
    next.elapsed_days,
    next.scheduled_days,
    next.reps,
    next.lapses,
    next.state,
    next.last_review,
    p.id
  );

  const now = new Date().toISOString();
  const correct = rating >= RATINGS.Good;
  const projected: typeof p = { ...p };
  if (taskType === "productive" && correct) {
    projected.productive_successes += 1;
    if (!projected.first_productive_at) projected.first_productive_at = now;
    projected.last_productive_at = now;
  }
  if (taskType === "receptive" && correct) projected.receptive_successes += 1;
  if (taskType === "duel" && correct) projected.discrimination_successes += 1;
  if (rating === RATINGS.Again && p.mastered_at) projected.lapsed_at = now;
  const stage = computeStage(projected);
  projected.stage = stage;
  if (stage === "mastered" && !projected.mastered_at) projected.mastered_at = now;

  db.prepare(
    `UPDATE progress SET first_productive_at = ?, last_productive_at = ?, productive_successes = ?, receptive_successes = ?,
       discrimination_successes = ?, stage = ?, mastered_at = ?, lapsed_at = ? WHERE id = ?`
  ).run(
    projected.first_productive_at,
    projected.last_productive_at,
    projected.productive_successes,
    projected.receptive_successes,
    projected.discrimination_successes,
    projected.stage,
    projected.mastered_at,
    projected.lapsed_at,
    p.id
  );

  db.prepare("INSERT INTO review_logs (user_id, word_id, rating, task_type) VALUES (?, ?, ?, ?)").run(
    user.id,
    wordId,
    rating,
    taskType
  );

  incrementQuest(user.id, "reviews");

  const xpGain = rating >= RATINGS.Good ? 4 : rating === RATINGS.Hard ? 2 : 0;
  if (xpGain > 0) db.prepare("UPDATE users SET xp = xp + ? WHERE id = ?").run(xpGain, user.id);
  touchStreak(user.id);
  revalidateAll();
  return { ok: true };
}

export async function skipPassage() {
  const user = getOrCreateUser();
  clearReadingStateDb(user.id);
  incrementQuest(user.id, "passages");
  awardPassageCoinsDb(user.id);
  const current = user.reading_level ?? 1;
  const next = Math.min(MAX_READING_TIER, current + 1);
  db.prepare("UPDATE users SET reading_level = ? WHERE id = ?").run(next, user.id);
  revalidatePath("/read");
  revalidatePath("/");
  revalidatePath("/rewards");
  return { ok: true, level: next, capped: next === current, coins: PASSAGE_COMPLETION_REWARD };
}

export async function finishReadingPassage() {
  const user = getOrCreateUser();
  clearReadingStateDb(user.id);
  incrementQuest(user.id, "passages");
  awardPassageCoinsDb(user.id);
  revalidatePath("/read");
  revalidatePath("/");
  revalidatePath("/rewards");
  return { ok: true, coins: PASSAGE_COMPLETION_REWARD };
}

export async function saveReadingState(state: ReadingStateInput) {
  const user = getOrCreateUser();
  saveReadingStateDb(user.id, state);
  return { ok: true };
}

export async function clearReadingState() {
  const user = getOrCreateUser();
  clearReadingStateDb(user.id);
  return { ok: true };
}

export async function spinWheel() {
  const user = getOrCreateUser();
  const result = spinWheelDb(user.id);
  revalidatePath("/rewards");
  revalidatePath("/");
  if (!result) return { ok: false as const, error: "Already spun today." };
  return { ok: true as const, index: result.index, amount: result.amount };
}

export async function claimQuest(type: QuestType) {
  const user = getOrCreateUser();
  const result = claimQuestDb(user.id, type);
  revalidatePath("/rewards");
  revalidatePath("/");
  return result;
}

export async function claimRoot(rootId: number) {
  const user = getOrCreateUser();
  const result = claimRootDb(user.id, rootId);
  revalidatePath("/");
  revalidatePath("/garden");
  return result;
}

export async function buyItem(itemId: string) {
  const user = getOrCreateUser();
  const result = buyItemDb(user.id, itemId);
  revalidatePath("/rewards");
  revalidatePath("/");
  return result;
}

export async function equipItem(itemId: string) {
  const user = getOrCreateUser();
  const result = equipItemDb(user.id, itemId);
  revalidatePath("/rewards");
  revalidatePath("/");
  return result;
}

export async function registerLeaderboardUsername(username: string) {
  const user = getOrCreateUser();
  const result = registerUsernameDb(user.id, username);
  if (result.ok) {
    revalidatePath("/leaderboard");
    revalidatePath("/");
  }
  return result;
}

export async function syncLeaderboard() {
  const user = getOrCreateUser();
  updateLeaderboardScore(user.id);
  revalidatePath("/leaderboard");
  return { ok: true };
}
