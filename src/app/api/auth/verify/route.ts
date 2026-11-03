import { NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth";
import { appUrl } from "@/lib/config";
import { getLocaleFromCookie } from "@/i18n/server";
import { localePath } from "@/i18n/paths";

export async function GET(req: Request) {
  const locale = await getLocaleFromCookie();
  const url = new URL(req.url);
  const user = await consumeMagicLink(url.searchParams.get("token") ?? "");
  if (!user) return NextResponse.redirect(`${appUrl()}${localePath(locale, "/login?error=expired")}`);
  const next = url.searchParams.get("next");
  const dest =
    next?.startsWith("/") && !next.startsWith("//") ? next : localePath(locale, "/");
  return NextResponse.redirect(`${appUrl()}${dest}`);
}
