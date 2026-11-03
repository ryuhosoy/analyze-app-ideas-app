import { Pig } from "@/components/Pig";
import { SupportForm } from "@/components/SupportForm";
import { getUser } from "@/lib/auth";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { notFound } from "next/navigation";

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = getDictionary(raw as Locale);
  const user = await getUser();
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-6 text-center">
        <div className="flex justify-center">
          <Pig size={100} ariaLabel={dict.pigAria} />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">{dict.support.title}</h1>
        <p className="mt-2 text-ink/70">{dict.support.subtitle}</p>
      </div>
      <SupportForm loggedInEmail={user?.email} />
    </div>
  );
}
