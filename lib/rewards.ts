import { getDb } from "./db";
import { todayString } from "./data";
import { WHEEL_SEGMENTS } from "@/data/wheel";
import { SHOP_ITEMS, shopItemById } from "@/data/shop";

export type QuestType = "learn_words" | "reviews" | "passages" | "sentences";

export const QUEST_POOL: { type: QuestType; label: string; icon: string; target: number; reward: number }[] = [
  { type: "learn_words", label: "Learn 3 new words", icon: "🌱", target: 3, reward: 50 },
  { type: "reviews", label: "Complete 10 reviews", icon: "🧠", target: 10, reward: 60 },
  { type: "passages", label: "Read 2 passages", icon: "📖", target: 2, reward: 80 },
  { type: "sentences", label: "Write 5 sentences", icon: "✍️", target: 5, reward: 40 },
];

export type QuestView = {
  type: QuestType;
  label: string;
  icon: string;
  target: number;
  reward: number;
  progress: number;
  claimed: boolean;
};

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function todaysQuestTypes(date: string): QuestType[] {
  let h = 2166136261;
  for (const c of date) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const rand = mulberry32(h >>> 0);
  const order = [...QUEST_POOL.keys()].sort(() => rand() - 0.5);
  return order.slice(0, 3).map((i) => QUEST_POOL[i].type);
}

export function getTodayQuests(userId: number): QuestView[] {
  const db = getDb();
  const date = todayString();
  db.prepare("DELETE FROM daily_quests WHERE date < ?").run(date);

  const types = todaysQuestTypes(date);
  const insert = db.prepare(
    `INSERT INTO daily_quests (user_id, date, quest_type, progress, target, reward, claimed)
     VALUES (?, ?, ?, 0, ?, ?, 0)
     ON CONFLICT(user_id, date, quest_type) DO NOTHING`
  );
  for (const type of types) {
    const def = QUEST_POOL.find((q) => q.type === type)!;
    insert.run(userId, date, type, def.target, def.reward);
  }

  const rows = db
    .prepare(
      "SELECT quest_type, progress, target, reward, claimed FROM daily_quests WHERE user_id = ? AND date = ?"
    )
    .all(userId, date) as { quest_type: string; progress: number; target: number; reward: number; claimed: number }[];

  return types.map((type) => {
    const def = QUEST_POOL.find((q) => q.type === type)!;
    const row = rows.find((r) => r.quest_type === type);
    return {
      type,
      label: def.label,
      icon: def.icon,
      target: row?.target ?? def.target,
      reward: row?.reward ?? def.reward,
      progress: Math.min(row?.progress ?? 0, row?.target ?? def.target),
      claimed: (row?.claimed ?? 0) === 1,
    };
  });
}

export function incrementQuest(userId: number, type: QuestType, amount = 1) {
  const db = getDb();
  const date = todayString();
  const def = QUEST_POOL.find((q) => q.type === type);
  if (!def) return;
  db.prepare(
    `INSERT INTO daily_quests (user_id, date, quest_type, progress, target, reward, claimed)
     VALUES (?, ?, ?, ?, ?, ?, 0)
     ON CONFLICT(user_id, date, quest_type) DO UPDATE SET progress = MIN(progress + excluded.progress, target)`
  ).run(userId, date, type, amount, def.target, def.reward);
}

export function claimQuestDb(userId: number, type: QuestType): { ok: boolean; reward?: number; error?: string } {
  const db = getDb();
  const date = todayString();
  const row = db
    .prepare("SELECT progress, target, reward, claimed FROM daily_quests WHERE user_id = ? AND date = ? AND quest_type = ?")
    .get(userId, date, type) as { progress: number; target: number; reward: number; claimed: number } | undefined;
  if (!row) return { ok: false, error: "Quest not found today." };
  if (row.claimed) return { ok: false, error: "Already claimed." };
  if (row.progress < row.target) return { ok: false, error: "Not complete yet." };
  db.prepare("UPDATE daily_quests SET claimed = 1 WHERE user_id = ? AND date = ? AND quest_type = ?").run(userId, date, type);
  db.prepare("UPDATE users SET coins = coins + ? WHERE id = ?").run(row.reward, userId);
  return { ok: true, reward: row.reward };
}

export function spinWheelDb(userId: number): { index: number; amount: number } | null {
  const db = getDb();
  const date = todayString();
  const user = db.prepare("SELECT last_spin_date FROM users WHERE id = ?").get(userId) as { last_spin_date: string | null };
  if (user.last_spin_date === date) return null;

  const total = WHEEL_SEGMENTS.reduce((n, s) => n + s.weight, 0);
  let roll = Math.random() * total;
  let index = 0;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    roll -= WHEEL_SEGMENTS[i].weight;
    if (roll <= 0) {
      index = i;
      break;
    }
  }
  const amount = WHEEL_SEGMENTS[index].amount;
  db.prepare("UPDATE users SET coins = coins + ?, last_spin_date = ? WHERE id = ?").run(amount, date, userId);
  return { index, amount };
}

