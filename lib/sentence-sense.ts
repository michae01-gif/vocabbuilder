/**
 * Lightweight "does this read like a real sentence?" signals — no corpus needed.
 * Random-word typing fails: no connecting words, no verb, or impossible runs
 * of content words. Shared by the client gate (validate-writing) and the
 * server scorer (evaluate) so both sides care.
 */

export const FUNCTION_WORDS = new Set([
  "a", "an", "the", "this", "that", "these", "those",
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "its", "our", "their", "mine", "yours",
  "who", "whom", "whose", "which", "what", "when", "where", "why", "how",
  "and", "or", "but", "nor", "so", "yet", "if", "because", "although", "though", "while",
  "of", "to", "in", "on", "at", "for", "with", "from", "by", "as",
  "into", "onto", "over", "under", "above", "below", "between", "through",
  "during", "before", "after", "without", "within", "along", "across", "behind", "beyond", "near",
  "up", "down", "out", "off", "again", "further", "then", "once", "here", "there",
  "is", "am", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should",
  "can", "could", "may", "might", "must",
  "not", "no", "never", "always", "often", "sometimes", "usually",
  "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
  "only", "own", "same", "too", "very", "really", "quite", "pretty", "even", "also", "just",
]);

export const COMMON_VERBS = new Set([
  "is", "am", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "will", "would", "shall", "should", "can", "could", "may", "might", "must",
  "go", "goes", "went", "gone", "come", "comes", "came",
  "make", "makes", "made", "get", "gets", "got", "take", "takes", "took", "taken",
  "give", "gives", "gave", "given", "find", "finds", "found",
  "think", "thinks", "thought", "tell", "tells", "told", "say", "says", "said",
  "speak", "speaks", "spoke", "spoken", "talk", "talks", "talked",
  "know", "knows", "knew", "known", "see", "sees", "saw", "seen",
  "look", "looks", "looked", "watch", "watches", "watched",
  "want", "wants", "wanted", "need", "needs", "needed", "use", "uses", "used",
  "work", "works", "worked", "seem", "seems", "seemed",
  "feel", "feels", "felt", "try", "tries", "tried",
  "leave", "leaves", "left", "call", "calls", "called", "ask", "asks", "asked",
  "become", "becomes", "became", "mean", "means", "meant",
  "turn", "turns", "turned", "start", "starts", "started",
  "show", "shows", "showed", "shown", "hear", "hears", "heard",
  "run", "runs", "ran", "walk", "walks", "walked",
  "bring", "brings", "brought", "hold", "holds", "held", "keep", "keeps", "kept",
  "let", "lets", "begin", "begins", "began", "begun",
  "help", "helps", "helped", "put", "puts",
  "read", "reads", "write", "writes", "wrote", "written",
  "sit", "sits", "sat", "stand", "stands", "stood",
  "lose", "loses", "lost", "pay", "pays", "paid", "meet", "meets", "met",
  "learn", "learns", "learned", "teach", "teaches", "taught",
  "lead", "leads", "led", "live", "lives", "lived", "love", "loves", "loved",
  "like", "likes", "liked", "eat", "eats", "ate", "sleep", "sleeps", "slept",
  "buy", "buys", "bought", "sell", "sells", "sold", "send", "sends", "sent",
  "build", "builds", "built", "break", "breaks", "broke", "broken",
  "stop", "stops", "stopped", "move", "moves", "moved",
  "arrive", "arrives", "arrived", "follow", "follows", "followed",
  "open", "opens", "opened", "close", "closes", "closed",
  "play", "plays", "played", "jump", "jumps", "jumped",
  "smile", "smiles", "smiled", "laugh", "laughs", "laughed", "cry", "cries", "cried",
  "pick", "picks", "picked", "drop", "drops", "dropped",
  "grow", "grows", "grew", "grown", "win", "wins", "won",
  "wear", "wears", "wore", "worn", "catch", "catches", "caught",
  "choose", "chooses", "chose", "chosen", "ride", "rides", "rode", "ridden",
  "drive", "drives", "drove", "driven", "fly", "flies", "flew", "flown",
  "spend", "spends", "spent", "cost", "costs", "cut", "cuts", "hit", "hits", "hurt", "hurts",
]);

function isVerbish(t: string): boolean {
  if (COMMON_VERBS.has(t)) return true;
  if (t.length > 4 && t.endsWith("ing")) return true;
  if (t.length > 3 && t.endsWith("ed")) return true;
  if (t.endsWith("s") && COMMON_VERBS.has(t.slice(0, -1))) return true;
  return false;
}

export type SentenceStructure = {
  ok: boolean;
  issue: null | "word-list" | "no-verb" | "run-on-nouns";
  functionCount: number;
  hasVerb: boolean;
  longestContentRun: number;
};

/** Structural check: real English needs connecting words and a verb.
 *  `verbHints` — extra tokens that legitimately count as verbs (e.g. the
 *  lesson word itself when it's a verb: "I will conduct..."). */
export function sentenceStructure(tokens: string[], verbHints: string[] = []): SentenceStructure {
  const hints = new Set(verbHints.map((v) => v.toLowerCase()));
  const isVerb = (t: string) => isVerbish(t) || hints.has(t);
  const functionCount = tokens.filter((t) => FUNCTION_WORDS.has(t)).length;
  const hasVerb = tokens.some(isVerb);
  let run = 0;
  let longestContentRun = 0;
  for (const t of tokens) {
    if (FUNCTION_WORDS.has(t)) run = 0;
    else {
      run++;
      if (run > longestContentRun) longestContentRun = run;
    }
  }
  if (functionCount < 2) return { ok: false, issue: "word-list", functionCount, hasVerb, longestContentRun };
  if (!hasVerb) return { ok: false, issue: "no-verb", functionCount, hasVerb, longestContentRun };
  if (longestContentRun > 5) return { ok: false, issue: "run-on-nouns", functionCount, hasVerb, longestContentRun };
  return { ok: true, issue: null, functionCount, hasVerb, longestContentRun };
}

export function structureErrorMessage(issue: "word-list" | "no-verb" | "run-on-nouns", label: string): string {
  switch (issue) {
    case "word-list":
      return `That reads like a list of random words, not a real ${label} — connect your ideas with words like "the", "is", "and", or "because".`;
    case "no-verb":
      return `A real ${label} needs an action or linking word (like "is", "went", or "makes").`;
    case "run-on-nouns":
      return `Too many describing words in a row — real English breaks those up with little words.`;
  }
}
