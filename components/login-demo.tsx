"use client";

import { useEffect, useState } from "react";

const SCENE_MS = 2500;

const CAPTIONS = [
  "1. Read a real passage — tap any word you don't know",
  "2. Learn the root — one key unlocks a whole family of words",
  "3. Prove it in a quick quiz",
  "4. Earn coins, keep your streak, grow your garden",
];

export default function LoginDemo() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setScene((s) => (s + 1) % 4), SCENE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4">
      {/* fake browser chrome */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/60" />
        <span className="ml-2 flex-1 truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] text-zinc-500">
          🌳 wordforgeapp.com
        </span>
      </div>

      {/* stage */}
      <div className="relative h-52 overflow-hidden rounded-xl border border-white/5 bg-[#0d0d12] sm:h-56">
        <div key={scene} className="absolute inset-0 p-4 sm:p-5">
          {scene === 0 && <SceneTap />}
          {scene === 1 && <SceneRoot />}
          {scene === 2 && <SceneQuiz />}
          {scene === 3 && <SceneGarden />}
        </div>
      </div>

      {/* progress segments */}
      <div className="mt-3 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            {i === scene && (
              <div
                className="h-full rounded-full bg-amber-200/80"
                style={{ animation: `demo-progress ${SCENE_MS}ms linear forwards` }}
              />
            )}
            {i < scene && <div className="h-full w-full rounded-full bg-amber-200/40" />}
          </div>
        ))}
      </div>

      {/* caption */}
      <p key={`c-${scene}`} className="mt-2.5 text-center text-xs text-zinc-400" style={{ animation: "demo-fade 0.4s ease both" }}>
        {CAPTIONS[scene]}
      </p>
    </div>
  );
}

function SceneTap() {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Reading · Tier 2</p>
      <div className="mt-2 space-y-2">
        <div className="h-2 w-full rounded bg-white/8" />
        <div className="h-2 w-11/12 rounded bg-white/8" />
        <p className="relative font-[var(--font-lora)] text-sm leading-relaxed text-zinc-100">
          The crowd fell silent as the mysterious{" "}
          <span
            className="relative rounded px-0.5"
            style={{ animation: "demo-highlight 2.5s ease both", textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: "#fbbf24", textUnderlineOffset: 3 }}
          >
            spectator
          </span>{" "}
          stepped forward, and every eye in the theatre turned to look.
        </p>
        <div className="h-2 w-9/12 rounded bg-white/8" />
        <div className="h-2 w-10/12 rounded bg-white/8" />
      </div>
      <span
        className="absolute right-10 top-14 flex h-6 w-6 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-200/20 text-[11px] text-amber-100 shadow-lg"
        style={{ animation: "demo-cursor 2.5s ease both" }}
      >
        👆
      </span>
    </div>
  );
}

function SceneRoot() {
  const chips = ["inspect", "spectator", "prospect", "respect", "suspect"];
  return (
    <div className="flex h-full flex-col">
      <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Lesson · Root family</p>
      <div className="mt-2 rounded-xl border border-amber-200/25 bg-amber-200/[0.06] p-3.5" style={{ animation: "demo-card-in 0.6s ease both" }}>
        <div className="flex items-baseline gap-2">
          <span className="font-[var(--font-lora)] text-2xl font-bold tracking-wide text-amber-100">SPECT</span>
          <span className="text-[11px] text-zinc-500">Latin · “to look”</span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-400">One root — a whole family of words:</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <span
              key={c}
              className="rounded-full border border-amber-200/30 bg-amber-200/10 px-2.5 py-1 text-[11px] text-amber-100"
              style={{ animation: `demo-chip 0.4s ease both ${0.5 + i * 0.18}s` }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-auto text-[11px] text-zinc-500">Learn <span className="text-amber-200">1 root</span> → unlock <span className="text-amber-200">5+ words</span></p>
    </div>
  );
}

function SceneQuiz() {
  const options = [
    { text: "a person who watches an event", correct: true },
    { text: "a tool for measuring depth", correct: false },
    { text: "a loud burst of sound", correct: false },
    { text: "a written agreement", correct: false },
  ];
  return (
    <div className="flex h-full flex-col">
      <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Quick quiz</p>
      <p className="mt-1.5 text-center font-[var(--font-lora)] text-xl font-bold text-amber-100">spectator</p>
      <div className="mt-2.5 space-y-1.5">
        {options.map((o) => (
          <div
            key={o.text}
            className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-[11px] ${
              o.correct ? "text-emerald-200" : "text-zinc-400"
            }`}
            style={{ animation: `demo-correct 2.5s ease both`, borderColor: "rgba(255,255,255,0.15)" }}
          >
            <span>{o.text}</span>
            {o.correct && (
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-300 text-[9px] font-bold text-black"
                style={{ animation: "demo-check 2.5s ease both" }}
              >
                ✓
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-auto text-[11px] text-zinc-500">Wrong answers come back sooner — right ones space out</p>
    </div>
  );
}

function SceneGarden() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <span className="text-5xl" style={{ animation: "demo-grow 2.5s ease both" }}>
        🌳
      </span>
      <div className="relative flex h-8 items-center">
        <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-200" style={{ animation: "demo-coin 2.2s ease-out 0.6s infinite" }}>
          +40 🪙
        </span>
        <span className="absolute left-14 rounded-full border border-amber-200/40 bg-amber-200/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-200" style={{ animation: "demo-coin 2.2s ease-out 1.4s infinite" }}>
          +150 🪙
        </span>
      </div>
      <div className="flex gap-2" style={{ animation: "demo-pop 2.5s ease both" }}>
        <span className="rounded-full border border-orange-300/30 bg-orange-300/10 px-3 py-1 text-[11px] text-orange-200">🔥 7-day streak</span>
        <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[11px] text-emerald-200">🌱 132 words grown</span>
      </div>
    </div>
  );
}
