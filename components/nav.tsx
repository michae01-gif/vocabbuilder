"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/session", label: "Learn" },
  { href: "/read", label: "Read" },
  { href: "/review", label: "Review", badge: true },
  { href: "/garden", label: "Garden", treeBadge: true },
  { href: "/leaderboard", label: "Ranks" },
  { href: "/stats", label: "Stats" },
  { href: "/rewards", label: "Rewards" },
];

export default function Nav({ dueCount = 0, coins = 0, treeRewards = 0 }: { dueCount?: number; coins?: number; treeRewards?: number }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0d0d12]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center gap-1 px-3 py-2.5 sm:px-4 sm:py-3">
        <Link href="/" className="mr-1.5 flex items-center gap-1.5 sm:mr-2 sm:gap-2">
          <span className="text-lg">🌳</span>
          <span className="hidden font-[var(--font-lora)] text-lg font-semibold tracking-tight sm:inline">
            WordForge
          </span>
        </Link>
        <Link
          href="/coin-shop"
          className="mr-1 flex items-center gap-1 rounded-full border border-amber-200/25 bg-amber-200/[0.08] px-2 py-1 transition-all hover:border-amber-200/50 hover:bg-amber-200/15 sm:mr-2 sm:px-2.5"
        >
          <span className="text-xs">🪙</span>
          <span className="text-xs font-semibold text-amber-200">{coins}</span>
        </Link>
        <div className="no-scrollbar ml-auto flex min-w-0 flex-1 items-center justify-end gap-0.5 overflow-x-auto whitespace-nowrap sm:flex-none">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative shrink-0 rounded-full px-2 py-1.5 text-[13px] transition-colors sm:px-2.5 ${
                  active
                    ? "bg-amber-200/15 text-amber-200"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                }`}
              >
                {l.label}
                {l.badge && dueCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-300 px-1 text-[10px] font-bold text-black">
                    {dueCount > 99 ? "99+" : dueCount}
                  </span>
                )}
                {"treeBadge" in l && l.treeBadge && treeRewards > 0 && (
                  <span className="claim-badge absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-200 bg-rose-500 text-[11px] font-black text-white shadow">
                    !
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
