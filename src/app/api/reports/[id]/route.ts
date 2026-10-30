import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  const { id } = await params;
  const row = db.prepare("SELECT status, progress, error FROM reports WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!row) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  return NextResponse.json(row);
}
