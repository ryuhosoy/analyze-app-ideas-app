import { NextResponse } from "next/server";
import { getUser, normalizeEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { APP_NAME, SUPPORT_MESSAGE_MAX } from "@/lib/config";

export async function POST(req: Request) {
  const user = await getUser();
  const body = (await req.json().catch(() => ({}))) as { subject?: string; message?: string; email?: string };
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();
  const email = user?.email ?? normalizeEmail(body.email ?? "");

  if (!email) return NextResponse.json({ error: "返信用のメールアドレスを入力してください" }, { status: 400 });
  if (!subject || subject.length > 100) return NextResponse.json({ error: "件名を入力してください（100文字以内）" }, { status: 400 });
  if (!message || message.length > SUPPORT_MESSAGE_MAX) {
    return NextResponse.json({ error: `メッセージは${SUPPORT_MESSAGE_MAX}文字以内で入力してください` }, { status: 400 });
  }

  db.prepare("INSERT INTO support_messages (email, subject, message) VALUES (?, ?, ?)").run(email, subject, message);
  if (process.env.SUPPORT_EMAIL) {
    await sendEmail({
      to: process.env.SUPPORT_EMAIL,
      replyTo: email,
      subject: `[${APP_NAME} サポート] ${subject}`,
      text: `From: ${email}\n\n${message}`,
    });
  }
  return NextResponse.json({ ok: true });
}
