import { getDb } from "./db";
import { getOrCreateUser } from "./data";

const db = getDb();

type LeaderboardEntry = {
  rank: number;
  username: string;
  xp: number;
  words_mastered: number;
  streak: number;
  last_active: string;
  is_ai: boolean;
  is_you: boolean;
};

const AI_OPPONENTS: { username: string; xp: number; words_mastered: number; streak: number }[] = [
  { username: "Alex Chen", xp: 7420, words_mastered: 387, streak: 28 },
  { username: "Maria Santos", xp: 6810, words_mastered: 342, streak: 21 },
  { username: "James Wilson", xp: 5930, words_mastered: 298, streak: 15 },
  { username: "Yuki Tanaka", xp: 7890, words_mastered: 401, streak: 30 },
  { username: "Priya Sharma", xp: 5240, words_mastered: 267, streak: 12 },
  { username: "Lucas Müller", xp: 4680, words_mastered: 231, streak: 9 },
  { username: "Sofia Russo", xp: 6350, words_mastered: 319, streak: 18 },
  { username: "Ethan Kim", xp: 3920, words_mastered: 198, streak: 7 },
  { username: "Ava Thompson", xp: 5710, words_mastered: 289, streak: 14 },
  { username: "Omar Hassan", xp: 4150, words_mastered: 213, streak: 10 },
  { username: "Chloe Dubois", xp: 7200, words_mastered: 368, streak: 25 },
  { username: "Raj Patel", xp: 3540, words_mastered: 178, streak: 5 },
  { username: "Emma Lindqvist", xp: 6120, words_mastered: 305, streak: 16 },
  { username: "Diego Morales", xp: 4890, words_mastered: 247, streak: 11 },
  { username: "Hana Nakamura", xp: 5560, words_mastered: 281, streak: 13 },
  { username: "Noah Fischer", xp: 3180, words_mastered: 162, streak: 4 },
  { username: "Zara Okonkwo", xp: 6670, words_mastered: 338, streak: 20 },
  { username: "Felix Johansson", xp: 4420, words_mastered: 224, streak: 8 },
  { username: "Lina Al-Rashid", xp: 7560, words_mastered: 394, streak: 27 },
  { username: "Mateo Garcia", xp: 5080, words_mastered: 258, streak: 12 },
];

function migrateLeaderboard() {
  const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "username")) {
    db.prepare("ALTER TABLE users ADD COLUMN username TEXT").run();
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      xp INTEGER NOT NULL DEFAULT 0,
      words_mastered INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      last_active TEXT NOT NULL DEFAULT (datetime('now')),
      is_ai INTEGER NOT NULL DEFAULT 0
    );
  `);

  const count = (db.prepare("SELECT COUNT(*) AS n FROM leaderboard").get() as { n: number }).n;
  if (count === 0) seedAIOpponents();
}

function seedAIOpponents() {
  const insert = db.prepare(
    "INSERT INTO leaderboard (username, xp, words_mastered, streak, last_active, is_ai) VALUES (?, ?, ?, ?, ?, 1)"
  );
  for (const ai of AI_OPPONENTS) {
    const daysAgo = Math.floor(Math.random() * 7);
    const lastActive = new Date(Date.now() - daysAgo * 86400000).toISOString();
    insert.run(ai.username, ai.xp, ai.words_mastered, ai.streak, lastActive);
  }
}

migrateLeaderboard();

export function registerUsername(userId: number, username: string): { ok: boolean; error?: string } {
  const trimmed = username.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    return { ok: false, error: "Username must be 2–20 characters." };
  }
  const existing = db.prepare("SELECT username FROM users WHERE id = ?").get(userId) as { username: string | null } | undefined;
  if (existing?.username) {
    return { ok: false, error: "You already have a username." };
  }
  const taken = db.prepare("SELECT id FROM leaderboard WHERE username = ?").get(trimmed);
  if (taken) {
    return { ok: false, error: "That name is already taken." };
  }

  db.prepare("UPDATE users SET username = ? WHERE id = ?").run(trimmed, userId);
  const user = db.prepare("SELECT xp, streak FROM users WHERE id = ?").get(userId) as { xp: number; streak: number };
  const wordsMastered = (
    db.prepare(
      "SELECT COUNT(*) AS n FROM progress p JOIN words w ON w.id = p.word_id WHERE p.user_id = ? AND p.state = 2"
    ).get(userId) as { n: number }
  ).n;
  db.prepare(
    "INSERT INTO leaderboard (username, xp, words_mastered, streak, last_active, is_ai) VALUES (?, ?, ?, ?, datetime('now'), 0)"
  ).run(trimmed, user.xp, wordsMastered, user.streak);

  return { ok: true };
}

export function getLeaderboard(userId?: number): LeaderboardEntry[] {
  const rows = db
    .prepare(
      `SELECT username, xp, words_mastered, streak, last_active, is_ai
       FROM leaderboard
       ORDER BY xp DESC
       LIMIT 50`
    )
    .all() as { username: string; xp: number; words_mastered: number; streak: number; last_active: string; is_ai: number }[];

  const user = userId != null ? getOrCreateUser() : null;
  const userUsername = user ? (db.prepare("SELECT username FROM users WHERE id = ?").get(userId!) as { username: string | null } | undefined)?.username : null;

  return rows.map((r, i) => ({
    rank: i + 1,
    username: r.username,
    xp: r.xp,
    words_mastered: r.words_mastered,
    streak: r.streak,
    last_active: r.last_active,
    is_ai: r.is_ai === 1,
    is_you: userUsername != null && r.username === userUsername,
  }));
}

export function updateLeaderboardScore(userId: number) {
  const user = db.prepare("SELECT username, xp, streak FROM users WHERE id = ?").get(userId) as { username: string | null; xp: number; streak: number } | undefined;
  if (!user?.username) return;

  const wordsMastered = (
    db.prepare(
      "SELECT COUNT(*) AS n FROM progress p JOIN words w ON w.id = p.word_id WHERE p.user_id = ? AND p.state = 2"
    ).get(userId) as { n: number }
  ).n;

  db.prepare(
    `INSERT INTO leaderboard (username, xp, words_mastered, streak, last_active, is_ai)
     VALUES (?, ?, ?, ?, datetime('now'), 0)
     ON CONFLICT(username) DO UPDATE SET
       xp = excluded.xp,
       words_mastered = excluded.words_mastered,
       streak = excluded.streak,
       last_active = datetime('now')`
  ).run(user.username, user.xp, wordsMastered, user.streak);
}

export function getUserRank(userId: number): number | null {
  const user = db.prepare("SELECT username FROM users WHERE id = ?").get(userId) as { username: string | null } | undefined;
  if (!user?.username) return null;

  const row = db
    .prepare(
      `SELECT COUNT(*) + 1 AS rank FROM leaderboard
       WHERE xp > (SELECT xp FROM leaderboard WHERE username = ?)`
    )
    .get(user.username) as { rank: number };
  return row.rank;
}
