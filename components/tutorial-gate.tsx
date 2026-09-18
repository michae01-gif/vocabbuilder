"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TutorialStepDef } from "@/lib/tutorial";

export default function TutorialGate({ def }: { def: TutorialStepDef }) {
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Track the target every frame so the ring always matches — entrance
  // animations, font loading, and layout shifts can't desync it.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = document.getElementById(def.targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        const last = rectRef.current;
        const moved =
          !last ||
          Math.abs(last.left - r.left) > 0.5 ||
          Math.abs(last.top - r.top) > 0.5 ||
          Math.abs(last.width - r.width) > 0.5 ||
          Math.abs(last.height - r.height) > 0.5;
        if (moved) {
          rectRef.current = r;
          setRect(r);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [def.targetId]);

  // Jump the target into view instantly, then freeze page scrolling so
  // nothing below the fold (e.g. the spin wheel) is ever reachable.
  useEffect(() => {
    const el = document.getElementById(def.targetId);
    if (el) el.scrollIntoView({ block: "center" });
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [def.targetId]);

  function nudge() {
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
  }

  if (!mounted) return null;

  const pad = 8;
  const bubbleBelow = rect ? rect.bottom + 132 < window.innerHeight : true;
  const bubbleTop = rect && bubbleBelow ? rect.bottom + 14 : undefined;
  const bubbleBottom = rect && !bubbleBelow ? window.innerHeight - rect.top + 14 : undefined;
  const bubbleLeft = rect
    ? Math.max(12, Math.min(rect.left + rect.width / 2 - 150, window.innerWidth - 312))
    : 12;

  // Portaled to <body>: no ancestor stacking contexts can ever trap the
  // overlay. Oversized 64px beyond every edge so no rendering gap (Safari
  // fullscreen repaint quirks, dvh rounding) can expose page content.
  return createPortal(
    <>
      {/* Backdrop: blocks everything except the highlighted target (which sits above via z-index) */}
      <div
        className="fixed z-[70] bg-black/80"
        style={{ inset: "-64px" }}
        onClick={nudge}
        aria-hidden
      />

      {rect && (
        <>
          {/* Pulsing spotlight ring around the target — coordinates update every frame */}
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
    </>,
    document.body
  );
}
