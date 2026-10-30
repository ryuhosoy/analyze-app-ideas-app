import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db, id } from "@/lib/db";
import { generateReport } from "@/lib/analyze";
import { COUNTRIES } from "@/lib/countries";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { idea?: string; country?: string };
  const idea = (body.idea ?? "").trim();
  const country = COUNTRIES.some((c) => c.code === body.country) ? body.country! : "us";
  if (idea.length < 5) return NextResponse.json({ error: "アイデアをもう少し詳しく書いてください" }, { status: 400 });
  if (idea.length > 300) return NextResponse.json({ error: "アイデアは300文字以内で書いてください" }, { status: 400 });

  // クレジットを原子的に1消費する
  const charged = db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0").run(user.id);
  if (charged.changes === 0) return NextResponse.json({ error: "クレジットが足りません" }, { status: 402 });

  const reportId = id();
  db.prepare("INSERT INTO reports (id, user_id, idea, country, progress) VALUES (?, ?, ?, ?, ?)").run(
    reportId,
    user.id,
    idea,
    country,
    "準備しています…",
  );
  void generateReport(reportId);
  return NextResponse.json({ id: reportId });
}
