import type { CSSProperties } from "react";

export type MascotPose = "stand" | "hold";

type SpeciesDef = {
  body: string;
  bodyLight: string;
  belly: string | null;
  bellyLight: string | null;
  accent: string;
  accentLight: string;
  ears: "round" | "pointy" | "tuft" | "none" | "antenna";
  tail: "none" | "bushy" | "thin" | "flame";
  eyes: "round" | "happy" | "visor" | "big";
  extra?: "glasses" | "hat" | "beak" | "crown" | "mane" | "horn" | "wings";
  patch?: boolean;
  square?: boolean;
  ghost?: boolean;
};

export const SPECIES: Record<string, SpeciesDef> = {
  "🦉": { body: "#8b7e74", bodyLight: "#b5a99a", belly: "#f5f0e8", bellyLight: "#fffdf9", accent: "#d97706", accentLight: "#fbbf24", ears: "tuft", tail: "none", eyes: "round", extra: "glasses" },
  "😺": { body: "#e8a820", bodyLight: "#fcd34d", belly: "#fef3c7", bellyLight: "#fffbeb", accent: "#ea580c", accentLight: "#fb923c", ears: "pointy", tail: "thin", eyes: "happy" },
  "🦊": { body: "#ea7e2e", bodyLight: "#fb923c", belly: "#ffedd5", bellyLight: "#fff7ed", accent: "#ffffff", accentLight: "#f8fafc", ears: "pointy", tail: "bushy", eyes: "round" },
  "🐼": { body: "#f5f5f4", bodyLight: "#ffffff", belly: "#ffffff", bellyLight: "#ffffff", accent: "#1c1917", accentLight: "#44403c", ears: "round", tail: "none", eyes: "round", patch: true },
  "🐺": { body: "#5a6a7e", bodyLight: "#8494a7", belly: "#d1d9e6", bellyLight: "#edf2f7", accent: "#2d3a4d", accentLight: "#475569", ears: "pointy", tail: "bushy", eyes: "round" },
  "🐯": { body: "#e87a20", bodyLight: "#fdba74", belly: "#ffedd5", bellyLight: "#fff7ed", accent: "#1c1917", accentLight: "#44403c", ears: "round", tail: "thin", eyes: "round" },
  "🦁": { body: "#e8a820", bodyLight: "#fcd34d", belly: "#fef08a", bellyLight: "#fefce8", accent: "#92400e", accentLight: "#b45309", ears: "round", tail: "bushy", eyes: "round", extra: "mane" },
  "🐙": { body: "#ec4899", bodyLight: "#f472b6", belly: null, bellyLight: null, accent: "#be185d", accentLight: "#db2777", ears: "none", tail: "none", eyes: "happy" },
  "🧙": { body: "#6d28d9", bodyLight: "#8b5cf6", belly: "#c4b5fd", bellyLight: "#ede9fe", accent: "#fbbf24", accentLight: "#fde68a", ears: "none", tail: "none", eyes: "round", extra: "hat" },
  "🤖": { body: "#7a8a9e", bodyLight: "#a3b1c6", belly: "#d1d9e6", bellyLight: "#edf2f7", accent: "#0ea5e9", accentLight: "#38bdf8", ears: "antenna", tail: "none", eyes: "visor", square: true },
  "🐉": { body: "#16a34a", bodyLight: "#4ade80", belly: "#bbf7d0", bellyLight: "#dcfce7", accent: "#ea580c", accentLight: "#fb923c", ears: "none", tail: "flame", eyes: "round", extra: "wings" },
  "👻": { body: "#e2e8f0", bodyLight: "#f8fafc", belly: null, bellyLight: null, accent: "#94a3b8", accentLight: "#cbd5e1", ears: "none", tail: "none", eyes: "happy", ghost: true },
  "🦄": { body: "#e879f9", bodyLight: "#f0abfc", belly: "#ffffff", bellyLight: "#ffffff", accent: "#a855f7", accentLight: "#c084fc", ears: "pointy", tail: "thin", eyes: "round", extra: "horn" },
  "🦅": { body: "#78350f", bodyLight: "#92400e", belly: "#d6d3d1", bellyLight: "#e7e5e4", accent: "#f59e0b", accentLight: "#fbbf24", ears: "none", tail: "none", eyes: "round", extra: "beak" },
  "👽": { body: "#22c55e", bodyLight: "#86efac", belly: "#bbf7d0", bellyLight: "#dcfce7", accent: "#15803d", accentLight: "#22c55e", ears: "antenna", tail: "none", eyes: "big" },
  "👑": { body: "#eab308", bodyLight: "#fde047", belly: "#fef9c3", bellyLight: "#fefce8", accent: "#7c2d12", accentLight: "#9a3412", ears: "round", tail: "thin", eyes: "round", extra: "crown" },
};

