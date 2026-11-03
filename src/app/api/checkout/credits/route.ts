import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createCreditsCheckout } from "@/lib/payments";
import { apiError } from "@/i18n/api-errors";
import { getRequestLocale } from "@/i18n/server";

export async function POST(req: Request) {
  const locale = await getRequestLocale(req);
  const user = await getUser();
  if (!user) return NextResponse.json({ error: apiError(locale, "loginRequired") }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { quantity?: number };
  const quantity = Number(body.quantity ?? 1);
  if (!(quantity >= 1 && quantity <= 20)) return NextResponse.json({ error: apiError(locale, "quantity") }, { status: 400 });
  return NextResponse.json({ url: await createCreditsCheckout(user.id, user.email, quantity, locale) });
}
