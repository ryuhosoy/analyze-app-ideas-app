import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDemoPayments } from "@/lib/config";
import { createCreditsCheckout } from "@/lib/payments";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { quantity?: number };
  const quantity = Math.floor(Number(body.quantity ?? 1));
  if (!(quantity >= 1 && quantity <= 20)) return NextResponse.json({ error: "数量は1〜20で指定してください" }, { status: 400 });

  if (isDemoPayments()) {
    db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(quantity, user.id);
    return NextResponse.json({ url: `/credits?purchased=${quantity}` });
  }
  return NextResponse.json({ url: await createCreditsCheckout(user.id, user.email, quantity) });
}
