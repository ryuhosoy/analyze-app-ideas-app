import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "./config";
import { defaultLocale, isLocale } from "./config";

export const LOCALE_COOKIE = "booscout_locale";

export async function getLocaleFromCookie(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return v && isLocale(v) ? v : defaultLocale;
}

export async function getRequestLocale(req: Request): Promise<Locale> {
  const h = req.headers.get("x-locale");
  if (h && isLocale(h)) return h;
  const fromCookieHeader = req.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${LOCALE_COOKIE}=`))
    ?.split("=")[1];
  if (fromCookieHeader && isLocale(fromCookieHeader)) return fromCookieHeader;
  return getLocaleFromCookie();
}

export function htmlLang(locale: Locale): string {
  return locale === "en" ? "en" : "ja";
}

export function dateLocale(locale: Locale): string {
  return locale === "en" ? "en-US" : "ja-JP";
}

/** Stripe Checkout Session の `locale`（アプリの jp → ja） */
export function stripeCheckoutLocale(locale: Locale): "en" | "ja" {
  return locale === "en" ? "en" : "ja";
}

/** Stripe 等の API リダイレクト用 */
export async function appPath(path: string): Promise<string> {
  const locale = await getLocaleFromCookie();
  const { localePath } = await import("./paths");
  return localePath(locale, path);
}
