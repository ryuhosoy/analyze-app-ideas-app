import "server-only";
import Stripe from "stripe";
import { db } from "./db";
import { APP_NAME, appUrl, REPORT_PRICE_CENTS } from "./config";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { stripeCheckoutLocale } from "@/i18n/server";

/** Managed Payments: AIaaS (cloud AI report credits) */
const TAX_CODE_REPORT_CREDIT = "txcd_10105002";

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
  const stripeLocale = stripeCheckoutLocale(locale);
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    locale: stripeLocale,
    customer_email: email,
    custom_text: {
      submit: {
        message:
          locale === "en"
            ? "Credits are added to your account right after payment."
            : "お支払い完了後、すぐにアカウントへクレジットが付与されます。",
      },
    },
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
    metadata: { kind: "credits", userId, quantity: String(quantity), locale },
    success_url: `${appUrl()}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}${localePath(locale, "/credits?canceled=1")}`,
  });
  return session.url!;
}

export type Fulfilled = { kind: "credits"; quantity: number } | null;

/**
 * 決済完了したCheckout Sessionを反映する。Webhookとリダイレクトの両方から呼ばれても二重付与しない。
 */
export async function fulfillCheckout(session: Stripe.Checkout.Session): Promise<Fulfilled> {
  if (session.payment_status !== "paid") return null;
  const meta = session.metadata ?? {};
  if (meta.kind !== "credits") return null;

  const inserted = db
    .prepare("INSERT OR IGNORE INTO purchases (stripe_session_id, kind, user_id, quantity) VALUES (?, ?, ?, ?)")
    .run(session.id, "credits", meta.userId ?? null, Number(meta.quantity ?? 1));
  const firstTime = inserted.changes > 0;

  const quantity = Number(meta.quantity ?? 1);
  if (firstTime) db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(quantity, meta.userId!);
  return { kind: "credits", quantity };
}
