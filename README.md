# 🐷 OinkCheck

アプリを作る**前に**、そのアイデアを検証するWebアプリ。
メインキャラクターの探偵ブタ「ブーちゃん」が、競合アプリのApp Storeレビューを読み込んでレポートにまとめます。

## 機能

- **競合分析レポート（$5.99 / 1クレジット）** — アイデアを1文で入力 → Claudeが検索キーワードを考える → App Storeで競合を探して上位5件を選ぶ → 各アプリの最新レビュー（1アプリ最大500件）を取得 → テーマ別に分析
  - 結論スコア（GO / MAYBE / RISKY）、ユーザーが好きな点、避けるべき点、課金ポイント、要望の多い機能、参入チャンス、MVPの提案
  - 失敗したらクレジットを自動で返す
- **レビュースプレッドシート（$0.99）** — App StoreのURLとメールアドレスを入力 → 最新レビューをCSV（Excelで文字化けしないBOM付き）でメール送信。ログイン不要
- **マジックリンク認証**（パスワードなし。リンクは15分有効・1回だけ使える）
- **クレジット購入**（Stripe Checkout。1〜20個まとめ買い、サブスクなし）
- **サンプルレポート4件**（架空データ）、レポート一覧、サポートフォーム（240文字まで）、プライバシーポリシー、利用規約

## セットアップ

```bash
cp .env.example .env.local   # ANTHROPIC_API_KEY を設定
npm install
npm run dev
```

Node.js 22.5以上が必要です（DBにNode内蔵の `node:sqlite` を使っています）。

### 開発モード

- `STRIPE_SECRET_KEY` が未設定 → 決済をスキップして、クレジットやスプレッドシートをすぐ付与
- `SMTP_HOST` が未設定 → ログインリンクやメール本文をサーバーのコンソールに出力

### 本番

- Stripe Webhook: `POST /api/stripe/webhook`（`checkout.session.completed`）。決済後のリダイレクトでも反映するので、Webhookが遅れても二重付与にはなりません
- レポート生成はサーバープロセス内のバックグラウンドで動くため、`next start` などの常駐Nodeサーバーで動かしてください（サーバーレスでは途中で止まります）

## 構成

| パス | 内容 |
| --- | --- |
| `src/lib/analyze.ts` | レポート生成パイプライン（Claude `claude-opus-5-5`、構造化出力） |
| `src/lib/appstore.ts` | iTunes Search API / レビューRSS / CSV生成 |
| `src/lib/auth.ts` | マジックリンクとセッション |
| `src/lib/payments.ts` | Stripe Checkout と、二重付与しない付与処理 |
| `src/components/Pig.tsx` | ブーちゃん（SVG、表情4種＋虫めがね） |
