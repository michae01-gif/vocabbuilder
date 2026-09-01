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
  | "purchase_made";

export function trackEvent(userId: number, eventType: EventType, eventData?: Record<string, unknown>) {
  db.prepare(
    "INSERT INTO analytics_events (user_id, event_type, event_data) VALUES (?, ?, ?)"
  ).run(userId, eventType, JSON.stringify(eventData ?? {}));
}

export function getDailyActiveDays(userId: number, days: number) {
  const rows = db
    .prepare(
      `SELECT date(created_at) AS day, COUNT(*) AS n
       FROM analytics_events
       WHERE user_id = ? AND created_at >= ?
       GROUP BY day`
    )
    .all(userId, new Date(Date.now() - days * 86400000).toISOString()) as { day: string; n: number }[];

  const activeSet = new Set(rows.map((r) => r.day));
  const result: { date: string; active: boolean }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, active: activeSet.has(dateStr) });
  }

  return result;
}

export function getRetentionCohort(userId: number) {
  const firstSession = db
    .prepare(
      "SELECT MIN(created_at) AS first_at FROM analytics_events WHERE user_id = ? AND event_type = 'session_start'"
    )
    .get(userId) as { first_at: string | null } | undefined;

  if (!firstSession?.first_at) return { day1: 0, day7: 0, day30: 0 };

  const firstDate = new Date(firstSession.first_at);
  // const firstDayStr = firstDate.toISOString().slice(0, 10);

  const wasActiveOnDay = (dayOffset: number) => {
    const target = new Date(firstDate);
    target.setDate(target.getDate() + dayOffset);
    const targetStr = target.toISOString().slice(0, 10);
    const row = db
      .prepare(
        "SELECT COUNT(*) AS n FROM analytics_events WHERE user_id = ? AND date(created_at) = ?"
      )
      .get(userId, targetStr) as { n: number };
    return row.n > 0;
  };

  const day1 = wasActiveOnDay(1) ? 100 : 0;
  const day7 = wasActiveOnDay(7) ? 100 : 0;
  const day30 = wasActiveOnDay(30) ? 100 : 0;

  return { day1, day7, day30 };
}

export function getSessionStats(userId: number) {
  const sessions = db
    .prepare(
      "SELECT COUNT(*) AS total FROM sessions WHERE user_id = ?"
    )
    .get(userId) as { total: number };

  const avgLength = db
    .prepare(
      `SELECT AVG(
        CASE WHEN completed_at IS NOT NULL
        THEN (julianday(completed_at) - julianday(started_at)) * 86400
        ELSE NULL END
      ) AS avg_len FROM sessions WHERE user_id = ?`
    )
    .get(userId) as { avg_len: number | null };

  const wordsLearned = db
    .prepare(
      "SELECT COALESCE(SUM(words_learned), 0) AS total FROM sessions WHERE user_id = ?"
    )
    .get(userId) as { total: number };

  const totalReviews = db
    .prepare(
      "SELECT COUNT(*) AS total FROM review_logs WHERE user_id = ?"
    )
    .get(userId) as { total: number };

  const user = db
    .prepare(
      "SELECT streak FROM users WHERE id = ?"
    )
    .get(userId) as { streak: number } | undefined;

  return {
    totalSessions: sessions.total,
    avgSessionLength: Math.round(avgLength.avg_len ?? 0),
    totalWordsLearned: wordsLearned.total,
    totalReviews: totalReviews.total,
    streak: user?.streak ?? 0,
  };
}

export function getLearningVelocity(userId: number) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const wordsThisWeek = db
    .prepare(
      `SELECT COUNT(DISTINCT word_id) AS n FROM progress
       WHERE user_id = ? AND last_review >= ?`
    )
    .get(userId, weekAgo.toISOString()) as { n: number };

  const wordsLastWeek = db
    .prepare(
      `SELECT COUNT(DISTINCT word_id) AS n FROM progress
       WHERE user_id = ? AND last_review >= ? AND last_review < ?`
    )
    .get(userId, twoWeeksAgo.toISOString(), weekAgo.toISOString()) as { n: number };

  const diff = wordsThisWeek.n - wordsLastWeek.n;
  let trend: "up" | "down" | "stable" = "stable";
  if (diff > 2) trend = "up";
  else if (diff < -2) trend = "down";

  return {
    wordsThisWeek: wordsThisWeek.n,
    wordsLastWeek: wordsLastWeek.n,
    trend,
  };
}

export function getActivityHeatmap(userId: number) {
  const rows = db
    .prepare(
      `SELECT
        CAST(strftime('%w', created_at) AS INTEGER) AS day_of_week,
        CAST(strftime('%H', created_at) AS INTEGER) AS hour,
        COUNT(*) AS count
       FROM analytics_events
       WHERE user_id = ? AND created_at >= ?
       GROUP BY day_of_week, hour`
    )
    .all(
      userId,
      new Date(Date.now() - 7 * 86400000).toISOString()
    ) as { day_of_week: number; hour: number; count: number }[];

  return rows.map((r) => ({
    day: r.day_of_week,
    hour: r.hour,
    count: r.count,
  }));
}
