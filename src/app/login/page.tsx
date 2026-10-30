import Link from "next/link";
import { Pig } from "@/components/Pig";
import { EmailForm } from "@/components/EmailForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <div className="flex justify-center"><Pig size={100} /></div>
        <h1 className="mt-3 text-2xl font-extrabold">おかえりなさい！</h1>
        <p className="mb-6 mt-1 text-sm text-ink/60">メールアドレスにログインリンクを送ります。</p>
        {error === "expired" && (
          <p className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-600">リンクの有効期限が切れています。もう一度お試しください。</p>
        )}
        <EmailForm next={next} cta="ログインリンクを送信" />
        <p className="mt-6 text-sm text-ink/60">
          アカウントをお持ちでない方は{" "}
          <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-oink-600">新規登録</Link>
        </p>
      </div>
    </div>
  );
}
