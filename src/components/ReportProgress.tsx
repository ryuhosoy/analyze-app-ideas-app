"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pig } from "./Pig";
import { useI18n } from "./I18nProvider";

export function ReportProgress({ reportId, initialProgress }: { reportId: string; initialProgress: string | null }) {
  const router = useRouter();
  const { dict } = useI18n();
  const t = dict.reports;
  const [progress, setProgress] = useState(initialProgress);

  useEffect(() => {
    const timer = setInterval(async () => {
      const res = await fetch(`/api/reports/${reportId}`);
      if (!res.ok) return;
      const data = (await res.json()) as { status: string; progress: string | null };
      setProgress(data.progress);
      if (data.status === "done" || data.status === "failed") {
        clearInterval(timer);
        router.refresh();
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [reportId, router]);

  return (
    <div className="card flex flex-col items-center gap-4 py-12 text-center">
      <div className="animate-wiggle">
        <Pig size={140} mood="thinking" magnifier ariaLabel={dict.pigAria} />
      </div>
      <p className="text-lg font-extrabold">{t.progressTitle}</p>
      <p className="text-ink/70">{progress ?? t.progressFallback}</p>
      <p className="text-sm text-ink/50">{t.progressHint}</p>
    </div>
  );
}
