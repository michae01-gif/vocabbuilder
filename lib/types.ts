export type WordSeed = {
  word: string;
  pos: string;
  definition: string;
  examples: [string, string, string];
  etymology: string;
  difficulty?: number;
};

export type RootSeed = {
  root: string;
  meaning: string;
  language: "Latin" | "Greek" | "French";
  story: string;
  emoji: string;
  words: WordSeed[];
};

export type DuelSeed = {
  word: string;
  foil: string;
  prompt: string;
  distinction: string;
};

export type Root = {
  id: number;
  root: string;
  meaning: string;
  language: string;
  story: string;
  emoji: string;
  order_idx: number;
};

export type Word = {
  id: number;
  root_id: number;
  word: string;
  pos: string;
  definition: string;
  pronunciation: string;
  example1: string;
  example2: string;
  example3: string;
  etymology: string;
  difficulty: number;
  frequency: number;
};

export type Progress = {
  id: number;
  user_id: number;
  word_id: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: string | null;
  stage: WordStage;
  productive_successes: number;
  receptive_successes: number;
  discrimination_successes: number;
  transfer_successes: number;
  production_passes: number;
  critical_error_open: number;
  first_productive_at: string | null;
  last_productive_at: string | null;
  mastered_at: string | null;
  lapsed_at: string | null;
};

export type WordStage =
  | "unseen"
  | "recognised"
  | "recalled"
  | "discriminated"
  | "produced"
  | "transferred"
  | "mastered"
  | "lapsed";

export const STAGE_ORDER: Record<WordStage, number> = {
  unseen: 0,
  recognised: 1,
  recalled: 2,
  discriminated: 3,
  produced: 4,
  transferred: 5,
  mastered: 6,
  lapsed: 1,
};

export type TaskType = "receptive" | "productive" | "duel" | "production";

export type Duel = {
  id: number;
  word_id: number;
  foil_word_id: number;
  prompt: string;
  distinction: string;
  order_idx: number;
};

export type DuelWithWords = Duel & {
  word: string;
  word_definition: string;
  foil_word: string;
  foil_definition: string;
  root: string;
  root_emoji: string;
};

export type ProductionVerdict = {
  passed: boolean;
  score: number;
  max_score: number;
  issues: string[];
  feedback: string;
};

export type ProgressWithWord = Progress & Word & { root: string; root_emoji: string; root_meaning: string };export const LEVELS: { name: string; min: number }[] = [
  { name: "Novice", min: 0 },
  { name: "Scholar", min: 40 },
  { name: "Savant", min: 120 },
  { name: "Polymath", min: 220 },
  { name: "Wordsmith", min: 330 },
  { name: "Luminary", min: 460 },
  { name: "Erudite", min: 600 },
  { name: "Lexicon Sage", min: 800 },
];

export function levelForWordCount(count: number) {
  let level = LEVELS[0];
  let next: (typeof LEVELS)[number] | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (count >= LEVELS[i].min) {
      level = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    } else {
      break;
    }
  }
  return { level, next };
}