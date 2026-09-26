/**
 * E2E journey: drives REAL Next.js server actions over HTTP against a
 * sandboxed production server (see tests/run-e2e.sh).
 * Prereq: actions.json (id map) + server running on :3100 with a fresh DB.
 */
import fs from "fs";
import Database from "better-sqlite3";

const BASE = "http://127.0.0.1:3100";
const actions = JSON.parse(fs.readFileSync("/tmp/wf-e2e/actions.json", "utf8"));
// opened lazily: the server creates the schema on the first DB-touching action
let db = null;

let passed = 0, failed = 0;
const failures = [];
function ok(cond, msg) {
  if (cond) { passed++; console.log("  ✓ " + msg); }
  else { failed++; failures.push(msg); console.error("  ✗ " + msg); }
}
function user(name) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(name);
}
function progressOf(uid, wid) {
  return db.prepare("SELECT * FROM progress WHERE user_id = ? AND word_id = ?").get(uid, wid);
}

async function action(name, args, cookie, path = "/") {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: {
      "Next-Action": actions[name],
      "Content-Type": "text/plain;charset=UTF-8",
      ...(cookie ? { cookie: `wf_session=${cookie}` } : {}),
    },
    body: JSON.stringify(args),
  });
  const setCookie = res.headers.get("set-cookie");
  return {
    status: res.status,
    text: await res.text(),
    cookie: setCookie ? /wf_session=([^;]+)/.exec(setCookie)?.[1] ?? null : null,
  };
}
async function page(path, cookie) {
  const res = await fetch(BASE + path, {
    headers: { cookie: `wf_session=${cookie}` },
    redirect: "manual",
  });
  return { status: res.status, text: await res.text() };
}

const uniq = `e2e${Date.now().toString(36)}`;
console.log(`\n== signup (${uniq}) ==`);
const up = await action("signUpAction", [uniq, "secret1", "7-9"], null, "/login");
db = new Database("/tmp/wf-e2e/wordforge.db");
ok(!!up.cookie, "signup sets session cookie");
const u = user(uniq);
ok(!!u, "user row created");
ok(u.grade === "7-9" && u.start_root_idx === 10, "grade 7-9 stored, start tier 10");
ok(u.coins === 100 && u.tutorial_step === 1, "starts with 100 coins at tutorial step 1");
const cookie = up.cookie;

console.log("\n== first session (tutorial, grade-gated) ==");
const sess = await page("/session", cookie);
ok(sess.status === 200, "/session renders");
ok(!sess.text.includes("I already know"), "quick-check hidden in tutorial session");
const ponRoot = db.prepare("SELECT * FROM roots WHERE order_idx = 10").get();
const lessonWords = db.prepare("SELECT * FROM words WHERE root_id = ? ORDER BY frequency LIMIT 5").all(ponRoot.id);
ok(sess.text.includes(lessonWords[0].word), `lesson shows graded root word "${lessonWords[0].word}"`);

console.log("\n== lesson: complete words (real sentences) ==");
for (const w of lessonWords) {
  const r = await action("completeWordBatch", [w.id, w.example1, true], cookie);
  ok(r.status === 200, `completeWordBatch ${w.word}`);
}
const p0 = progressOf(u.id, lessonWords[0].id);
ok(!!p0 && p0.state === 1, "new word lands in Learning state (due in the future now)");
ok(new Date(p0.due).getTime() > Date.now() - 60000, "due is genuinely future (srs anchor fix)");
const redoNow = db.prepare(
  "SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND state = 1 AND due <= datetime('now')"
).get(u.id).n;
ok(redoNow === 0, "freshly learned words do not flood the redo queue (same-day guard)");

console.log("\n== tutorial: reading step ==");
await action("finishTutorialSession", [], cookie);
ok(user(uniq).tutorial_step === 2, "tutorial step 1 -> 2");
const read = await page("/read", cookie);
ok(read.status === 200 && !read.text.includes("I knew all these words"), "tutorial reading has no skip button");
await action("finishTutorialReading", [], cookie);
ok(user(uniq).tutorial_step === 3, "tutorial step 2 -> 3");
const rewards = await page("/rewards", cookie);
ok(rewards.status === 200, "/rewards renders");
ok(user(uniq).tutorial_step === 0, "tutorial complete after visiting rewards");
ok(user(uniq).coins === 200, "tutorial completion +100 coins");

console.log("\n== quick check: 'I already know all these words' ==");
const nextWords = db.prepare("SELECT * FROM words WHERE root_id = ? AND id NOT IN (SELECT word_id FROM progress WHERE user_id = ?) ORDER BY frequency LIMIT 5").all(ponRoot.id, u.id);
const qc = await action("completeQuickCheck", [nextWords.map((w) => ({ wordId: w.id, correct: true }))], cookie);
ok(qc.status === 200, "completeQuickCheck runs");
const qp = progressOf(u.id, nextWords[0].id);
ok(!!qp && qp.stage === "recalled" && qp.productive_successes === 1, "quick-check correct -> recalled, productive_successes=1");
const qlog = db.prepare("SELECT COUNT(*) AS n FROM review_logs WHERE user_id = ? AND task_type = 'quick_check'").get(u.id).n;
ok(qlog === nextWords.length, "quick_check review logs written");
const sess2 = await page("/session", cookie);
ok(!sess2.text.includes("Words to reforge"), "no redo nag right after quick check");

