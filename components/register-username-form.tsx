"use client";

import { useState } from "react";
import { registerLeaderboardUsername } from "@/lib/actions";

export default function RegisterUsernameForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await registerLeaderboardUsername(username);
    setLoading(false);
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error ?? "Something went wrong.");
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-300">
        <span>✓</span>
        <span>Username registered! You&apos;re on the board.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1 max-w-xs">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Pick a name…"
          maxLength={20}
          className="w-full rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-200/40 focus:outline-none"
        />
        {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={loading || username.trim().length < 2}
        className="shrink-0 rounded-xl bg-amber-200/90 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-amber-200 disabled:opacity-40"
      >
        {loading ? "…" : "Register"}
      </button>
    </form>
  );
}
