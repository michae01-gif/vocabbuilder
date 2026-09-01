import Database from "better-sqlite3";
import path from "path";
import os from "os";
import fs from "fs";

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const DB_DIR = isBuildPhase
  ? path.join(fs.mkdtempSync(path.join(os.tmpdir(), "wordforge-build-")))
  : process.env.RAILWAY_VOLUME_MOUNT_PATH
    || (process.env.DATABASE_PATH ? path.dirname(process.env.DATABASE_PATH) : path.join(process.cwd(), "data"));
const DB_FILE = process.env.DATABASE_PATH ?? path.join(DB_DIR, "wordforge.db");

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function getDb() {
  return db;
}

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roots (
      id INTEGER PRIMARY KEY,
      root TEXT NOT NULL,
      meaning TEXT NOT NULL,
      language TEXT NOT NULL,
      story TEXT NOT NULL,
      emoji TEXT NOT NULL,
      order_idx INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY,
      root_id INTEGER NOT NULL REFERENCES roots(id),
      word TEXT NOT NULL UNIQUE,
      pos TEXT NOT NULL,
      definition TEXT NOT NULL,
      pronunciation TEXT NOT NULL DEFAULT '',
      example1 TEXT NOT NULL,
      example2 TEXT NOT NULL,
      example3 TEXT NOT NULL,
      etymology TEXT NOT NULL,
      difficulty INTEGER NOT NULL DEFAULT 1,
      frequency INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL DEFAULT 'WordForger',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      xp INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      last_study_date TEXT
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      word_id INTEGER NOT NULL REFERENCES words(id),
      due TEXT NOT NULL,
      stability REAL NOT NULL DEFAULT 0,
      difficulty REAL NOT NULL DEFAULT 0,
      elapsed_days REAL NOT NULL DEFAULT 0,
      scheduled_days REAL NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      lapses INTEGER NOT NULL DEFAULT 0,
      state INTEGER NOT NULL DEFAULT 0,
      last_review TEXT,
      stage TEXT NOT NULL DEFAULT 'recognised',
      productive_successes INTEGER NOT NULL DEFAULT 0,
      receptive_successes INTEGER NOT NULL DEFAULT 0,
      discrimination_successes INTEGER NOT NULL DEFAULT 0,
      transfer_successes INTEGER NOT NULL DEFAULT 0,
      production_passes INTEGER NOT NULL DEFAULT 0,
      critical_error_open INTEGER NOT NULL DEFAULT 0,
      first_productive_at TEXT,
      last_productive_at TEXT,
      mastered_at TEXT,
      lapsed_at TEXT,
      UNIQUE(user_id, word_id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      words_learned INTEGER NOT NULL DEFAULT 0,
      reviews_done INTEGER NOT NULL DEFAULT 0,
      xp_earned INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS review_logs (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      word_id INTEGER NOT NULL REFERENCES words(id),
      rating INTEGER NOT NULL,
      task_type TEXT NOT NULL DEFAULT 'receptive',
      reviewed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS production_attempts (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      word_id INTEGER NOT NULL REFERENCES words(id),
      sentence TEXT NOT NULL,
      verdict TEXT NOT NULL,
      issues TEXT NOT NULL DEFAULT '',
      score INTEGER NOT NULL DEFAULT 0,
      max_score INTEGER NOT NULL DEFAULT 20,
      passed INTEGER NOT NULL DEFAULT 0,
      repaired INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS duels (
      id INTEGER PRIMARY KEY,
      word_id INTEGER NOT NULL REFERENCES words(id),
      foil_word_id INTEGER NOT NULL REFERENCES words(id),
      prompt TEXT NOT NULL,
      distinction TEXT NOT NULL,
      order_idx INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reading_state (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      passage_id TEXT NOT NULL,
      selected_ids TEXT NOT NULL DEFAULT '[]',
      view TEXT NOT NULL DEFAULT 'passage',
      lesson_phase TEXT NOT NULL DEFAULT 'teach',
      sentences TEXT NOT NULL DEFAULT '{}',
      test_results TEXT NOT NULL DEFAULT '[]',
      test_idx INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchases (
      user_id INTEGER NOT NULL REFERENCES users(id),
      item_id TEXT NOT NULL,
      purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, item_id)
    );

    CREATE TABLE IF NOT EXISTS daily_quests (
      user_id INTEGER NOT NULL REFERENCES users(id),
      date TEXT NOT NULL,
      quest_type TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      target INTEGER NOT NULL,
      reward INTEGER NOT NULL,
      claimed INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, date, quest_type)
    );

    CREATE TABLE IF NOT EXISTS root_claims (
      user_id INTEGER NOT NULL REFERENCES users(id),
      root_id INTEGER NOT NULL REFERENCES roots(id),
      claimed_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, root_id)
    );

    CREATE INDEX IF NOT EXISTS idx_progress_due ON progress(due);
    CREATE INDEX IF NOT EXISTS idx_words_root ON words(root_id);
  `);

  migrateProgress();
  migrateUsers();
}

function tryAlter(sql: string) {
  try {
    db.prepare(sql).run();
  } catch (e) {
    if (!(e instanceof Error && e.message.includes("duplicate column name"))) throw e;
  }
}

function migrateProgress() {
  const cols = db.prepare("PRAGMA table_info(progress)").all() as { name: string }[];
  const has = (name: string) => cols.some((c) => c.name === name);
  if (!has("stage")) tryAlter("ALTER TABLE progress ADD COLUMN stage TEXT NOT NULL DEFAULT 'recognised'");
  if (!has("productive_successes"))
    tryAlter("ALTER TABLE progress ADD COLUMN productive_successes INTEGER NOT NULL DEFAULT 0");
  if (!has("receptive_successes"))
    tryAlter("ALTER TABLE progress ADD COLUMN receptive_successes INTEGER NOT NULL DEFAULT 0");
  if (!has("discrimination_successes"))
    tryAlter("ALTER TABLE progress ADD COLUMN discrimination_successes INTEGER NOT NULL DEFAULT 0");
  if (!has("transfer_successes"))
    tryAlter("ALTER TABLE progress ADD COLUMN transfer_successes INTEGER NOT NULL DEFAULT 0");
  if (!has("production_passes"))
    tryAlter("ALTER TABLE progress ADD COLUMN production_passes INTEGER NOT NULL DEFAULT 0");
  if (!has("critical_error_open"))
    tryAlter("ALTER TABLE progress ADD COLUMN critical_error_open INTEGER NOT NULL DEFAULT 0");
  if (!has("first_productive_at"))
    tryAlter("ALTER TABLE progress ADD COLUMN first_productive_at TEXT");
  if (!has("last_productive_at"))
    tryAlter("ALTER TABLE progress ADD COLUMN last_productive_at TEXT");
  if (!has("mastered_at")) tryAlter("ALTER TABLE progress ADD COLUMN mastered_at TEXT");
  if (!has("lapsed_at")) tryAlter("ALTER TABLE progress ADD COLUMN lapsed_at TEXT");

  const rcols = db.prepare("PRAGMA table_info(review_logs)").all() as { name: string }[];
  if (!rcols.some((c) => c.name === "task_type"))
    tryAlter("ALTER TABLE review_logs ADD COLUMN task_type TEXT NOT NULL DEFAULT 'receptive'");
}

function migrateUsers() {
  const cols = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const has = (name: string) => cols.some((c) => c.name === name);
  if (!has("reading_level")) {
    tryAlter("ALTER TABLE users ADD COLUMN reading_level INTEGER NOT NULL DEFAULT 1");
  }
  if (!has("coins")) {
    tryAlter("ALTER TABLE users ADD COLUMN coins INTEGER NOT NULL DEFAULT 0");
    db.prepare("UPDATE users SET coins = 100").run();
  }
  if (!has("last_spin_date")) {
    tryAlter("ALTER TABLE users ADD COLUMN last_spin_date TEXT");
  }
  if (!has("avatar")) {
    tryAlter("ALTER TABLE users ADD COLUMN avatar TEXT NOT NULL DEFAULT '🦉'");
  }
  if (!has("title")) {
    tryAlter("ALTER TABLE users ADD COLUMN title TEXT NOT NULL DEFAULT 'Novice'");
  }
  if (!has("banner")) {
    tryAlter("ALTER TABLE users ADD COLUMN banner TEXT NOT NULL DEFAULT 'banner-amber'");
  }
  if (!has("frame")) {
    tryAlter("ALTER TABLE users ADD COLUMN frame TEXT NOT NULL DEFAULT 'frame-classic'");
  }
  if (!has("name_style")) {
    tryAlter("ALTER TABLE users ADD COLUMN name_style TEXT NOT NULL DEFAULT 'name-classic'");
  }
  if (!has("background")) {
    tryAlter("ALTER TABLE users ADD COLUMN background TEXT NOT NULL DEFAULT 'bg-forge'");
  }
}

initSchema();