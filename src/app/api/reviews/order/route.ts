import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/auth";
import { db, id } from "@/lib/db";
import { lookupApp, parseAppStoreUrl } from "@/lib/appstore";
import { isDemoPayments } from "@/lib/config";
import { createSpreadsheetCheckout } from "@/lib/payments";
import { fulfillReviewOrder } from "@/lib/review-orders";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { appUrl?: string; email?: string };
  const parsed = parseAppStoreUrl(body.appUrl ?? "");
  if (!parsed) {
    return NextResponse.json(
      { error: "App StoreのURLを確認してください（例: https://apps.apple.com/us/app/xxx/id123456789）" },
      { status: 400 },
    );
  }
  const email = normalizeEmail(body.email ?? "");
  if (!email) return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });

  const app = await lookupApp(parsed.appId, parsed.country);
  if (!app) return NextResponse.json({ error: "このストアでアプリが見つかりませんでした" }, { status: 404 });

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
    return NextResponse.json({ url: "/reviews/thanks" });
  }
  return NextResponse.json({ url: await createSpreadsheetCheckout(orderId, email, app.name) });
}
