import type { Locale } from "./config";

/** ロケール付きパス（`/jp/credits` など） */
export function localePath(locale: Locale, path: string): string {
  const raw = path.startsWith("/") ? path : `/${path}`;
  const q = raw.indexOf("?");
  const pathname = q === -1 ? raw : raw.slice(0, q);
  const search = q === -1 ? "" : raw.slice(q);
  if (pathname === "/") return `/${locale}${search}`;
  return `/${locale}${pathname}${search}`;
}

/** 現在のパスから別ロケールへの同一ページ URL */
export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && (segments[0] === "jp" || segments[0] === "en")) {
    segments[0] = nextLocale;
    return `/${segments.join("/")}`;
  }
  return localePath(nextLocale, pathname || "/");
}
