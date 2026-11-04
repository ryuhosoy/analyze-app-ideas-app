import { notFound, redirect } from "next/navigation";
import { Pig } from "@/components/Pig";
import { ReportView } from "@/components/ReportView";
import { ReportProgress } from "@/components/ReportProgress";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { CompetitorSummary, ReportResult } from "@/lib/report-schema";
import { L } from "@/components/I18nProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localePath } from "@/i18n/paths";

type Row = {
  id: string;
  idea: string;
  status: string;
  progress: string | null;
  competitors: string | null;
  result: string | null;
  error: string | null;
  review_count: number;
};

export default async function ReportPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const t = dict.reports;
  const user = await getUser();
  if (!user) redirect(localePath(locale, `/login?next=/reports/${id}`));
  const report = db.prepare("SELECT * FROM reports WHERE id = ? AND user_id = ?").get(id, user.id) as Row | undefined;
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <L href="/reports" className="mb-4 inline-block text-sm font-bold text-oink-600">
        {t.back}
      </L>
      {report.status === "done" && report.result ? (
        <ReportView
          idea={report.idea}
          competitors={JSON.parse(report.competitors ?? "[]") as CompetitorSummary[]}
          reviewCount={report.review_count}
          result={JSON.parse(report.result) as ReportResult}
          labels={dict.reportView}
          pigAria={dict.pigAria}
        />
      ) : report.status === "failed" ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <Pig size={120} mood="sleepy" ariaLabel={dict.pigAria} />
          <p className="text-lg font-extrabold">{t.failedTitle}</p>
          <p className="text-sm leading-relaxed text-ink/60">{t.failedBusyHint}</p>
          {report.error && <p className="text-sm text-ink/50">{report.error}</p>}
          <p className="text-sm text-ink/60">{t.creditRefunded}</p>
          <L href={`/?idea=${encodeURIComponent(report.idea)}`} className="btn-primary mt-2">
            {t.retry}
          </L>
        </div>
      ) : (
        <ReportProgress reportId={report.id} initialProgress={report.progress} />
      )}
    </div>
  );
}
