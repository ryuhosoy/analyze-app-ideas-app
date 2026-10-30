import Link from "next/link";
import { redirect } from "next/navigation";
import { Pig } from "@/components/Pig";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "作成中", cls: "bg-amber-100 text-amber-700" },
  running: { label: "作成中", cls: "bg-amber-100 text-amber-700" },
  done: { label: "完了", cls: "bg-emerald-100 text-emerald-700" },
  failed: { label: "失敗", cls: "bg-rose-100 text-rose-700" },
};

export default async function ReportsPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/reports");
  const reports = db
    .prepare("SELECT id, idea, status, review_count, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id) as { id: string; idea: string; status: string; review_count: number; created_at: string }[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">レポート</h1>
        <Link href="/" className="btn-primary !py-2 text-sm">＋ 新規レポート</Link>
      </div>
      {reports.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <Pig size={120} mood="sleepy" />
          <p className="text-lg font-extrabold">まだレポートがありません</p>
          <p className="text-sm text-ink/60">ブーちゃんが出番を待っています。</p>
          <Link href="/" className="btn-primary mt-2">最初のレポートを作成</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id}>
              <Link href={`/reports/${r.id}`} className="card flex items-center justify-between gap-4 !p-5 transition hover:border-oink-300">
                <div className="min-w-0">
                  <p className="truncate font-bold">{r.idea}</p>
                  <p className="mt-1 text-xs text-ink/50">
                    {new Date(r.created_at + "Z").toLocaleString("ja-JP")}
                    {r.review_count > 0 && ` ・ レビュー${r.review_count.toLocaleString()}件`}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${STATUS[r.status]?.cls}`}>{STATUS[r.status]?.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
