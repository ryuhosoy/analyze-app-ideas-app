import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { db, id } from "@/lib/db";
import { generateReport } from "@/lib/analyze";
import { COUNTRY_CODES } from "@/lib/countries";
import { apiError } from "@/i18n/api-errors";
import { getRequestLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

export async function POST(req: Request) {
  const locale = await getRequestLocale(req);
  const user = await getUser();
  if (!user) return NextResponse.json({ error: apiError(locale, "loginRequired") }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { idea?: string; country?: string };
  const idea = (body.idea ?? "").trim();
  const country = COUNTRY_CODES.includes(body.country as (typeof COUNTRY_CODES)[number]) ? body.country! : "us";
  if (idea.length < 5) return NextResponse.json({ error: apiError(locale, "ideaTooShort") }, { status: 400 });
  if (idea.length > 300) return NextResponse.json({ error: apiError(locale, "ideaTooLong") }, { status: 400 });

  const charged = db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0").run(user.id);
  if (charged.changes === 0) return NextResponse.json({ error: apiError(locale, "noCredits") }, { status: 402 });

  const reportId = id();
  const preparing = getDictionary(locale as Locale).analyze.preparing;
  db.prepare("INSERT INTO reports (id, user_id, idea, country, progress, locale) VALUES (?, ?, ?, ?, ?, ?)").run(
    reportId,
    user.id,
    idea,
    country,
    preparing,
    locale,
  );
  void generateReport(reportId);
  return NextResponse.json({ id: reportId });
}
