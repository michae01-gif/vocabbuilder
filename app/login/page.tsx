import LoginForm from "@/components/login-form";
import LoginDemo from "@/components/login-demo";

export const dynamic = "force-dynamic";

const GOALS = [
  {
    icon: "🎯",
    title: "Ace my tests",
    body: "SAT, ACT, GRE — root families unlock hundreds of test words at once.",
  },
  {
    icon: "📖",
    title: "Read harder texts",
    body: "Follow real passages and never stop to reach for a dictionary.",
  },
  {
    icon: "🧠",
    title: "Grow for the joy of it",
    body: "A daily 5-minute ritual — streaks, coins, and a garden that proves it.",
  },
  {
    icon: "✍️",
    title: "Write with precision",
    body: "Say exactly what you mean — the right word, not the almost-right one.",
  },
];

export default function LoginPage() {
  return (
    <div className="rise mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14">
      {/* Left — the pitch */}
      <div className="space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌳</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/80">
              WordForge
            </span>
          </div>
          <h1 className="font-[var(--font-lora)] text-4xl font-bold leading-tight text-zinc-50 sm:text-5xl">
            A <span className="text-amber-200">bigger vocabulary</span>,
            <br />
            five minutes a day.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400">
            WordForge teaches the{" "}
            <span className="text-zinc-200">Greek &amp; Latin roots behind English</span> — so every
            new word makes the next ten easier. Read real passages, tap what you don&apos;t know,
            prove it in quick quizzes, and watch your vocabulary garden grow, one daily session at a
            time.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            What brings you here?
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {GOALS.map((g) => (
              <div
                key={g.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-amber-200/30"
              >
                <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                  <span className="text-lg">{g.icon}</span>
                  {g.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{g.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            How it works
          </h2>
          <LoginDemo />
        </section>
      </div>

      {/* Right — sign in */}
      <div className="flex flex-col items-center gap-6">
        <div className="hidden text-center lg:block">
          <div className="mascot-bob text-5xl">🦉</div>
        </div>
        <LoginForm />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-600">
          <span>🔥 Daily streaks</span>
          <span>🪙 Coins &amp; rewards</span>
          <span>🌱 Smart review scheduling</span>
          <span>📖 Real reading passages</span>
        </div>
      </div>
    </div>
  );
}
