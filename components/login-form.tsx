"use client";

import { useState, useTransition } from "react";
import { signInAction, signUpAction } from "@/lib/auth-actions";
import { validateUsername } from "@/lib/validate";

export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const liveHint = username.length > 0 ? validateUsername(username) : null;
  const usernameOk = username.length > 0 && liveHint === null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    startTransition(async () => {
      const res =
        mode === "signup" ? await signUpAction(username, password) : await signInAction(username, password);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form
      onSubmit={submit}
      className="w-full space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
    >
      <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/[0.02] p-1">
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`rounded-full py-2 text-sm font-medium transition-colors ${
              mode === m ? "bg-amber-200 text-black" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          Username {usernameOk && <span className="text-emerald-400">✓</span>}
        </span>
        <input
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(null);
          }}
          autoComplete="username"
          placeholder="wordforger_99"
          className={`w-full rounded-xl border bg-black/30 px-4 py-2.5 text-zinc-100 outline-none transition-colors ${
            username.length > 0 && liveHint
              ? "border-rose-400/50 focus:border-rose-400/70"
              : "border-white/15 focus:border-amber-200/60"
          }`}
        />
        {liveHint && <span className="block text-xs text-rose-300">{liveHint}</span>}
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs uppercase tracking-widest text-zinc-500">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-zinc-100 outline-none transition-colors focus:border-amber-200/60"
        />
      </label>

      {mode === "signup" && (
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-widest text-zinc-500">Confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-zinc-100 outline-none transition-colors focus:border-amber-200/60"
          />
        </label>
      )}

      {error && (
        <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || username.length === 0 || password.length === 0}
        className="w-full rounded-xl bg-amber-200 py-3 font-semibold text-black transition-all hover:bg-amber-100 disabled:opacity-40"
      >
        {pending ? "Forging…" : mode === "signup" ? "Start forging →" : "Sign in →"}
      </button>

      <p className="text-center text-xs text-zinc-600">
        {mode === "signup"
          ? "Your progress, coins, and garden are saved to your account."
          : "Welcome back — your forge awaits."}
      </p>
    </form>
  );
}
