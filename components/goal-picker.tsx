"use client";

import { useState } from "react";

const GOALS = [
  {
    icon: "🎯",
    title: "Ace my tests",
    body: "SAT, ACT, GRE — root families unlock hundreds of test words at once.",
  },
  {
    icon: "📖",
    title: "Read harder texts",
    body: "Follow real passages and never stop to reach for a dictionary.",
  },
  {
    icon: "🧠",
    title: "Grow for the joy of it",
    body: "A daily 5-minute ritual — streaks, coins, and a garden that proves it.",
  },
  {
    icon: "✍️",
    title: "Write with precision",
    body: "Say exactly what you mean — the right word, not the almost-right one.",
  },
];

export default function GoalPicker() {
  const [picked, setPicked] = useState<number[]>([]);

  function toggle(i: number) {
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  }

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          What brings you here? <span className="normal-case text-zinc-600">(tap to pick)</span>
        </h2>
        {picked.length > 0 && (
          <span className="pop text-[11px] font-medium text-emerald-300">✓ Noted</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {GOALS.map((g, i) => {
          const on = picked.includes(i);
          return (
            <button
              key={g.title}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={on}
              className={`rounded-xl border p-3 text-left transition-all active:scale-[0.98] ${
                on
                  ? "border-emerald-300/60 bg-emerald-300/10 shadow-[0_0_16px_rgba(110,231,183,0.12)]"
                  : "border-white/10 bg-white/[0.03] hover:border-amber-200/30"
              }`}
            >
              <p
                className={`flex items-center gap-1.5 text-[13px] font-semibold ${
                  on ? "text-emerald-100" : "text-zinc-100"
                }`}
              >
                <span className="text-base">{g.icon}</span>
                {g.title}
                {on && <span className="ml-auto text-xs text-emerald-300">✓</span>}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{g.body}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
