"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCountries } from "@/lib/countries";
import { useI18n } from "./I18nProvider";
import { localePath } from "@/i18n/paths";

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
  const { locale, dict } = useI18n();
  const t = dict.ideaForm;
  const countries = getCountries(locale);
  const [idea, setIdea] = useState(initialIdea);
  const [country, setCountry] = useState("us");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const back = localePath(locale, `/?idea=${encodeURIComponent(idea)}`);
    if (!loggedIn) return router.push(localePath(locale, `/signup?next=${encodeURIComponent(back)}`));
    if (credits < 1) return router.push(localePath(locale, `/credits?next=${encodeURIComponent(back)}`));

    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Locale": locale },
      body: JSON.stringify({ idea, country }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      if (res.status === 402) return router.push(localePath(locale, `/credits?next=${encodeURIComponent(back)}`));
      return setError(data.error ?? dict.common.genericError);
    }
    router.push(localePath(locale, `/reports/${data.id}`));
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 text-left">
      <label className="block">
        <span className="mb-2 block font-bold">{t.label}</span>
        <textarea
          className="input min-h-28 resize-none"
          placeholder={t.placeholder}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          maxLength={300}
          required
          minLength={5}
        />
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select className="input sm:w-auto" value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t.storeLabel}>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
              {t.storeSuffix}
            </option>
          ))}
        </select>
        <button className="btn-primary flex-1" disabled={loading || idea.trim().length < 5}>
          {loading ? t.loading : loggedIn && credits > 0 ? t.createWithCredits(credits) : t.buyReport}
        </button>
      </div>
      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
      <details className="text-sm text-ink/70">
        <summary className="cursor-pointer font-bold text-oink-600">{t.tipsTitle}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {t.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </details>
    </form>
  );
}
