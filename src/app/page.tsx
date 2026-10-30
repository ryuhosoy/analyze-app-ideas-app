import Link from "next/link";
import { Pig } from "@/components/Pig";
import { IdeaForm } from "@/components/IdeaForm";
import { getUser } from "@/lib/auth";
import { EXAMPLES } from "@/lib/examples";

export default async function Home({ searchParams }: { searchParams: Promise<{ idea?: string }> }) {
  const user = await getUser();
  const { idea } = await searchParams;

  return (
    <div>
      {/* ヒーロー */}
      <section className="bg-gradient-to-b from-oink-100 to-background">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 md:grid-cols-[1fr_1.1fr] md:py-16">
          <div className="text-center md:text-left">
            <div className="mb-4 flex justify-center md:justify-start">
              <Pig size={150} mood="happy" magnifier />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              アプリを作る<span className="text-oink-500">前に</span>、<br />
              そのアイデアを検証しよう
            </h1>
            <p className="mt-4 leading-relaxed text-ink/70">
              探偵の<span className="font-bold text-oink-600">ブーちゃん</span>が、競合アプリの何千件ものApp Storeレビューを読み込んで、
              ユーザーが好きなこと・嫌いなこと・お金を払うポイントをレポートにまとめます。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <a href="#examples" className="btn-secondary">サンプルを見る</a>
              <a href="#pricing" className="btn-secondary">料金を見る</a>
            </div>
          </div>
          <div id="new-report">
            {user && <p className="mb-2 text-sm font-bold text-oink-600">✨ 新規レポート</p>}
            <IdeaForm loggedIn={!!user} credits={user?.credits ?? 0} initialIdea={idea ?? ""} />
          </div>
        </div>
      </section>

      {/* サンプルレポート */}
      <section id="examples" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
        <div className="mb-6 flex items-center gap-3">
          <Pig size={48} mood="wow" />
          <h2 className="text-2xl font-extrabold">サンプルレポートを見る</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXAMPLES.map((ex) => (
            <Link key={ex.slug} href={`/examples/${ex.slug}`} className="card transition hover:-translate-y-1 hover:border-oink-300">
              <p className="text-4xl">{ex.emoji}</p>
              <p className="mt-3 font-extrabold">{ex.title}</p>
              <p className="mt-1 text-sm text-ink/60">トップ競合: {ex.topCompetitor}</p>
              <p className="mt-3 text-sm font-bold text-oink-600">レポートを見る →</p>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink/50">※サンプルは架空のアプリ・レビューで作成したものです。</p>
      </section>

      {/* 使い方 */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-center text-2xl font-extrabold">使い方はかんたん3ステップ</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: 1, mood: "happy" as const, t: "アイデアを書く", d: "1文で十分です。それをもとにApp Storeで最適な競合アプリを探します。" },
            { n: 2, mood: "thinking" as const, t: "レビューを分析", d: "上位競合アプリの実際のユーザーレビュー数千件を、テーマとインサイトにクラスタリングします。" },
            { n: 3, mood: "wow" as const, t: "レポートを受け取る", d: "ユーザーが好きなこと、避けるべきこと、お金を払うポイント、そして参入チャンスがわかります。" },
          ].map((s) => (
            <div key={s.n} className="card text-center">
              <div className="flex justify-center">
                <Pig size={90} mood={s.mood} magnifier={s.n === 2} />
              </div>
              <p className="mt-3 text-sm font-extrabold text-oink-500">STEP {s.n}</p>
              <p className="text-lg font-extrabold">{s.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 料金 */}
      <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
        <h2 className="mb-6 text-center text-2xl font-extrabold">料金</h2>
        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          <div className="card border-oink-300 text-center">
            <p className="font-bold text-oink-600">競合分析レポート</p>
            <p className="my-3 text-5xl font-extrabold">$5.99</p>
            <p className="text-sm text-ink/60">1レポートごとのお支払い・いつでも使える・サブスクなし</p>
            <ul className="my-5 space-y-1.5 text-left text-sm">
              <li>🐽 上位競合アプリを自動で発見</li>
              <li>🐽 数千件の実レビューを分析</li>
              <li>🐽 好き・嫌い・課金ポイント・チャンス</li>
              <li>🐽 MVPで作るべき機能の提案</li>
            </ul>
            <Link href="/credits" className="btn-primary w-full">レポートを購入（$5.99）</Link>
          </div>
          <div className="card text-center">
            <p className="font-bold text-oink-600">レビュースプレッドシート</p>
            <p className="my-3 text-5xl font-extrabold">$0.99</p>
            <p className="text-sm text-ink/60">好きなアプリの最新レビューをCSVでメールにお届け</p>
            <ul className="my-5 space-y-1.5 text-left text-sm">
              <li>🐽 App StoreのURLを貼るだけ</li>
              <li>🐽 通常1時間以内にお届け</li>
              <li>🐽 Excel・スプレッドシートで開ける</li>
              <li>🐽 アカウント登録不要</li>
            </ul>
            <Link href="/reviews" className="btn-secondary w-full">スプレッドシートを入手</Link>
          </div>
        </div>
      </section>

      {/* スプレッドシート訴求 */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="card flex flex-col items-center gap-6 bg-gradient-to-r from-oink-50 to-white md:flex-row">
          <Pig size={110} mood="wow" />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-extrabold">レビューの生データがほしい？</h3>
            <p className="mt-1 text-ink/70">App StoreのURLを貼るだけで、そのアプリの最新レビューをスプレッドシートでお届けします。たった$0.99。</p>
          </div>
          <Link href="/reviews" className="btn-primary shrink-0">レビュースプレッドシート →</Link>
        </div>
      </section>
    </div>
  );
}
