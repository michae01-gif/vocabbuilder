import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { weeklyTestStatus, weeklyTestQuestions } from "@/lib/weekly";
import WeeklyTest from "@/components/weekly-test";

export const dynamic = "force-dynamic";

export default async function WeeklyTestPage() {
  const user = await requireUser();
  const status = weeklyTestStatus(user.id);

  return (
    <div className="rise mx-auto max-w-2xl space-y-5">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Weekly test</p>
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Test your trouble words</h1>
        <p className="text-sm text-zinc-400">
          Every week you get one shot at the words you missed. Nail them to bank coins and keep your
          vault strong.
        </p>
      </header>

      {status.taken ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="text-5xl">
            {status.correct === status.total ? "🏆" : (status.correct ?? 0) >= (status.total ?? 0) / 2 ? "💪" : "🌱"}
          </div>
          <h2 className="font-[var(--font-lora)] text-2xl font-bold">Already taken this week</h2>
          <p className="text-zinc-400">
            You scored{" "}
            <span className="font-semibold text-amber-200">
              {status.correct ?? 0}/{status.total ?? 0}
            </span>{" "}
            {status.coins ? <>and banked <span className="text-amber-200">+{status.coins} 🪙</span></> : null}.
          </p>
          <p className="text-sm text-zinc-500">A fresh batch lands every Monday.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/" className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black">
              Back home
            </Link>
            <Link href="/session" className="rounded-full border border-white/15 px-6 py-2.5 font-medium hover:bg-white/5">
              Keep learning
            </Link>
          </div>
        </div>
      ) : status.eligible === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="text-5xl">🧪</div>
          <h2 className="font-[var(--font-lora)] text-2xl font-bold">No trouble words this week</h2>
          <p className="max-w-md text-zinc-400">
            None of your answers missed yet. Miss a word in a lesson and it lands here — check back
            after your next session.
          </p>
          <Link href="/session" className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black">
            Take a session
          </Link>
        </div>
      ) : (
        <WeeklyTest questions={weeklyTestQuestions(user.id)} />
      )}
    </div>
  );
}