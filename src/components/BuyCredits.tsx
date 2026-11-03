"use client";

import { useState } from "react";
import { REPORT_PRICE_CENTS, formatUsd } from "@/lib/config";
import { useI18n } from "./I18nProvider";
import { localePath } from "@/i18n/paths";

export function BuyCredits({ loggedIn }: { loggedIn: boolean }) {
  const { locale, dict } = useI18n();
  const t = dict.credits;
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    if (!loggedIn) {
      window.location.href = localePath(locale, `/signup?next=${encodeURIComponent(localePath(locale, "/credits"))}`);
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Locale": locale },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(data.error ?? dict.common.genericError);
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button className="btn-secondary !h-11 !w-11 !p-0 text-xl" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label={t.decrease}>
          −
        </button>
        <span className="w-20 text-center text-4xl font-extrabold">{quantity}</span>
        <button className="btn-secondary !h-11 !w-11 !p-0 text-xl" onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label={t.increase}>
          ＋
        </button>
      </div>
      <button className="btn-primary w-full text-lg" onClick={buy} disabled={loading}>
        {loading ? t.processing : t.buy(quantity, formatUsd(REPORT_PRICE_CENTS * quantity))}
      </button>
      {error && <p className="text-center text-sm font-bold text-rose-600">{error}</p>}
    </div>
  );
}
