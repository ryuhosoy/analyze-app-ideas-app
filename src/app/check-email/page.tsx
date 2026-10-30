import Link from "next/link";
import { Pig } from "@/components/Pig";

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; next?: string }> }) {
  const { email, next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <div className="flex justify-center"><Pig size={110} mood="wow" /></div>
        <h1 className="mt-3 text-2xl font-extrabold">メールを確認してください 💌</h1>
        <p className="mt-3 text-ink/70">
          {email ? <><span className="font-bold">{email}</span> に</> : null}
          ログインリンクを送りました。リンクは15分間有効です。
        </p>
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="mt-6 inline-block text-sm font-bold text-oink-600">
          別のメールアドレスを使う
        </Link>
      </div>
    </div>
  );
}
