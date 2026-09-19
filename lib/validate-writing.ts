import { inflections } from "./evaluate";

export const PASTE_WARNINGS_LIMIT = 3;
export const PASTE_PENALTY_COINS = 500;
export const PARAGRAPH_BONUS_COINS = 30;

export type WritingValidation = { error: string | null };

const GIBBERISH_MAX_TOKEN = 25;

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function containsWord(text: string, word: string): boolean {
  const toks = tokens(text);
  const forms = new Set(inflections(word.toLowerCase()));
  return toks.some((t) => forms.has(t) || forms.has(t.replace(/s$/, "")));
}

/**
 * Shared client/server writing validator.
 * Checks length, target-word usage, and "makes sense" heuristics
 * (gibberish, repetition, copy-spam).
 */
export function validateWriting(
  text: string,
  opts: { minWords?: number; requireWord?: string; requireWords?: string[]; label?: string } = {}
): string | null {
  const minWords = opts.minWords ?? 10;
  const label = opts.label ?? "sentence";

  const trimmed = text.trim();
  if (!trimmed) return `Write a ${label} first.`;

  const toks = tokens(trimmed);
  if (toks.length < minWords) {
    return `Your ${label} needs at least ${minWords} words — you have ${toks.length}.`;
  }

  if (opts.requireWord && !containsWord(trimmed, opts.requireWord)) {
    return `Your ${label} must use the word "${opts.requireWord}" (any form counts).`;
  }

  if (opts.requireWords && opts.requireWords.length > 0) {
    const missing = opts.requireWords.filter((w) => !containsWord(trimmed, w));
    if (missing.length > 0) {
      return `Your ${label} is missing: ${missing.map((w) => `"${w}"`).join(", ")}.`;
    }
  }

  // Gibberish: very long letter runs with no vowels, or single-letter spam
  const gibberish = toks.find(
    (t) => t.replace(/'/g, "").length > GIBBERISH_MAX_TOKEN || /^[bcdfghjklmnpvwxz]{6,}$/i.test(t)
  );
  if (gibberish) {
    return `That doesn't look like real English ("${gibberish.slice(0, 20)}…"). Write a genuine ${label}.`;
  }

  // Repetition spam: one token filling most of the text
  const counts = new Map<string, number>();
  for (const t of toks) counts.set(t, (counts.get(t) ?? 0) + 1);
  const maxCount = Math.max(...counts.values());
  if (toks.length >= 8 && maxCount / toks.length > 0.4) {
    return `A ${label} isn't the same word repeated — vary your wording.`;
  }

  // Copy-paste-of- examples style: no spaces between words after letters
  if (/([a-z]{3,})\1{2,}/i.test(trimmed)) {
    return `That looks like repeated text — write your own ${label}.`;
  }

  return null;
}
