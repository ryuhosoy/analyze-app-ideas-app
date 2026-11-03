import { NextResponse } from "next/server";
import { getUser, normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { APP_NAME, SUPPORT_MESSAGE_MAX } from "@/lib/config";
import { apiError } from "@/i18n/api-errors";
import { getRequestLocale } from "@/i18n/server";

export async function POST(req: Request) {
  const locale = await getRequestLocale(req);
  const user = await getUser();
  const body = (await req.json().catch(() => ({}))) as { subject?: string; message?: string; email?: string };
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();
  const email = user?.email ?? normalizeEmail(body.email ?? "");

  if (!email) return NextResponse.json({ error: apiError(locale, "supportEmail") }, { status: 400 });
  if (!subject || subject.length > 100) return NextResponse.json({ error: apiError(locale, "supportSubject") }, { status: 400 });
  if (!message || message.length > SUPPORT_MESSAGE_MAX) {
    return NextResponse.json({ error: apiError(locale, "supportMessage", SUPPORT_MESSAGE_MAX) }, { status: 400 });
  }

  db.prepare("INSERT INTO support_messages (email, subject, message) VALUES (?, ?, ?)").run(email, subject, message);
  if (process.env.SUPPORT_EMAIL) {
    await sendEmail({
      to: process.env.SUPPORT_EMAIL,
      replyTo: email,
      subject: `[${APP_NAME} ${locale === "en" ? "Support" : "サポート"}] ${subject}`,
      text: `From: ${email}\n\n${message}`,
    });
  }
  return NextResponse.json({ ok: true });
}
