import type { CompetitorSummary, ReportResult } from "@/lib/report-schema";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Pig } from "./Pig";

type Insight = ReportResult["whatUsersLove"][number];
type LegacyQuote = string | { appId: string; text: string };
type Labels = Dictionary["reportView"];

function normalizeQuote(q: LegacyQuote): { appId?: string; text: string } {
  return typeof q === "string" ? { text: q } : q;
}

function AppIconFallback({ size, emojiPlaceholder }: { size: "sm" | "lg"; emojiPlaceholder: boolean }) {
  if (emojiPlaceholder) {
    return size === "sm" ? (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-oink-100 text-xs">📱</span>
    ) : (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-oink-100 text-xl">📱</div>
    );
  }
  return size === "sm" ? (
    <span className="h-6 w-6 shrink-0 rounded-md bg-oink-100" aria-hidden />
  ) : (
    <div className="h-12 w-12 shrink-0 rounded-xl bg-oink-100" aria-hidden />
  );
}

function QuoteAttribution({ app, emojiPlaceholder }: { app?: CompetitorSummary; emojiPlaceholder: boolean }) {
  if (!app) return null;
  return (
    <div className="mb-1 flex items-center gap-2 not-italic">
      {app.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.icon} alt="" className="h-6 w-6 shrink-0 rounded-md" />
      ) : (
        <AppIconFallback size="sm" emojiPlaceholder={emojiPlaceholder} />
      )}
      <span className="truncate text-xs font-bold text-ink/70">{app.name}</span>
    </div>
  );
}

function verdictStyle(label: ReportResult["verdict"]["label"], t: Labels) {
  const text = t.verdict[label];
  const base = {
    GO: { color: "bg-emerald-100 text-emerald-700 border-emerald-300", mood: "wow" as const },
    MAYBE: { color: "bg-amber-100 text-amber-700 border-amber-300", mood: "thinking" as const },
    RISKY: { color: "bg-rose-100 text-rose-700 border-rose-300", mood: "sleepy" as const },
  }[label];
  return { ...base, text };
}

