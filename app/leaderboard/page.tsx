import { getOrCreateUser } from "@/lib/data";
import { getLeaderboard, getUserRank, updateLeaderboardScore } from "@/lib/leaderboard";
import RegisterUsernameForm from "@/components/register-username-form";

export const dynamic = "force-dynamic";

export default function LeaderboardPage() {
  const user = getOrCreateUser();
  updateLeaderboardScore(user.id);

  const entries = getLeaderboard(user.id);
  const rank = getUserRank(user.id);
  const hasUsername = user.username != null;
  // const stats = userStats(user.id);

  const yourEntry = entries.find((e) => e.is_you);

  const MEDALS = ["🥇", "🥈", "🥉"];

  return (
    <div className="rise space-y-8">
      <header>
        <h1 className="font-[var(--font-lora)] text-4xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-zinc-400">Compete with fellow word-smiths. Climb the ranks.</p>
      </header>

      {!hasUsername && (
        <section className="rounded-2xl border border-amber-200/30 bg-amber-200/[0.06] p-6">
          <h2 className="font-[var(--font-lora)] text-lg font-semibold mb-2">Join the leaderboard</h2>
          <p className="text-sm text-zinc-400 mb-4">Pick a username to see where you rank.</p>
          <RegisterUsernameForm />
        </section>
      )}

      {hasUsername && rank != null && (
        <section className="rounded-2xl border border-amber-200/30 bg-amber-200/[0.06] p-6 pop">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Your rank</p>
              <p className="font-[var(--font-lora)] text-4xl font-bold text-amber-200">#{rank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-400">Your XP</p>
              <p className="font-[var(--font-lora)] text-2xl font-semibold">
                ⚡ {user.xp.toLocaleString()}
              </p>
            </div>
          </div>
          {yourEntry && (
            <div className="mt-4 flex gap-4 text-sm text-zinc-400">
              <span>📚 {yourEntry.words_mastered} words mastered</span>
              <span>🔥 {yourEntry.streak}-day streak</span>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_5rem_5rem_4rem] gap-2 px-4 py-3 border-b border-white/10 text-xs font-medium text-zinc-500 uppercase tracking-wider">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">⚡ XP</span>
          <span className="text-right">📚 Words</span>
          <span className="text-right">🔥 Streak</span>
        </div>
        <div>
          {entries.map((entry) => (
            <div
              key={entry.username}
              className={`grid grid-cols-[3rem_1fr_5rem_5rem_4rem] gap-2 px-4 py-3 items-center border-b border-white/5 transition-colors ${
                entry.is_you
                  ? "bg-amber-200/[0.08] border-l-2 border-l-amber-200"
                  : "hover:bg-white/[0.02]"
              }`}
            >
              <span className="font-[var(--font-lora)] text-lg font-semibold">
                {entry.rank <= 3 ? MEDALS[entry.rank - 1] : entry.rank}
              </span>
              <span className="truncate font-medium">
                {entry.username}
                {entry.is_you && (
                  <span className="ml-1.5 inline-block rounded-full bg-amber-200/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-200 align-middle">
                    You
                  </span>
                )}
              </span>
              <span className="text-right tabular-nums text-sm text-zinc-300">{entry.xp.toLocaleString()}</span>
              <span className="text-right tabular-nums text-sm text-zinc-400">{entry.words_mastered}</span>
              <span className="text-right tabular-nums text-sm text-zinc-400">{entry.streak}</span>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">
              No entries yet. Register a username to get started.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
