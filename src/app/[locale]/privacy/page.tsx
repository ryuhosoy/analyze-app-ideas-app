import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const m = getDictionary(raw).meta.privacy;
  return pageMetadata({ locale: raw, path: "/privacy", title: m.title, description: m.description });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const p = getDictionary(raw as Locale).privacy;
  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-12 leading-relaxed">
      <h1 className="text-2xl font-extrabold">{p.title}</h1>
      <p>{p.intro(APP_NAME)}</p>
      <h2 className="text-lg font-bold">{p.h1}</h2>
      <p>{p.p1}</p>
      <h2 className="text-lg font-bold">{p.h2}</h2>
      <p>{p.p2}</p>
      <h2 className="text-lg font-bold">{p.h3}</h2>
      <p>{p.p3}</p>
      <h2 className="text-lg font-bold">{p.h4}</h2>
      <p>{p.p4}</p>
    </article>
  );
}
