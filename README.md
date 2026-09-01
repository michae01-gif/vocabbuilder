# WordForge 🌳

Grow an erudite vocabulary one **word tree** at a time — built on the strongest evidence in vocabulary research:

- **Roots as force-multipliers** — learn Latin/Greek roots and a whole family of words unlocks at once (49 roots, 322 words).
- **Retrieval before reveal** — try to recall each word from its meaning before you see it (the strongest encoding).
- **Productive recall** — reviews alternate word→meaning and meaning→word; an honest "I don't know" is always allowed.
- **Precision Duels** — separate each word from a close alternative (e.g. *deduce* vs *induce*) so you use the precise one.
- **Immediate feedback + repair** — every sentence you write is checked against a rule-based rubric; weak sentences must be repaired.
- **Evidence-based mastery** — a word is only *Mastered* after three productive recalls across 14+ days, a natural production, a duel pass, and a transfer. Recognition alone never counts. Words can *lapse*.
- **Review-load throttling** — when the due backlog is high, the session teaches fewer new words.
- **Spaced repetition** — FSRS scheduling keeps every word alive with short daily reviews.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQLite database is created and seeded automatically on first run at `data/wordforge.db`.

> **Note:** the dev server is plain `http://`, not `https://`. Use `http://localhost:3000` — opening `https://localhost:3000` shows a browser connection error.

## Daily loop (5–10 min)

1. **Session** — learn today's root: read the story, attempt each word from its meaning, meet the words, listen to examples, write your own sentence and repair it until it passes.
2. **Review** — recall each due word (word→meaning or meaning→word), face a Precision Duel when one is ready, then rate it (Again / Hard / Good / Easy) to reschedule it.
3. Watch your **vocabulary meter**, **erudition level**, **mastery ladder**, and **word garden** grow.

## Mastery ladder

`Unseen → Recognised → Recalled → Discriminated → Produced → Transferred → Mastered` — and words can fall back to **Lapsed**. The ladder is visible on the garden and stats pages.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **SQLite** via `better-sqlite3` (local single-user, no auth)
- **FSRS** spaced-repetition scheduling via `fsrs.js`
- Browser **SpeechSynthesis** for pronunciation (no API keys)
- **Rule-based sentence evaluator** — deterministic, no AI keys

## Project layout

```
app/            dashboard, session, review, garden, stats pages
components/     session + review runners, speak button, nav
data/           seed content (roots × words, precision-duel pairs)
lib/            db, data queries, server actions, stage logic, evaluator, FSRS helpers, seed loader
```

## Adding words

Add a `RootSeed` (or extend an existing one) in `data/part*.ts`, then delete `data/wordforge.db` — it reseeds on next run.

## Deploying

This is a single-user local app using a file-backed SQLite database. For production deployment (e.g. Vercel serverless), swap `better-sqlite3` for a hosted/libSQL-backed store and add auth.