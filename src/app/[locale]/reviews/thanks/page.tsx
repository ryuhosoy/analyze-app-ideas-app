import { Pig } from "@/components/Pig";
import { L } from "@/components/I18nProvider";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { notFound } from "next/navigation";

export default async function ThanksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDictionary(raw as Locale);
  const t = dict.reviews;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <div className="flex justify-center">
          <Pig size={110} mood="wow" ariaLabel={dict.pigAria} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{t.thanksTitle}</h1>
        <p className="mt-3 text-ink/70">{t.thanksBody}</p>
        <L href="/" className="btn-secondary mt-6">
          {dict.common.backHome}
        </L>
      </div>
    </div>
  );
}
