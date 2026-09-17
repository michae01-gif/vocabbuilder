"use client";

import { useCallback, useEffect, useState } from "react";
import type { TutorialStepDef } from "@/lib/tutorial";

export default function TutorialGate({ def }: { def: TutorialStepDef }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [shake, setShake] = useState(false);

  const measure = useCallback(() => {
    const el = document.getElementById(def.targetId);
    if (el) setRect(el.getBoundingClientRect());
  }, [def.targetId]);

  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function nudge() {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  }

  const showSpotlight = rect !== null;
  const pad = 8;
  const bubbleBelow = rect ? rect.bottom + 132 < window.innerHeight : true;
  const bubbleTop = rect && bubbleBelow ? rect.bottom + 14 : undefined;
  const bubbleBottom = rect && !bubbleBelow ? window.innerHeight - rect.top + 14 : undefined;
  const bubbleLeft = rect
    ? Math.max(12, Math.min(rect.left + rect.width / 2 - 150, window.innerWidth - 312))
    : 12;

  return (
    <>
      {/* Backdrop: blocks everything except the highlighted target (which sits above via z-index) */}
      <div
        className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-[2px]"
        onClick={nudge}
        aria-hidden
      />

      {showSpotlight && rect && (
        <>
          {/* Pulsing spotlight ring around the target */}
          <div
            className="tutorial-ring pointer-events-none fixed z-[90] rounded-2xl"
            style={{
              left: rect.left - pad,
              top: rect.top - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
            }}
          />

          {/* Instruction bubble */}
          <div
            className={`pointer-events-none fixed z-[90] w-[300px] rounded-2xl border-2 border-amber-200 bg-[#141008] p-4 shadow-2xl shadow-amber-200/20 ${
              shake ? "tutorial-shake" : ""
            }`}
            style={{ top: bubbleTop, bottom: bubbleBottom, left: bubbleLeft }}
          >
            <div className="flex items-center gap-2">
              <span className="tutorial-bounce text-lg">👆</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/80">
                Step {def.step} of 4 · {def.title}
              </p>
            </div>
            <p className="mt-1.5 text-[13px] leading-snug text-zinc-200">{def.text}</p>
            <p className="mt-2 text-[10px] text-zinc-500">Tap the highlighted button to continue</p>
            <div
              className="absolute h-3 w-3 rotate-45 border-l-2 border-t-2 border-amber-200 bg-[#141008]"
              style={
                bubbleBelow
                  ? { top: -8, left: 140 }
                  : { bottom: -8, left: 140, transform: "rotate(225deg)" }
              }
            />
          </div>
        </>
      )}
    </>
  );
}
