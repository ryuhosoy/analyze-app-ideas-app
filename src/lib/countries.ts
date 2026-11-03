import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/** App Store の主要ストア（レポート対象の想定リリース市場） */
export const COUNTRY_CODES = [
  "us",
  "jp",
  "kr",
  "tw",
  "gb",
  "ca",
  "au",
  "de",
  "fr",
  "es",
  "it",
  "in",
  "sg",
  "br",
  "mx",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export function getCountries(locale: Locale) {
  const labels = getDictionary(locale).countries;
  return COUNTRY_CODES.map((code) => ({ code, label: labels[code] }));
}

/** @deprecated use getCountries(locale) */
export const COUNTRIES = getCountries("jp");
