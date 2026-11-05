import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import { notFound } from "next/navigation";
import { Pig } from "@/components/Pig";
import { getUser } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { APP_NAME, appUrl } from "@/lib/config";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { htmlLang } from "@/i18n/server";
import { I18nProvider, L } from "@/components/I18nProvider";
import { localeAlternates } from "@/lib/seo";

const rounded = M_PLUS_Rounded_1c({
  variable: "--font-rounded",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return [{ locale: "jp" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const title = `${APP_NAME} — ${dict.meta.title}`;
  const description = dict.meta.description;

  return {
    metadataBase: new URL(appUrl()),
    title: {
      default: title,
      template: `%s | ${APP_NAME}`,
    },
    description,
    applicationName: APP_NAME,
    alternates: localeAlternates(locale),
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      locale: locale === "en" ? "en_US" : "ja_JP",
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const user = await getUser();

  return (
    <html lang={htmlLang(locale)}>
      <body className={`${rounded.variable} antialiased min-h-screen flex flex-col`}>
        <I18nProvider locale={locale}>
          <SiteHeader loggedIn={!!user} credits={user?.credits ?? 0} />
          <main className="flex-1">{children}</main>
          <footer className="mt-16 border-t-2 border-oink-100 bg-white">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-ink/70 sm:flex-row">
              <div className="flex items-center gap-2">
                <Pig size={28} mood="sleepy" ariaLabel={dict.pigAria} />
                <span>© 2026 {APP_NAME}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <L href="/support" className="hover:text-oink-600">
                  {dict.nav.support}
                </L>
                <L href="/privacy" className="hover:text-oink-600">
                  {dict.nav.privacy}
                </L>
                <L href="/terms" className="hover:text-oink-600">
                  {dict.nav.terms}
                </L>
              </div>
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
