import { NextResponse } from "next/server";
import { normalizeEmail, sendMagicLink } from "@/lib/auth";
import { apiError } from "@/i18n/api-errors";
import { getRequestLocale } from "@/i18n/server";

export async function POST(req: Request) {
  const locale = await getRequestLocale(req);
  const body = (await req.json().catch(() => ({}))) as { email?: string; next?: string };
  const email = normalizeEmail(body.email ?? "");
  if (!email) return NextResponse.json({ error: apiError(locale, "invalidEmail") }, { status: 400 });
  await sendMagicLink(email, body.next, locale);
  return NextResponse.json({ ok: true });
}
