import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { todayString } from "@/lib/data";
import { getOwnedItemIds } from "@/lib/rewards";
import { advanceTutorialDb } from "@/lib/tutorial";
import Wheel from "@/components/wheel";
import Shop from "@/components/shop";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const user = await requireUser();
  const finished = advanceTutorialDb(user.id, 3);
  const owned = [...getOwnedItemIds(user.id)];
  const spunToday = user.last_spin_date === todayString();
  const coins = user.coins + (finished.completed ? finished.reward : 0);

  return (
    <div className="rise space-y-6">
      {finished.completed && (
        <div className="pop rounded-2xl border border-emerald-300/40 bg-emerald-300/10 p-5 text-center">
          <p className="text-2xl">🎓</p>
          <h2 className="mt-1 font-[var(--font-lora)] text-xl font-bold text-emerald-200">
            Tutorial complete — you&apos;re free to explore!
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Here&apos;s <span className="font-bold text-amber-200">+{finished.reward} 🪙</span> to
            get your collection started. Everything on the home page is unlocked now.
          </p>
        </div>
      )}

      <header className="text-center">
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Rewards shop</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your profile card lives on the{" "}
          <Link href="/" className="text-amber-200/80 hover:text-amber-200">
            home page
          </Link>{" "}
          — dress it up here.
        </p>
      </header>

      <div className="mx-auto max-w-md">
        <Wheel coins={coins} spunToday={spunToday} avatar={user.avatar} />
      </div>

      <Shop
        coins={coins}
        ownedIds={owned}
        equipped={{
          name: user.name,
          avatar: user.avatar,
          banner: user.banner,
          frame: user.frame,
          background: user.background,
          nameStyle: user.name_style,
        }}
      />
    </div>
  );
}
