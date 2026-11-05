import type { Metadata } from "next";
import { Pig } from "@/components/Pig";
import { BuyCredits } from "@/components/BuyCredits";
import { getUser } from "@/lib/auth";
import { isDemoPayments } from "@/lib/config";
import { L } from "@/components/I18nProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const m = getDictionary(raw).meta.credits;
  return pageMetadata({ locale: raw, path: "/credits", title: m.title, description: m.description });
}

export default async function CreditsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ purchased?: string; canceled?: string; next?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const t = dict.credits;
  const user = await getUser();
  const { purchased, canceled, next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card text-center">
        <div className="flex justify-center">
          <Pig size={110} mood={purchased ? "wow" : "happy"} ariaLabel={dict.pigAria} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{t.title}</h1>
        <p className="mt-2 text-sm text-ink/70">{t.subtitle}</p>
        <p className="text-sm text-ink/70">{t.priceNote}</p>
        {user && (
          <p className="mt-4 rounded-2xl bg-oink-50 p-3 font-bold">
            {t.balance}: <span className="text-oink-600">🪙 {user.credits}</span>
          </p>
        )}
        {purchased && (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            {t.purchased(purchased)}
            <L href={next ?? "/"} className="ml-2 underline">
              {t.createReport}
            </L>
          </div>
        )}
        {canceled && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">{t.canceled}</p>}
        <div className="mt-6">
          <BuyCredits loggedIn={!!user} />
        </div>
        {isDemoPayments() && <p className="mt-4 text-xs text-ink/40">{t.demoNote}</p>}
      </div>
    </div>
  );
}
