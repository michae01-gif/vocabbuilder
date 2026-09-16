import LoginForm from "@/components/login-form";
import LoginDemo from "@/components/login-demo";
import GoalPicker from "@/components/goal-picker";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="-mt-8 -mb-24 flex min-h-dvh justify-center px-4 pb-10 pt-6 lg:h-dvh lg:overflow-hidden lg:py-0">
      <div className="mx-auto grid w-full max-w-6xl content-center gap-7 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
        {/* Left — the pitch */}
        <div className="space-y-4 sm:space-y-5">
          <header className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌳</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                WordForge
              </span>
            </div>
            <h1 className="font-[var(--font-lora)] text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl">
              A <span className="text-amber-200">bigger vocabulary</span>, five minutes a day.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
              WordForge teaches the{" "}
              <span className="text-zinc-200">Greek &amp; Latin roots behind English</span> — so
              every new word makes the next ten easier. Read real passages, tap what you don&apos;t
              know, prove it in quick quizzes, and watch your vocabulary garden grow.
            </p>
          </header>

          <GoalPicker />

          <LoginDemo />
        </div>

        {/* Right — sign in */}
        <div className="flex flex-col items-center gap-4">
          <div className="mascot-bob text-4xl">🦉</div>
          <LoginForm />
          <div className="flex flex-wrap justify-center gap-x-3.5 gap-y-1 text-[11px] text-zinc-600">
            <span>🔥 Streaks</span>
            <span>🪙 Coins</span>
            <span>🌱 Smart review</span>
            <span>📖 Real passages</span>
          </div>
        </div>
      </div>
    </div>
  );
}
