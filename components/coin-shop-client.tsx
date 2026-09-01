"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const PACKS = [
  { id: "starter", name: "Starter Pack", coins: 500, price: 0.99, bonus: 0 },
  { id: "explorer", name: "Explorer Pack", coins: 1200, price: 1.99, bonus: 0.2 },
  { id: "scholar", name: "Scholar Pack", coins: 3000, price: 4.99, bonus: 0.25 },
  { id: "sage", name: "Sage Pack", coins: 6000, price: 9.99, bonus: 0.3 },
  { id: "legendary", name: "Legendary Pack", coins: 15000, price: 19.99, bonus: 0.5 },
];

export default function CoinShopClient({ coins }: { coins: number }) {
  const router = useRouter();
  const [purchasing, startTransition] = useTransition();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedCoins, setAddedCoins] = useState(0);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  function totalCoins(pack: (typeof PACKS)[0]) {
    return pack.coins + Math.floor(pack.coins * pack.bonus);
  }

  function handlePurchase() {
    if (!selectedPack) return;
    const pack = PACKS.find((p) => p.id === selectedPack);
    if (!pack) return;

    startTransition(async () => {
      // Mock stripe checkout
      await new Promise((r) => setTimeout(r, 1500));

      const earned = totalCoins(pack);
      setAddedCoins(earned);
      setSelectedPack(null);
      setShowSuccess(true);
      setCardNumber("");
      setExpiry("");
      setCvc("");
      router.refresh();

      setTimeout(() => setShowSuccess(false), 4000);
    });
  }

  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  return (
    <div className="space-y-6">
      {/* Current balance */}
      <div className="rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4 text-center">
        <p className="text-sm text-zinc-400">Your balance</p>
        <p className="mt-1 font-[var(--font-lora)] text-3xl font-bold text-amber-200">
          🪙 {coins.toLocaleString()}
        </p>
      </div>

      {/* Coin packs grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PACKS.map((pack) => {
          const earned = totalCoins(pack);
          const isSelected = selectedPack === pack.id;
          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => setSelectedPack(isSelected ? null : pack.id)}
              className={`pop relative rounded-2xl border p-5 text-left transition-all ${
                isSelected
                  ? "border-amber-200/50 bg-amber-200/[0.08] shadow-lg shadow-amber-200/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {pack.bonus > 0 && (
                <span className="absolute -top-2.5 right-4 rounded-full border border-amber-200/40 bg-amber-200/10 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                  +{Math.round(pack.bonus * 100)}% bonus
                </span>
              )}
              <p className="font-[var(--font-lora)] text-lg font-semibold">{pack.name}</p>
              <p className="mt-2 text-2xl font-bold text-amber-200">
                🪙 {earned.toLocaleString()}
              </p>
              {pack.bonus > 0 && (
                <p className="mt-0.5 text-xs text-zinc-500">
                  {pack.coins.toLocaleString()} + {Math.floor(pack.coins * pack.bonus).toLocaleString()} bonus
                </p>
              )}
              <p className="mt-3 text-sm font-medium text-zinc-300">${pack.price.toFixed(2)}</p>
            </button>
          );
        })}
      </div>

      {/* Checkout modal */}
      {selectedPack && (
        <div className="pop rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-lora)] text-lg font-semibold">Checkout</h2>
            <button
              type="button"
              onClick={() => setSelectedPack(null)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Package</span>
              <span className="text-zinc-200">
                {PACKS.find((p) => p.id === selectedPack)?.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">You get</span>
              <span className="text-amber-200 font-medium">
                🪙 {totalCoins(PACKS.find((p) => p.id === selectedPack)!).toLocaleString()} coins
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Price</span>
              <span className="text-zinc-200 font-semibold">
                ${PACKS.find((p) => p.id === selectedPack)?.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Mock card inputs */}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Card number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-amber-200/40 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-zinc-500">Expiry</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-amber-200/40 transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-zinc-500">CVC</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="123"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-amber-200/40 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full rounded-full bg-amber-200 px-6 py-3 font-medium text-black transition-all hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {purchasing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                Processing…
              </span>
            ) : (
              `Pay $${PACKS.find((p) => p.id === selectedPack)?.price.toFixed(2)}`
            )}
          </button>

          <p className="text-center text-[10px] text-zinc-600">
            Mock checkout — no real charges will be made.
          </p>
        </div>
      )}

      {/* Success animation */}
      {showSuccess && (
        <div className="pop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="pop mx-4 rounded-2xl border border-emerald-300/30 bg-zinc-900 p-8 text-center shadow-2xl">
            <p className="text-5xl">🎉</p>
            <p className="mt-4 font-[var(--font-lora)] text-2xl font-bold text-emerald-200">
              Purchase complete!
            </p>
            <p className="mt-2 text-zinc-400">
              +{addedCoins.toLocaleString()} coins added to your balance
            </p>
            <div className="mt-4 flex justify-center gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className="confetti-particle text-lg"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {["✨", "🪙", "⭐", "🎉"][i % 4]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
