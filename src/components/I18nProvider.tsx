"use client";

import Link from "next/link";
import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { getDictionary } from "@/i18n/get-dictionary";
import { localePath } from "@/i18n/paths";

type I18nValue = { locale: Locale; dict: Dictionary };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, dict: getDictionary(locale) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function L({ href, ...props }: React.ComponentProps<typeof Link> & { href: string }) {
  const { locale } = useI18n();
  const path = typeof href === "string" ? localePath(locale, href) : href;
  return <Link href={path} {...props} />;
}
