"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCountries } from "@/lib/countries";
import { L, useI18n } from "./I18nProvider";
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
  const [connectionIssue, setConnectionIssue] = useState(false);
  const [loading, setLoading] = useState(false);

  function showReportsListHint() {
    setConnectionIssue(true);
    setError("");
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setConnectionIssue(false);
    const back = localePath(locale, `/?idea=${encodeURIComponent(idea)}`);
    if (!loggedIn) return router.push(localePath(locale, `/signup?next=${encodeURIComponent(back)}`));
    if (credits < 1) return router.push(localePath(locale, `/credits?next=${encodeURIComponent(back)}`));

    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Locale": locale },
        body: JSON.stringify({ idea, country }),
      });
      let data: { id?: string; error?: string };
      try {
        data = await res.json();
      } catch {
        return showReportsListHint();
      }
      if (!res.ok) {
        setLoading(false);
        if (res.status === 402) return router.push(localePath(locale, `/credits?next=${encodeURIComponent(back)}`));
        return setError(data.error ?? dict.common.genericError);
      }
      if (!data.id) return showReportsListHint();
      router.push(localePath(locale, `/reports/${data.id}`));
      router.refresh();
    } catch {
      showReportsListHint();
    }
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
      <div className="flex flex-col gap-3">
        <select className="input w-full" value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t.storeLabel}>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
              {t.storeSuffix}
            </option>
          ))}
        </select>
        <button className="btn-primary min-h-11 w-full px-4 py-2.5" disabled={loading || idea.trim().length < 5}>
          {loading ? (
            t.loading
          ) : loggedIn && credits > 0 ? (
            <span className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap">
              <span>{t.createReport}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/20 px-2.5 py-0.5 text-sm font-extrabold tabular-nums">
                <span aria-hidden>🪙</span>
                {t.creditsBadge(credits)}
              </span>
            </span>
          ) : (
            t.buyReport
          )}
        </button>
      </div>
      {connectionIssue && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-bold text-amber-900">{t.submitConnectionError}</p>
          <p className="mt-1.5 leading-relaxed text-amber-950/80">{t.submitReportsHint}</p>
          <L href="/reports" className="mt-3 inline-block font-bold text-oink-600 underline">
            {t.submitReportsLink}
          </L>
        </div>
      )}
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
