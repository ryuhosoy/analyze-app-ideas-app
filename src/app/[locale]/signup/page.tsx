import { Pig } from "@/components/Pig";
import { EmailForm } from "@/components/EmailForm";
import { L } from "@/components/I18nProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { notFound } from "next/navigation";

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDictionary(raw as Locale);
  const a = dict.auth;
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <div className="flex justify-center">
          <Pig size={100} mood="wow" ariaLabel={dict.pigAria} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{a.signupTitle}</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">{a.signupSubtitle}</p>
        <EmailForm next={next} cta={a.signupCta} />
        <p className="mt-6 text-sm text-ink/60">
          {a.hasAccount}{" "}
          <L href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-oink-600">
            {a.loginLink}
          </L>
        </p>
      </div>
    </div>
  );
}
