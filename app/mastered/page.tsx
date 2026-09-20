import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { masteredWordsList, masteredWordCount } from "@/lib/data";
import { definitionMcqDb } from "@/lib/reading";
import MasteredList from "@/components/mastered-list";

export const dynamic = "force-dynamic";

export default async function MasteredPage() {
  const user = await requireUser();
  const words = masteredWordsList(user.id);
  const total = masteredWordCount(user.id);
  const options = definitionMcqDb(words.map((w) => w.id));

  return (
    <div className="rise mx-auto max-w-3xl space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Word vault</p>
          <h1 className="font-[var(--font-lora)] text-3xl font-bold">Words you&apos;ve mastered</h1>
          <p className="text-sm text-zinc-400">
            {total} word{total === 1 ? "" : "s"} in your long-term keeping. Forgot one? Tap it and
            quiz yourself — a wrong answer sends it back into your rotation.
          </p>
        </div>
        <Link
          href="/weekly-test"
          className="hidden shrink-0 rounded-full border border-sky-300/40 bg-sky-300/10 px-4 py-2 text-sm font-medium text-sky-200 transition-all hover:bg-sky-300/20 sm:inline-block"
        >
          🧪 Weekly test
        </Link>
      </header>

      {words.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="text-6xl">🏆</div>
          <h2 className="font-[var(--font-lora)] text-2xl font-bold">No mastered words yet</h2>
          <p className="max-w-md text-zinc-400">
            Words graduate into your vault as you produce them and recall them over time. Start a
            session to forge your first few.
          </p>
          <Link href="/session" className="rounded-full bg-amber-200 px-6 py-2.5 font-medium text-black">
            Start learning
          </Link>
        </div>
      ) : (
        <MasteredList words={words} options={options} />
      )}
    </div>
  );
}