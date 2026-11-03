import { Pig } from "@/components/Pig";
import { IdeaForm } from "@/components/IdeaForm";
import { getUser } from "@/lib/auth";
import { getExamples } from "@/lib/examples";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { L } from "@/components/I18nProvider";
import { notFound } from "next/navigation";

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ idea?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const h = dict.home;
  const user = await getUser();
  const { idea } = await searchParams;
  const examples = getExamples(locale);

  return (
    <div>
      <section className="bg-gradient-to-b from-oink-100 to-background">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 md:grid-cols-[1fr_1.1fr] md:py-16">
          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              <Pig size={150} mood="happy" magnifier ariaLabel={dict.pigAria} />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              {locale === "jp" ? (
                <>
                  {h.h1Before}
                  <span className="text-oink-500">{h.h1Highlight}</span>、<br />
                  {h.h1After}
                </>
              ) : (
                <>
                  {h.h1Before} <span className="text-oink-500">{h.h1Highlight}</span> {h.h1After}
                </>
              )}
            </h1>
            <p className="mt-4 leading-relaxed text-ink/70">{h.hero}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <a href="#examples" className="btn-secondary">
                {h.seeSamples}
              </a>
              <a href="#pricing" className="btn-secondary">
                {h.seePricing}
              </a>
            </div>
          </div>
          <div id="new-report">
            {user && <p className="mb-2 text-sm font-bold text-oink-600">{h.newReportBadge}</p>}
            <IdeaForm loggedIn={!!user} credits={user?.credits ?? 0} initialIdea={idea ?? ""} />
          </div>
        </div>
      </section>

      <section id="examples" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
        <div className="mb-6 flex items-center gap-3">
          <Pig size={48} mood="wow" ariaLabel={dict.pigAria} />
          <h2 className="text-2xl font-extrabold">{h.samplesTitle}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {examples.map((ex) => (
            <L key={ex.slug} href={`/examples/${ex.slug}`} className="card transition hover:-translate-y-1 hover:border-oink-300">
              <p className="font-extrabold">{ex.title}</p>
              <p className="mt-1 text-sm text-ink/60">
                {h.topCompetitor}: {ex.topCompetitor}
              </p>
              <p className="mt-3 text-sm font-bold text-oink-600">{h.viewReport}</p>
            </L>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink/50">{h.samplesDisclaimer}</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-center text-2xl font-extrabold">{h.stepsTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {h.steps.map((s, idx) => (
            <div key={idx} className="card text-center">
              <div className="flex justify-center">
                <Pig size={90} mood={idx === 0 ? "happy" : idx === 1 ? "thinking" : "wow"} magnifier={idx === 1} ariaLabel={dict.pigAria} />
              </div>
              <p className="mt-3 text-sm font-extrabold text-oink-500">STEP {idx + 1}</p>
              <p className="text-lg font-extrabold">{s.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
        <h2 className="mb-6 text-center text-2xl font-extrabold">{h.pricingTitle}</h2>
        <div className="card mx-auto max-w-md border-oink-300 text-center">
          <p className="font-bold text-oink-600">{h.reportProduct}</p>
          <p className="my-3 text-5xl font-extrabold">$5.99</p>
          <p className="text-sm text-ink/60">{h.reportPriceNote}</p>
          <ul className="my-5 space-y-1.5 text-left text-sm">
            {h.reportFeatures.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <L href="/credits" className="btn-primary w-full">
            {h.buyReport}
          </L>
        </div>
      </section>
    </div>
  );
}
