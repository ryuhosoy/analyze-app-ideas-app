import "server-only";
import Stripe from "stripe";
import { db } from "./db";
import { APP_NAME, appUrl, REPORT_PRICE_CENTS, SPREADSHEET_PRICE_CENTS } from "./config";
import { fulfillReviewOrder } from "./review-orders";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";

/** Managed Payments: AIaaS (cloud AI report credits) */
const TAX_CODE_REPORT_CREDIT = "txcd_10105002";
/** Managed Payments: downloadable digital document (review CSV) */
const TAX_CODE_REVIEW_CSV = "txcd_10503000";

let stripe: Stripe | null = null;
export function getStripe(): Stripe {
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return stripe;
}

export async function createCreditsCheckout(
  userId: string,
  email: string,
  quantity: number,
  locale: Locale = "jp",
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: REPORT_PRICE_CENTS,
          product_data: {
            name: locale === "en" ? `${APP_NAME} report credits` : `${APP_NAME} レポートクレジット`,
            description: locale === "en" ? "1 credit = 1 competitor analysis report" : "1クレジット = 競合分析レポート1件",
            tax_code: TAX_CODE_REPORT_CREDIT,
          },
        },
      },
    ],
    metadata: { kind: "credits", userId, quantity: String(quantity) },
    success_url: `${appUrl()}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}${localePath(locale, "/credits?canceled=1")}`,
  });
  return session.url!;
}

export async function createSpreadsheetCheckout(
  orderId: string,
  email: string,
  appName: string,
  locale: Locale = "jp",
): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: SPREADSHEET_PRICE_CENTS,
          product_data: {
            name: (locale === "en" ? `Review spreadsheet: ${appName}` : `レビュースプレッドシート: ${appName}`).slice(0, 120),
            tax_code: TAX_CODE_REVIEW_CSV,
          },
        },
      },
    ],
    metadata: { kind: "spreadsheet", orderId },
    success_url: `${appUrl()}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}${localePath(locale, "/reviews?canceled=1")}`,
  });
  db.prepare("UPDATE review_orders SET stripe_session_id = ? WHERE id = ?").run(session.id, orderId);
  return session.url!;
}

export type Fulfilled = { kind: "credits"; quantity: number } | { kind: "spreadsheet"; orderId: string } | null;

/**
 * 決済完了したCheckout Sessionを反映する。Webhookとリダイレクトの両方から呼ばれても二重付与しない。
 */
export async function fulfillCheckout(session: Stripe.Checkout.Session): Promise<Fulfilled> {
  if (session.payment_status !== "paid") return null;
  const meta = session.metadata ?? {};
  const kind = meta.kind;
  if (kind !== "credits" && kind !== "spreadsheet") return null;

  const inserted = db
    .prepare("INSERT OR IGNORE INTO purchases (stripe_session_id, kind, user_id, quantity) VALUES (?, ?, ?, ?)")
    .run(session.id, kind, meta.userId ?? null, Number(meta.quantity ?? 1));
  const firstTime = inserted.changes > 0;

  if (kind === "credits") {
    const quantity = Number(meta.quantity ?? 1);
    if (firstTime) db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(quantity, meta.userId!);
    return { kind, quantity };
  }

  if (firstTime) {
    db.prepare("UPDATE review_orders SET status = 'paid' WHERE id = ? AND status = 'awaiting_payment'").run(meta.orderId!);
    void fulfillReviewOrder(meta.orderId!);
  }
  return { kind, orderId: meta.orderId! };
}
