import { getDb } from "./db";

const db = getDb();

db.exec(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event_type TEXT NOT NULL,
    event_data TEXT DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
  CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
`);

export type EventType =
  | "session_start"
  | "word_learned"
  | "review_completed"
  | "passage_read"
  | "spin_wheel"
  | "quest_claimed"
  | "purchase_made"
  | "weekly_test_completed"
  | "mastered_confirmed"
  | "mastered_demoted";

export function trackEvent(userId: number, eventType: EventType, eventData?: Record<string, unknown>) {
  db.prepare(
    "INSERT INTO analytics_events (user_id, event_type, event_data) VALUES (?, ?, ?)"
  ).run(userId, eventType, JSON.stringify(eventData ?? {}));
}
