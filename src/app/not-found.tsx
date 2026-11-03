import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="ja">
      <body className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-2xl font-extrabold">404</h1>
        <Link href="/jp" className="font-bold text-oink-600">
          /jp
        </Link>
        <Link href="/en" className="font-bold text-oink-600">
          /en
        </Link>
      </body>
    </html>
  );
}
