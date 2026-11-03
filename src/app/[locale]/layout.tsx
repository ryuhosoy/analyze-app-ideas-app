import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import { notFound } from "next/navigation";
import { Pig } from "@/components/Pig";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { APP_NAME } from "@/lib/config";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { htmlLang } from "@/i18n/server";
import { I18nProvider, L } from "@/components/I18nProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

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
  const dict = getDictionary(raw);
  return {
    title: `${APP_NAME} — ${dict.meta.title}`,
    description: dict.meta.description,
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
          <header className="sticky top-0 z-20 border-b-2 border-oink-100 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
              <L href="/" className="flex items-center gap-2 text-xl font-extrabold text-oink-600">
                <Pig size={36} ariaLabel={dict.pigAria} />
                {APP_NAME}
              </L>
              <nav className="flex items-center gap-1 text-sm font-bold sm:gap-3">
                <LocaleSwitcher locale={locale} />
                {user ? (
                  <>
                    <L href="/" className="rounded-full px-3 py-1.5 hover:bg-oink-50">
                      {dict.nav.newReport}
                    </L>
                    <L href="/reports" className="rounded-full px-3 py-1.5 hover:bg-oink-50">
                      {dict.nav.reports}
                    </L>
                    <L href="/credits" className="rounded-full bg-oink-50 px-3 py-1.5 text-oink-700 hover:bg-oink-100">
                      🪙 {user.credits}
                    </L>
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <L href="/login" className="rounded-full px-3 py-1.5 hover:bg-oink-50">
                      {dict.nav.login}
                    </L>
                    <L href="/signup" className="btn-primary !px-4 !py-1.5 text-sm">
                      {dict.nav.signup}
                    </L>
                  </>
                )}
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-16 border-t-2 border-oink-100 bg-white">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-ink/70 sm:flex-row">
              <div className="flex items-center gap-2">
                <Pig size={28} mood="sleepy" ariaLabel={dict.pigAria} />
                <span>© 2026 {APP_NAME}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <L href="/reviews" className="hover:text-oink-600">
                  {dict.nav.reviewSheet}
                </L>
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
