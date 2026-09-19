"use client";

import { useCallback, useState, useTransition } from "react";
import { registerPasteWarning } from "@/lib/actions";
import { PASTE_WARNINGS_LIMIT } from "@/lib/validate-writing";

export type PasteGuardState = {
  warnings: number;
  penalized: boolean;
  coinsLost: number;
};

export function usePasteGuard() {
  const [state, setState] = useState<PasteGuardState | null>(null);
  const [pending, startTransition] = useTransition();

  const trigger = useCallback(() => {
    startTransition(async () => {
      const res = await registerPasteWarning();
      setState({ warnings: res.warnings, penalized: res.penalized, coinsLost: res.coinsLost });
    });
  }, []);

  const clear = useCallback(() => setState(null), []);

  const banner = state ? (
    <div
      key={`${state.warnings}-${state.penalized}`}
      className={`pop rounded-xl border px-4 py-2.5 text-sm ${
        state.penalized
          ? "border-rose-400/50 bg-rose-400/10 text-rose-200"
          : "border-amber-300/50 bg-amber-300/10 text-amber-200"
      }`}
    >
      {state.penalized ? (
        <span>
          🚫 Paste attempt #{PASTE_WARNINGS_LIMIT} — <strong>-{state.coinsLost} 🪙 penalty applied.</strong>{" "}
          Write it in your own words — that&apos;s the whole point.
        </span>
      ) : (
        <span>
          ⚠️ Pasting is disabled — warning {state.warnings} of {PASTE_WARNINGS_LIMIT}. Write the{" "}
          {PASTE_WARNINGS_LIMIT} words yourself; a {PASTE_WARNINGS_LIMIT}rd warning costs{" "}
          <strong>500 🪙</strong>.
        </span>
      )}
    </div>
  ) : null;

  return { state, pending, trigger, clear, banner };
}
