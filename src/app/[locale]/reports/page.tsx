import { redirect } from "next/navigation";
import { Pig } from "@/components/Pig";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { L } from "@/components/I18nProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localePath } from "@/i18n/paths";
import { dateLocale } from "@/i18n/server";
import { notFound } from "next/navigation";

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const t = dict.reports;
  const user = await getUser();
  if (!user) redirect(localePath(locale, `/login?next=${encodeURIComponent(localePath(locale, "/reports"))}`));
  const reports = db
    .prepare(
      "SELECT id, idea, status, review_count, created_at FROM reports WHERE user_id = ? AND status != 'failed' ORDER BY created_at DESC",
    )
    .all(user.id) as { id: string; idea: string; status: string; review_count: number; created_at: string }[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t.title}</h1>
        <L href="/" className="btn-primary !py-2 text-sm">
          {t.newBtn}
        </L>
      </div>
      {reports.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <Pig size={120} mood="sleepy" ariaLabel={dict.pigAria} />
          <p className="text-lg font-extrabold">{t.emptyTitle}</p>
          <p className="text-sm text-ink/60">{t.emptyBody}</p>
          <L href="/" className="btn-primary mt-2">
            {t.emptyCta}
          </L>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => {
            const status = t.status[r.status as keyof typeof t.status] ?? r.status;
            const statusCls =
              r.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
            return (
              <li key={r.id}>
                <L href={`/reports/${r.id}`} className="card flex items-center justify-between gap-4 !p-5 transition hover:border-oink-300">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{r.idea}</p>
                    <p className="mt-1 text-xs text-ink/50">
                      {new Date(r.created_at + "Z").toLocaleString(dateLocale(locale))}
                      {r.review_count > 0 && t.reviewCount(r.review_count.toLocaleString())}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${statusCls}`}>{status}</span>
                </L>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
