import type { ReactNode } from "react";
import { SPECIES, mascotEmoji } from "./mascot";

/* ---------------------------------- pieces --------------------------------- */

function Planet({
  size,
  from,
  to,
  ring,
  uid,
  className,
  style,
}: {
  size: number;
  from: string;
  to: string;
  ring?: string;
  uid: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id={`p-${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </radialGradient>
      </defs>
      {ring && (
        <ellipse cx="50" cy="55" rx="48" ry="12" fill="none" stroke={ring} strokeWidth="5" opacity="0.7" transform="rotate(-18 50 55)" />
      )}
      <circle cx="50" cy="50" r="34" fill={`url(#p-${uid})`} />
      <circle cx="40" cy="42" r="5" fill="rgba(0,0,0,0.12)" />
      <circle cx="58" cy="60" r="7" fill="rgba(0,0,0,0.10)" />
      <circle cx="62" cy="38" r="3.5" fill="rgba(0,0,0,0.10)" />
      {ring && (
        <path
          d="M8 66 A 46 46 0 0 0 88 42"
          fill="none"
          stroke={ring}
          strokeWidth="5"
          opacity="0.9"
          transform="rotate(-18 50 55)"
          strokeDasharray="70 60"
        />
      )}
    </svg>
  );
}

function AstroMascot({
  emoji,
  pose,
  size = 92,
  className,
  style,
}: {
  emoji: string;
  pose: "wave" | "float" | "flag";
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const sp = SPECIES[mascotEmoji(emoji)];
  return (
    <svg
      width={size}
      height={(size * 140) / 120}
      viewBox="0 0 120 140"
      className={className}
      style={style}
      aria-hidden
    >
      {/* flag pole */}
      {pose === "flag" && (
        <>
          <line x1="24" y1="58" x2="24" y2="8" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M26 10 L 52 17 L 26 25 Z" fill="#f59e0b" />
        </>
      )}
      {/* backpack */}
      <rect x="38" y="52" width="44" height="36" rx="11" fill="#94a3b8" opacity="0.85" />
      {/* body suit */}
      <rect x="34" y="54" width="52" height="54" rx="21" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      {/* chest panel */}
      <rect x="47" y="72" width="26" height="15" rx="4" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="54" cy="79.5" r="2.6" fill="#f59e0b" />
      <circle cx="61" cy="79.5" r="2.6" fill="#38bdf8" />
      <circle cx="68" cy="79.5" r="2.6" fill="#34d399" />
      {/* legs */}
      {pose === "float" ? (
        <>
          <rect x="40" y="100" width="17" height="24" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" transform="rotate(18 48 102)" />
          <rect x="63" y="100" width="17" height="24" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" transform="rotate(-24 72 102)" />
        </>
      ) : (
        <>
          <rect x="41" y="102" width="17" height="22" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="62" y="102" width="17" height="22" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="39" y="119" width="21" height="10" rx="4" fill="#f97316" />
          <rect x="60" y="119" width="21" height="10" rx="4" fill="#f97316" />
        </>
      )}

      {/* --- mascot head inside the helmet --- */}
      {/* mane behind head */}
      {sp.extra === "mane" &&
        [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const x = 60 + 17 * Math.cos((a * Math.PI) / 180);
          const y = 36 + 17 * Math.sin((a * Math.PI) / 180);
          return <circle key={a} cx={x} cy={y} r="5.5" fill={sp.accent} />;
        })}
      {/* antennae poke out of the helmet */}
      {sp.ears === "antenna" && (
        <>
          <line x1="52" y1="24" x2="42" y2="4" stroke={sp.accent} strokeWidth="3" strokeLinecap="round" />
          <line x1="68" y1="24" x2="78" y2="4" stroke={sp.accent} strokeWidth="3" strokeLinecap="round" />
          <circle cx="42" cy="3" r="4" fill={sp.accent} />
          <circle cx="78" cy="3" r="4" fill={sp.accent} />
        </>
      )}
      <circle cx="60" cy="36" r="15" fill={sp.body} />
      {/* ears */}
      {sp.ears === "pointy" && (
        <>
          <path d="M52 27 L 45 12 L 60 21 Z" fill={sp.body} stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />
          <path d="M68 27 L 75 12 L 60 21 Z" fill={sp.body} stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />
          <path d="M53 24 L 49 16 L 57 21 Z" fill={sp.accent} />
          <path d="M67 24 L 71 16 L 63 21 Z" fill={sp.accent} />
        </>
      )}
      {sp.ears === "round" && (
        <>
          <circle cx="50" cy="23" r="7" fill={sp.body} stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />
          <circle cx="70" cy="23" r="7" fill={sp.body} stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />
          <circle cx="50" cy="23" r="3" fill={sp.accent} />
          <circle cx="70" cy="23" r="3" fill={sp.accent} />
        </>
      )}
      {sp.ears === "tuft" && (
        <>
          <ellipse cx="54" cy="21" rx="3" ry="6" fill={sp.accent} transform="rotate(-14 54 21)" />
          <ellipse cx="60" cy="19" rx="3" ry="7" fill={sp.accent} />
          <ellipse cx="66" cy="21" rx="3" ry="6" fill={sp.accent} transform="rotate(14 66 21)" />
        </>
      )}
      {/* eyes */}
      {sp.eyes === "round" && (
        <>
          <circle cx="54" cy="34" r="5" fill="#ffffff" />
          <circle cx="66" cy="34" r="5" fill="#ffffff" />
          <circle cx="55" cy="35" r="2.5" fill="#1c1917" />
          <circle cx="67" cy="35" r="2.5" fill="#1c1917" />
        </>
      )}
      {sp.eyes === "happy" && (
        <>
          <path d="M49 36 Q 54 30 59 36" fill="none" stroke="#1c1917" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M61 36 Q 66 30 71 36" fill="none" stroke="#1c1917" strokeWidth="2.6" strokeLinecap="round" />
        </>
      )}
      {sp.eyes === "big" && (
        <>
          <ellipse cx="54" cy="34" rx="6" ry="7.5" fill="#052e16" />
          <ellipse cx="66" cy="34" rx="6" ry="7.5" fill="#052e16" />
          <circle cx="56" cy="31.5" r="1.8" fill="#ffffff" />
          <circle cx="68" cy="31.5" r="1.8" fill="#ffffff" />
        </>
      )}
      {sp.eyes === "visor" && (
        <>
          <rect x="48" y="30" width="24" height="9" rx="4.5" fill="#1e293b" />
          <circle cx="54" cy="34.5" r="2" fill={sp.accent} />
          <circle cx="66" cy="34.5" r="2" fill={sp.accent} />
        </>
      )}
      {/* beak / smile / horn */}
      {sp.extra === "beak" ? (
        <path d="M56 42 L 64 42 L 60 49 Z" fill={sp.accent} />
      ) : sp.eyes === "visor" ? (
        <rect x="56" y="44" width="8" height="2.5" rx="1.2" fill="#1e293b" />
      ) : (
        <path d="M55 43 Q 60 47.5 65 43" fill="none" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" />
      )}
      {sp.extra === "horn" && <path d="M57 23 L 60 12 L 63 23 Z" fill={sp.accent} />}

      {/* helmet over the head */}
      <circle cx="60" cy="36" r="26" fill="rgba(226,232,240,0.16)" stroke="#f8fafc" strokeWidth="5" />
      <circle cx="60" cy="36" r="20" fill="rgba(191,219,254,0.14)" stroke="rgba(147,197,253,0.45)" strokeWidth="1.5" />
      <path d="M45 22 Q 53 13 66 15" stroke="rgba(255,255,255,0.75)" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* arms */}
      {pose === "wave" && (
        <>
          <rect x="20" y="62" width="16" height="30" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" transform="rotate(22 28 64)" />
          <rect x="84" y="46" width="16" height="30" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" transform="rotate(-128 92 48)" />
          <circle cx="74" cy="28" r="8.5" fill="#f97316" />
        </>
      )}
      {pose === "float" && (
        <>
          <rect x="16" y="56" width="16" height="30" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" transform="rotate(38 24 58)" />
          <rect x="88" y="56" width="16" height="30" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" transform="rotate(-38 96 58)" />
          <circle cx="16" cy="72" r="8.5" fill="#f97316" />
          <circle cx="104" cy="72" r="8.5" fill="#f97316" />
        </>
      )}
      {pose === "flag" && (
        <>
          <rect x="18" y="62" width="16" height="30" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" transform="rotate(14 26 64)" />
          <rect x="86" y="64" width="16" height="28" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" transform="rotate(-14 94 66)" />
          <circle cx="22" cy="88" r="8.5" fill="#f97316" />
          <circle cx="98" cy="88" r="8.5" fill="#f97316" />
        </>
      )}
    </svg>
  );
}

function Crab({ size = 58, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={(size * 60) / 80} viewBox="0 0 80 60" className={className} style={style} aria-hidden>
      <circle cx="16" cy="14" r="6" fill="none" stroke="#f87171" strokeWidth="2.5" />
      <circle cx="64" cy="14" r="6" fill="none" stroke="#f87171" strokeWidth="2.5" />
      <path d="M20 17 Q 28 8 34 16" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 17 Q 52 8 46 16" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="14" x2="30" y2="7" stroke="#f87171" strokeWidth="2" />
      <line x1="50" y1="14" x2="50" y2="7" stroke="#f87171" strokeWidth="2" />
      <circle cx="30" cy="6" r="3" fill="#1c1917" />
      <circle cx="50" cy="6" r="3" fill="#1c1917" />
      <ellipse cx="40" cy="36" rx="22" ry="15" fill="#ef4444" />
      <ellipse cx="40" cy="40" rx="13" ry="7" fill="#fca5a5" opacity="0.6" />
      <path d="M20 46 L 14 54 M30 49 L 27 57 M50 49 L 53 57 M60 46 L 66 54" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Sandcastle({ size = 110, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={(size * 100) / 110} viewBox="0 0 110 100" className={className} style={style} aria-hidden>
      <rect x="18" y="52" width="74" height="34" rx="4" fill="#d6b98c" />
      <rect x="14" y="86" width="82" height="8" rx="4" fill="#c2a678" />
      <rect x="26" y="30" width="18" height="24" fill="#d6b98c" />
      <rect x="54" y="30" width="18" height="24" fill="#d6b98c" />
      <rect x="40" y="18" width="18" height="36" fill="#e0c69b" />
      <path d="M40 18 L 49 8 L 58 18 Z" fill="#e0c69b" />
      <path d="M26 30 L 31 24 L 36 30 M 26 36 L 35 36 M 26 42 L 31 36 M 54 30 L 59 24 L 64 30 M 54 42 L 59 36 M 54 36 L 63 36" stroke="#b99a6d" strokeWidth="2" fill="none" />
      <line x1="49" y1="8" x2="49" y2="2" stroke="#7c5c3a" strokeWidth="1.5" />
      <path d="M49.5 2 L 58 5 L 49.5 8 Z" fill="#38bdf8" />
      <circle cx="49" cy="42" r="3.5" fill="#8a6d45" />
    </svg>
  );
}

function Palm({ size = 150, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={(size * 150) / 150} viewBox="0 0 150 150" className={className} style={style} aria-hidden>
      <path d="M70 145 Q 66 100 78 62" fill="none" stroke="#8a6d45" strokeWidth="9" strokeLinecap="round" />
      <path d="M73 110 Q 88 112 94 122" fill="none" stroke="#8a6d45" strokeWidth="5" strokeLinecap="round" />
      <path d="M78 62 Q 46 44 24 56 Q 50 62 74 70 Z" fill="#2f9e6e" />
      <path d="M78 62 Q 110 44 132 56 Q 106 62 82 70 Z" fill="#2f9e6e" />
      <path d="M78 62 Q 60 34 38 30 Q 62 46 78 68 Z" fill="#37b57d" />
      <path d="M78 62 Q 96 34 118 30 Q 94 46 78 68 Z" fill="#37b57d" />
      <path d="M78 62 Q 78 30 92 18 Q 86 42 80 66 Z" fill="#2f9e6e" />
      <circle cx="78" cy="66" r="4" fill="#a1865a" />
      <circle cx="84" cy="70" r="3" fill="#a1865a" />
    </svg>
  );
}

function Fish({ size = 46, flip, className, style }: { size?: number; flip?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={(size * 30) / 60}
      viewBox="0 0 60 30"
      className={className}
      style={{ ...style, transform: `${style?.transform ?? ""} scaleX(${flip ? -1 : 1})` }}
      aria-hidden
    >
      <path d="M6 15 Q 20 2 38 8 Q 50 12 54 15 Q 50 18 38 22 Q 20 28 6 15 Z" fill="rgba(15,118,136,0.55)" />
      <path d="M10 15 L 2 8 L 2 22 Z" fill="rgba(15,118,136,0.55)" />
      <circle cx="44" cy="13" r="2.2" fill="#042f2e" />
    </svg>
  );
}

function Seaweed({ height = 120, className, style }: { height?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={height / 3} height={height} viewBox="0 0 40 120" className={className} style={style} aria-hidden>
      <path d="M12 118 Q 4 90 14 66 Q 22 44 12 20" fill="none" stroke="rgba(6,95,70,0.6)" strokeWidth="7" strokeLinecap="round" />
      <path d="M28 118 Q 36 96 26 74 Q 20 58 28 40" fill="none" stroke="rgba(6,95,70,0.5)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function Pine({ height = 150, className, style }: { height?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={height / 1.6} height={height} viewBox="0 0 80 128" className={className} style={style} aria-hidden>
      <rect x="36" y="100" width="8" height="26" fill="#5c4633" />
      <path d="M40 4 L 66 44 L 52 44 L 74 78 L 6 78 L 28 44 L 14 44 Z" fill="rgba(20,83,45,0.75)" />
      <path d="M40 4 L 52 44 L 28 44 Z" fill="rgba(22,101,52,0.8)" />
    </svg>
  );
}

function Mushroom({ size = 34, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} style={style} aria-hidden>
      <rect x="16" y="20" width="8" height="16" rx="3" fill="#e7e5e4" />
      <path d="M6 22 Q 8 8 20 8 Q 32 8 34 22 Q 20 26 6 22 Z" fill="#dc2626" opacity="0.85" />
      <circle cx="14" cy="16" r="2.4" fill="#f5f5f4" opacity="0.9" />
      <circle cx="24" cy="14" r="1.9" fill="#f5f5f4" opacity="0.9" />
    </svg>
  );
}

function Mountains({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="100%" height="240" viewBox="0 0 1200 240" preserveAspectRatio="none" className={className} style={style} aria-hidden>
      <path d="M0 240 L 180 90 L 300 190 L 470 40 L 640 200 L 800 110 L 960 210 L 1100 130 L 1200 240 Z" fill="rgba(15,23,42,0.75)" />
      <path d="M470 40 L 520 90 L 500 96 L 470 76 L 440 96 L 420 90 Z" fill="rgba(226,232,240,0.85)" />
      <path d="M180 90 L 216 126 L 196 130 L 180 116 Z" fill="rgba(226,232,240,0.7)" />
      <path d="M800 110 L 834 142 L 814 146 L 800 132 Z" fill="rgba(226,232,240,0.7)" />
    </svg>
  );
}

function Penguin({ size = 56, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} style={style} aria-hidden>
      <ellipse cx="30" cy="36" rx="18" ry="21" fill="#1e293b" />
      <ellipse cx="30" cy="40" rx="12" ry="14" fill="#f1f5f9" />
      <circle cx="24" cy="22" r="2.6" fill="#fff" />
      <circle cx="36" cy="22" r="2.6" fill="#fff" />
      <circle cx="24.6" cy="22.4" r="1.2" fill="#0f172a" />
      <circle cx="36.6" cy="22.4" r="1.2" fill="#0f172a" />
      <path d="M26 27 L 34 27 L 30 33 Z" fill="#f59e0b" />
      <ellipse cx="14" cy="38" rx="5" ry="10" fill="#1e293b" transform="rotate(18 14 38)" />
      <ellipse cx="46" cy="38" rx="5" ry="10" fill="#1e293b" transform="rotate(-18 46 38)" />
      <ellipse cx="22" cy="57" rx="8" ry="3.5" fill="#f59e0b" />
      <ellipse cx="38" cy="57" rx="8" ry="3.5" fill="#f59e0b" />
    </svg>
  );
}

function Volcano({ width = 340, className, style }: { width?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={width} height={width / 2} viewBox="0 0 340 170" className={className} style={style} aria-hidden>
      <path d="M20 170 L 130 34 L 210 34 L 320 170 Z" fill="rgba(23,10,8,0.9)" />
      <path d="M130 34 L 210 34 L 218 44 Q 170 58 122 44 Z" fill="rgba(249,115,22,0.55)" />
      <ellipse cx="170" cy="46" rx="40" ry="8" fill="rgba(251,146,60,0.8)" />
      <circle cx="150" cy="28" r="9" fill="rgba(120,113,108,0.5)" />
      <circle cx="182" cy="20" r="12" fill="rgba(120,113,108,0.4)" />
      <circle cx="208" cy="14" r="7" fill="rgba(120,113,108,0.3)" />
    </svg>
  );
}

function BlossomBranch({ size = 190, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  const blossom = (x: number, y: number, r: number) => (
    <g key={`${x}-${y}`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={x + r * 0.62 * Math.cos((a * Math.PI) / 180)}
          cy={y + r * 0.62 * Math.sin((a * Math.PI) / 180)}
          r={r * 0.42}
          fill="rgba(244,114,182,0.75)"
        />
      ))}
      <circle cx={x} cy={y} r={r * 0.28} fill="rgba(251,191,36,0.9)" />
    </g>
  );
  return (
    <svg width={size} height={size / 1.6} viewBox="0 0 190 120" className={className} style={style} aria-hidden>
      <path d="M4 108 Q 60 84 96 58 Q 130 34 178 22" fill="none" stroke="rgba(120,53,15,0.6)" strokeWidth="5" strokeLinecap="round" />
      <path d="M62 78 Q 84 84 96 100" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="3.5" strokeLinecap="round" />
      {blossom(24, 96, 13)}
      {blossom(60, 76, 15)}
      {blossom(96, 54, 14)}
      {blossom(134, 34, 15)}
      {blossom(172, 22, 12)}
      {blossom(84, 96, 10)}
    </svg>
  );
}

