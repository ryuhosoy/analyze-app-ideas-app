import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import { getExample, exampleSlugs } from "@/lib/examples";
import { L } from "@/components/I18nProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return exampleSlugs().flatMap((slug) => [{ slug, locale: "jp" }, { slug, locale: "en" }]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const ex = getExample(slug, raw);
  if (!ex) return {};
  const m = getDictionary(raw).meta.example;
  return pageMetadata({
    locale: raw,
    path: `/examples/${slug}`,
    title: m.title(ex.title),
    description: m.description(ex.title),
  });
}

export default async function ExamplePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const ex = getExample(slug, locale);
  if (!ex) notFound();
  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10">
      <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-center text-sm font-bold text-amber-700">{dict.example.banner}</div>
      <ReportView
        idea={ex.idea}
        competitors={ex.competitors}
        reviewCount={ex.reviewCount}
        result={ex.result}
        labels={dict.reportView}
        pigAria={dict.pigAria}
        emojiIconPlaceholder
      />
      <div className="mt-8 text-center">
        <L href="/#new-report" className="btn-primary text-lg">
          {dict.example.tryYours}
        </L>
      </div>
    </div>
  );
}
