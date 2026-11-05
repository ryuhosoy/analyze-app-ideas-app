import type { Metadata } from "next";
import { Pig } from "@/components/Pig";
import { L } from "@/components/I18nProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = getDictionary(raw);
  return pageMetadata({
    locale: raw,
    path: "/check-email",
    title: dict.auth.checkEmailTitle,
    description: dict.meta.description,
    index: false,
  });
}

export default async function CheckEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDictionary(raw as Locale);
  const a = dict.auth;
  const { email, next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <div className="flex justify-center">
          <Pig size={110} mood="wow" ariaLabel={dict.pigAria} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{a.checkEmailTitle}</h1>
        <p className="mt-3 text-ink/70">
          {email ? (
            <>
              <span className="font-bold">{email}</span> {a.checkEmailSentTo}{" "}
            </>
          ) : null}
          {a.checkEmailBody}
        </p>
        <L href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="mt-6 inline-block text-sm font-bold text-oink-600">
          {a.checkEmailOther}
        </L>
      </div>
    </div>
  );
}
