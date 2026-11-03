import { Pig } from "@/components/Pig";
import { ReviewOrderForm } from "@/components/ReviewOrderForm";
import { getUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { notFound } from "next/navigation";

export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ canceled?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDictionary(raw as Locale);
  const t = dict.reviews;
  const user = await getUser();
  const { canceled } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-6 text-center">
        <div className="flex justify-center">
          <Pig size={110} mood="wow" ariaLabel={dict.pigAria} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{t.title}</h1>
        <p className="mt-2 text-ink/70">{t.subtitle}</p>
      </div>
      {canceled && <p className="mb-4 rounded-2xl bg-amber-50 p-3 text-center text-sm font-bold text-amber-700">{t.canceled}</p>}
      <ReviewOrderForm defaultEmail={user?.email} />
      <ul className="mt-6 space-y-2 text-sm text-ink/60">
        {t.notes.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
