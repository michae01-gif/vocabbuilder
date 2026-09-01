import Link from "next/link";
import { getOrCreateUser, todayString } from "@/lib/data";
import { getOwnedItemIds } from "@/lib/rewards";
import Wheel from "@/components/wheel";
import Shop from "@/components/shop";

export const dynamic = "force-dynamic";

export default function RewardsPage() {
  const user = getOrCreateUser();
  const owned = [...getOwnedItemIds(user.id)];
  const spunToday = user.last_spin_date === todayString();

  return (
    <div className="rise space-y-6">
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
        <Wheel coins={user.coins} spunToday={spunToday} avatar={user.avatar} />
      </div>

      <Shop
        coins={user.coins}
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
