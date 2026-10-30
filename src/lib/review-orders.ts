import "server-only";
import { db } from "./db";
import { fetchReviews, lookupApp, reviewsToCsv } from "./appstore";
import { sendEmail } from "./email";
import { APP_NAME } from "./config";

/** 支払い済みのスプレッドシート注文を処理してメール送信する */
export async function fulfillReviewOrder(orderId: string): Promise<void> {
  const order = db.prepare("SELECT * FROM review_orders WHERE id = ?").get(orderId) as
    | { id: string; app_id: string; country: string; email: string; status: string }
    | undefined;
  if (!order || order.status !== "paid") return;
  db.prepare("UPDATE review_orders SET status = 'processing' WHERE id = ?").run(orderId);

  try {
    const app = await lookupApp(order.app_id, order.country);
    const reviews = await fetchReviews(order.app_id, order.country);
    const name = app?.name ?? `app-${order.app_id}`;
    const safeName = name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 40) || order.app_id;
    await sendEmail({
      to: order.email,
      subject: `🐷 「${name}」のレビュースプレッドシート`,
      text:
        `${APP_NAME} をご利用いただきありがとうございます！\n\n` +
        `「${name}」（${order.country.toUpperCase()}ストア）の最新レビュー ${reviews.length}件 をCSVで添付しました。\n` +
        `※Appleが公開しているのは国ごとの最新レビューのみで、全期間のアーカイブではありません。\n\nブーちゃんより 🐽`,
      attachments: [{ filename: `${safeName}-reviews-${order.country}.csv`, content: reviewsToCsv(app, reviews), contentType: "text/csv; charset=utf-8" }],
    });
    db.prepare("UPDATE review_orders SET status = 'sent' WHERE id = ?").run(orderId);
  } catch (err) {
    console.error(`[review order ${orderId}]`, err);
    db.prepare("UPDATE review_orders SET status = 'failed', error = ? WHERE id = ?").run(
      err instanceof Error ? err.message : String(err),
      orderId,
    );
  }
}
