import Link from "next/link";
import { Pig } from "@/components/Pig";
import { BuyCredits } from "@/components/BuyCredits";
import { getUser } from "@/lib/auth";
import { isDemoPayments } from "@/lib/config";

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ purchased?: string; canceled?: string; next?: string }>;
}) {
  const user = await getUser();
  const { purchased, canceled, next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card text-center">
        <div className="flex justify-center"><Pig size={110} mood={purchased ? "wow" : "happy"} /></div>
        <h1 className="mt-3 text-2xl font-extrabold">レポートクレジットを購入</h1>
        <p className="mt-2 text-sm text-ink/70">1クレジットで競合分析レポートを1件作成できます。</p>
        <p className="text-sm text-ink/70">1レポート $5.99・いつでも使える・サブスクなし</p>
        {user && (
          <p className="mt-4 rounded-2xl bg-oink-50 p-3 font-bold">
            現在のクレジット: <span className="text-oink-600">🪙 {user.credits}</span>
          </p>
        )}
        {purchased && (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            🎉 {purchased}クレジットを追加しました！
            <Link href={next ?? "/"} className="ml-2 underline">レポートを作成する →</Link>
          </div>
        )}
        {canceled && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-700">お支払いがキャンセルされました。</p>}
        <div className="mt-6">
          <BuyCredits loggedIn={!!user} />
        </div>
        {isDemoPayments() && (
          <p className="mt-4 text-xs text-ink/40">※ 開発モード: Stripe未設定のため、決済なしでクレジットが付与されます</p>
        )}
      </div>
    </div>
  );
}
