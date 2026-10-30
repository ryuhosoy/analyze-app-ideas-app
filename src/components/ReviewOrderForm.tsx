"use client";

import { useState } from "react";

export function ReviewOrderForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [appUrl, setAppUrl] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/reviews/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appUrl, email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return setError(data.error ?? "エラーが発生しました");
    }
    window.location.href = data.url;
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <label className="block">
        <span className="mb-2 block font-bold">App StoreのURL</span>
        <input
          className="input"
          placeholder="https://apps.apple.com/us/app/example/id123456789"
          value={appUrl}
          onChange={(e) => setAppUrl(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block font-bold">送信先メールアドレス</span>
        <input type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "処理中…" : "スプレッドシートを購入（$0.99）"}
      </button>
      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
    </form>
  );
}
