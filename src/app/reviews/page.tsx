import { Pig } from "@/components/Pig";
import { ReviewOrderForm } from "@/components/ReviewOrderForm";
import { getUser } from "@/lib/auth";

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ canceled?: string }> }) {
  const user = await getUser();
  const { canceled } = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-6 text-center">
        <div className="flex justify-center"><Pig size={110} mood="wow" /></div>
        <h1 className="mt-3 text-2xl font-extrabold">レビュースプレッドシート</h1>
        <p className="mt-2 text-ink/70">App StoreのURLを貼るだけで、そのアプリの最新レビューをCSVにしてメールでお届けします。</p>
      </div>
      {canceled && <p className="mb-4 rounded-2xl bg-amber-50 p-3 text-center text-sm font-bold text-amber-700">お支払いがキャンセルされました。</p>}
      <ReviewOrderForm defaultEmail={user?.email} />
      <ul className="mt-6 space-y-2 text-sm text-ink/60">
        <li>🐽 通常1時間以内にお届けします</li>
        <li>🐽 iOSのApp Storeのみ対応しています</li>
        <li>🐽 Appleが公開しているのは国ごとの最新レビューのみで、全期間のアーカイブではありません</li>
      </ul>
    </div>
  );
}
