import Link from "next/link";
import { Pig } from "@/components/Pig";
import { EmailForm } from "@/components/EmailForm";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <div className="flex justify-center"><Pig size={100} mood="wow" /></div>
        <h1 className="mt-3 text-2xl font-extrabold">アカウントを作成</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">パスワードは不要。メールに届くリンクからはじめられます。</p>
        <EmailForm next={next} cta="登録リンクを送信" />
        <p className="mt-6 text-sm text-ink/60">
          すでにアカウントをお持ちの方は{" "}
          <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-oink-600">ログイン</Link>
        </p>
      </div>
    </div>
  );
}
