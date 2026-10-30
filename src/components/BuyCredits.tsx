"use client";

import { useState } from "react";
import { REPORT_PRICE_CENTS, formatUsd } from "@/lib/config";

export function BuyCredits({ loggedIn }: { loggedIn: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    if (!loggedIn) {
      window.location.href = `/signup?next=${encodeURIComponent("/credits")}`;
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(data.error ?? "エラーが発生しました");
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button className="btn-secondary !h-11 !w-11 !p-0 text-xl" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="減らす">
          −
        </button>
        <span className="w-20 text-center text-4xl font-extrabold">{quantity}</span>
        <button className="btn-secondary !h-11 !w-11 !p-0 text-xl" onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="増やす">
          ＋
        </button>
      </div>
      <button className="btn-primary w-full text-lg" onClick={buy} disabled={loading}>
        {loading ? "処理中…" : `${quantity}クレジットを購入（${formatUsd(REPORT_PRICE_CENTS * quantity)}）`}
      </button>
      {error && <p className="text-center text-sm font-bold text-rose-600">{error}</p>}
    </div>
  );
}
