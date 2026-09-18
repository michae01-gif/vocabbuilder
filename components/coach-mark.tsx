"use client";

import type { ReactNode } from "react";
import Mascot from "./mascot";

export default function CoachMark({
  avatar,
  label = "Your guide",
  cta = "Continue",
  onContinue,
  children,
}: {
  avatar: string;
  label?: string;
  cta?: string;
  onContinue: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="pop w-full max-w-lg rounded-2xl border-2 border-amber-200/70 bg-[#141008] p-5 shadow-2xl shadow-amber-200/20">
        <div className="flex items-start gap-4">
          <div className="mascot-bob shrink-0">
            <Mascot emoji={avatar} size={72} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/80">{label}</p>
            <div className="mt-1 text-sm leading-relaxed text-zinc-200">{children}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="mt-4 w-full rounded-xl bg-amber-200 py-2.5 font-semibold text-black transition-colors hover:bg-amber-100"
        >
          {cta} →
        </button>
      </div>
    </div>
  );
}
