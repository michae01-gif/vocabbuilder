import type { ProductionVerdict } from "./types";

type WordInfo = {
  word: string;
  definition: string;
  examples: string[];
};

const STOP = new Set(["a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "for", "with", "at", "by", "is", "are", "was", "were", "be", "been", "being", "it", "its", "this", "that", "these", "those", "i", "you", "he", "she", "they", "we", "my", "your", "his", "her", "their", "our", "me", "him", "them", "us", "from", "as", "so", "if", "then", "than", "when", "which", "who", "whom", "where", "why", "how", "have", "has", "had", "do", "does", "did", "not", "no", "will", "would", "can", "could", "may", "might", "must", "shall", "should", "there", "here", "all", "some", "any", "each", "every", "one", "two", "more", "most", "other", "also", "just", "very", "like", "about"]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function inflections(word: string): string[] {
  const w = word.toLowerCase();
  const forms = new Set<string>([w]);
  const doubleConsonant = (stem: string): string => {
    if (stem.length < 3) return stem;
    const last = stem[stem.length - 1];
    const second = stem[stem.length - 2];
    const third = stem[stem.length - 3];
    if (
      third && second && last &&
      "aeiou".indexOf(third.toLowerCase()) === -1 &&
      "aeiou".indexOf(second.toLowerCase()) !== -1 &&
      "aeiou".indexOf(last.toLowerCase()) === -1 &&
      "rtsldpnmgb".indexOf(last.toLowerCase()) !== -1
    ) {
      return stem + last;
    }
    return stem;
  };
  if (w.endsWith("y")) {
    forms.add(w.slice(0, -1) + "ies");
    forms.add(w.slice(0, -1) + "ied");
    forms.add(w + "ing");
  }
  if (w.endsWith("e")) {
    forms.add(w.slice(0, -1) + "ing");
    forms.add(w + "d");
  }
  const double = doubleConsonant(w);
  if (double !== w) {
    forms.add(double + "ing");
    forms.add(double + "ed");
  }
  forms.add(w + "s");
  forms.add(w + "es");
  forms.add(w + "ed");
  forms.add(w + "d");
  forms.add(w + "ing");
  if (w.endsWith("se") || w.endsWith("ze") || w.endsWith("sh") || w.endsWith("ch") || w.endsWith("x")) {
    forms.add(w + "es");
  }
  return [...forms];
}

function containsWord(sentence: string, word: string): boolean {
  const tokens = tokenize(sentence);
  const forms = new Set(inflections(word));
  return tokens.some((t) => forms.has(t.replace(/s$/, "")) || forms.has(t));
}

function isCopy(sentence: string, examples: string[]): boolean {
  const sent = tokenize(sentence);
  for (const ex of examples) {
    const exTok = tokenize(ex);
    const n = sent.length;
    const m = exTok.length;
    if (n < 5 || m < 5) continue;
    let longest = 0;
    const dp: number[] = new Array(m + 1).fill(0);
    for (let i = 1; i <= n; i++) {
      for (let j = m; j >= 1; j--) {
        if (sent[i - 1] === exTok[j - 1]) {
          dp[j] = dp[j - 1] + 1;
          if (dp[j] > longest) longest = dp[j];
        } else {
          dp[j] = 0;
        }
      }
    }
    if (longest >= 6) return true;
  }
  return false;
}

export function evaluateSentence(sentence: string, info: WordInfo): ProductionVerdict {
  const trimmed = sentence.trim();
  const issues: string[] = [];

  const used = containsWord(trimmed, info.word);
  if (!used) {
    issues.push(`The word “${info.word}” does not appear in your sentence.`);
  }

  const words = tokenize(trimmed).filter((t) => !STOP.has(t));
  if (words.length < 3) {
    issues.push("The sentence is too short to show real use.");
  }

  const copy = isCopy(trimmed, info.examples);
  if (copy) {
    issues.push("This closely copies a given example. Write your own sentence.");
  }

  const startsCap = /^[A-Z]/.test(trimmed);
  const endsPunct = /[.!?]["']?$/.test(trimmed);
  if (!startsCap || !endsPunct) {
    issues.push("Start with a capital letter and end with a punctuation mark.");
  }

  const semantic = used ? 4 : 1;
  const collocation = used && !copy ? 3 : used ? 2 : 1;
  const grammar = startsCap && endsPunct ? 3 : 2;
  const register = 3;
  const naturalness = used && !copy && words.length >= 3 ? 4 : 2;
  const contribution = used && words.length >= 4 ? 2 : 1;

  const score = semantic + collocation + grammar + register + naturalness + contribution;
  const critical = !used;
  const passed = score >= 15 && semantic >= 3 && !critical && !copy;

  let feedback: string;
  if (passed) {
    feedback = "Good use. The word earns its place and the sentence reads naturally.";
  } else if (critical) {
    feedback = `Rewrite the sentence so that “${info.word}” (${info.definition}) actually appears and does the work.`;
  } else if (copy) {
    feedback = `This is too close to the example. Write a fresh sentence of your own using “${info.word}”.`;
  } else {
    feedback = issues[0] ?? "Revise the sentence and try again.";
  }

  return { passed, score, max_score: 20, issues, feedback };
}

export function makeCloze(sentence: string, word: string): string {
  const forms = inflections(word);
  const escaped = forms.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${escaped.join("|")})\\b`, "i");
  const match = sentence.match(re);
  if (!match || match.index === undefined) return sentence;
  const blanked = sentence.slice(0, match.index) + "_____" + sentence.slice(match.index + match[0].length);
  return blanked;
}

export function makeClozeHighlight(sentence: string, word: string): { before: string; blank: string; after: string; matchedForm: string } | null {
  const forms = inflections(word);
  const escaped = forms.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`\\b(${escaped.join("|")})\\b`, "i");
  const match = sentence.match(re);
  if (!match || match.index === undefined) return null;
  return {
    before: sentence.slice(0, match.index),
    blank: "_____",
    after: sentence.slice(match.index + match[0].length),
    matchedForm: match[0],
  };
}
