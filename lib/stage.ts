import type { Progress, WordStage } from "./types";

const MASTERY_DAYS = 14;
const MASTERY_PRODUCTIVE = 3;

export function daysBetween(a: string | null, b: string | null): number {
  if (!a || !b) return 0;
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.max(0, (db - da) / 86400000);
}

export function computeStage(p: Progress): WordStage {
  if (p.critical_error_open > 0) {
    return p.mastered_at ? "lapsed" : "recognised";
  }

  const span = daysBetween(p.first_productive_at, p.last_productive_at);
  const mastered =
    p.productive_successes >= MASTERY_PRODUCTIVE &&
    span >= MASTERY_DAYS &&
    p.production_passes >= 1 &&
    p.discrimination_successes >= 1 &&
    p.transfer_successes >= 1;

  if (mastered) return "mastered";
  if (p.transfer_successes >= 1) return "transferred";
  if (p.production_passes >= 1) return "produced";
  if (p.discrimination_successes >= 1) return "discriminated";
  if (p.productive_successes >= 1) return "recalled";
  return "recognised";
}

export function stageMeta(stage: WordStage): { label: string; color: string; ring: string; icon: string } {
  switch (stage) {
    case "unseen":
      return { label: "Unseen", color: "text-zinc-600", ring: "border-white/10", icon: "🌱" };
    case "recognised":
      return { label: "Recognised", color: "text-amber-200", ring: "border-amber-200/40", icon: "🌿" };
    case "recalled":
      return { label: "Recalled", color: "text-sky-300", ring: "border-sky-300/50", icon: "💧" };
    case "discriminated":
      return { label: "Discriminated", color: "text-violet-300", ring: "border-violet-300/50", icon: "⚖️" };
    case "produced":
      return { label: "Produced", color: "text-orange-300", ring: "border-orange-300/50", icon: "✍️" };
    case "transferred":
      return { label: "Transferred", color: "text-cyan-300", ring: "border-cyan-300/50", icon: "🔀" };
    case "mastered":
      return { label: "Mastered", color: "text-emerald-300", ring: "border-emerald-300/60", icon: "🏆" };
    case "lapsed":
      return { label: "Lapsed", color: "text-rose-300", ring: "border-rose-300/50", icon: "🥀" };
  }
}
