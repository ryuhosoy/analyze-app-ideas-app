import { NextResponse } from "next/server";
import { normalizeEmail, sendMagicLink } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; next?: string };
  const email = normalizeEmail(body.email ?? "");
  if (!email) return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
  await sendMagicLink(email, body.next);
  return NextResponse.json({ ok: true });
}
