"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { spinWheel } from "@/lib/actions";
import { WHEEL_SEGMENTS } from "@/data/wheel";
import Mascot from "./mascot";

const SLICE = 360 / WHEEL_SEGMENTS.length;
const SIZE = 216;
const C = SIZE / 2;
const R = SIZE / 2 - 16;

function pt(deg: number, r: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [C + r * Math.sin(rad), C - r * Math.cos(rad)];
}

function wedge(i: number): string {
  const a0 = i * SLICE;
  const a1 = (i + 1) * SLICE;
  const [x0, y0] = pt(a0, R);
  const [x1, y1] = pt(a1, R);
  return `M${C},${C} L${x0.toFixed(2)},${y0.toFixed(2)} A${R},${R} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
}

const CONFETTI = Array.from({ length: 16 }, (_, i) => i);

export default function Wheel({ coins, spunToday, avatar = "🦉" }: { coins: number; spunToday: boolean; avatar?: string }) {
  const router = useRouter();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<number | null>(null);
  const [hasSpun, setHasSpun] = useState(spunToday);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleSpin() {
    if (spinning || hasSpun) return;
    setSpinning(true);
    setError(null);
    setWon(null);
    startTransition(async () => {
      const res = await spinWheel();
      if (!res.ok) {
        setError(res.error);
        setSpinning(false);
        setHasSpun(true);
        return;
      }
      const jitter = (Math.random() - 0.5) * (SLICE * 0.55);
      const target = 360 * 6 + (360 - (res.index * SLICE + SLICE / 2) + jitter);
      setRotation((prev) => Math.ceil(prev / 360) * 360 + target);
      setTimeout(() => {
        setSpinning(false);
        setHasSpun(true);
        setWon(res.amount);
        router.refresh();
      }, 4600);
    });
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-200/15 bg-gradient-to-b from-amber-200/[0.07] via-white/[0.03] to-white/[0.02] p-5">
      {won !== null && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {CONFETTI.map((i) => (
            <span
              key={i}
              className="confetti-particle absolute text-base"
              style={{ left: `${(i * 41) % 100}%`, top: "-20px", animationDelay: `${(i % 6) * 0.12}s` }}
            >
              {["🎉", "✨", "🪙", "⭐"][i % 4]}
            </span>
          ))}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-[var(--font-lora)] text-lg font-semibold">Daily spin</h2>
        <span className="rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-amber-200">
          1 free / day
        </span>
      </div>

      <div className="flex items-end justify-center gap-1">
        {/* Mascot beside the wheel, presenting it */}
        <div className="mascot-bob relative z-20 -mr-4 w-[76px] shrink-0 sm:w-[100px]">
          <Mascot emoji={avatar} pose="hold" dance className="h-auto w-full drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div className="relative shrink-0">
          <div className="absolute left-1/2 top-[-7px] z-30 -translate-x-1/2 drop-shadow-md">
            <div className="h-0 w-0 border-x-[9px] border-t-[15px] border-x-transparent border-t-amber-300" />
          </div>

          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-[188px] w-[188px] drop-shadow-xl sm:h-[216px] sm:w-[216px]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4.5s cubic-bezier(0.18, 0.85, 0.22, 1)" : "none",
            }}
          >
            <defs>
              <radialGradient id="hubGlow" cx="50%" cy="35%" r="80%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="60%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#d97706" />
              </radialGradient>
              <linearGradient id="gloss" x1="0" y1="0" x2="0.6" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>

            {/* rim */}
            <circle cx={C} cy={C} r={C - 2} fill="#3f2d13" />
            <circle cx={C} cy={C} r={C - 5} fill="#7c4a0e" />
            <circle cx={C} cy={C} r={C - 9} fill="#0d0d12" />

            {/* segments */}
            {WHEEL_SEGMENTS.map((seg, i) => (
              <g key={i}>
                <path d={wedge(i)} fill={seg.color} stroke="#0d0d12" strokeWidth="1.5" />
                {i % 2 === 0 && <path d={wedge(i)} fill="rgba(255,255,255,0.10)" />}
              </g>
            ))}

            {/* labels */}
            {WHEEL_SEGMENTS.map((seg, i) => (
              <g key={`l${i}`} transform={`rotate(${i * SLICE + SLICE / 2} ${C} ${C})`}>
                <text
                  x={C}
                  y={C - R + 24}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={seg.amount >= 100 ? 12 : 11}
                  fontWeight="800"
                  fill={seg.amount === 250 ? "#1c1917" : "#ffffff"}
                  style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.25)", strokeWidth: 2.5 }}
                >
                  {seg.amount === 250 ? "✦250" : seg.label}
                </text>
              </g>
            ))}

            {/* bulbs */}
            {WHEEL_SEGMENTS.map((_, i) => {
              const mid = i * SLICE + SLICE / 2;
              const [x, y] = pt(mid, C - 5.5);
              const lit = i % 2 === 0;
              return (
                <circle
                  key={`b${i}`}
                  cx={x}
                  cy={y}
                  r="2.6"
                  fill={lit ? "#fde68a" : "#f7f7f7"}
                  opacity={lit ? 1 : 0.55}
                />
              );
            })}

            {/* gloss */}
            <circle cx={C} cy={C} r={R} fill="url(#gloss)" style={{ pointerEvents: "none" }} />
          </svg>

          {/* Hub = spin button */}
          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning || hasSpun}
            aria-label="Spin the wheel"
            className={`absolute left-1/2 top-1/2 z-30 flex h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[3px] border-amber-100/80 shadow-[0_3px_10px_rgba(0,0,0,0.45),inset_0_2px_4px_rgba(255,255,255,0.55)] transition-all active:scale-90 sm:h-[70px] sm:w-[70px] ${
              spinning || hasSpun
                ? "cursor-not-allowed bg-zinc-700 opacity-80"
                : "bg-[radial-gradient(circle_at_35%_30%,#fffbeb,#fcd34d_60%,#d97706)] hover:brightness-105"
            }`}
          >
            <span className="text-lg leading-none drop-shadow-sm">{hasSpun ? "🌙" : "🪙"}</span>
            <span
              className={`text-[10px] font-extrabold uppercase tracking-wide ${
                hasSpun ? "text-zinc-400" : "text-amber-950"
              }`}
            >
              {spinning ? "…" : hasSpun ? "done" : "spin"}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-3 flex min-h-[30px] flex-col items-center justify-center gap-1.5">
        {won !== null && (
          <p className="pop rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-1 text-sm font-bold text-emerald-200">
            +{won} coins! See you tomorrow 🎉
          </p>
        )}
        {error && (
          <p className="rounded-full border border-rose-300/40 bg-rose-400/10 px-4 py-1 text-xs text-rose-200">{error}</p>
        )}
        {!won && !error && (
          <p className="text-xs text-zinc-500">
            {hasSpun ? "Spun today — come back tomorrow" : `Balance: 🪙 ${coins}`}
          </p>
        )}
      </div>
    </section>
  );
}
