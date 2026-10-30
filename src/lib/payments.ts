import "server-only";
import Stripe from "stripe";
import { db } from "./db";
import { appUrl, REPORT_PRICE_CENTS, SPREADSHEET_PRICE_CENTS } from "./config";
import { fulfillReviewOrder } from "./review-orders";

let stripe: Stripe | null = null;
export function getStripe(): Stripe {
  stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return stripe;
}

export async function createCreditsCheckout(userId: string, email: string, quantity: number): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: REPORT_PRICE_CENTS,
          product_data: { name: "OinkCheck レポートクレジット", description: "1クレジット = 競合分析レポート1件" },
        },
      },
    ],
    metadata: { kind: "credits", userId, quantity: String(quantity) },
    success_url: `${appUrl()}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/credits?canceled=1`,
  });
  return session.url!;
}

export async function createSpreadsheetCheckout(orderId: string, email: string, appName: string): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: SPREADSHEET_PRICE_CENTS,
          product_data: { name: `レビュースプレッドシート: ${appName}`.slice(0, 120) },
        },
      },
    ],
    metadata: { kind: "spreadsheet", orderId },
    success_url: `${appUrl()}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/reviews?canceled=1`,
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
