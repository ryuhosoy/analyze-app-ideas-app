import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth";
import { db, id } from "@/lib/db";
import { lookupApp, parseAppStoreUrl } from "@/lib/appstore";
import { isDemoPayments } from "@/lib/config";
import { createSpreadsheetCheckout } from "@/lib/payments";
import { fulfillReviewOrder } from "@/lib/review-orders";
import { apiError } from "@/i18n/api-errors";
import { getRequestLocale } from "@/i18n/server";
import { localePath } from "@/i18n/paths";

export async function POST(req: Request) {
  const locale = await getRequestLocale(req);
  const body = (await req.json().catch(() => ({}))) as { appUrl?: string; email?: string };
  const parsed = parseAppStoreUrl(body.appUrl ?? "");
  if (!parsed) {
    return NextResponse.json({ error: apiError(locale, "invalidAppUrl") }, { status: 400 });
  }
  const email = normalizeEmail(body.email ?? "");
  if (!email) return NextResponse.json({ error: apiError(locale, "invalidEmail") }, { status: 400 });

  const app = await lookupApp(parsed.appId, parsed.country);
  if (!app) return NextResponse.json({ error: apiError(locale, "appNotFound") }, { status: 404 });

  const orderId = id();
  db.prepare("INSERT INTO review_orders (id, app_url, app_id, country, email) VALUES (?, ?, ?, ?, ?)").run(
    orderId,
    body.appUrl!.trim(),
    parsed.appId,
    parsed.country,
    email,
  );

  if (isDemoPayments()) {
    db.prepare("UPDATE review_orders SET status = 'paid' WHERE id = ?").run(orderId);
    void fulfillReviewOrder(orderId);
    return NextResponse.json({ url: localePath(locale, "/reviews/thanks") });
  }
  return NextResponse.json({ url: await createSpreadsheetCheckout(orderId, email, app.name, locale) });
}
