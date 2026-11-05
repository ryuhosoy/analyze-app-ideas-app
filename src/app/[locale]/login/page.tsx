import type { Metadata } from "next";
import { Pig } from "@/components/Pig";
import { EmailForm } from "@/components/EmailForm";
import { L } from "@/components/I18nProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const m = getDictionary(raw).meta.login;
  return pageMetadata({ locale: raw, path: "/login", title: m.title, description: m.description });
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const a = dict.auth;
  const { next, error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <div className="flex justify-center">
          <Pig size={100} ariaLabel={dict.pigAria} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{a.loginTitle}</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">{a.loginSubtitle}</p>
        {error === "expired" && (
          <p className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-600">{a.expired}</p>
        )}
        <EmailForm next={next} cta={a.loginCta} />
        <p className="mt-6 text-sm text-ink/60">
          {a.noAccount}{" "}
          <L href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-oink-600">
            {a.signupLink}
          </L>
        </p>
      </div>
    </div>
  );
}
