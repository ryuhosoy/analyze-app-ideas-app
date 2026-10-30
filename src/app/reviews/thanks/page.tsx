import Link from "next/link";
import { Pig } from "@/components/Pig";

export default function ThanksPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card text-center">
        <div className="flex justify-center"><Pig size={110} mood="wow" /></div>
        <h1 className="mt-3 text-2xl font-extrabold">ご購入ありがとうございます！</h1>
        <p className="mt-3 text-ink/70">ブーちゃんがレビューを集めています。通常1時間以内にメールでスプレッドシートをお届けします。</p>
        <Link href="/" className="btn-secondary mt-6">トップへ戻る</Link>
      </div>
    </div>
  );
}