function ShootingStar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="90" height="26" viewBox="0 0 90 26" className={className} style={style} aria-hidden>
      <line x1="86" y1="4" x2="26" y2="20" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" />
      <line x1="80" y1="3" x2="40" y2="15" stroke="rgba(255,255,255,0.35)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="24" cy="21" r="3" fill="#fff" />
    </svg>
  );
}

function CloudBlob({ width = 130, opacity = 0.5, className, style }: { width?: number; opacity?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={width} height={width / 2.6} viewBox="0 0 130 50" className={className} style={{ ...style, opacity }} aria-hidden>
      <ellipse cx="35" cy="34" rx="28" ry="14" fill="#fff" />
      <ellipse cx="66" cy="26" rx="24" ry="16" fill="#fff" />
      <ellipse cx="96" cy="35" rx="22" ry="11" fill="#fff" />
    </svg>
  );
}

function Sun({ size = 120, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="scene-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(253,224,71,0.95)" />
          <stop offset="70%" stopColor="rgba(251,146,60,0.75)" />
          <stop offset="100%" stopColor="rgba(251,146,60,0)" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#scene-sun)" />
      <circle cx="60" cy="60" r="24" fill="rgba(254,240,138,0.95)" />
    </svg>
  );
}

function Moon({ size = 90, className, style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <path d="M62 6 A 46 46 0 1 0 62 94 A 36 36 0 1 1 62 6 Z" fill="rgba(226,232,240,0.9)" />
      <circle cx="30" cy="38" r="5" fill="rgba(148,163,184,0.5)" />
      <circle cx="24" cy="62" r="7" fill="rgba(148,163,184,0.4)" />
    </svg>
  );
}