console.log("\n== graduation via quick check on a due word ==");
// age the card: due/last_review yesterday, so the Good rating graduates it (FSRS learning steps done)
db.prepare("UPDATE progress SET due = ?, last_review = ? WHERE user_id = ? AND word_id = ?")
  .run(new Date(Date.now() - 86400000).toISOString(), new Date(Date.now() - 86400000).toISOString(), u.id, nextWords[0].id);
await action("completeQuickCheck", [[{ wordId: nextWords[0].id, correct: true }]], cookie);
const g = progressOf(u.id, nextWords[0].id);
ok(g.state === 2 && !!g.mastered_at, "Good on a due word graduates to Review + mastered_at");
const mpage = await page("/mastered", cookie);
ok(mpage.text.includes(nextWords[0].word), "graduated word appears in the vault");

console.log("\n== quests & coins ==");
const q = db.prepare("SELECT * FROM daily_quests WHERE user_id = ? AND quest_type = 'learn_words'").get(u.id);
ok(q && q.progress >= 3, "learn_words quest progressed");
const claim = await action("claimQuest", ["learn_words"], cookie);
ok(claim.status === 200 && user(uniq).coins === 250, "quest claim pays 50");
const spin1 = await action("spinWheel", [], cookie);
ok(spin1.status === 200, "daily wheel spins");
const coinsAfterSpin = user(uniq).coins;
await action("spinWheel", [], cookie);
ok(user(uniq).coins === coinsAfterSpin, "second spin same day rejected");

console.log("\n== reading passage flow ==");
const saved = await action("saveReadingState", [{ passageId: "harbour-inspector", selectedIds: [], view: "passage", lessonPhase: "teach", sentences: {}, testResults: [], testIdx: 0 }], cookie);
ok(saved.status === 200, "reading state saves");
const before = user(uniq).coins;
await action("finishReadingPassage", [], cookie);
ok(user(uniq).coins === before + 40, "passage completion +40 coins");

console.log("\n== skip flow: no coins, tier up, checkpoint ==");
const cBefore = user(uniq).coins;
const lvlBefore = user(uniq).reading_level;
for (let i = 0; i < 3; i++) {
  await action("skipPassage", ["harbour-inspector"], cookie);
}
ok(user(uniq).coins === cBefore, "skipping pays zero coins");
ok(user(uniq).reading_level === Math.min(5, lvlBefore + 3), "skips raise reading tier");
const cp = db.prepare("SELECT * FROM skip_checkpoint WHERE user_id = ?").get(u.id);
ok(!!cp, "checkpoint pending after 3 skips");
const readCp = await page("/read", cookie);
ok(readCp.text.includes("Prove you knew them"), "checkpoint quiz gates /read");
await action("completeSkipCheckpoint", [], cookie);
ok(user(uniq).coins === cBefore, "checkpoint completion pays zero coins (by design)");

console.log("\n== weekly test ==");
const nextRoot = db.prepare("SELECT * FROM roots WHERE order_idx = 11").get();
const wl = db.prepare("SELECT * FROM words WHERE root_id = ? LIMIT 1").all(nextRoot.id);
await action("completeWordBatch", [wl[0].id, "", false], cookie);
const wtStatus = await page("/weekly-test", cookie);
ok(wtStatus.text.includes("Test your trouble words") || wtStatus.text.includes("question"), "weekly test becomes available after a miss");
const wb = user(uniq).coins;
await action("submitWeeklyTest", [[{ wordId: wl[0].id, correct: true }]], cookie);
ok(user(uniq).coins === wb + 15 + 50, "weekly test pays 15/correct + 50 perfect bonus");
await action("submitWeeklyTest", [[{ wordId: wl[0].id, correct: true }]], cookie);
ok(user(uniq).coins === wb + 65, "weekly test once per week");

console.log("\n== mastered vault: confirm + demote ==");
const conf = await action("confirmMasteredWord", [nextWords[0].id], cookie);
ok(conf.status === 200, "confirm mastered word");
const dem = await action("demoteMasteredWord", [nextWords[0].id], cookie);
ok(dem.status === 200, "demote mastered word");
const d = progressOf(u.id, nextWords[0].id);
ok(d.state === 1 && !!d.lapsed_at && !d.mastered_at, "demoted: back to learning, lapsed flag set, mastery cleared");
const redo = await page("/session", cookie);
ok(redo.text.includes("Words to reforge"), "demoted word returns to session same day");
ok(redo.text.includes(nextWords[0].word), "the forgotten word itself is served");

console.log("\n== auth negatives & signout ==");
const dup = await action("signUpAction", [uniq, "secret1", "7-9"], null, "/login");
ok(!dup.cookie && dup.text.length > 0, "duplicate username rejected");
const bad = await action("signInAction", [uniq, "wrongpw"], null, "/login");
ok(!bad.cookie, "wrong password rejected");
const good = await action("signInAction", [uniq, "secret1"], null, "/login");
ok(!!good.cookie, "correct password signs in");
await action("signOutAction", [], good.cookie);
const after = await page("/", good.cookie);
ok(after.status === 307, "session invalidated after signout");

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log("FAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
