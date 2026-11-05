import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const m = getDictionary(raw).meta.terms;
  return pageMetadata({ locale: raw, path: "/terms", title: m.title, description: m.description });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const t = getDictionary(raw as Locale).terms;
  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-12 leading-relaxed">
      <h1 className="text-2xl font-extrabold">{t.title}</h1>
      <p>{t.intro(APP_NAME)}</p>
      <h2 className="text-lg font-bold">{t.h1}</h2>
      <p>{t.p1}</p>
      <h2 className="text-lg font-bold">{t.h2}</h2>
      <p>{t.p2}</p>
      <h2 className="text-lg font-bold">{t.h3}</h2>
      <p>{t.p3}</p>
      <h2 className="text-lg font-bold">{t.h4}</h2>
      <p>{t.p4}</p>
    </article>
  );
}
