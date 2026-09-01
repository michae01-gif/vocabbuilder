"use client";

import { useState } from "react";

export default function SpeakButton({ text, className = "" }: { text: string; className?: string }) {
  const [speaking, setSpeaking] = useState(false);

  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Pronounce ${text}`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-sm transition-all hover:scale-105 hover:border-amber-200/40 ${
        speaking ? "bg-amber-200/20 text-amber-200" : "text-zinc-300 hover:bg-white/5"
      } ${className}`}
    >
      {speaking ? "🔊" : "▶"}
    </button>
  );
}