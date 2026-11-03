"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { localePath } from "@/i18n/paths";

export function EmailForm({ next, cta }: { next?: string; cta: string }) {
  const router = useRouter();
  const { locale, dict } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Locale": locale },
      body: JSON.stringify({ email, next }),
    });
    if (!res.ok) {
      setLoading(false);
      return setError((await res.json()).error ?? dict.common.genericError);
    }
    router.push(
      localePath(
        locale,
        `/check-email?email=${encodeURIComponent(email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`,
      ),
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        className="input"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoFocus
      />
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? dict.auth.sending : cta}
      </button>
      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
    </form>
  );
}