function InsightList({
  items,
  tone,
  competitorsById,
  labels,
  emojiPlaceholder,
}: {
  items: Insight[];
  tone: "good" | "bad" | "neutral";
  competitorsById: Map<string, CompetitorSummary>;
  labels: Labels;
  emojiPlaceholder: boolean;
}) {
  const dot = tone === "good" ? "bg-emerald-400" : tone === "bad" ? "bg-rose-400" : "bg-oink-400";
  return (
    <ul className="space-y-4">
      {items.map((it, idx) => (
        <li key={idx} className="rounded-2xl bg-oink-50/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <h4 className="flex items-center gap-2 font-bold">
              <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
              {it.title}
            </h4>
            <span className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-ink/60">
              {labels.mentions(it.mentions.toLocaleString())}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{it.detail}</p>
          {it.quotes.length > 0 && (
            <div className="mt-2 space-y-2">
              {it.quotes.slice(0, 3).map((raw, qi) => {
                const q = normalizeQuote(raw as LegacyQuote);
                const app = q.appId ? competitorsById.get(q.appId) : undefined;
                return (
                  <blockquote key={qi} className="rounded-xl border border-oink-100 bg-white/80 px-3 py-2 text-sm text-ink/60">
                    <QuoteAttribution app={app} emojiPlaceholder={emojiPlaceholder} />
                    <p className="italic">&ldquo;{q.text}&rdquo;</p>
                  </blockquote>
                );
              })}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card min-w-0">
      <h3 className="mb-4 text-lg font-extrabold">{title}</h3>
      {children}
    </section>
  );
}

export function ReportView({
  idea,
  competitors,
  reviewCount,
  result,
  labels,
  pigAria,
  emojiIconPlaceholder = false,
}: {
  idea: string;
  competitors: CompetitorSummary[];
  reviewCount: number;
  result: ReportResult;
  labels: Labels;
  pigAria: string;
  /** サンプルレポート用: アイコン未設定時に 📱 を表示 */
  emojiIconPlaceholder?: boolean;
}) {
  const v = verdictStyle(result.verdict.label, labels);
  const notes = new Map(result.competitorNotes.map((n) => [n.appId, n]));
  const competitorsById = new Map(competitors.map((c) => [c.id, c]));

  const competitorCardClass =
    "min-w-0 max-w-full rounded-2xl border-2 border-oink-100 p-4 [overflow-wrap:anywhere]";
  const competitorCardLinkClass = `${competitorCardClass} transition hover:border-oink-300`;

  return (
    <div className="min-w-0 space-y-6">
      <section className="card overflow-hidden !p-0">
        <div className="flex flex-col items-center gap-6 bg-gradient-to-br from-oink-100 to-white p-6 sm:flex-row sm:p-8">
          <div className="relative shrink-0">
            <Pig size={120} mood={v.mood} magnifier ariaLabel={pigAria} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-ink/50">{labels.yourIdea}</p>
            <p className="mb-3 font-bold">{idea}</p>
            <div className="mb-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <span className={`rounded-full border-2 px-3 py-1 text-sm font-extrabold ${v.color}`}>
                {result.verdict.label} · {v.text}
              </span>
              <span className="text-3xl font-extrabold text-oink-600">
                {result.verdict.score}
                <span className="text-base text-ink/40"> / 100</span>
              </span>
            </div>
            <h2 className="text-xl font-extrabold">{result.verdict.headline}</h2>
          </div>
        </div>
        <div className="space-y-3 p-6 sm:p-8">
          <p className="leading-relaxed">{result.verdict.summary}</p>
          <p className="text-sm leading-relaxed text-ink/70">{result.marketOverview}</p>
          <p className="text-xs text-ink/50">{labels.analyzed(reviewCount.toLocaleString(), competitors.length)}</p>
        </div>
      </section>

      <Section title={labels.competitors}>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          {competitors.map((c) => {
            const n = notes.get(c.id);
            const inner = (
              <>
                <div className="flex min-w-0 items-start gap-3">
                  {c.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.icon} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
                  ) : (
                    <AppIconFallback size="lg" emojiPlaceholder={emojiIconPlaceholder} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-bold leading-snug">{c.name}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink/60 break-words">
                      ★{c.rating} ({c.ratingCount.toLocaleString()}) · {c.price} · {labels.reviewsAnalyzed(c.reviewsAnalyzed)}
                    </p>
                  </div>
                </div>
                {n && (
                  <div className="mt-3 space-y-1 text-xs break-words leading-relaxed">
                    {n.strengths.length > 0 && (
                      <p>
                        <span className="font-bold text-emerald-600">{labels.strengths}</span> {n.strengths.join(" / ")}
                      </p>
                    )}
                    {n.weaknesses.length > 0 && (
                      <p>
                        <span className="font-bold text-rose-600">{labels.weaknesses}</span> {n.weaknesses.join(" / ")}
                      </p>
                    )}
                  </div>
                )}
              </>
            );
            return c.url ? (
              <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className={competitorCardLinkClass}>
                {inner}
              </a>
            ) : (
              <div key={c.id} className={competitorCardClass}>
                {inner}
              </div>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={labels.love}>
          <InsightList
            items={result.whatUsersLove}
            tone="good"
            competitorsById={competitorsById}
            labels={labels}
            emojiPlaceholder={emojiIconPlaceholder}
          />
        </Section>
        <Section title={labels.avoid}>
          <InsightList
            items={result.whatToAvoid}
            tone="bad"
            competitorsById={competitorsById}
            labels={labels}
            emojiPlaceholder={emojiIconPlaceholder}
          />
        </Section>
      </div>

      <Section title={labels.pay}>
        <p className="mb-4 leading-relaxed">{result.willingnessToPay.summary}</p>
        <InsightList
          items={result.willingnessToPay.signals}
          tone="neutral"
          competitorsById={competitorsById}
          labels={labels}
          emojiPlaceholder={emojiIconPlaceholder}
        />
        <div className="mt-4 rounded-2xl border-2 border-dashed border-oink-300 bg-white p-4">
          <p className="text-sm font-bold text-oink-600">{labels.pricingTip}</p>
          <p className="mt-1">{result.willingnessToPay.suggestedPricing}</p>
        </div>
      </Section>

      <Section title={labels.features}>
        <InsightList
          items={result.featureRequests}
          tone="neutral"
          competitorsById={competitorsById}
          labels={labels}
          emojiPlaceholder={emojiIconPlaceholder}
        />
      </Section>

      <Section title={labels.opportunities}>
        <div className="grid gap-3 sm:grid-cols-2">
          {result.opportunities.map((o, idx) => (
            <div key={idx} className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-4">
              <p className="font-bold">{o.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/80">{o.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title={labels.mvp}>
        <ol className="space-y-2">
          {result.mvpPlan.map((m, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-oink-500 text-sm font-bold text-white">
                {idx + 1}
              </span>
              <span className="pt-0.5">{m}</span>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
