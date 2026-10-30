import { APP_NAME } from "@/lib/config";

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-12 leading-relaxed">
      <h1 className="text-2xl font-extrabold">プライバシーポリシー</h1>
      <p>{APP_NAME}（以下「本サービス」）は、以下の方針で個人情報を取り扱います。</p>
      <h2 className="text-lg font-bold">取得する情報</h2>
      <p>メールアドレス、入力されたアプリのアイデア、サポートへのお問い合わせ内容、決済に関する情報（決済処理はStripeが行い、カード情報は本サービスでは保持しません）。</p>
      <h2 className="text-lg font-bold">利用目的</h2>
      <p>ログイン、レポートの作成と提供、スプレッドシートの送付、お問い合わせへの対応、サービス改善のために利用します。</p>
      <h2 className="text-lg font-bold">第三者への提供</h2>
      <p>レポート作成のため、入力されたアイデアと公開レビューをAIサービス（Anthropic）に送信します。法令に基づく場合を除き、その他の第三者には提供しません。</p>
      <h2 className="text-lg font-bold">お問い合わせ</h2>
      <p>サポートページからご連絡ください。</p>
    </article>
  );
}
