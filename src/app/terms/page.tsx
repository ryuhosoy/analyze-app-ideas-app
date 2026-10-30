import { APP_NAME } from "@/lib/config";

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-12 leading-relaxed">
      <h1 className="text-2xl font-extrabold">利用規約</h1>
      <p>本規約は、{APP_NAME}（以下「本サービス」）の利用条件を定めるものです。</p>
      <h2 className="text-lg font-bold">サービス内容</h2>
      <p>本サービスは、App Storeで公開されているレビューをもとに、AIで分析したレポートを提供します。レポートの内容は参考情報であり、事業上の成果を保証するものではありません。</p>
      <h2 className="text-lg font-bold">料金と返金</h2>
      <p>クレジットは購入後いつでも利用できます。レポートの作成に失敗した場合、消費したクレジットは自動的に返却されます。</p>
      <h2 className="text-lg font-bold">禁止事項</h2>
      <p>法令に違反する行為、本サービスの運営を妨げる行為、不正な手段での利用を禁止します。</p>
      <h2 className="text-lg font-bold">免責</h2>
      <p>Appleが提供するデータの内容・可用性について、本サービスは責任を負いません。</p>
    </article>
  );
}
