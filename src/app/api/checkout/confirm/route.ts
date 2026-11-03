import { NextResponse } from "next/server";
import { appUrl } from "@/lib/config";
import { fulfillCheckout, getStripe } from "@/lib/payments";
import { isLocale } from "@/i18n/config";
import { getLocaleFromCookie, LOCALE_COOKIE } from "@/i18n/server";
import { localePath } from "@/i18n/paths";

/** Stripe Checkoutからの戻り先。Webhookが遅れても確実に反映する */
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    const locale = await getLocaleFromCookie();
    return NextResponse.redirect(`${appUrl()}${localePath(locale, "/")}`);
  }
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const locale = session.metadata?.locale && isLocale(session.metadata.locale) ? session.metadata.locale : await getLocaleFromCookie();
  const result = await fulfillCheckout(session);
  const path =
    result?.kind === "credits"
      ? localePath(locale, `/credits?purchased=${result.quantity}`)
      : localePath(locale, "/credits?canceled=1");
  const res = NextResponse.redirect(`${appUrl()}${path}`);
  res.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
