import Link from "next/link";
import { getOrCreateUser } from "@/lib/data";
import CoinShopClient from "@/components/coin-shop-client";

export const dynamic = "force-dynamic";

export default function CoinShopPage() {
  const user = getOrCreateUser();

  return (
    <div className="rise space-y-6">
      <header className="text-center">
        <h1 className="font-[var(--font-lora)] text-3xl font-bold">Coin shop</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Need more coins? Grab a pack and keep learning.
        </p>
      </header>

      <div className="mx-auto max-w-md">
        <CoinShopClient coins={user.coins} />
      </div>

      <div className="flex justify-center">
        <Link
          href="/rewards"
          className="text-sm text-zinc-400 hover:text-amber-200 transition-colors"
        >
          ← Back to rewards
        </Link>
      </div>
    </div>
  );
}
