import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Pig } from "@/components/Pig";
import { ReportView } from "@/components/ReportView";
import { ReportProgress } from "@/components/ReportProgress";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { CompetitorSummary, ReportResult } from "@/lib/report-schema";

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

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect(`/login?next=/reports/${id}`);
  const report = db.prepare("SELECT * FROM reports WHERE id = ? AND user_id = ?").get(id, user.id) as Row | undefined;
  if (!report) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/reports" className="mb-4 inline-block text-sm font-bold text-oink-600">← レポート一覧</Link>
      {report.status === "done" && report.result ? (
        <ReportView
          idea={report.idea}
          competitors={JSON.parse(report.competitors ?? "[]") as CompetitorSummary[]}
          reviewCount={report.review_count}
          result={JSON.parse(report.result) as ReportResult}
        />
      ) : report.status === "failed" ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <Pig size={120} mood="sleepy" />
          <p className="text-lg font-extrabold">ごめんなさい、レポートを作成できませんでした</p>
          <p className="text-sm text-ink/60">{report.error}</p>
          <p className="text-sm text-ink/60">クレジットはお戻ししました。</p>
          <Link href={`/?idea=${encodeURIComponent(report.idea)}`} className="btn-primary mt-2">もう一度試す</Link>
        </div>
      ) : (
        <ReportProgress reportId={report.id} initialProgress={report.progress} />
      )}
    </div>
  );
}
