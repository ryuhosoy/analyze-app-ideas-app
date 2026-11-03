import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError } from "@/i18n/api-errors";
import { getRequestLocale } from "@/i18n/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const locale = await getRequestLocale(req);
  const user = await getUser();
  if (!user) return NextResponse.json({ error: apiError(locale, "loginRequired") }, { status: 401 });
  const { id } = await params;
  const row = db.prepare("SELECT status, progress, error FROM reports WHERE id = ? AND user_id = ?").get(id, user.id);
  if (!row) return NextResponse.json({ error: apiError(locale, "notFound") }, { status: 404 });
  return NextResponse.json(row);
}
