/**
 * Integration tests for WordForge core logic.
 * Runs against a throwaway SQLite DB (DATABASE_PATH set before lib imports).
 * Usage: npx tsx tests/integration.test.ts
 */
import fs from "fs";
import path from "path";

const TEST_DB = "/tmp/wf-test/wordforge.db";
fs.rmSync(path.dirname(TEST_DB), { recursive: true, force: true });
fs.mkdirSync(path.dirname(TEST_DB), { recursive: true });
process.env.DATABASE_PATH = TEST_DB;

let passed = 0;
let failed = 0;
const failures: string[] = [];
function ok(cond: unknown, msg: string) {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(msg);
    console.error(`  ✗ ${msg}`);
  }
}
function eq(actual: unknown, expected: unknown, msg: string) {
  ok(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${msg} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
  );
}
function section(name: string) {
  console.log(`\n== ${name} ==`);
}

async function main() {
  const dbMod = await import("../lib/db");
  const db = dbMod.getDb();

  const data = await import("../lib/data");
  const { computeStage } = await import("../lib/stage");
  const srs = await import("../lib/srs");
  const reading = await import("../lib/reading");
  const weekly = await import("../lib/weekly");
  const rewards = await import("../lib/rewards");
  const tutorial = await import("../lib/tutorial");
  const { hashPassword, verifyPassword } = await import("../lib/auth");
  const { validateUsername, validatePassword } = await import("../lib/validate");
  const { validateWriting } = await import("../lib/validate-writing");
  const { evaluateSentence } = await import("../lib/evaluate");

  function makeUser(opts: { grade?: string; start?: number; step?: number; coins?: number } = {}) {
    const uname = `t${Date.now()}${Math.floor(Math.random() * 100000)}`;
    const info = db
      .prepare(
        "INSERT INTO users (name, username, password_hash, coins, tutorial_step, grade, start_root_idx) VALUES (?,?,?,?,?,?,?)"
      )
      .run(uname, uname, "x", opts.coins ?? 100, opts.step ?? 0, opts.grade ?? null, opts.start ?? 0);
    return Number(info.lastInsertRowid);
  }
  function coinsOf(userId: number) {
    return (db.prepare("SELECT coins FROM users WHERE id = ?").get(userId) as { coins: number }).coins;
  }
  function wordsOfRoot(rootId: number) {
    return db.prepare("SELECT id FROM words WHERE root_id = ? ORDER BY id").all(rootId) as { id: number }[];
  }
  function insertProgress(userId: number, wordId: number, patch: Record<string, unknown> = {}) {
    db.prepare(
      `INSERT INTO progress (user_id, word_id, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review, stage,
         productive_successes, receptive_successes, production_passes, critical_error_open, mastered_at, lapsed_at)
       VALUES (?, ?, ?, 1, 5, 0, 1, 1, 0, ?, ?, ?, 0, 0, 0, 0, ?, ?)`
    ).run(
      userId,
      wordId,
      (patch.due as string) ?? new Date(Date.now() + 86400000).toISOString(),
      (patch.state as number) ?? 1,
      new Date().toISOString(),
      (patch.stage as string) ?? "recalled",
      (patch.mastered_at as string) ?? null,
      (patch.lapsed_at as string) ?? null
    );
  }

  // ---------- SRS ----------
  section("SRS scheduling");
  const goodNew = srs.scheduleNew(srs.RATINGS.Good);
  eq(goodNew.card.state, 1, "New->Good lands in Learning state");
  eq(goodNew.card.reps, 1, "New->Good reps=1");
  ok(new Date(goodNew.card.due).getTime() > Date.now() - 1000, "due is in the future");
  const againNew = srs.scheduleNew(srs.RATINGS.Again);
  eq(againNew.card.state, 1, "New->Again lands in Learning state");
  // graduation chain
  const step1 = srs.review(
    { ...(goodNew.card as unknown as Record<string, unknown>) } as never,
    srs.RATINGS.Good
  );
  ok(step1.state >= 1, "review returns valid state");
  const base = {
    due: new Date().toISOString(),
    stability: 1,
    difficulty: 5,
    elapsed_days: 0,
    scheduled_days: 1,
    reps: 1,
    lapses: 0,
    state: 1,
    last_review: new Date().toISOString(),
  };
  const grad = srs.review(base as never, srs.RATINGS.Good);
  eq(grad.state, 2, "Learning->Good graduates to Review state");

  // ---------- Stage ----------
  section("Stage computation");
  eq(computeStage({ state: 1 } as never), "recognised", "bare row -> recognised");
  eq(computeStage({ state: 1, productive_successes: 1 } as never), "recalled", "productive success -> recalled");
  eq(computeStage({ state: 1, productive_successes: 1, production_passes: 1 } as never), "produced", "production pass -> produced");
  eq(computeStage({ state: 2, mastered_at: "x" } as never), "mastered", "state2+mastered_at -> mastered");
  eq(computeStage({ state: 2 } as never), "recognised", "state2 without mastered_at is NOT mastered");
  eq(computeStage({ state: 3, lapsed_at: "x" } as never), "lapsed", "lapsed_at -> lapsed");
  eq(computeStage({ state: 2, mastered_at: "x", critical_error_open: 1 } as never), "lapsed", "open critical error on mastered -> lapsed");
  eq(computeStage({ state: 1, critical_error_open: 1 } as never), "recognised", "open critical error on learner -> recognised");

  // ---------- currentRoot & grade gating ----------
  section("currentRoot / grade tiers / wrap");
  const roots = db.prepare("SELECT * FROM roots ORDER BY order_idx").all() as { id: number; order_idx: number; root: string }[];
  ok(roots.length >= 30, `root library loaded (${roots.length} roots)`);
  const u79 = makeUser({ grade: "7-9", start: data.GRADE_START_IDX["7-9"] });
  eq(data.currentRoot(u79).order_idx, 10, "grade 7-9 starts at order_idx 10");
  const u0 = makeUser({});
  eq(data.currentRoot(u0).order_idx, 0, "no grade starts at order_idx 0");
  const uClamp = makeUser({ start: 9999 });
  // empty roots are skipped: simulate the wrap-scan to find the first completable root
  const wordCounts = new Map(
    (db.prepare("SELECT root_id, COUNT(*) AS n FROM words GROUP BY root_id").all() as { root_id: number; n: number }[]).map(
      (r) => [r.root_id, r.n]
    )
  );
  const clampedStart = Math.min(9999, roots.length - 1);
  const wrapOrder = [...roots.slice(clampedStart), ...roots.slice(0, clampedStart)];
  const expectedFirst = wrapOrder.find((r) => (wordCounts.get(r.id) ?? 0) > 0)!;
  eq(data.currentRoot(uClamp).order_idx, expectedFirst.order_idx, "start idx clamps and skips wordless roots");
  eq(data.startRootIdxForGrade("10-12"), 29, "10-12 maps to 29");
  eq(data.startRootIdxForGrade(null), 0, "null grade maps to 0");
  eq(data.startRootIdxForGrade("bogus"), 0, "unknown grade maps to 0");
  // wrap: complete the LAST root entirely -> should wrap to the first root
  const lastRoot = roots[roots.length - 1];
  const uWrap = makeUser({ start: lastRoot.order_idx });
  for (const w of wordsOfRoot(lastRoot.id)) insertProgress(uWrap, w.id, { state: 2, mastered_at: new Date().toISOString() });
  eq(data.currentRoot(uWrap).order_idx, 0, "completing the last root wraps to the first");
  // progression: complete starting root -> moves to next order_idx
  const startRoot = data.currentRoot(u79);
  for (const w of wordsOfRoot(startRoot.id)) insertProgress(u79, w.id, { state: 2, mastered_at: new Date().toISOString() });
  eq(data.currentRoot(u79).order_idx, 11, "after finishing tier root, next root in order follows");

  // ---------- newWordsForRoot / reviewLoad ----------
  section("newWordsForRoot / reviewLoad");
  const uNew = makeUser({});
  const firstRoot = roots[0];
  const allWords = wordsOfRoot(firstRoot.id);
  ok(allWords.length > 0, "first root has words");
  eq(data.newWordsForRoot(uNew, firstRoot.id).length, allWords.length, "fresh user sees all root words as new");
  insertProgress(uNew, allWords[0].id, {});
  eq(data.newWordsForRoot(uNew, firstRoot.id).length, allWords.length - 1, "progressed word excluded from new");
  eq(data.reviewLoad(uNew).newCap, 5, "no due words -> newCap 5");
  const uDue = makeUser({});
  const dw = db
    .prepare("SELECT id FROM words ORDER BY id LIMIT 25")
    .all() as { id: number }[];
  for (let i = 0; i < 12; i++) insertProgress(uDue, dw[i].id, { due: new Date(Date.now() - 3600000).toISOString() });
  eq(data.reviewLoad(uDue).newCap, 3, "12 due -> newCap 3");
  for (let i = 12; i < 20; i++) insertProgress(uDue, dw[i].id, { due: new Date(Date.now() - 3600000).toISOString() });
  eq(data.reviewLoad(uDue).newCap, 1, "20 due -> newCap 1");
  ok(data.reviewLoad(uDue).message !== null, "load message present when due pile is big");

  // ---------- redo queue semantics ----------
  section("redo queue (words to reforge)");
  {
    const u = makeUser({});
    const w = db.prepare("SELECT id FROM words ORDER BY id LIMIT 4").all() as { id: number }[];
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    // 1. fresh learning word from today: NOT redo-eligible
    insertProgress(u, w[0].id, { state: 1, due: new Date(Date.now() - 7200000).toISOString(), stage: "recalled" });
    db.prepare("UPDATE progress SET last_review = ? WHERE user_id = ? AND word_id = ?").run(new Date().toISOString(), u, w[0].id);
    // 2. learning word learned yesterday: eligible tomorrow-style (eligible now)
    insertProgress(u, w[1].id, { state: 1, due: new Date(Date.now() - 7200000).toISOString(), stage: "recalled" });
    db.prepare("UPDATE progress SET last_review = ? WHERE user_id = ? AND word_id = ?").run(yesterday, u, w[1].id);
    // 3. demoted mastered word (state 1 + lapsed_at, due now): eligible TODAY and first
    insertProgress(u, w[2].id, { state: 1, due: new Date().toISOString(), stage: "lapsed" });
    db.prepare("UPDATE progress SET lapsed_at = ?, last_review = ? WHERE user_id = ? AND word_id = ?").run(new Date().toISOString(), yesterday, u, w[2].id);
    // 4. relearning word from a quick-check miss (state 3): eligible
    insertProgress(u, w[3].id, { state: 3, due: new Date(Date.now() - 1000).toISOString(), stage: "lapsed" });
    const redo = data.redoLearningWordIds(u, 5);
    ok(!redo.includes(w[0].id), "word learned minutes ago stays out of the redo queue");
    ok(redo.includes(w[1].id), "yesterday's learning word rejoins the queue");
    ok(redo.includes(w[2].id), "demoted (forgotten) word returns same day");
    ok(redo.includes(w[3].id), "relearning word returns");
    eq(redo[0], w[2].id, "forgotten words are served before routine rechecks");
  }

  // ---------- userStats ----------
  section("userStats");
  {
const u = makeUser({});
    const wa = wordsOfRoot(roots[0].id);
    const wb = wordsOfRoot(roots[1].id);
    insertProgress(u, wa[0].id, { state: 2, mastered_at: new Date().toISOString(), stage: "mastered" });
    insertProgress(u, wb[0].id, { state: 1, stage: "recalled" });
    db.prepare("UPDATE progress SET productive_successes = 1 WHERE user_id = ? AND word_id = ?").run(u, wb[0].id);
    insertProgress(u, wb[1].id, {});
    db.prepare("UPDATE progress SET production_passes = 1 WHERE user_id = ? AND word_id = ?").run(u, wb[1].id);
    insertProgress(u, wb[2].id, { state: 3, lapsed_at: new Date().toISOString(), stage: "lapsed", due: new Date(Date.now() - 1000).toISOString() });
    const s = data.userStats(u);
    eq(s.introduced, 4, "stats: introduced 4");
    eq(s.mastered, 1, "stats: mastered 1");
    eq(s.produced, 1, "stats: produced 1");
    eq(s.recalled, 1, "stats: recalled 1");
    eq(s.lapsed, 1, "stats: lapsed 1");
    eq(s.due, 1, "stats: due 1");
    eq(s.rootsExplored, 2, "stats: roots explored 2");
  }

  // ---------- mastered count consistency ----------
  section("mastered vault consistency");
  {
    const u = makeUser({});
    const w = wordsOfRoot(roots[0].id);
    insertProgress(u, w[0].id, { state: 2, mastered_at: new Date().toISOString(), stage: "mastered" });
    insertProgress(u, w[1].id, { state: 2, stage: "recalled" }); // legacy-style row: state2, no mastered_at
    eq(data.masteredWordsList(u).length, 1, "vault list shows only confirmed-mastered");
    eq(data.masteredWordCount(u), 1, "vault header count matches list (no phantom mastered)");
  }

  // ---------- quick check quiz ----------
  section("quickCheckQuiz");
  {
    const w = wordsOfRoot(roots[0].id).slice(0, 5).map((x) => x.id);
    const rows = db.prepare(`SELECT id, word, definition FROM words WHERE id IN (${w.map(() => "?").join(",")})`).all(...w) as {
      id: number;
      word: string;
      definition: string;
    }[];
    const quiz = reading.quickCheckQuiz(rows);
    eq(quiz.length, rows.length, "one question per word");
    for (const q of quiz) {
      ok(q.options.includes(q.correct), `options contain correct def for ${q.word}`);
      eq(new Set(q.options).size, q.options.length, `options distinct for ${q.word}`);
      ok(q.options.length >= 4, `4 options for ${q.word} (${q.options.length})`);
    }
    // empty-definition words are excluded
    eq(reading.quickCheckQuiz([{ id: -1, word: "x", definition: "  " }]), [], "blank definitions excluded");
  }

  // ---------- weekly ----------
  section("weekly test");
  eq(weekly.weekStartISO(new Date("2026-09-26T12:00:00Z")), "2026-09-21", "Saturday -> Monday");
  eq(weekly.weekStartISO(new Date("2026-09-21T00:30:00Z")), "2026-09-21", "Monday -> same Monday");
  eq(weekly.weekStartISO(new Date("2026-09-27T23:00:00Z")), "2026-09-21", "Sunday -> previous Monday");
  {
    const u = makeUser({});
    const w = wordsOfRoot(roots[2].id);
    const log = (wordId: number, rating: number, when: string) =>
      db
        .prepare("INSERT INTO review_logs (user_id, word_id, rating, task_type, reviewed_at) VALUES (?,?,?, 'productive', ?)")
        .run(u, wordId, rating, when);
    log(w[0].id, srs.RATINGS.Again, new Date().toISOString());
    log(w[1].id, srs.RATINGS.Hard, new Date().toISOString());
    log(w[2].id, srs.RATINGS.Good, new Date().toISOString());
    log(w[3].id, srs.RATINGS.Again, new Date(Date.now() - 9 * 86400000).toISOString());
    const missed = weekly.weeklyMissedWordIds(u);
    ok(missed.includes(w[0].id), "Again this week is eligible");
    ok(!missed.includes(w[1].id), "Hard is not eligible");
    ok(!missed.includes(w[2].id), "Good is not eligible");
    ok(!missed.includes(w[3].id), "last week's Again is not eligible");
    const st = weekly.weeklyTestStatus(u);
    eq(st.taken, false, "test not taken yet");
    eq(st.eligible, 1, "one eligible word");
    const qs = weekly.weeklyTestQuestions(u);
    eq(qs.length, 1, "one question built");
    ok(qs[0]?.options.includes(qs[0].definition), "question options include the answer");
    // take it
    const runId = weekly.createWeeklyTestRun(u);
    weekly.recordWeeklyTestAnswer(runId, u, w[0].id, false);
    const after = weekly.weeklyTestStatus(u);
    eq(after.taken, true, "test marked taken");
    const carried = weekly.weeklyMissedWordIds(u);
    ok(carried.includes(w[0].id), "wrong weekly answer carries over");
  }

  // ---------- quests / rewards ----------
  section("quests & rewards");
  {
    const u = makeUser({ coins: 0 });
    const quests = rewards.getTodayQuests(u);
    eq(quests.length, 3, "three daily quests");
    const learn = quests.find((q) => q.type === "learn_words")!;
    rewards.incrementQuest(u, "learn_words", 5);
    const after = rewards.getTodayQuests(u).find((q) => q.type === "learn_words")!;
    eq(after.progress, learn.target, "quest progress capped at target");
    const claim = rewards.claimQuestDb(u, "learn_words");
    ok(claim.ok, "completed quest claims");
    eq(coinsOf(u), learn.reward, "claim pays reward coins");
    ok(!rewards.claimQuestDb(u, "learn_words").ok, "double claim rejected");
    const u2 = makeUser({ coins: 0 });
    ok(!rewards.claimQuestDb(u2, "learn_words").ok, "unmet quest claim rejected");
    // root claim
    const u3 = makeUser({ coins: 0 });
    const r0 = roots[0];
    for (const w of wordsOfRoot(r0.id)) insertProgress(u3, w.id, { state: 2, mastered_at: new Date().toISOString() });
    const claimable = rewards.claimableRoots(u3);
    ok(claimable.some((c) => c.rootId === r0.id), "completed root is claimable");
    const rc = rewards.claimRootDb(u3, r0.id);
    ok(rc.ok, "root claim pays");
    eq(coinsOf(u3), 150, "root claim pays 150");
    ok(!rewards.claimRootDb(u3, r0.id).ok, "root re-claim rejected");
    // wheel once per day
    const u4 = makeUser({});
    const spin = rewards.spinWheelDb(u4);
    ok(spin !== null, "first daily spin works");
    eq(rewards.spinWheelDb(u4), null, "second spin same day rejected");
  }

  // ---------- reading/skip checkpoint ----------
  section("reading passages & skip checkpoint");
  {
    const p1 = reading.pickPassage(1);
    eq(p1.difficulty, 1, "tier-1 passage picked");
    const m = reading.passageMatches(p1);
    ok(m.length > 0, "passage contains forge words");
    const u = makeUser({});
    const w = wordsOfRoot(roots[3].id);
    reading.logSkipDb(u, "p1", [w[0].id]);
    reading.logSkipDb(u, "p2", [w[1].id]);
    eq(reading.pendingSkipCountDb(u), 2, "pending skips counted");
    eq(reading.buildSkipCheckpointDb(u), null, "checkpoint needs 3 skips");
    reading.logSkipDb(u, "p3", [w[2].id]);
    const cp = reading.buildSkipCheckpointDb(u);
    ok(cp !== null, "checkpoint built on 3rd skip");
    eq(reading.pendingSkipCountDb(u), 0, "skip log cleared at checkpoint");
    eq(new Set(reading.getSkipCheckpointDb(u)).size, 3, "checkpoint holds union of skipped word ids");
    const quiz = reading.checkpointQuizDb(u);
    eq(quiz.length, 3, "checkpoint quiz has 3 questions");
    for (const q of quiz) ok(q.options.includes(q.definition), `checkpoint options include answer for ${q.word}`);
    reading.completeSkipCheckpointDb(u);
    eq(reading.getSkipCheckpointDb(u), null, "checkpoint cleared after completion");
  }

  // ---------- auth & validation ----------
  section("auth & validation");
  {
    const stored = hashPassword("hunter22");
    ok(verifyPassword("hunter22", stored), "password verifies");
    ok(!verifyPassword("hunter23", stored), "wrong password rejected");
    ok(validateUsername("ab") !== null, "short username rejected");
    ok(validateUsername("bad name!") !== null, "username with spaces/! rejected");
    ok(validateUsername("good_name1") === null, "valid username accepted");
    ok(validatePassword("short") !== null, "short password rejected");
    ok(validatePassword("longenough") === null, "valid password accepted");
  }

  section("validateWriting");
  {
    eq(validateWriting("too short", { minWords: 8, requireWord: "short" }), "Your sentence needs at least 8 words — you have 2.", "short sentence rejected");
    ok(validateWriting("I will conduct the orchestra tonight with great care.", { minWords: 8, requireWord: "conduct" }) === null, "8+ word sentence with word passes");
    ok(validateWriting("She conducts herself very well in every single meeting.", { minWords: 8, requireWord: "conduct" }) === null, "inflected form counts");
    ok(validateWriting("This is a totally different sentence without it.", { minWords: 8, requireWord: "conduct" }) !== null, "missing word rejected");
    ok(validateWriting("x".repeat(40) + " conduct conduct conduct conduct conduct conduct", { minWords: 8, requireWord: "conduct" }) !== null, "gibberish rejected");
    ok(validateWriting("conduct conduct conduct conduct conduct conduct conduct conduct conduct", { minWords: 8, requireWord: "conduct" }) !== null, "repetition spam rejected");
  }

  // ---------- tutorial ----------
  section("tutorial progression");
  {
    const u = makeUser({ coins: 0, step: 1 });
    eq(tutorial.getTutorialStepDb(u)?.step, 1, "step 1 active");
    eq(tutorial.advanceTutorialDb(u, 2).completed, false, "skipping ahead rejected");
    tutorial.advanceTutorialDb(u, 1);
    eq(tutorial.getTutorialStepDb(u)?.step, 2, "step 1 -> 2");
    tutorial.advanceTutorialDb(u, 2);
    tutorial.advanceTutorialDb(u, 3);
    eq(tutorial.getTutorialStepDb(u), null, "tutorial done after step 3");
    eq(coinsOf(u), 100, "completion reward paid");
  }

  // ---------- evaluate ----------
  section("evaluateSentence");
  {
    const info = { word: "conduct", definition: "to lead or guide", examples: ["She will conduct the meeting."] };
    const good = evaluateSentence("The captain will conduct his ship through the storm carefully tonight.", info);
    ok(typeof good.passed === "boolean", "verdict shape");
    ok(good.score > 0, "original sentence scores above zero");
  }

  // ---------- garden ----------
  section("gardenData");
  {
    const u = makeUser({});
    const g = data.gardenData(u);
    eq(g.length, roots.length, "garden covers every root");
    const first = g[0];
    eq(first.words.every((w) => w.stage === "unseen"), true, "fresh user sees all unseen");
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failures.length) {
    console.log("FAILURES:");
    for (const f of failures) console.log("  - " + f);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
