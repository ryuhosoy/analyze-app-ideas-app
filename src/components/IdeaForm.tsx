"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";

export function IdeaForm({
  loggedIn,
  credits,
  initialIdea = "",
}: {
  loggedIn: boolean;
  credits: number;
  initialIdea?: string;
}) {
  const router = useRouter();
  const [idea, setIdea] = useState(initialIdea);
  const [country, setCountry] = useState("us");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const back = `/?idea=${encodeURIComponent(idea)}`;
    if (!loggedIn) return router.push(`/signup?next=${encodeURIComponent(back)}`);
    if (credits < 1) return router.push(`/credits?next=${encodeURIComponent(back)}`);

    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, country }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      if (res.status === 402) return router.push(`/credits?next=${encodeURIComponent(back)}`);
      return setError(data.error ?? "エラーが発生しました");
    }
    router.push(`/reports/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 text-left">
      <label className="block">
        <span className="mb-2 block font-bold">どんなアプリを作りたいですか？</span>
        <textarea
          className="input min-h-28 resize-none"
          placeholder="例：猫のごはんの成分をスキャンして安全か教えてくれるアプリ"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          maxLength={300}
          required
          minLength={5}
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select className="input sm:w-auto" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="App Storeの国">
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}のApp Store
            </option>
          ))}
        </select>
        <button className="btn-primary flex-1" disabled={loading || idea.trim().length < 5}>
          {loading ? "ブーちゃん出動中…" : loggedIn && credits > 0 ? `レポートを作成（残り${credits}クレジット）` : "レポートを購入（$5.99）"}
        </button>
      </div>
      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
      <details className="text-sm text-ink/70">
        <summary className="cursor-pointer font-bold text-oink-600">🐽 上手な書き方のコツ</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>アプリは1つだけ書いてください</li>
          <li>1文で十分です。短いほど正確に競合を見つけられます</li>
          <li>細かい機能、技術スタック、ビジネスモデルは書かなくてOK</li>
        </ul>
      </details>
    </form>
  );
}
