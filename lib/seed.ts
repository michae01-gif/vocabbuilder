import { getDb } from "./db";
import { roots } from "@/data/roots";
import { duels } from "@/data/duels";

export function seedIfEmpty() {
  const db = getDb();
  const count = (db.prepare("SELECT COUNT(*) AS n FROM roots").get() as { n: number }).n;

  if (count === 0) {
    seedAllRoots(db);
  } else if (count < roots.length) {
    seedMissingRoots(db, count);
  }

  seedDuelsIfEmpty();
}

function seedAllRoots(db: ReturnType<typeof getDb>) {
  const insertRoot = db.prepare(
    `INSERT INTO roots (root, meaning, language, story, emoji, order_idx) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertWord = db.prepare(
    `INSERT OR IGNORE INTO words (root_id, word, pos, definition, pronunciation, example1, example2, example3, etymology, difficulty, frequency)
     VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    roots.forEach((r, rootIdx) => {
      const rootInfo = insertRoot.run(r.root, r.meaning, r.language, r.story, r.emoji, rootIdx);
      const rootId = Number(rootInfo.lastInsertRowid);
      r.words.forEach((w, wordIdx) => {
        insertWord.run(
          rootId,
          w.word,
          w.pos,
          w.definition,
          w.examples[0],
          w.examples[1],
          w.examples[2],
          w.etymology,
          w.difficulty ?? 1,
          wordIdx + 1
        );
      });
    });
  });

  tx();
}

function seedMissingRoots(db: ReturnType<typeof getDb>, existingCount: number) {
  const existingRoots = db.prepare("SELECT root FROM roots").all() as { root: string }[];
  const existingSet = new Set(existingRoots.map((r) => r.root));

  const insertRoot = db.prepare(
    `INSERT INTO roots (root, meaning, language, story, emoji, order_idx) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertWord = db.prepare(
    `INSERT OR IGNORE INTO words (root_id, word, pos, definition, pronunciation, example1, example2, example3, etymology, difficulty, frequency)
     VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?)`
  );

  let newCount = 0;
  const tx = db.transaction(() => {
    roots.forEach((r) => {
      if (!existingSet.has(r.root)) {
        const rootInfo = insertRoot.run(r.root, r.meaning, r.language, r.story, r.emoji, existingCount + newCount);
        const rootId = Number(rootInfo.lastInsertRowid);
        r.words.forEach((w, wordIdx) => {
          insertWord.run(
            rootId,
            w.word,
            w.pos,
            w.definition,
            w.examples[0],
            w.examples[1],
            w.examples[2],
            w.etymology,
            w.difficulty ?? 1,
            wordIdx + 1
          );
        });
        newCount++;
      }
    });
  });

  tx();
}

function seedDuelsIfEmpty() {
  const db = getDb();
  const count = (db.prepare("SELECT COUNT(*) AS n FROM duels").get() as { n: number }).n;
  if (count > 0) return;
  seedDuels(db);
}

function seedDuels(db: ReturnType<typeof getDb>) {
  const find = db.prepare("SELECT id FROM words WHERE word = ?");
  const insert = db.prepare(
    `INSERT INTO duels (word_id, foil_word_id, prompt, distinction, order_idx) VALUES (?, ?, ?, ?, ?)`
  );
  duels.forEach((d, i) => {
    const wordId = find.get(d.word) as { id: number } | undefined;
    const foilId = find.get(d.foil) as { id: number } | undefined;
    if (wordId && foilId) {
      insert.run(wordId.id, foilId.id, d.prompt, d.distinction, i);
    }
  });
}

seedIfEmpty();