export const ROOT_COMPLETION_REWARD = 150;
export const PASSAGE_COMPLETION_REWARD = 40;

export function awardPassageCoinsDb(userId: number): number {
  getDb().prepare("UPDATE users SET coins = coins + ? WHERE id = ?").run(PASSAGE_COMPLETION_REWARD, userId);
  return PASSAGE_COMPLETION_REWARD;
}

export type ClaimableRoot = { rootId: number; root: string; emoji: string; wordCount: number };

export function claimableRoots(userId: number): ClaimableRoot[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT r.id AS rootId, r.root, r.emoji, COUNT(w.id) AS wordCount
       FROM roots r
       JOIN words w ON w.root_id = r.id
       LEFT JOIN progress p ON p.word_id = w.id AND p.user_id = ?
       GROUP BY r.id
       HAVING COUNT(w.id) > 0 AND COUNT(p.id) = COUNT(w.id)`
    )
    .all(userId) as ClaimableRoot[];
  const claimed = new Set(
    (db.prepare("SELECT root_id FROM root_claims WHERE user_id = ?").all(userId) as { root_id: number }[]).map(
      (r) => r.root_id
    )
  );
  return rows.filter((r) => !claimed.has(r.rootId));
}

export function claimRootDb(userId: number, rootId: number): { ok: boolean; reward?: number; error?: string } {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) AS n FROM words WHERE root_id = ?").get(rootId) as { n: number }).n;
  const done = (
    db
      .prepare(
        "SELECT COUNT(*) AS n FROM words w JOIN progress p ON p.word_id = w.id AND p.user_id = ? WHERE w.root_id = ?"
      )
      .get(userId, rootId) as { n: number }
  ).n;
  if (total === 0 || done < total) return { ok: false, error: "Root not complete yet." };
  const already = db.prepare("SELECT 1 FROM root_claims WHERE user_id = ? AND root_id = ?").get(userId, rootId);
  if (already) return { ok: false, error: "Already claimed." };
  db.prepare("INSERT INTO root_claims (user_id, root_id) VALUES (?, ?)").run(userId, rootId);
  db.prepare("UPDATE users SET coins = coins + ? WHERE id = ?").run(ROOT_COMPLETION_REWARD, userId);
  return { ok: true, reward: ROOT_COMPLETION_REWARD };
}

export function getOwnedItemIds(userId: number): Set<string> {
  const rows = getDb()
    .prepare("SELECT item_id FROM purchases WHERE user_id = ?")
    .all(userId) as { item_id: string }[];
  const owned = new Set<string>(rows.map((r) => r.item_id));
  for (const item of SHOP_ITEMS) {
    if (item.cost === 0) owned.add(item.id);
  }
  return owned;
}

export function buyItemDb(userId: number, itemId: string): { ok: boolean; coins?: number; error?: string } {
  const db = getDb();
  const item = shopItemById(itemId);
  if (!item) return { ok: false, error: "Unknown item." };
  const owned = getOwnedItemIds(userId);
  if (owned.has(itemId)) return { ok: false, error: "Already owned." };
  const user = db.prepare("SELECT coins FROM users WHERE id = ?").get(userId) as { coins: number };
  if (user.coins < item.cost) return { ok: false, error: `Need ${item.cost - user.coins} more coins.` };
  db.prepare("UPDATE users SET coins = coins - ? WHERE id = ?").run(item.cost, userId);
  db.prepare("INSERT INTO purchases (user_id, item_id) VALUES (?, ?)").run(userId, itemId);
  return { ok: true, coins: user.coins - item.cost };
}

export function equipItemDb(userId: number, itemId: string): { ok: boolean; error?: string } {
  const db = getDb();
  const item = shopItemById(itemId);
  if (!item) return { ok: false, error: "Unknown item." };
  const owned = getOwnedItemIds(userId);
  if (!owned.has(itemId)) return { ok: false, error: "You don't own this yet." };
  switch (item.category) {
    case "avatar":
      db.prepare("UPDATE users SET avatar = ? WHERE id = ?").run(item.emoji ?? "🦉", userId);
      break;
    case "banner":
      db.prepare("UPDATE users SET banner = ? WHERE id = ?").run(item.id, userId);
      break;
    case "frame":
      db.prepare("UPDATE users SET frame = ? WHERE id = ?").run(item.id, userId);
      break;
    case "background":
      db.prepare("UPDATE users SET background = ? WHERE id = ?").run(item.id, userId);
      break;
    case "nameStyle":
      db.prepare("UPDATE users SET name_style = ? WHERE id = ?").run(item.id, userId);
      break;
  }
  return { ok: true };
}
