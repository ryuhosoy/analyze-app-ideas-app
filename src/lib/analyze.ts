import "server-only";
import { db } from "./db";
import { runAnalysis, UserFacingError } from "./run-analysis";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

function setProgress(reportId: string, progress: string) {
  db.prepare("UPDATE reports SET progress = ? WHERE id = ?").run(progress, reportId);
}

/** レポート生成ジョブ（バックグラウンドで実行される） */
export async function generateReport(reportId: string): Promise<void> {
  const report = db.prepare("SELECT idea, country, user_id, locale FROM reports WHERE id = ?").get(reportId) as
    | { idea: string; country: string; user_id: string; locale: string }
    | undefined;
  if (!report) return;
  const locale: Locale = report.locale === "en" ? "en" : "jp";
  const a = getDictionary(locale).analyze;
  db.prepare("UPDATE reports SET status = 'running' WHERE id = ?").run(reportId);

  try {
    const { competitors, reviewCount, result } = await runAnalysis(report.idea, report.country, locale, (msg) =>
      setProgress(reportId, msg),
    );

    db.prepare("UPDATE reports SET competitors = ?, review_count = ? WHERE id = ?").run(
      JSON.stringify(competitors),
      reviewCount,
      reportId,
    );

    db.prepare("UPDATE reports SET status = 'done', result = ?, progress = NULL WHERE id = ?").run(
      JSON.stringify(result),
      reportId,
    );
  } catch (err) {
    console.error(`[report ${reportId}]`, err);
    const message = err instanceof UserFacingError ? err.message : a.genericFail;
    db.prepare("UPDATE reports SET status = 'failed', error = ?, progress = NULL WHERE id = ?").run(message, reportId);
    db.prepare("UPDATE users SET credits = credits + 1 WHERE id = ?").run(report.user_id);
  }
}
