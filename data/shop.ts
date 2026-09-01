import type { CSSProperties } from "react";

export type ShopCategory = "avatar" | "banner" | "frame" | "background" | "nameStyle";

export type ShopItem = {
  id: string;
  category: ShopCategory;
  name: string;
  cost: number;
  emoji?: string;
  gradient?: string;
  ring?: string;
  glow?: string;
  nameGradient?: string;
  colors?: string;
  pageBg?: string;
};

export const CATEGORY_META: Record<ShopCategory, { label: string; icon: string }> = {
  avatar: { label: "Mascots", icon: "🐾" },
  banner: { label: "Banners", icon: "🖼️" },
  frame: { label: "Banner frames", icon: "💫" },
  background: { label: "Backgrounds", icon: "🌌" },
  nameStyle: { label: "Name styles", icon: "🌈" },
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: "avatar-owl", category: "avatar", name: "Scholar Owl", cost: 0, emoji: "🦉" },
  { id: "avatar-cat", category: "avatar", name: "Curious Cat", cost: 225, emoji: "😺" },
  { id: "avatar-fox", category: "avatar", name: "Cunning Fox", cost: 300, emoji: "🦊" },
  { id: "avatar-panda", category: "avatar", name: "Zen Panda", cost: 350, emoji: "🐼" },
  { id: "avatar-wolf", category: "avatar", name: "Lone Wolf", cost: 450, emoji: "🐺" },
  { id: "avatar-tiger", category: "avatar", name: "Tiger Reader", cost: 525, emoji: "🐯" },
  { id: "avatar-lion", category: "avatar", name: "Word Lion", cost: 625, emoji: "🦁" },
  { id: "avatar-octopus", category: "avatar", name: "Ink Octopus", cost: 700, emoji: "🐙" },
  { id: "avatar-wizard", category: "avatar", name: "Lexicon Wizard", cost: 750, emoji: "🧙" },
  { id: "avatar-robot", category: "avatar", name: "Vocab Droid", cost: 875, emoji: "🤖" },
  { id: "avatar-dragon", category: "avatar", name: "Etymology Dragon", cost: 1000, emoji: "🐉" },
  { id: "avatar-ghost", category: "avatar", name: "Silent Scholar", cost: 950, emoji: "👻" },
  { id: "avatar-unicorn", category: "avatar", name: "Rare Unicorn", cost: 1125, emoji: "🦄" },
  { id: "avatar-eagle", category: "avatar", name: "Prose Eagle", cost: 1250, emoji: "🦅" },
  { id: "avatar-alien", category: "avatar", name: "Alien Linguist", cost: 1375, emoji: "👽" },
  { id: "avatar-crown", category: "avatar", name: "Erudite Sovereign", cost: 1500, emoji: "👑" },

  { id: "banner-amber", category: "banner", name: "Amber Dawn", cost: 0, colors: "amber · sunrise glow",
    gradient: "radial-gradient(180px 100px at 30% 40%, rgba(253,230,138,0.35), transparent 70%), radial-gradient(240px 120px at 70% 60%, rgba(251,146,60,0.25), transparent 70%), linear-gradient(135deg,#fbbf24 0%,#f59e0b 35%,#ea580c 70%,#c2410c 100%)" },
  { id: "banner-emerald", category: "banner", name: "Emerald Grove", cost: 375, colors: "emerald · deep forest",
    gradient: "radial-gradient(160px 90px at 25% 35%, rgba(110,231,183,0.3), transparent 70%), radial-gradient(200px 110px at 75% 65%, rgba(6,95,70,0.3), transparent 70%), linear-gradient(135deg,#6ee7b7 0%,#34d399 30%,#10b981 60%,#047857 100%)" },
  { id: "banner-ocean", category: "banner", name: "Deep Ocean", cost: 500, colors: "cerulean · abyss blue",
    gradient: "radial-gradient(200px 100px at 40% 30%, rgba(56,189,248,0.3), transparent 70%), radial-gradient(180px 100px at 70% 70%, rgba(30,58,138,0.35), transparent 70%), linear-gradient(135deg,#7dd3fc 0%,#38bdf8 25%,#0284c7 55%,#1e3a8a 100%)" },
  { id: "banner-violet", category: "banner", name: "Violet Dusk", cost: 500, colors: "lavender · deep magenta",
    gradient: "radial-gradient(180px 100px at 30% 45%, rgba(196,181,253,0.3), transparent 70%), radial-gradient(200px 110px at 75% 55%, rgba(192,132,252,0.25), transparent 70%), linear-gradient(135deg,#c4b5fd 0%,#a78bfa 30%,#9333ea 60%,#7e22ce 100%)" },
  { id: "banner-sunset", category: "banner", name: "Radiant Sunset", cost: 625, colors: "golden hour · crimson horizon",
    gradient: "radial-gradient(200px 110px at 50% 40%, rgba(253,224,138,0.35), transparent 70%), radial-gradient(180px 100px at 30% 70%, rgba(251,146,60,0.2), transparent 70%), linear-gradient(135deg,#fdba74 0%,#fb923c 25%,#dc2626 55%,#9f1239 100%)" },
  { id: "banner-midnight", category: "banner", name: "Midnight Study", cost: 750, colors: "deep indigo · starlit navy",
    gradient: "radial-gradient(1.4px 1.4px at 15% 25%, rgba(255,255,255,0.7), transparent), radial-gradient(1.2px 1.2px at 42% 15%, rgba(255,255,255,0.55), transparent), radial-gradient(1.6px 1.6px at 68% 35%, rgba(255,255,255,0.6), transparent), radial-gradient(1.3px 1.3px at 88% 20%, rgba(255,255,255,0.5), transparent), radial-gradient(200px 110px at 30% 60%, rgba(99,102,241,0.2), transparent 70%), linear-gradient(135deg,#818cf8 0%,#6366f1 30%,#4338ca 60%,#1e1b4b 100%)" },
  { id: "banner-rose", category: "banner", name: "Blooming Rose", cost: 625, colors: "blush · deep rose",
    gradient: "radial-gradient(160px 90px at 35% 40%, rgba(254,205,211,0.35), transparent 70%), radial-gradient(180px 100px at 70% 60%, rgba(244,63,94,0.2), transparent 70%), linear-gradient(135deg,#fda4af 0%,#fb7185 30%,#e11d48 60%,#9f1239 100%)" },
  { id: "banner-gold", category: "banner", name: "Golden Trophy", cost: 875, colors: "molten gold · deep bronze",
    gradient: "radial-gradient(180px 100px at 40% 35%, rgba(254,249,195,0.4), transparent 70%), radial-gradient(200px 110px at 65% 65%, rgba(217,119,6,0.25), transparent 70%), linear-gradient(135deg,#fef3c7 0%,#fbbf24 25%,#d97706 55%,#92400e 100%)" },
  { id: "banner-aurora", category: "banner", name: "Aurora", cost: 1000, colors: "cyan · violet · rose",
    gradient: "radial-gradient(220px 110px at 20% 50%, rgba(34,211,238,0.3), transparent 70%), radial-gradient(200px 100px at 55% 40%, rgba(167,139,250,0.25), transparent 70%), radial-gradient(180px 100px at 80% 55%, rgba(244,114,182,0.2), transparent 70%), linear-gradient(135deg,#67e8f9 0%,#22d3ee 25%,#a78bfa 50%,#d946ef 75%,#f472b6 100%)" },
  { id: "banner-mint", category: "banner", name: "Mint Fresh", cost: 750, colors: "icy mint · cerulean",
    gradient: "radial-gradient(160px 90px at 30% 40%, rgba(167,243,208,0.35), transparent 70%), radial-gradient(180px 100px at 70% 60%, rgba(59,130,246,0.2), transparent 70%), linear-gradient(135deg,#a7f3d0 0%,#6ee7b7 30%,#2dd4bf 55%,#0891b2 100%)" },
  { id: "banner-peach", category: "banner", name: "Peach Sorbet", cost: 750, colors: "warm peach · coral pink",
    gradient: "radial-gradient(170px 95px at 35% 45%, rgba(254,215,170,0.35), transparent 70%), radial-gradient(190px 105px at 65% 55%, rgba(251,146,130,0.25), transparent 70%), linear-gradient(135deg,#fed7aa 0%,#fdba74 30%,#fb923c 55%,#f43f5e 100%)" },
  { id: "banner-steel", category: "banner", name: "Royal Steel", cost: 875, colors: "polished chrome · gunmetal",
    gradient: "radial-gradient(180px 100px at 35% 35%, rgba(226,232,240,0.3), transparent 70%), radial-gradient(200px 110px at 70% 65%, rgba(51,65,85,0.3), transparent 70%), linear-gradient(135deg,#e2e8f0 0%,#94a3b8 30%,#64748b 60%,#1e293b 100%)" },
  { id: "banner-candy", category: "banner", name: "Candy Pop", cost: 1000, colors: "bubblegum · lemon sparkle",
    gradient: "radial-gradient(160px 90px at 30% 40%, rgba(249,168,212,0.35), transparent 70%), radial-gradient(180px 100px at 70% 60%, rgba(250,204,21,0.25), transparent 70%), linear-gradient(135deg,#f9a8d4 0%,#f472b6 30%,#ec4899 55%,#facc15 100%)" },
  { id: "banner-forest", category: "banner", name: "Forest Dawn", cost: 1125, colors: "spring lime · deep emerald",
    gradient: "radial-gradient(180px 100px at 25% 40%, rgba(163,230,53,0.3), transparent 70%), radial-gradient(200px 110px at 75% 60%, rgba(5,150,105,0.3), transparent 70%), linear-gradient(135deg,#bef264 0%,#a3e635 30%,#65a30d 60%,#047857 100%)" },

  { id: "banner-lunar-park", category: "banner", name: "Lunar Park", cost: 2500, colors: "full moon · starlight carnival",
    gradient: "radial-gradient(1.6px 1.6px at 8% 24%, rgba(255,255,255,.92), transparent), radial-gradient(1.3px 1.3px at 19% 58%, rgba(255,255,255,.72), transparent), radial-gradient(1.8px 1.8px at 33% 12%, rgba(255,255,255,.88), transparent), radial-gradient(1.1px 1.1px at 48% 42%, rgba(255,255,255,.58), transparent), radial-gradient(1.5px 1.5px at 62% 18%, rgba(255,255,255,.82), transparent), radial-gradient(1.3px 1.3px at 78% 52%, rgba(255,255,255,.68), transparent), radial-gradient(1.7px 1.7px at 91% 15%, rgba(255,255,255,.82), transparent), radial-gradient(1.2px 1.2px at 25% 80%, rgba(255,255,255,.5), transparent), radial-gradient(1.4px 1.4px at 55% 72%, rgba(255,255,255,.45), transparent), radial-gradient(120px 72px at 78% 24%, rgba(253,230,138,.98), transparent 68%), radial-gradient(190px 110px at 78% 24%, rgba(253,224,71,.42), transparent 68%), radial-gradient(260px 140px at 14% 110%, rgba(244,114,182,.45), transparent 68%), radial-gradient(280px 150px at 82% 114%, rgba(139,92,246,.48), transparent 68%), linear-gradient(180deg,#080a24 0%,#141048 48%,#2d1a6e 100%)" },
  { id: "banner-sunset-shore", category: "banner", name: "Sunset Shore", cost: 2500, colors: "sinking sun · ocean horizon",
    gradient: "radial-gradient(140px 80px at 50% 62%, rgba(254,240,158,.98), transparent 68%), radial-gradient(240px 130px at 50% 64%, rgba(251,146,60,.58), transparent 72%), radial-gradient(80px 28px at 35% 82%, rgba(255,255,255,.3), transparent 70%), radial-gradient(100px 32px at 62% 88%, rgba(255,255,255,.24), transparent 70%), radial-gradient(60px 20px at 48% 78%, rgba(255,255,255,.18), transparent 70%), linear-gradient(180deg,#1e2a5e 0%,#7a4a6e 30%,#d4847a 52%,#f4a261 62%,#1a6a82 63%,#0c3848 100%)" },
  { id: "banner-neon-city", category: "banner", name: "Neon Skyline", cost: 2500, colors: "neon glow · midnight city",
    gradient: "radial-gradient(1.4px 1.4px at 12% 15%, rgba(255,255,255,.88), transparent), radial-gradient(1.1px 1.1px at 28% 8%, rgba(255,255,255,.72), transparent), radial-gradient(1.5px 1.5px at 52% 13%, rgba(255,255,255,.78), transparent), radial-gradient(1.2px 1.2px at 72% 6%, rgba(255,255,255,.62), transparent), radial-gradient(1.6px 1.6px at 88% 18%, rgba(255,255,255,.82), transparent), radial-gradient(1.3px 1.3px at 40% 30%, rgba(255,255,255,.5), transparent), radial-gradient(300px 150px at 14% 114%, rgba(34,211,238,.52), transparent 68%), radial-gradient(300px 150px at 86% 114%, rgba(244,114,182,.58), transparent 68%), radial-gradient(190px 110px at 50% 118%, rgba(139,92,246,.48), transparent 68%), linear-gradient(180deg,#060610 0%,#0a0a1e 54%,#12122e 100%)" },
  { id: "banner-aurora-peaks", category: "banner", name: "Aurora Peaks", cost: 2500, colors: "aurora · moonlit snow",
    gradient: "radial-gradient(1.4px 1.4px at 10% 20%, rgba(255,255,255,.82), transparent), radial-gradient(1.2px 1.2px at 28% 32%, rgba(255,255,255,.68), transparent), radial-gradient(1.5px 1.5px at 48% 10%, rgba(255,255,255,.78), transparent), radial-gradient(1.1px 1.1px at 68% 24%, rgba(255,255,255,.62), transparent), radial-gradient(1.6px 1.6px at 88% 14%, rgba(255,255,255,.82), transparent), radial-gradient(1.3px 1.3px at 35% 60%, rgba(255,255,255,.42), transparent), radial-gradient(320px 140px at 20% -28%, rgba(52,211,153,.52), transparent 60%), radial-gradient(280px 130px at 52% -32%, rgba(56,189,248,.42), transparent 60%), radial-gradient(260px 130px at 86% -22%, rgba(244,114,182,.35), transparent 60%), linear-gradient(180deg,#060e22 0%,#0a1a36 58%,#0e1e38 65%,#c8d4e0 66%,#a8b8c8 100%)" },
  { id: "banner-golden-reef", category: "banner", name: "Golden Reef", cost: 2500, colors: "sunken gold · coral glow",
    gradient: "radial-gradient(2px 2px at 14% 22%, rgba(255,255,255,.42), transparent), radial-gradient(1.5px 1.5px at 30% 12%, rgba(255,255,255,.35), transparent), radial-gradient(2.4px 2.4px at 54% 28%, rgba(255,255,255,.4), transparent), radial-gradient(1.7px 1.7px at 74% 10%, rgba(255,255,255,.32), transparent), radial-gradient(2.2px 2.2px at 90% 32%, rgba(255,255,255,.38), transparent), radial-gradient(1.8px 1.8px at 42% 60%, rgba(255,255,255,.25), transparent), radial-gradient(100px 60px at 20% 76%, rgba(253,224,71,.62), transparent 70%), radial-gradient(130px 78px at 60% 86%, rgba(251,191,36,.52), transparent 70%), radial-gradient(90px 54px at 84% 72%, rgba(253,186,116,.48), transparent 70%), radial-gradient(650px 220px at 50% -32%, rgba(14,116,144,.52), transparent 68%), linear-gradient(180deg,#051e28 0%,#083e50 50%,#0c303c 100%)" },

  { id: "frame-classic", category: "frame", name: "Classic", cost: 0, ring: "3px solid rgba(255,255,255,0.2)" },
  { id: "frame-amber", category: "frame", name: "Amber Ring", cost: 250, ring: "3px solid #f59e0b", glow: "0 0 14px rgba(245,158,11,0.5)" },
  { id: "frame-emerald", category: "frame", name: "Emerald Ring", cost: 375, ring: "3px solid #34d399", glow: "0 0 14px rgba(52,211,153,0.5)" },
  { id: "frame-sky", category: "frame", name: "Sky Ring", cost: 375, ring: "3px solid #38bdf8", glow: "0 0 14px rgba(56,189,248,0.5)" },
  { id: "frame-rose", category: "frame", name: "Rose Ring", cost: 375, ring: "3px solid #fb7185", glow: "0 0 14px rgba(251,113,133,0.5)" },
  { id: "frame-violet", category: "frame", name: "Violet Ring", cost: 500, ring: "3px solid #a78bfa", glow: "0 0 14px rgba(167,139,250,0.5)" },
  { id: "frame-gold", category: "frame", name: "Golden Aura", cost: 750, ring: "3px solid #fbbf24", glow: "0 0 22px rgba(251,191,36,0.8)" },
  { id: "frame-prism", category: "frame", name: "Prism Glow", cost: 1125, ring: "3px solid #f472b6", glow: "0 0 12px rgba(244,114,182,0.7), 0 0 26px rgba(250,204,21,0.6), 0 0 40px rgba(56,189,248,0.5)" },

  { id: "bg-forge", category: "background", name: "Forge Classic", cost: 0, colors: "amber embers · warm charcoal",
    pageBg: "radial-gradient(1400px 700px at 8% -12%, rgba(217,179,96,0.1), transparent 58%), radial-gradient(1200px 600px at 95% 2%, rgba(96,165,250,0.07), transparent 52%), radial-gradient(800px 400px at 50% 100%, rgba(217,179,96,0.04), transparent 50%), #0c0c11" },
  { id: "bg-space", category: "background", name: "Deep Space", cost: 625, colors: "planets · astronauts · stars",
    pageBg: "radial-gradient(1.6px 1.6px at 10% 18%, rgba(255,255,255,0.92), transparent), radial-gradient(1.4px 1.4px at 26% 62%, rgba(255,255,255,0.72), transparent), radial-gradient(2px 2px at 42% 10%, rgba(255,255,255,0.82), transparent), radial-gradient(1.3px 1.3px at 59% 36%, rgba(255,255,255,0.62), transparent), radial-gradient(1.7px 1.7px at 71% 69%, rgba(255,255,255,0.88), transparent), radial-gradient(1.4px 1.4px at 84% 20%, rgba(255,255,255,0.72), transparent), radial-gradient(2.2px 2.2px at 91% 53%, rgba(255,255,255,0.92), transparent), radial-gradient(1.5px 1.5px at 6% 76%, rgba(255,255,255,0.62), transparent), radial-gradient(1.8px 1.8px at 48% 85%, rgba(255,255,255,0.5), transparent), radial-gradient(1000px 550px at 78% -2%, rgba(124,58,237,0.18), transparent 58%), radial-gradient(900px 550px at 8% 102%, rgba(30,64,175,0.2), transparent 58%), #060612" },
  { id: "bg-stargaze", category: "background", name: "Starry Night", cost: 750, colors: "moon · astronaut · constellations",
    pageBg: "radial-gradient(1.5px 1.5px at 7% 12%, rgba(255,255,255,0.82), transparent), radial-gradient(1.2px 1.2px at 16% 46%, rgba(255,255,255,0.62), transparent), radial-gradient(1.8px 1.8px at 31% 74%, rgba(255,255,255,0.78), transparent), radial-gradient(1.3px 1.3px at 45% 23%, rgba(255,255,255,0.68), transparent), radial-gradient(2.1px 2.1px at 56% 56%, rgba(255,255,255,0.92), transparent), radial-gradient(1.4px 1.4px at 67% 10%, rgba(255,255,255,0.62), transparent), radial-gradient(1.6px 1.6px at 80% 42%, rgba(255,255,255,0.82), transparent), radial-gradient(1.3px 1.3px at 93% 76%, rgba(255,255,255,0.72), transparent), radial-gradient(1.2px 1.2px at 37% 89%, rgba(255,255,255,0.58), transparent), radial-gradient(1100px 650px at 18% -12%, rgba(99,102,241,0.17), transparent 58%), linear-gradient(180deg, #0a0c28 0%, #121842 58%, #1a1050 100%)" },
  { id: "bg-ocean", category: "background", name: "Under the Sea", cost: 750, colors: "fish · seaweed · bubbles",
    pageBg: "linear-gradient(rgba(3,10,16,0.38), rgba(3,10,16,0.48)), radial-gradient(3px 3px at 12% 28%, rgba(255,255,255,0.38), transparent), radial-gradient(2px 2px at 22% 60%, rgba(255,255,255,0.32), transparent), radial-gradient(4px 4px at 36% 16%, rgba(255,255,255,0.3), transparent), radial-gradient(2.5px 2.5px at 53% 72%, rgba(255,255,255,0.35), transparent), radial-gradient(3.5px 3.5px at 66% 38%, rgba(255,255,255,0.32), transparent), radial-gradient(2px 2px at 78% 64%, rgba(255,255,255,0.3), transparent), radial-gradient(4.5px 4.5px at 89% 22%, rgba(255,255,255,0.35), transparent), radial-gradient(2.8px 2.8px at 45% 45%, rgba(255,255,255,0.22), transparent), radial-gradient(1000px 550px at 48% -12%, rgba(14,116,144,0.38), transparent 58%), linear-gradient(180deg, #051e2a 0%, #083e50 52%, #0c2e3a 100%)" },
  { id: "bg-beach", category: "background", name: "Sunset Beach", cost: 875, colors: "sandcastle · crab · palm trees",
    pageBg: "linear-gradient(rgba(6,8,18,0.44), rgba(6,8,18,0.52)), radial-gradient(560px 280px at 76% 14%, rgba(255,200,120,0.38), transparent 62%), radial-gradient(400px 200px at 25% 30%, rgba(251,146,60,0.12), transparent 60%), linear-gradient(180deg, #283260 0%, #a45a72 42%, #e09070 68%, #d4a878 100%)" },
  { id: "bg-forest", category: "background", name: "Enchanted Forest", cost: 875, colors: "pines · mushrooms · fireflies",
    pageBg: "radial-gradient(2.5px 2.5px at 13% 32%, rgba(253,224,71,0.82), transparent), radial-gradient(2px 2px at 24% 66%, rgba(253,224,71,0.62), transparent), radial-gradient(3px 3px at 40% 18%, rgba(253,224,71,0.72), transparent), radial-gradient(2px 2px at 55% 50%, rgba(253,224,71,0.68), transparent), radial-gradient(2.8px 2.8px at 69% 78%, rgba(253,224,71,0.78), transparent), radial-gradient(2px 2px at 82% 28%, rgba(253,224,71,0.62), transparent), radial-gradient(2.4px 2.4px at 91% 60%, rgba(253,224,71,0.72), transparent), radial-gradient(1.8px 1.8px at 33% 48%, rgba(253,224,71,0.45), transparent), radial-gradient(1100px 650px at 13% -2%, rgba(22,101,52,0.32), transparent 58%), linear-gradient(180deg, #081c12 0%, #0f2c1c 52%, #0a2216 100%)" },
  { id: "bg-aurora", category: "background", name: "Polar Aurora", cost: 1000, colors: "mountains · penguin · aurora",
    pageBg: "radial-gradient(1.5px 1.5px at 8% 16%, rgba(255,255,255,0.82), transparent), radial-gradient(1.3px 1.3px at 28% 42%, rgba(255,255,255,0.62), transparent), radial-gradient(1.7px 1.7px at 50% 10%, rgba(255,255,255,0.72), transparent), radial-gradient(1.4px 1.4px at 74% 34%, rgba(255,255,255,0.68), transparent), radial-gradient(1.2px 1.2px at 88% 68%, rgba(255,255,255,0.58), transparent), radial-gradient(1200px 520px at 22% -8%, rgba(52,211,153,0.24), transparent 52%), radial-gradient(1100px 460px at 62% -2%, rgba(56,189,248,0.18), transparent 52%), radial-gradient(1000px 550px at 88% 6%, rgba(244,114,182,0.16), transparent 58%), linear-gradient(180deg, #060e20 0%, #0a1a36 58%, #0e1e34 100%)" },
  { id: "bg-sakura", category: "background", name: "Sakura Dusk", cost: 1000, colors: "petals · blush",
    pageBg: "linear-gradient(rgba(8,6,14,0.48), rgba(8,6,14,0.55)), radial-gradient(2.2px 2.2px at 12% 24%, rgba(251,207,232,0.72), transparent), radial-gradient(1.8px 1.8px at 25% 56%, rgba(251,207,232,0.58), transparent), radial-gradient(2.5px 2.5px at 42% 12%, rgba(251,207,232,0.62), transparent), radial-gradient(2px 2px at 57% 44%, rgba(251,207,232,0.52), transparent), radial-gradient(2.3px 2.3px at 71% 72%, rgba(251,207,232,0.68), transparent), radial-gradient(1.9px 1.9px at 85% 30%, rgba(251,207,232,0.58), transparent), radial-gradient(2.4px 2.4px at 93% 64%, rgba(251,207,232,0.62), transparent), radial-gradient(1.6px 1.6px at 38% 80%, rgba(251,207,232,0.4), transparent), linear-gradient(180deg, #382848 0%, #7a4e6e 58%, #bc8098 100%)" },
  { id: "bg-volcano", category: "background", name: "Ember Wastes", cost: 1125, colors: "ember glow · ash",
    pageBg: "radial-gradient(1.8px 1.8px at 16% 38%, rgba(251,146,60,0.78), transparent), radial-gradient(1.5px 1.5px at 32% 70%, rgba(251,146,60,0.62), transparent), radial-gradient(2px 2px at 50% 26%, rgba(251,146,60,0.68), transparent), radial-gradient(1.6px 1.6px at 66% 56%, rgba(251,146,60,0.62), transparent), radial-gradient(1.9px 1.9px at 83% 20%, rgba(251,146,60,0.72), transparent), radial-gradient(1.4px 1.4px at 44% 50%, rgba(251,146,60,0.48), transparent), radial-gradient(1200px 600px at 48% 112%, rgba(234,88,12,0.3), transparent 58%), linear-gradient(180deg, #100806 0%, #1c0e09 52%, #26100a 100%)" },
  { id: "bg-nebula", category: "background", name: "Nebula", cost: 1250, colors: "cosmic clouds · magenta",
    pageBg: "radial-gradient(1.6px 1.6px at 10% 22%, rgba(255,255,255,0.88), transparent), radial-gradient(1.3px 1.3px at 28% 53%, rgba(255,255,255,0.68), transparent), radial-gradient(2px 2px at 46% 14%, rgba(255,255,255,0.78), transparent), radial-gradient(1.4px 1.4px at 62% 46%, rgba(255,255,255,0.62), transparent), radial-gradient(1.8px 1.8px at 77% 72%, rgba(255,255,255,0.72), transparent), radial-gradient(1.5px 1.5px at 90% 28%, rgba(255,255,255,0.68), transparent), radial-gradient(1.2px 1.2px at 50% 80%, rgba(255,255,255,0.45), transparent), radial-gradient(1100px 600px at 18% 8%, rgba(147,51,234,0.24), transparent 58%), radial-gradient(1000px 550px at 82% 28%, rgba(236,72,153,0.2), transparent 58%), radial-gradient(900px 650px at 52% 92%, rgba(59,130,246,0.17), transparent 58%), #080512" },

  { id: "name-classic", category: "nameStyle", name: "Classic", cost: 0 },
  { id: "name-amber", category: "nameStyle", name: "Amber Shine", cost: 250, nameGradient: "linear-gradient(90deg,#fde68a,#f59e0b)" },
  { id: "name-emerald", category: "nameStyle", name: "Emerald Shine", cost: 375, nameGradient: "linear-gradient(90deg,#6ee7b7,#10b981)" },
  { id: "name-sky", category: "nameStyle", name: "Sky Shine", cost: 375, nameGradient: "linear-gradient(90deg,#7dd3fc,#0ea5e9)" },
  { id: "name-rose", category: "nameStyle", name: "Rose Shine", cost: 375, nameGradient: "linear-gradient(90deg,#fda4af,#f43f5e)" },
  { id: "name-violet", category: "nameStyle", name: "Violet Shine", cost: 500, nameGradient: "linear-gradient(90deg,#c4b5fd,#8b5cf6)" },
  { id: "name-gold", category: "nameStyle", name: "Molten Gold", cost: 875, nameGradient: "linear-gradient(90deg,#fef08a,#f59e0b,#fef08a)" },
  { id: "name-rainbow", category: "nameStyle", name: "Rainbow", cost: 1250, nameGradient: "linear-gradient(90deg,#f43f5e,#f59e0b,#34d399,#38bdf8,#a78bfa)" },
];

export function shopItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export function bannerCss(bannerId: string): string {
  return shopItemById(bannerId)?.gradient ?? "linear-gradient(135deg,#f59e0b 0%,#f97316 100%)";
}

export function pageBackground(backgroundId: string): string {
  return (
    shopItemById(backgroundId)?.pageBg ??
    "radial-gradient(1200px 600px at 10% -10%, rgba(217,179,96,0.08), transparent 60%), radial-gradient(1000px 500px at 100% 0%, rgba(96,165,250,0.06), transparent 55%), #0d0d12"
  );
}

export function frameStyle(frameId: string): CSSProperties {
  const item = shopItemById(frameId);
  if (!item) return { border: "3px solid rgba(255,255,255,0.2)" };
  const style: CSSProperties = {};
  if (item.ring) style.border = item.ring as never;
  if (item.glow) style.boxShadow = item.glow;
  return style;
}

export function nameStyle(nameStyleId: string): CSSProperties {
  const item = shopItemById(nameStyleId);
  if (!item?.nameGradient) return {};
  return {
    backgroundImage: item.nameGradient,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
}
