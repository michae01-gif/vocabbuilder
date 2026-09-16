"use client";

import { useEffect, useState, type ReactNode } from "react";

const SCENES: { ms: number; caption: string; render: () => ReactNode }[] = [
  { ms: 2600, caption: "1. Your home base — streak, coins, and where to start", render: () => <SceneHome /> },
  { ms: 2600, caption: "2. Read real passages — tap any word you don't know", render: () => <SceneTap /> },
  { ms: 2600, caption: "3. Learn the root family — one key, many words", render: () => <SceneRoot /> },
  { ms: 2600, caption: "4. Smart review — words return right before you'd forget", render: () => <SceneReview /> },
  { ms: 2600, caption: "5. Coins earn you mascots, banners & themes", render: () => <SceneCoins /> },
  { ms: 2600, caption: "6. Spend them on your rewards page", render: () => <SceneRewards /> },
];

export default function LoginDemo() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setScene((s) => (s + 1) % SCENES.length), SCENES[scene].ms);
    return () => clearTimeout(t);
  }, [scene]);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-black/30 p-2.5 sm:p-3">
      {/* fake browser chrome */}
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-rose-400/60" />
        <span className="h-2 w-2 rounded-full bg-amber-300/60" />
        <span className="h-2 w-2 rounded-full bg-emerald-300/60" />
        <span className="ml-2 flex-1 truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-0.5 text-[10px] text-zinc-500">
          🌳 wordforgeapp.com
        </span>
      </div>

      {/* stage */}
      <div className="relative h-40 overflow-hidden rounded-xl border border-white/5 bg-[#0d0d12] sm:h-44">
        <div key={scene} className="absolute inset-0 p-3.5 sm:p-4">
          {SCENES[scene].render()}
        </div>
      </div>

      {/* progress segments */}
      <div className="mt-2 flex gap-1.5">
        {SCENES.map((s, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            {i === scene && (
              <div
                className="h-full rounded-full bg-amber-200/80"
                style={{ animation: `demo-progress ${s.ms}ms linear forwards` }}
              />
            )}
            {i < scene && <div className="h-full w-full rounded-full bg-amber-200/40" />}
          </div>
        ))}
      </div>

      {/* caption */}
      <p
        key={`c-${scene}`}
        className="mt-2 text-center text-[11px] text-zinc-400"
        style={{ animation: "demo-fade 0.4s ease both" }}
      >
        {SCENES[scene].caption}
      </p>
    </div>
  );
}

/* ---- Scene 1: Home screen ---- */
function SceneHome() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 text-[10px]">
        <span className="text-sm">🌳</span>
        <span className="font-semibold text-zinc-300">WordForge</span>
        <span className="ml-auto rounded-full border border-amber-200/25 bg-amber-200/10 px-2 py-0.5 text-amber-200">🪙 120</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="rounded-full border border-orange-300/30 bg-orange-300/10 px-2 py-0.5 text-[10px] text-orange-200" style={{ animation: "demo-pop 2.6s ease both" }}>🔥 7-day streak</span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-zinc-500">Level 2</span>
      </div>
      <div className="relative mt-2.5 grid flex-1 grid-cols-3 gap-1.5">
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1.5">
          <span className="text-lg">🌱</span>
          <span className="text-[10px] text-zinc-400">Learn</span>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-1 rounded-lg border p-1.5"
          style={{ animation: "demo-glow 2.6s ease both", borderColor: "rgba(255,255,255,0.12)" }}
        >
          <span className="text-lg">📖</span>
          <span className="text-[10px] text-zinc-200">Read</span>
          <span
            className="absolute -top-1 right-[34%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-200/20 text-[9px] shadow"
            style={{ animation: "demo-cursor-home 2.6s ease both" }}
          >
            👆
          </span>
        </div>
        <div className="relative flex flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1.5">
          <span className="text-lg">🔄</span>
          <span className="text-[10px] text-zinc-400">Review</span>
          <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-300 px-1 text-[8px] font-bold text-black">12</span>
        </div>
      </div>
      <p className="mt-1.5 text-[10px] text-zinc-600">A few taps a day — everything lives here</p>
    </div>
  );
}

/* ---- Scene 2: Reading passage ---- */
function SceneTap() {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Reading · Tier 2</p>
      <div className="mt-1.5 space-y-1.5">
        <div className="h-1.5 w-full rounded bg-white/8" />
        <div className="h-1.5 w-11/12 rounded bg-white/8" />
        <p className="relative font-[var(--font-lora)] text-[13px] leading-relaxed text-zinc-100">
          The crowd fell silent as the mysterious{" "}
          <span
            className="relative rounded px-0.5"
            style={{ animation: "demo-highlight 2.6s ease both", textDecoration: "underline", textDecorationStyle: "wavy", textDecorationColor: "#fbbf24", textUnderlineOffset: 3 }}
          >
            spectator
          </span>{" "}
          stepped forward, and every eye turned to look.
        </p>
        <div className="h-1.5 w-9/12 rounded bg-white/8" />
        <div className="h-1.5 w-10/12 rounded bg-white/8" />
      </div>
      <span
        className="absolute right-10 top-12 flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-200 bg-amber-200/20 text-[9px] text-amber-100 shadow-lg"
        style={{ animation: "demo-cursor 2.6s ease both" }}
      >
        👆
      </span>
    </div>
  );
}