export function mascotEmoji(emoji: string): string {
  return SPECIES[emoji] ? emoji : "🦉";
}

export default function Mascot({
  emoji,
  pose = "stand",
  size = 120,
  className,
  style,
  dance = false,
}: {
  emoji: string;
  pose?: MascotPose;
  size?: number;
  className?: string;
  style?: CSSProperties;
  dance?: boolean;
}) {
  const sp = SPECIES[mascotEmoji(emoji)];
  const id = mascotEmoji(emoji).codePointAt(0) ?? 0;
  const bodyRx = sp.square ? 18 : 62;

  return (
    <svg
      viewBox="0 0 220 260"
      width={className ? undefined : size}
      height={className ? undefined : (size * 260) / 220}
      className={`${dance ? "mascot-squash" : ""} ${className ?? ""}`}
      style={style}
      aria-hidden
    >
      <defs>
        {/* Body gradient */}
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sp.bodyLight} />
          <stop offset="100%" stopColor={sp.body} />
        </linearGradient>
        {/* Belly gradient */}
        {sp.belly && (
          <linearGradient id={`belly${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sp.bellyLight ?? sp.belly} />
            <stop offset="100%" stopColor={sp.belly} />
          </linearGradient>
        )}
        {/* Accent gradient */}
        <linearGradient id={`acc${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sp.accentLight} />
          <stop offset="100%" stopColor={sp.accent} />
        </linearGradient>
        {/* Drop shadow */}
        <filter id={`ds${id}`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.18" />
        </filter>
        {/* Body highlight (rim light) */}
        <radialGradient id={`hl${id}`} cx="0.35" cy="0.2" r="0.65">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g filter={`url(#ds${id})`}>
        {/* tail (behind) */}
        {sp.tail === "bushy" && (
          <>
            <ellipse cx="190" cy="200" rx="36" ry="20" fill={`url(#acc${id})`} transform="rotate(-25 190 200)" />
            <ellipse cx="192" cy="198" rx="22" ry="12" fill={sp.accentLight} opacity="0.5" transform="rotate(-25 192 198)" />
          </>
        )}
        {sp.tail === "thin" && (
          <>
            <path d="M168 210 Q 210 200 204 165" fill="none" stroke={sp.body} strokeWidth="12" strokeLinecap="round" />
            <path d="M168 210 Q 206 202 200 168" fill="none" stroke={sp.bodyLight} strokeWidth="5" strokeLinecap="round" opacity="0.4" />
          </>
        )}
        {sp.tail === "flame" && (
          <>
            <path d="M170 208 Q 218 192 210 142 Q 200 172 180 188 Z" fill={`url(#acc${id})`} />
            <path d="M174 204 Q 208 194 204 158 Q 196 178 182 190 Z" fill={sp.accentLight} opacity="0.6" />
          </>
        )}

        {/* wings (behind) */}
        {sp.extra === "wings" && (
          <>
            <path d="M52 128 Q 2 82 8 45 Q 35 72 62 105 Z" fill={`url(#acc${id})`} opacity="0.85" />
            <path d="M52 128 Q 2 82 8 45 Q 35 72 62 105 Z" fill={sp.accentLight} opacity="0.3" />
            <path d="M168 128 Q 218 82 212 45 Q 185 72 158 105 Z" fill={`url(#acc${id})`} opacity="0.85" />
            <path d="M168 128 Q 218 82 212 45 Q 185 72 158 105 Z" fill={sp.accentLight} opacity="0.3" />
            {/* wing feather lines */}
            <path d="M28 82 L 48 98" fill="none" stroke={sp.accent} strokeWidth="1.5" opacity="0.4" />
            <path d="M18 68 L 42 88" fill="none" stroke={sp.accent} strokeWidth="1.5" opacity="0.4" />
            <path d="M192 82 L 172 98" fill="none" stroke={sp.accent} strokeWidth="1.5" opacity="0.4" />
            <path d="M202 68 L 178 88" fill="none" stroke={sp.accent} strokeWidth="1.5" opacity="0.4" />
          </>
        )}

        {/* ears (behind head) */}
        {sp.ears === "round" && (
          <>
            <circle cx="60" cy="70" r="22" fill={`url(#bg${id})`} />
            <circle cx="160" cy="70" r="22" fill={`url(#bg${id})`} />
            <circle cx="60" cy="70" r="12" fill={`url(#acc${id})`} />
            <circle cx="160" cy="70" r="12" fill={`url(#acc${id})`} />
            <circle cx="58" cy="67" r="5" fill={sp.accentLight} opacity="0.5" />
            <circle cx="158" cy="67" r="5" fill={sp.accentLight} opacity="0.5" />
          </>
        )}
        {sp.ears === "pointy" && (
          <>
            <path d="M55 80 L 40 26 L 90 60 Z" fill={`url(#bg${id})`} />
            <path d="M165 80 L 180 26 L 130 60 Z" fill={`url(#bg${id})`} />
            <path d="M58 72 L 48 42 L 78 60 Z" fill={`url(#acc${id})`} />
            <path d="M162 72 L 172 42 L 142 60 Z" fill={`url(#acc${id})`} />
            <path d="M56 74 L 48 48 L 72 62 Z" fill={sp.accentLight} opacity="0.4" />
            <path d="M164 74 L 172 48 L 148 62 Z" fill={sp.accentLight} opacity="0.4" />
          </>
        )}
        {sp.ears === "antenna" && (
          <>
            <line x1="82" y1="64" x2="68" y2="20" stroke={sp.accent} strokeWidth="5" strokeLinecap="round" />
            <line x1="138" y1="64" x2="152" y2="20" stroke={sp.accent} strokeWidth="5" strokeLinecap="round" />
            <circle cx="68" cy="18" r="9" fill={`url(#acc${id})`} />
            <circle cx="152" cy="18" r="9" fill={`url(#acc${id})`} />
            <circle cx="66" cy="15" r="3" fill={sp.accentLight} opacity="0.7" />
            <circle cx="150" cy="15" r="3" fill={sp.accentLight} opacity="0.7" />
          </>
        )}

        {/* mane (behind face, over body top) */}
        {sp.extra === "mane" &&
          [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => {
            const r = 58;
            const x = 110 + r * Math.cos((a * Math.PI) / 180);
            const y = 108 + r * Math.sin((a * Math.PI) / 180);
            return (
              <g key={a}>
                <circle cx={x} cy={y} r="17" fill={`url(#acc${id})`} />
                <circle cx={x - 2} cy={y - 3} r="8" fill={sp.accentLight} opacity="0.35" />
              </g>
            );
          })}

        {/* body */}
        {sp.ghost ? (
          <path
            d="M110 55 C 58 55 42 98 42 142 L 42 208 Q 54 196 65 210 Q 76 224 87 210 Q 97 197 110 210 Q 123 224 134 210 Q 145 197 156 210 Q 168 224 178 208 L 178 142 C 178 98 162 55 110 55 Z"
            fill={`url(#bg${id})`}
            opacity="0.96"
          />
        ) : (
          <>
            <rect x="44" y="55" width="132" height="182" rx={bodyRx} fill={`url(#bg${id})`} />
            <rect x="44" y="55" width="132" height="182" rx={bodyRx} fill={`url(#hl${id})`} />
          </>
        )}

        {/* belly */}
        {sp.belly && !sp.ghost && (
          <>
            <ellipse cx="110" cy="172" rx="44" ry="54" fill={`url(#belly${id})`} />
            <ellipse cx="106" cy="158" rx="20" ry="12" fill="#ffffff" opacity="0.18" />
          </>
        )}

        {/* feet */}
        {!sp.ghost && (
          <>
            <ellipse cx="84" cy="237" rx="22" ry="12" fill={`url(#bg${id})`} />
            <ellipse cx="136" cy="237" rx="22" ry="12" fill={`url(#bg${id})`} />
            <ellipse cx="84" cy="234" rx="14" ry="6" fill={sp.bodyLight} opacity="0.3" />
            <ellipse cx="136" cy="234" rx="14" ry="6" fill={sp.bodyLight} opacity="0.3" />
          </>
        )}

        {/* tuft */}
        {sp.ears === "tuft" && (
          <>
            <ellipse cx="94" cy="48" rx="8" ry="16" fill={`url(#acc${id})`} transform="rotate(-15 94 48)" />
            <ellipse cx="110" cy="44" rx="8" ry="18" fill={`url(#acc${id})`} />
            <ellipse cx="126" cy="48" rx="8" ry="16" fill={`url(#acc${id})`} transform="rotate(15 126 48)" />
            <ellipse cx="94" cy="46" rx="4" ry="8" fill={sp.accentLight} opacity="0.45" transform="rotate(-15 94 46)" />
            <ellipse cx="110" cy="42" rx="4" ry="9" fill={sp.accentLight} opacity="0.45" />
            <ellipse cx="126" cy="46" rx="4" ry="8" fill={sp.accentLight} opacity="0.45" transform="rotate(15 126 46)" />
          </>
        )}

        {/* panda patches */}
        {sp.patch && (
          <>
            <ellipse cx="82" cy="110" rx="19" ry="21" fill={sp.accent} transform="rotate(-12 82 110)" />
            <ellipse cx="138" cy="110" rx="19" ry="21" fill={sp.accent} transform="rotate(12 138 110)" />
          </>
        )}

        {/* eyes */}
        {sp.eyes === "round" && (
          <>
            <circle cx="84" cy="110" r="12" fill="#ffffff" />
            <circle cx="136" cy="110" r="12" fill="#ffffff" />
            <circle cx="86" cy="112" r="6.5" fill="#1c1917" />
            <circle cx="138" cy="112" r="6.5" fill="#1c1917" />
            <circle cx="89" cy="109" r="2.5" fill="#ffffff" />
            <circle cx="141" cy="109" r="2.5" fill="#ffffff" />
            <circle cx="84" cy="113" r="1.2" fill="#ffffff" opacity="0.6" />
            <circle cx="136" cy="113" r="1.2" fill="#ffffff" opacity="0.6" />
          </>
        )}
        {sp.eyes === "happy" && (
          <>
            <path d="M72 112 Q 84 98 96 112" fill="none" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" />
            <path d="M124 112 Q 136 98 148 112" fill="none" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {sp.eyes === "big" && (
          <>
            <ellipse cx="82" cy="110" rx="15" ry="18" fill="#052e16" />
            <ellipse cx="138" cy="110" rx="15" ry="18" fill="#052e16" />
            <ellipse cx="84" cy="107" rx="7" ry="9" fill="#166534" />
            <ellipse cx="140" cy="107" rx="7" ry="9" fill="#166534" />
            <circle cx="87" cy="104" r="4.5" fill="#ffffff" />
            <circle cx="143" cy="104" r="4.5" fill="#ffffff" />
            <circle cx="80" cy="112" r="2" fill="#ffffff" opacity="0.5" />
            <circle cx="136" cy="112" r="2" fill="#ffffff" opacity="0.5" />
          </>
        )}
        {sp.eyes === "visor" && (
          <>
            <rect x="60" y="98" width="100" height="28" rx="14" fill="#1e293b" />
            <rect x="62" y="100" width="96" height="24" rx="12" fill="#0f172a" />
            <circle cx="88" cy="112" r="6" fill={sp.accent} />
            <circle cx="132" cy="112" r="6" fill={sp.accent} />
            <circle cx="86" cy="110" r="2" fill={sp.accentLight} opacity="0.7" />
            <circle cx="130" cy="110" r="2" fill={sp.accentLight} opacity="0.7" />
            <rect x="104" y="108" width="12" height="8" rx="2" fill={sp.accent} opacity="0.5" />
          </>
        )}

        {/* cheek blush */}
        {sp.eyes !== "visor" && (
          <>
            <ellipse cx="66" cy="126" rx="10" ry="6" fill="#fda4af" opacity="0.35" />
            <ellipse cx="154" cy="126" rx="10" ry="6" fill="#fda4af" opacity="0.35" />
          </>
        )}

        {/* beak / mouth */}
        {sp.extra === "beak" ? (
          <>
            <path d="M96 126 L 124 126 L 110 146 Z" fill={`url(#acc${id})`} />
            <path d="M100 128 L 120 128 L 110 140 Z" fill={sp.accentLight} opacity="0.4" />
          </>
        ) : sp.eyes === "visor" ? (
          <rect x="96" y="140" width="28" height="6" rx="3" fill="#1e293b" />
        ) : (
          <path d="M96 138 Q 110 150 124 138" fill="none" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" />
        )}

        {/* glasses */}
        {sp.extra === "glasses" && (
          <>
            <circle cx="84" cy="110" r="17" fill="none" stroke={sp.accent} strokeWidth="4.5" />
            <circle cx="136" cy="110" r="17" fill="none" stroke={sp.accent} strokeWidth="4.5" />
            <line x1="101" y1="110" x2="119" y2="110" stroke={sp.accent} strokeWidth="4" />
            <line x1="67" y1="108" x2="52" y2="100" stroke={sp.accent} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="153" y1="108" x2="168" y2="100" stroke={sp.accent} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="78" cy="104" r="3" fill="#ffffff" opacity="0.25" />
            <circle cx="130" cy="104" r="3" fill="#ffffff" opacity="0.25" />
          </>
        )}

        {/* horn */}
        {sp.extra === "horn" && (
          <>
            <path d="M100 60 L 110 12 L 120 60 Z" fill={`url(#acc${id})`} />
            <path d="M104 52 L 110 20 L 114 52 Z" fill={sp.accentLight} opacity="0.5" />
            <line x1="103" y1="50" x2="117" y2="50" stroke="#ffffff" strokeWidth="2.5" opacity="0.7" />
            <line x1="105" y1="40" x2="115" y2="40" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
            <line x1="107" y1="30" x2="113" y2="30" stroke="#ffffff" strokeWidth="1.5" opacity="0.5" />
          </>
        )}

        {/* crown */}
        {sp.extra === "crown" && (
          <>
            <path d="M80 56 L 80 26 L 95 40 L 110 18 L 125 40 L 140 26 L 140 56 Z" fill={`url(#acc${id})`} />
            <path d="M84 54 L 84 30 L 95 42 L 110 24 L 125 42 L 136 30 L 136 54 Z" fill={sp.accentLight} opacity="0.35" />
            <circle cx="90" cy="30" r="3" fill="#ef4444" />
            <circle cx="110" cy="22" r="3.5" fill="#3b82f6" />
            <circle cx="130" cy="30" r="3" fill="#22c55e" />
          </>
        )}

        {/* wizard hat */}
        {sp.extra === "hat" && (
          <>
            <path d="M110 0 L 140 56 L 80 56 Z" fill="#4c1d95" />
            <path d="M110 0 L 140 56 L 80 56 Z" fill="url(#hl49)" />
            <ellipse cx="110" cy="56" rx="44" ry="10" fill="#5b21b6" />
            <ellipse cx="110" cy="56" rx="44" ry="10" fill="#6d28d9" opacity="0.5" />
            <path d="M116 12 L 126 28 L 108 24 Z" fill={sp.accent} />
            <circle cx="118" cy="10" r="3" fill={sp.accentLight} />
            <path d="M92 52 Q 110 44 128 52" fill="none" stroke={sp.accentLight} strokeWidth="2" opacity="0.4" />
          </>
        )}

        {/* tiger stripes */}
        {emoji === "🐯" && (
          <>
            <path d="M52 80 Q 62 90 52 100" fill="none" stroke={sp.accent} strokeWidth="4" strokeLinecap="round" />
            <path d="M48 100 Q 58 110 48 120" fill="none" stroke={sp.accent} strokeWidth="4" strokeLinecap="round" />
            <path d="M168 80 Q 158 90 168 100" fill="none" stroke={sp.accent} strokeWidth="4" strokeLinecap="round" />
            <path d="M172 100 Q 162 110 172 120" fill="none" stroke={sp.accent} strokeWidth="4" strokeLinecap="round" />
            <path d="M90 68 Q 110 62 130 68" fill="none" stroke={sp.accent} strokeWidth="3.5" strokeLinecap="round" />
          </>
        )}

        {/* dragon belly scales */}
        {emoji === "🐉" && (
          <>
            <path d="M88 155 Q 110 148 132 155" fill="none" stroke={sp.accent} strokeWidth="2" opacity="0.4" />
            <path d="M84 170 Q 110 163 136 170" fill="none" stroke={sp.accent} strokeWidth="2" opacity="0.35" />
            <path d="M82 185 Q 110 178 138 185" fill="none" stroke={sp.accent} strokeWidth="2" opacity="0.3" />
          </>
        )}

        {/* octopus spots */}
        {emoji === "🐙" && (
          <>
            <circle cx="80" cy="150" r="5" fill={sp.accent} opacity="0.3" />
            <circle cx="140" cy="150" r="5" fill={sp.accent} opacity="0.3" />
            <circle cx="110" cy="165" r="4" fill={sp.accent} opacity="0.25" />
          </>
        )}

        {/* robot panel lines */}
        {emoji === "🤖" && (
          <>
            <line x1="70" y1="145" x2="150" y2="145" stroke={sp.accent} strokeWidth="1.5" opacity="0.4" />
            <line x1="70" y1="165" x2="150" y2="165" stroke={sp.accent} strokeWidth="1.5" opacity="0.4" />
            <rect x="100" y="148" width="20" height="14" rx="3" fill={sp.accent} opacity="0.25" />
            <circle cx="106" cy="155" r="2" fill={sp.accent} opacity="0.5" />
            <circle cx="114" cy="155" r="2" fill={sp.accent} opacity="0.5" />
          </>
        )}

        {/* arms */}
        {pose === "hold" ? (
          <>
            <line x1="70" y1="150" x2="54" y2="94" stroke={`url(#bg${id})`} strokeWidth="22" strokeLinecap="round" />
            <line x1="150" y1="150" x2="166" y2="94" stroke={`url(#bg${id})`} strokeWidth="22" strokeLinecap="round" />
            <circle cx="54" cy="92" r="14" fill={`url(#bg${id})`} />
            <circle cx="166" cy="92" r="14" fill={`url(#bg${id})`} />
            <circle cx="54" cy="92" r="14" fill={`url(#hl${id})`} />
            <circle cx="166" cy="92" r="14" fill={`url(#hl${id})`} />
            <circle cx="54" cy="92" r="8" fill={sp.accent} opacity="0.7" />
            <circle cx="166" cy="92" r="8" fill={sp.accent} opacity="0.7" />
          </>
        ) : (
          <>
            <line x1="54" y1="150" x2="38" y2="198" stroke={`url(#bg${id})`} strokeWidth="20" strokeLinecap="round" />
            <line x1="166" y1="150" x2="182" y2="198" stroke={`url(#bg${id})`} strokeWidth="20" strokeLinecap="round" />
            <circle cx="38" cy="200" r="13" fill={`url(#bg${id})`} />
            <circle cx="182" cy="200" r="13" fill={`url(#bg${id})`} />
            <circle cx="38" cy="200" r="13" fill={`url(#hl${id})`} />
            <circle cx="182" cy="200" r="13" fill={`url(#hl${id})`} />
          </>
        )}
      </g>
    </svg>
  );
}
