import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { locales } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { APP_NAME, appUrl } from "@/lib/config";

function hreflang(locale: Locale): string {
  return locale === "en" ? "en" : "ja";
}

export function absoluteUrl(path: string): string {
  const base = appUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** ロケール付きパスの hreflang / canonical 用 */
export function localeAlternates(locale: Locale, path = "/") {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[hreflang(l)] = absoluteUrl(localePath(l, path));
  }
  languages["x-default"] = absoluteUrl(localePath("jp", path));
  return {
    canonical: absoluteUrl(localePath(locale, path)),
    languages,
  };
}

type PageMetaOpts = {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  /** true のとき `%s | BooScout` テンプレートを使い、ホーム以外の短いタイトル向け */
  useTemplate?: boolean;
  index?: boolean;
};

export function pageMetadata({
  locale,
  path = "/",
  title,
  description,
  useTemplate = true,
  index = true,
}: PageMetaOpts): Metadata {
  const url = absoluteUrl(localePath(locale, path));
  const fullTitle = useTemplate ? title : `${APP_NAME} — ${title}`;

  return {
    title: useTemplate ? title : { absolute: fullTitle },
    description,
    alternates: localeAlternates(locale, path),
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      locale: locale === "en" ? "en_US" : "ja_JP",
      url,
      title: useTemplate ? `${title} | ${APP_NAME}` : fullTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: useTemplate ? `${title} | ${APP_NAME}` : fullTitle,
      description,
    },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
  };
}
