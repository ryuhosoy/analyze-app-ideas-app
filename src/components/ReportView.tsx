import type { CompetitorSummary, ReportResult } from "@/lib/report-schema";
import { Pig } from "./Pig";

type Insight = ReportResult["whatUsersLove"][number];
type LegacyQuote = string | { appId: string; text: string };

function normalizeQuote(q: LegacyQuote): { appId?: string; text: string } {
  return typeof q === "string" ? { text: q } : q;
}

function QuoteAttribution({ app }: { app?: CompetitorSummary }) {
  if (!app) return null;
  return (
    <div className="mb-1 flex items-center gap-2 not-italic">
      {app.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.icon} alt="" className="h-6 w-6 shrink-0 rounded-md" />
      ) : (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-oink-100 text-xs">📱</span>
      )}
      <span className="truncate text-xs font-bold text-ink/70">{app.name}</span>
    </div>
  );
}

const VERDICT_STYLE = {
  GO: { text: "作ってOK！", color: "bg-emerald-100 text-emerald-700 border-emerald-300", mood: "wow" as const },
  MAYBE: { text: "工夫次第", color: "bg-amber-100 text-amber-700 border-amber-300", mood: "thinking" as const },
  RISKY: { text: "慎重に", color: "bg-rose-100 text-rose-700 border-rose-300", mood: "sleepy" as const },
};

function InsightList({
  items,
  tone,
  competitorsById,
}: {
  items: Insight[];
  tone: "good" | "bad" | "neutral";
  competitorsById: Map<string, CompetitorSummary>;
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
              約{it.mentions.toLocaleString()}件
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
                    <QuoteAttribution app={app} />
                    <p className="italic">“{q.text}”</p>
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

function Section({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
        <span className="text-2xl">{emoji}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ReportView({
  idea,
  competitors,
  reviewCount,
  result,
}: {
  idea: string;
  competitors: CompetitorSummary[];
  reviewCount: number;
  result: ReportResult;
}) {
  const v = VERDICT_STYLE[result.verdict.label];
  const notes = new Map(result.competitorNotes.map((n) => [n.appId, n]));
  const competitorsById = new Map(competitors.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden !p-0">
        <div className="flex flex-col items-center gap-6 bg-gradient-to-br from-oink-100 to-white p-6 sm:flex-row sm:p-8">
          <div className="relative shrink-0">
            <Pig size={120} mood={v.mood} magnifier />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-ink/50">あなたのアイデア</p>
            <p className="mb-3 font-bold">{idea}</p>
            <div className="mb-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <span className={`rounded-full border-2 px-3 py-1 text-sm font-extrabold ${v.color}`}>
                {result.verdict.label}・{v.text}
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
          <p className="text-xs text-ink/50">
            分析したレビュー: {reviewCount.toLocaleString()}件 ・ 競合アプリ: {competitors.length}件
          </p>
        </div>
      </section>

      <Section emoji="🏁" title="競合アプリ">
        <div className="grid gap-3 sm:grid-cols-2">
          {competitors.map((c) => {
            const n = notes.get(c.id);
            const inner = (
              <>
                <div className="flex items-center gap-3">
                  {c.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.icon} alt="" className="h-12 w-12 rounded-xl" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-oink-100 text-xl">📱</div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-bold">{c.name}</p>
                    <p className="text-xs text-ink/60">
                      ★{c.rating} ({c.ratingCount.toLocaleString()}) ・ {c.price} ・ レビュー{c.reviewsAnalyzed}件を分析
                    </p>
                  </div>
                </div>
                {n && (
                  <div className="mt-3 space-y-1 text-xs">
                    {n.strengths.length > 0 && <p><span className="font-bold text-emerald-600">強み:</span> {n.strengths.join(" / ")}</p>}
                    {n.weaknesses.length > 0 && <p><span className="font-bold text-rose-600">弱み:</span> {n.weaknesses.join(" / ")}</p>}
                  </div>
                )}
              </>
            );
            return c.url ? (
              <a key={c.id} href={c.url} target="_blank" rel="noreferrer" className="rounded-2xl border-2 border-oink-100 p-4 transition hover:border-oink-300">
                {inner}
              </a>
            ) : (
              <div key={c.id} className="rounded-2xl border-2 border-oink-100 p-4">{inner}</div>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section emoji="💖" title="ユーザーが気に入っている点">
          <InsightList items={result.whatUsersLove} tone="good" competitorsById={competitorsById} />
        </Section>
        <Section emoji="⚠️" title="避けるべき点">
          <InsightList items={result.whatToAvoid} tone="bad" competitorsById={competitorsById} />
        </Section>
      </div>

      <Section emoji="🐷💰" title="お金を払ってくれるポイント">
        <p className="mb-4 leading-relaxed">{result.willingnessToPay.summary}</p>
        <InsightList items={result.willingnessToPay.signals} tone="neutral" competitorsById={competitorsById} />
        <div className="mt-4 rounded-2xl border-2 border-dashed border-oink-300 bg-white p-4">
          <p className="text-sm font-bold text-oink-600">💡 おすすめの価格戦略</p>
          <p className="mt-1">{result.willingnessToPay.suggestedPricing}</p>
        </div>
      </Section>

      <Section emoji="🙋" title="要望の多い機能">
        <InsightList items={result.featureRequests} tone="neutral" competitorsById={competitorsById} />
      </Section>

      <Section emoji="🌱" title="参入チャンス">
        <div className="grid gap-3 sm:grid-cols-2">
          {result.opportunities.map((o, idx) => (
            <div key={idx} className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-4">
              <p className="font-bold">{o.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/80">{o.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section emoji="🛠️" title="最初に作るべきMVP">
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
