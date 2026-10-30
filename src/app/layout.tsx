import type { Metadata } from "next";
import Link from "next/link";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";
import { Pig } from "@/components/Pig";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { APP_NAME } from "@/lib/config";

const rounded = M_PLUS_Rounded_1c({
  variable: "--font-rounded",
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_NAME} — 作る前にアプリのアイデアを検証しよう`,
  description: "競合アプリのApp Storeレビューを分析して、あなたのアプリのアイデアを作る前に検証します。",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getUser();
  return (
    <html lang="ja">
      <body className={`${rounded.variable} antialiased min-h-screen flex flex-col`}>
        <header className="sticky top-0 z-20 border-b-2 border-oink-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-oink-600">
              <Pig size={36} />
              {APP_NAME}
            </Link>
            <nav className="flex items-center gap-1 text-sm font-bold sm:gap-3">
              {user ? (
                <>
                  <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-oink-50">新規レポート</Link>
                  <Link href="/reports" className="rounded-full px-3 py-1.5 hover:bg-oink-50">レポート</Link>
                  <Link href="/credits" className="rounded-full bg-oink-50 px-3 py-1.5 text-oink-700 hover:bg-oink-100">
                    🪙 {user.credits}
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="rounded-full px-3 py-1.5 hover:bg-oink-50">ログイン</Link>
                  <Link href="/signup" className="btn-primary !px-4 !py-1.5 text-sm">はじめる</Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t-2 border-oink-100 bg-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-ink/70 sm:flex-row">
            <div className="flex items-center gap-2">
              <Pig size={28} mood="sleepy" />
              <span>© 2026 {APP_NAME}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/reviews" className="hover:text-oink-600">レビュースプレッドシート</Link>
              <Link href="/support" className="hover:text-oink-600">サポート</Link>
              <Link href="/privacy" className="hover:text-oink-600">プライバシーポリシー</Link>
              <Link href="/terms" className="hover:text-oink-600">利用規約</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