/* ---------------------------------- scenes --------------------------------- */

function at(children: ReactNode, cls: string, key: string) {
  return (
    <div key={key} className={`absolute ${cls}`}>
      {children}
    </div>
  );
}

function scene(id: string, avatar: string): ReactNode {
  switch (id) {
    case "bg-space":
      return [
        at(<Planet size={150} from="#8b5cf6" to="#4c1d95" ring="#c4b5fd" uid="sp1" className="float-slow" />, "right-[4%] top-[6%] opacity-70 hidden sm:block", "p1"),
        at(<Planet size={72} from="#fb923c" to="#9a3412" uid="sp2" />, "left-[3%] top-[16%] opacity-60", "p2"),
        at(<AstroMascot emoji={avatar} pose="wave" size={86} className="float-slow" style={{ animationDelay: "0.8s" }} />, "right-[16%] top-[30%] opacity-80", "a1"),
        at(
          <div className="relative">
            <Planet size={110} from="#22d3ee" to="#155e75" uid="sp3" />
            <div className="absolute -top-14 left-1/2 -translate-x-1/2">
              <AstroMascot emoji={avatar} pose="flag" size={72} />
            </div>
          </div>,
          "left-[5%] bottom-[6%] opacity-70 hidden md:block",
          "a2"
        ),
        at(<ShootingStar className="float-slow" style={{ animationDelay: "1.6s" }} />, "left-[30%] top-[10%] opacity-60", "s1"),
      ];
    case "bg-stargaze":
      return [
        at(<Moon size={96} className="float-slow" />, "right-[6%] top-[7%] opacity-80", "m1"),
        at(<Planet size={86} from="#a5b4fc" to="#3730a3" uid="sg1" />, "left-[4%] bottom-[10%] opacity-60 hidden sm:block", "p1"),
        at(<AstroMascot emoji={avatar} pose="wave" size={80} className="float-slow" />, "left-[24%] top-[24%] opacity-75", "a1"),
        at(<ShootingStar className="float-slow" style={{ animationDelay: "1.2s" }} />, "right-[28%] top-[18%] opacity-60", "s1"),
      ];
    case "bg-nebula":
      return [
        at(<Planet size={130} from="#c084fc" to="#581c87" ring="#f0abfc" uid="nb1" className="float-slow" />, "left-[4%] top-[8%] opacity-65 hidden sm:block", "p1"),
        at(<Planet size={64} from="#f472b6" to="#831843" uid="nb2" />, "right-[10%] bottom-[12%] opacity-60", "p2"),
        at(<AstroMascot emoji={avatar} pose="float" size={90} className="float-slow" style={{ animationDelay: "0.6s" }} />, "right-[22%] top-[34%] opacity-80", "a1"),
        at(<ShootingStar className="float-slow" style={{ animationDelay: "2s" }} />, "left-[34%] top-[14%] opacity-55", "s1"),
      ];
    case "bg-ocean":
      return [
        at(<Fish size={52} flip className="float-slow" />, "left-[8%] top-[24%] opacity-60", "f1"),
        at(<Fish size={38} className="float-slow" style={{ animationDelay: "1s" }} />, "right-[12%] top-[16%] opacity-50", "f2"),
        at(<Fish size={44} flip className="float-slow" style={{ animationDelay: "1.8s" }} />, "right-[30%] top-[38%] opacity-45", "f3"),
        at(<Seaweed height={130} className="float-slow" />, "left-[2%] bottom-0 opacity-60", "w1"),
        at(<Seaweed height={100} className="float-slow" style={{ animationDelay: "1s" }} />, "right-[3%] bottom-0 opacity-55", "w2"),
      ];
    case "bg-beach":
      return [
        at(<Sun size={130} className="float-slow" />, "right-[5%] top-[5%] opacity-70", "sun"),
        at(<CloudBlob width={120} className="float-slow" style={{ animationDelay: "0.9s" }} />, "left-[12%] top-[10%]", "c1"),
        at(<CloudBlob width={90} className="float-slow" style={{ animationDelay: "1.7s" }} />, "left-[38%] top-[5%]", "c2"),
        at(<Palm size={160} />, "left-[2%] bottom-0 opacity-80 hidden sm:block", "palm"),
        at(
          <div className="flex items-end gap-3">
            <Sandcastle size={110} />
            <Crab size={56} className="float-slow" />
          </div>,
          "right-[4%] bottom-[5%] opacity-75 hidden md:block",
          "castle"
        ),
      ];
    case "bg-forest":
      return [
        at(<Pine height={170} className="float-slow" />, "left-[2%] bottom-0 opacity-70", "t1"),
        at(<Pine height={120} className="float-slow" style={{ animationDelay: "0.8s" }} />, "left-[10%] bottom-0 opacity-55 hidden md:block", "t2"),
        at(<Pine height={150} className="float-slow" style={{ animationDelay: "1.4s" }} />, "right-[3%] bottom-0 opacity-65", "t3"),
        at(<Mushroom size={32} className="float-slow" style={{ animationDelay: "0.5s" }} />, "left-[16%] bottom-[6%] opacity-70", "m1"),
        at(<Mushroom size={26} className="float-slow" style={{ animationDelay: "1.2s" }} />, "right-[14%] bottom-[8%] opacity-60", "m2"),
      ];
    case "bg-aurora":
      return [
        at(<Mountains />, "bottom-0 left-0 right-0", "mt"),
        at(<Penguin size={58} className="float-slow" />, "right-[8%] bottom-[7%] opacity-70 hidden md:block", "pg"),
        at(<Moon size={70} className="float-slow" style={{ animationDelay: "1s" }} />, "left-[8%] top-[8%] opacity-50", "m1"),
      ];
    case "bg-sakura":
      return [
        at(<BlossomBranch size={200} className="float-slow" />, "left-0 top-[4%] opacity-80", "b1"),
        at(<BlossomBranch size={150} className="float-slow" style={{ animationDelay: "1.1s" }} />, "right-0 top-[10%] opacity-60 hidden sm:block", "b2"),
        at(<span className="float-slow text-lg opacity-60">🌸</span>, "left-[30%] top-[26%]", "p1"),
        at(<span className="float-slow text-base opacity-50" style={{ animationDelay: "0.8s" }}>🌸</span>, "right-[26%] top-[36%]", "p2"),
        at(<span className="float-slow text-sm opacity-40" style={{ animationDelay: "1.5s" }}>🌸</span>, "left-[52%] top-[14%]", "p3"),
      ];
    case "bg-volcano":
      return [
        at(<Volcano width={360} />, "left-[2%] bottom-0 opacity-80", "v1"),
        at(<span className="float-slow text-sm opacity-60">🔥</span>, "left-[14%] top-[30%]", "e1"),
        at(<span className="float-slow text-xs opacity-50" style={{ animationDelay: "0.9s" }}>🔥</span>, "left-[24%] top-[20%]", "e2"),
      ];
    default:
      return null;
  }
}

export default function ThemeScene({ backgroundId, avatar = "🦉" }: { backgroundId: string; avatar?: string }) {
  const nodes = scene(backgroundId, avatar);
  if (!nodes) return null;
  return <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">{nodes}</div>;
}
