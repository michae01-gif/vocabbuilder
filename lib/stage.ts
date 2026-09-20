import type { Progress, WordStage } from "./types";

export function computeStage(p: Progress): WordStage {
  if (p.critical_error_open > 0) {
    return p.mastered_at ? "lapsed" : "recognised";
  }

  if (p.state === 2 && p.mastered_at) return "mastered";
  if (p.lapsed_at && !p.mastered_at) return "lapsed";
  if (p.production_passes >= 1) return "produced";
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
