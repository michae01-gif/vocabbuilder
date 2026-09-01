"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buyItem, equipItem } from "@/lib/actions";
import {
  SHOP_ITEMS,
  CATEGORY_META,
  frameStyle,
  bannerCss,
  nameStyle,
  pageBackground,
  type ShopCategory,
  type ShopItem,
} from "@/data/shop";
import Mascot from "./mascot";

export type EquippedProfile = {
  name: string;
  avatar: string;
  banner: string;
  frame: string;
  background: string;
  nameStyle: string;
};

export default function Shop({ coins, ownedIds, equipped }: { coins: number; ownedIds: string[]; equipped: EquippedProfile }) {
  const router = useRouter();
  const owned = new Set(ownedIds);
  const [tab, setTab] = useState<ShopCategory>("avatar");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [tryout, setTryout] = useState<ShopItem | null>(null);
  const [, startTransition] = useTransition();

  function run(action: "buy" | "equip", item: ShopItem) {
    setPending(item.id);
    setMessage(null);
    startTransition(async () => {
      const res = action === "buy" ? await buyItem(item.id) : await equipItem(item.id);
      if (res.ok) {
        setMessage({
          ok: true,
          text: action === "buy" ? `Purchased ${item.name}!` : `Equipped ${item.name}.`,
        });
      } else {
        setMessage({ ok: false, text: "error" in res && res.error ? res.error : "Something went wrong." });
      }
      setPending(null);
      router.refresh();
    });
  }

  function isEquipped(item: ShopItem): boolean {
    switch (item.category) {
      case "avatar":
        return item.emoji === equipped.avatar;
      case "banner":
        return item.id === equipped.banner;
      case "frame":
        return item.id === equipped.frame;
      case "background":
        return item.id === equipped.background;
      case "nameStyle":
        return item.id === equipped.nameStyle;
    }
  }

  function preview(item: ShopItem) {
    switch (item.category) {
      case "avatar":
        return <Mascot emoji={item.emoji ?? "🦉"} size={68} />;
      case "banner":
        return (
          <div className="w-full">
            <div
              className="flex h-16 w-full items-center gap-2 overflow-hidden rounded-lg border border-white/10 px-2.5 shadow-inner"
              style={{ background: item.gradient }}
            >
              <Mascot emoji={equipped.avatar} size={30} />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-white drop-shadow">{equipped.name}</p>
              </div>
            </div>
            <p className="mt-1.5 text-center text-[10px] font-medium text-zinc-400">{item.colors}</p>
          </div>
        );
      case "frame":
        return (
          <div className="w-full">
            <div
              className="flex h-14 w-full items-center gap-2 overflow-hidden rounded-xl px-2.5"
              style={{ background: bannerCss(equipped.banner), ...frameStyle(item.id) }}
            >
              <Mascot emoji={equipped.avatar} size={26} />
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-white drop-shadow">{equipped.name}</p>
              </div>
            </div>
            <p className="mt-1.5 text-center text-[10px] font-medium text-zinc-400">{item.name}</p>
          </div>
        );
      case "background":
        return (
          <div className="w-full">
            <div
              className="relative h-[72px] w-full overflow-hidden rounded-lg border border-white/10"
              style={{ background: item.pageBg }}
            >
              <div className="absolute left-2 top-2 h-4 w-[52%] rounded-lg border border-white/20 bg-white/10" />
              <div className="absolute left-3.5 top-4 h-1.5 w-[30%] rounded bg-white/25" />
              <div className="absolute bottom-2 right-2 h-6 w-[38%] rounded-lg border border-white/15 bg-white/10" />
            </div>
            <p className="mt-1.5 text-center text-[10px] font-medium text-zinc-400">{item.colors}</p>
          </div>
        );
      case "nameStyle":
        return item.nameGradient ? (
          <span
            className="max-w-full break-words text-center font-[var(--font-lora)] text-base font-bold leading-tight"
            style={{
              backgroundImage: item.nameGradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {item.name}
          </span>
        ) : (
          <span className="break-words text-center font-[var(--font-lora)] text-base font-bold text-zinc-100">
            {item.name}
          </span>
        );
    }
  }

  const items = SHOP_ITEMS.filter((i) => i.category === tab);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[var(--font-lora)] text-xl font-semibold">Customise your profile</h2>
        <span className="rounded-full border border-amber-200/20 bg-amber-200/[0.08] px-3 py-1 text-sm font-medium text-amber-200">
          🪙 {coins}
        </span>
      </div>

      {message && (
        <p
          className={`pop mb-4 rounded-xl border px-4 py-2 text-sm ${
            message.ok
              ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"
              : "border-rose-300/40 bg-rose-400/10 text-rose-200"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_META) as ShopCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setTab(cat)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              tab === cat
                ? "border-amber-200/50 bg-amber-200/15 text-amber-200"
                : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25 hover:text-zinc-200"
            }`}
          >
            {CATEGORY_META[cat].icon} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const isOwned = owned.has(item.id);
          const isEq = isEquipped(item);
          const affordable = coins >= item.cost;
          return (
            <div
              key={item.id}
              className={`flex min-w-0 flex-col items-center gap-2.5 rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
                isEq
                  ? "border-amber-200/50 bg-amber-200/[0.08] shadow-lg shadow-amber-200/5"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25"
              }`}
            >
              <div className="flex min-h-14 min-w-0 items-center justify-center overflow-hidden">
                {preview(item)}
              </div>
              <p className="text-center text-[11px] leading-tight text-zinc-400">{item.name}</p>

              <div className="flex w-full gap-1.5">
                <button
                  type="button"
                  onClick={() => setTryout(item)}
                  className="flex-1 rounded-lg border border-white/15 py-1.5 text-[11px] font-medium text-zinc-300 transition-all hover:border-white/30 hover:text-white"
                  title="Try on"
                >
                  👁️ Try
                </button>
                {isEq ? (
                  <span className="flex-1 py-1.5 text-center text-xs font-semibold text-amber-200">✓ Equipped</span>
                ) : isOwned ? (
                  <button
                    type="button"
                    onClick={() => run("equip", item)}
                    disabled={pending === item.id}
                    className="flex-1 rounded-lg border border-emerald-300/40 py-1.5 text-xs font-semibold text-emerald-200 transition-all hover:bg-emerald-300/10 disabled:opacity-50"
                  >
                    {pending === item.id ? "…" : "Equip"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => run("buy", item)}
                    disabled={pending === item.id || !affordable}
                    className="flex-1 rounded-lg bg-gradient-to-b from-amber-200 to-amber-300 py-1.5 text-xs font-bold text-black transition-all hover:brightness-105 active:scale-95 disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-500"
                    title={!affordable ? `Need ${item.cost - coins} more coins` : undefined}
                  >
                    {pending === item.id ? "…" : `🪙 ${item.cost}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tryout overlay */}
      {tryout && (
        <TryoutOverlay
          item={tryout}
          equipped={equipped}
          coins={coins}
          owned={owned}
          pending={pending}
          onBuy={() => run("buy", tryout)}
          onEquip={() => run("equip", tryout)}
          onClose={() => setTryout(null)}
        />
      )}
    </section>
  );
}

/* ── Tryout overlay ──────────────────────────────────────────────── */

function TryoutOverlay({
  item,
  equipped,
  coins,
  owned,
  pending,
  onBuy,
  onEquip,
  onClose,
}: {
  item: ShopItem;
  equipped: EquippedProfile;
  coins: number;
  owned: Set<string>;
  pending: string | null;
  onBuy: () => void;
  onEquip: () => void;
  onClose: () => void;
}) {
  const isOwned = owned.has(item.id);
  const isEq =
    (item.category === "avatar" && item.emoji === equipped.avatar) ||
    (item.category === "banner" && item.id === equipped.banner) ||
    (item.category === "frame" && item.id === equipped.frame) ||
    (item.category === "background" && item.id === equipped.background) ||
    (item.category === "nameStyle" && item.id === equipped.nameStyle);
  const affordable = coins >= item.cost;

  const previewBanner =
    item.category === "banner" ? item.gradient! : bannerCss(equipped.banner);
  const previewFrame =
    item.category === "frame" ? frameStyle(item.id) : frameStyle(equipped.frame);
  const previewAvatar =
    item.category === "avatar" ? (item.emoji ?? "🦉") : equipped.avatar;
  const previewNameStyle =
    item.category === "nameStyle" ? nameStyle(item.id) : nameStyle(equipped.nameStyle);
  const previewBg =
    item.category === "background" ? item.pageBg! : pageBackground(equipped.background);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-white/15 bg-zinc-900/95 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm text-zinc-400 transition-all hover:border-white/30 hover:text-white"
        >
          ✕
        </button>

        <h3 className="font-[var(--font-lora)] text-lg font-semibold">
          Try on — {item.name}
        </h3>

        {/* Full preview card */}
        <div className="w-full">
          {/* Background strip */}
          {item.category === "background" && (
            <div
              className="mb-3 h-20 w-full overflow-hidden rounded-xl border border-white/10"
              style={{ background: previewBg }}
            />
          )}

          {/* Profile card */}
          <div
            className="relative w-full overflow-hidden rounded-3xl border border-white/15 shadow-2xl"
            style={{ background: previewBanner, ...previewFrame }}
          >
            <div className="absolute inset-0 bg-black/35" />
            <div className="relative flex items-center gap-4 p-5 sm:gap-5 sm:p-6">
              <div className="mascot-bob -ml-1 shrink-0">
                <Mascot emoji={previewAvatar} size={100} dance className="drop-shadow-xl" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p
                  className="truncate font-[var(--font-lora)] text-2xl font-bold drop-shadow"
                  style={previewNameStyle}
                >
                  {equipped.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                    🔥 streak
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                    📚 words
                  </span>
                  <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
                    ⚡ XP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Item description */}
        <div className="w-full text-center">
          {"colors" in item && item.colors && (
            <p className="text-sm text-zinc-400">{item.colors}</p>
          )}
        </div>

        {/* Action button */}
        <div className="flex w-full gap-2">
          {isEq ? (
            <span className="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-amber-200">
              ✓ Currently equipped
            </span>
          ) : isOwned ? (
            <button
              type="button"
              onClick={onEquip}
              disabled={pending === item.id}
              className="flex-1 rounded-xl border border-emerald-300/40 bg-emerald-300/10 py-2.5 text-sm font-semibold text-emerald-200 transition-all hover:bg-emerald-300/20 disabled:opacity-50"
            >
              {pending === item.id ? "…" : "Equip now"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onBuy}
              disabled={pending === item.id || !affordable}
              className="flex-1 rounded-xl bg-gradient-to-b from-amber-200 to-amber-300 py-2.5 text-sm font-bold text-black transition-all hover:brightness-105 active:scale-[0.98] disabled:from-zinc-700 disabled:to-zinc-800 disabled:text-zinc-500"
            >
              {pending === item.id
                ? "…"
                : affordable
                  ? `Buy for 🪙 ${item.cost}`
                  : `Need ${item.cost - coins} more coins`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
