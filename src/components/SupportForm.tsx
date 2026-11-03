"use client";

import { useState } from "react";
import { SUPPORT_MESSAGE_MAX } from "@/lib/config";
import { useI18n } from "./I18nProvider";

export function SupportForm({ loggedInEmail }: { loggedInEmail?: string }) {
  const { locale, dict } = useI18n();
  const t = dict.support;
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Locale": locale },
      body: JSON.stringify({ email, subject, message }),
    });
    if (!res.ok) {
      setState("idle");
      return setError((await res.json()).error ?? dict.common.genericError);
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="card text-center">
        <p className="text-4xl">💌</p>
        <p className="mt-2 font-bold">{t.sent}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      {loggedInEmail ? (
        <p className="text-sm text-ink/60">
          {t.replyTo}: {loggedInEmail}
        </p>
      ) : (
        <label className="block">
          <span className="mb-2 block font-bold">{t.emailLabel}</span>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
      )}
      <label className="block">
        <span className="mb-2 block font-bold">{t.subject}</span>
        <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={100} required />
      </label>
      <label className="block">
        <span className="mb-2 flex justify-between font-bold">
          {t.message}
          <span className="text-sm font-normal text-ink/50">
            {message.length}/{SUPPORT_MESSAGE_MAX}
          </span>
        </span>
        <textarea
          className="input min-h-32 resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={SUPPORT_MESSAGE_MAX}
          required
        />
      </label>
      <button className="btn-primary w-full" disabled={state === "sending"}>
        {state === "sending" ? dict.auth.sending : t.send}
      </button>
      {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
    </form>
  );
}