/* ---- Scene 3: Root family ---- */
function SceneRoot() {
  const chips = ["inspect", "spectator", "prospect", "respect", "suspect"];
  return (
    <div className="flex h-full flex-col">
      <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Lesson · Root family</p>
      <div className="mt-1.5 rounded-xl border border-amber-200/25 bg-amber-200/[0.06] p-3" style={{ animation: "demo-card-in 0.6s ease both" }}>
        <div className="flex items-baseline gap-2">
          <span className="font-[var(--font-lora)] text-xl font-bold tracking-wide text-amber-100">SPECT</span>
          <span className="text-[10px] text-zinc-500">Latin · “to look”</span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {chips.map((c, i) => (
            <span
              key={c}
              className="rounded-full border border-amber-200/30 bg-amber-200/10 px-2 py-0.5 text-[10px] text-amber-100"
              style={{ animation: `demo-chip 0.4s ease both ${0.5 + i * 0.16}s` }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-auto text-[10px] text-zinc-500">
        Learn <span className="text-amber-200">1 root</span> → unlock{" "}
        <span className="text-amber-200">5+ words</span>
      </p>
    </div>
  );
}

/* ---- Scene 4: Review ---- */
function SceneReview() {
  const ratings = ["Again", "Hard", "Good", "Easy"];
  return (
    <div className="flex h-full flex-col">
      <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Review · 12 due</p>
      <div className="mt-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center" style={{ animation: "demo-card-in 0.5s ease both" }}>
        <p className="font-[var(--font-lora)] text-lg font-bold text-amber-100">obsolete</p>
        <p className="text-[11px] text-zinc-500">no longer in use</p>
      </div>
      <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-zinc-600">How well do you know it?</p>
      <div className="mt-1.5 grid grid-cols-4 gap-1.5">
        {ratings.map((r) => (
          <div
            key={r}
            className={`rounded-lg border px-1 py-1.5 text-center text-[10px] ${
              r === "Good" ? "text-emerald-200" : "text-zinc-400"
            }`}
            style={{ borderColor: "rgba(255,255,255,0.15)", ...(r === "Good" ? { animation: "demo-correct 2.6s ease both" } : {}) }}
          >
            {r}
          </div>
        ))}
      </div>
      <p className="mt-auto text-[10px] text-zinc-500">Right answers space out — wrong ones return sooner</p>
    </div>
  );
}

/* ---- Scene 5: Coins ---- */
function SceneCoins() {
  const items = [
    { icon: "🦉", name: "Night Owl", price: "500" },
    { icon: "🖼️", name: "Golden Frame", price: "750" },
    { icon: "🌌", name: "Aurora Peaks", price: "1000" },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-amber-200/70">🪙 What coins can do</p>
        <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-2 py-0.5 text-[10px] font-bold text-amber-200" style={{ animation: "demo-coin 2s ease-out 0.4s infinite" }}>
          +40
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <div
            key={it.name}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5"
            style={{ animation: `demo-rain 0.5s ease both ${0.3 + i * 0.25}s` }}
          >
            <span className="text-base">{it.icon}</span>
            <span className="text-[11px] text-zinc-200">{it.name}</span>
            <span className="ml-auto text-[10px] font-semibold text-amber-200">🪙 {it.price}</span>
          </div>
        ))}
      </div>
      <p className="mt-auto text-[10px] text-zinc-500">Every lesson, quiz & streak pays out coins</p>
    </div>
  );
}

/* ---- Scene 6: Rewards page ---- */
function SceneRewards() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[10px] uppercase tracking-widest text-amber-200/70">Rewards · Shop</p>
      <div className="mt-1.5 flex gap-1 text-[10px]">
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-zinc-500">Avatar</span>
        <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-2 py-0.5 text-amber-200">Banner</span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-zinc-500">Background</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-rose-400/30 to-purple-500/30 p-1.5" style={{ animation: "demo-rain 0.5s ease both 0.3s" }}>
          <div className="h-8 rounded bg-black/20" />
          <p className="mt-1 text-[9px] text-zinc-400">Sunset · 750🪙</p>
        </div>
        <div className="relative rounded-lg border border-emerald-300/40 bg-emerald-300/10 p-1.5" style={{ animation: "demo-rain 0.5s ease both 0.55s" }}>
          <span className="absolute -top-1 -right-1 rounded-full bg-emerald-300 px-1.5 text-[8px] font-bold text-black">✓</span>
          <div className="h-8 rounded bg-black/20" />
          <p className="mt-1 text-[9px] text-emerald-200">Owned</p>
        </div>
        <div className="flex flex-col rounded-lg border border-white/10 bg-white/[0.03] p-1.5" style={{ animation: "demo-rain 0.5s ease both 0.8s" }}>
          <div className="h-5 rounded bg-black/20" />
          <div
            className="mt-1.5 rounded-md border border-amber-200/40 py-0.5 text-center text-[9px] font-semibold text-amber-200"
            style={{ animation: "demo-equip-btn 2.6s ease both" }}
          >
            Equip
          </div>
        </div>
      </div>
      <p className="mt-auto text-[10px] text-zinc-500">Dress your mascot, theme your whole app</p>
    </div>
  );
}
