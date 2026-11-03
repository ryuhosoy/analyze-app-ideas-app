import type { CompetitorSummary, ReportResult } from "../report-schema";

export type ExampleReport = {
  slug: string;
  title: string;
  idea: string;
  topCompetitor: string;
  reviewCount: number;
  competitors: CompetitorSummary[];
  result: ReportResult;
};

const comp = (id: string, name: string, rating: number, ratingCount: number, price: string, reviewsAnalyzed: number): CompetitorSummary => ({
  id,
  name,
  seller: "Sample Inc.",
  rating,
  ratingCount,
  price,
  icon: "",
  url: "",
  reviewsAnalyzed,
});

const q = (appId: string, text: string) => ({ appId, text });
const i = (title: string, detail: string, mentions: number, quotes: { appId: string; text: string }[]) => ({
  title,
  detail,
  mentions,
  quotes,
});

// ※ すべて架空のアプリ・架空のレビューによるサンプルです
export const EXAMPLES: ExampleReport[] = [
  {
    slug: "habit-tracker",
    title: "習慣トラッカー",
    idea: "毎日の習慣をワンタップで記録できる、かわいいキャラが励ましてくれる習慣トラッカー",
    topCompetitor: "HabitBloom",
    reviewCount: 1874,
    competitors: [
      comp("ex1", "HabitBloom", 4.7, 152000, "Free", 500),
      comp("ex2", "Streaky Days", 4.5, 48000, "Free", 500),
      comp("ex3", "TinySteps Habit", 4.3, 21000, "$2.99", 474),
      comp("ex4", "Routine Garden", 4.6, 9800, "Free", 400),
    ],
    result: {
      verdict: {
        score: 68,
        label: "MAYBE",
        headline: "需要は大きいが、差別化は「続けやすさ」と「良心的な課金」が鍵",
        summary:
          "習慣トラッカーは人気カテゴリで、ユーザーは明確にお金を払う意思を見せています。一方で上位アプリは機能が似通っており、不満の多くは強引なサブスク誘導と、記録が途切れた時の挫折感に集中しています。ここを解決できれば十分に勝ち目があります。",
      },
      marketOverview:
        "上位4アプリはいずれもストリーク（連続記録）を中心に設計されています。評価は高いものの、最近のレビューでは値上げや無料機能の削減への不満が増えています。",
      whatUsersLove: [
        i("ワンタップの手軽さ", "開いてすぐ記録できるシンプルさが最も評価されています。", 310, [
          q("ex1", "Takes literally two seconds a day."),
          q("ex2", "So simple, that's why I keep using it."),
        ]),
        i("ストリークのモチベーション", "連続日数が伸びることが継続の動機になっています。", 245, [q("ex2", "My 200 day streak keeps me going!")]),
        i("ウィジェット", "ホーム画面から記録できることが習慣化を助けています。", 132, [q("ex1", "The widget is the best part.")]),
      ],
      whatToAvoid: [
        i("強引なサブスク誘導", "起動直後のペイウォールや、無料機能の後からの有料化に強い反発があります。", 288, [
          q("ex1", "Paywall before I could even try it."),
          q("ex2", "They moved basic features behind a subscription."),
        ]),
        i("ストリークが切れた時の挫折", "1日忘れただけでゼロになり、やめてしまうユーザーが多数います。", 176, [q("ex2", "Missed one day and lost 90 days. Deleted.")]),
        i("同期・データ消失", "機種変更やアップデートで記録が消えた報告があります。", 94, [q("ex3", "Lost all my data after the update.")]),
      ],
      willingnessToPay: {
        summary: "買い切りや手頃な年額には好意的ですが、月額の高価格プランには否定的です。",
        signals: [
          i("買い切りを支持", "「一度払えば使い続けられる」形式を求める声が多いです。", 120, [q("ex3", "I'd happily pay $10 once.")]),
          i("年額なら許容", "年額$10〜20程度なら払うという声があります。", 64, [q("ex1", "$15 a year is fair for this.")]),
        ],
        suggestedPricing: "基本機能は無料、テーマや統計を$9.99の買い切り（または年額$14.99）で提供。",
      },
      featureRequests: [
        i("お休み日（ストリーク保護）", "体調不良や旅行の日にストリークを守る機能。", 141, [q("ex2", "Please add skip days!")]),
        i("柔軟なスケジュール", "週3回など、毎日ではない習慣への対応。", 88, [q("ex4", "Not every habit is daily.")]),
        i("Apple Watch対応", "腕から記録したいという要望。", 57, [q("ex1", "Need a watch app.")]),
      ],
      opportunities: [
        { title: "挫折しないストリーク設計", detail: "途切れても励ましてくれるキャラクターと「お休み券」で、離脱の最大要因を解消できます。" },
        { title: "誠実な価格設定", detail: "買い切りオプションを明示するだけで、競合に不満を持つ層を取り込めます。" },
        { title: "キャラクターによる応援", detail: "上位アプリは無機質なUIが多く、愛着の湧くキャラは差別化になります。" },
      ],
      competitorNotes: [
        { appId: "ex1", strengths: ["洗練されたUI", "ウィジェット"], weaknesses: ["強いペイウォール"] },
        { appId: "ex2", strengths: ["ストリーク演出"], weaknesses: ["お休み機能なし"] },
        { appId: "ex3", strengths: ["買い切り"], weaknesses: ["同期の不具合"] },
        { appId: "ex4", strengths: ["育成要素"], weaknesses: ["動作が重い"] },
      ],
      mvpPlan: ["ワンタップ記録＋ウィジェット", "お休み券つきストリーク", "キャラクターの励ましメッセージ", "iCloud同期", "買い切りのプレミアム"],
    },
  },
  {
    slug: "budget-app",
    title: "家計簿アプリ",
    idea: "レシートを撮るだけで支出を記録できる、一人暮らし向けのシンプルな家計簿",
    topCompetitor: "CoinNote",
    reviewCount: 2210,
    competitors: [
      comp("ex1", "CoinNote", 4.6, 98000, "Free", 500),
      comp("ex2", "Receipt Snap", 4.2, 33000, "Free", 500),
      comp("ex3", "Budget Buddy", 4.4, 27000, "Free", 500),
      comp("ex4", "PennyWise Lite", 4.1, 12000, "$4.99", 500),
      comp("ex5", "Simple Spend", 4.5, 6400, "Free", 210),
    ],
    result: {
      verdict: {
        score: 54,
        label: "MAYBE",
        headline: "大きな市場だが、OCR精度で勝てないなら「シンプルさ」で勝負",
        summary:
          "家計簿は競合が多い成熟市場です。レシート読み取りの精度への不満は根強いものの、精度で大手を上回るのは困難です。「入力が3秒で終わる」体験に絞れば、多機能化に疲れたユーザーを狙えます。",
      },
      marketOverview: "上位アプリは銀行連携や資産管理まで機能を広げており、シンプルさを求める層との乖離が見られます。",
      whatUsersLove: [
        i("グラフで支出が見える", "カテゴリ別の円グラフが分かりやすいと好評です。", 260, [q("ex1", "The charts finally made me understand my spending.")]),
        i("入力の速さ", "よく使う項目のテンプレートが評価されています。", 180, [q("ex5", "Logging takes seconds.")]),
      ],
      whatToAvoid: [
        i("OCRの誤認識", "金額や店名の読み取りミスで結局手入力になるという不満。", 340, [q("ex2", "Scanner gets the total wrong half the time.")]),
        i("機能が多すぎる", "アップデートで画面が複雑になったという声。", 150, [q("ex1", "Too cluttered now.")]),
        i("広告が多い", "入力ごとの全画面広告への強い不満。", 132, [q("ex3", "Ad after every entry, no thanks.")]),
      ],
      willingnessToPay: {
        summary: "広告削除とOCR無制限には課金意欲がありますが、月額は敬遠されがちです。",
        signals: [i("広告削除に課金", "広告を消すためなら数ドル払うという声。", 98, [q("ex3", "I'd pay just to remove ads.")])],
        suggestedPricing: "広告なし・OCR月30回まで無料、無制限を$2.99/月 または $19.99/年。",
      },
      featureRequests: [
        i("修正しやすいOCR", "読み取り結果をすぐ直せるUI。", 110, [q("ex2", "Let me fix the scan quickly.")]),
        i("CSV書き出し", "データを持ち出したいという要望。", 64, [q("ex4", "Need CSV export.")]),
      ],
      opportunities: [
        { title: "一人暮らし特化", detail: "家族共有などを省き、自炊・外食・固定費に絞ったUIで差別化。" },
        { title: "広告なしの安心感", detail: "広告への不満が強く、「広告なし」は強い訴求点になります。" },
      ],
      competitorNotes: [
        { appId: "ex1", strengths: ["グラフ"], weaknesses: ["機能過多"] },
        { appId: "ex2", strengths: ["OCR"], weaknesses: ["誤認識"] },
        { appId: "ex3", strengths: ["予算機能"], weaknesses: ["広告"] },
        { appId: "ex4", strengths: ["買い切り"], weaknesses: ["更新停止"] },
        { appId: "ex5", strengths: ["シンプル"], weaknesses: ["グラフが弱い"] },
      ],
      mvpPlan: ["3秒の手入力", "直しやすいレシート読み取り", "月次グラフ", "CSV書き出し"],
    },
  },
  {
    slug: "plant-care",
    title: "植物の水やりアプリ",
    idea: "写真から植物を判定して、水やりのタイミングを通知してくれるアプリ",
    topCompetitor: "LeafPal",
    reviewCount: 1312,
    competitors: [
      comp("ex1", "LeafPal", 4.7, 64000, "Free", 500),
      comp("ex2", "Water Me Daily", 4.4, 18000, "Free", 500),
      comp("ex3", "PlantSnap ID", 4.0, 41000, "Free", 312),
    ],
    result: {
      verdict: {
        score: 74,
        label: "GO",
        headline: "不満が明確で、ユーザーは解決策にお金を払っている",
        summary:
          "上位アプリは高評価ながら、判定精度と高額なサブスクへの不満が多く寄せられています。通知の正確さと手頃な価格で勝負できる余地が大きい市場です。",
      },
      marketOverview: "植物判定と水やり通知を組み合わせたアプリが中心。季節や室内環境を考慮したアドバイスは手薄です。",
      whatUsersLove: [
        i("植物が元気になった", "通知のおかげで枯らさなくなったという声が多数。", 290, [q("ex2", "My plants have never been healthier.")]),
        i("判定の楽しさ", "写真を撮って名前がわかる体験自体が好評です。", 150, [q("ex3", "So fun to identify plants on walks.")]),
      ],
      whatToAvoid: [
        i("通知が環境に合わない", "季節や室内環境を考慮せず、水のやりすぎになるという指摘。", 170, [q("ex2", "Told me to water every 3 days in winter. Root rot.")]),
        i("高額なサブスク", "年額$30以上のプランへの不満。", 210, [q("ex1", "$40 a year for reminders? No.")]),
      ],
      willingnessToPay: {
        summary: "診断機能には払う価値を感じていますが、通知だけには払いたくないという傾向です。",
        signals: [i("病気の診断に価値", "葉の病気を診断できるなら払うという声。", 76, [q("ex1", "Diagnosis feature is worth paying for.")])],
        suggestedPricing: "通知は無料、病気診断を月5回まで無料・無制限を年額$14.99。",
      },
      featureRequests: [
        i("季節に合わせた調整", "冬は通知頻度を自動で減らしてほしい。", 92, [q("ex2", "Adjust for seasons please.")]),
        i("家族と共有", "同居人と水やり担当を分けたい。", 48, [q("ex1", "Let my partner see the schedule.")]),
      ],
      opportunities: [
        { title: "環境に合わせた通知", detail: "季節・日当たり・鉢の大きさを考慮するだけで最大の不満を解決できます。" },
        { title: "手頃な価格", detail: "競合の半額以下でも十分な収益が見込めます。" },
      ],
      competitorNotes: [
        { appId: "ex1", strengths: ["UI", "コミュニティ"], weaknesses: ["高額"] },
        { appId: "ex2", strengths: ["通知のシンプルさ"], weaknesses: ["季節非対応"] },
        { appId: "ex3", strengths: ["判定"], weaknesses: ["精度にばらつき"] },
      ],
      mvpPlan: ["写真で植物判定", "季節を考慮した水やり通知", "水やり記録", "家族共有"],
    },
  },
  {
    slug: "vocab-app",
    title: "英単語アプリ",
    idea: "1日5分、通勤中に使える英単語の暗記アプリ",
    topCompetitor: "WordDash",
    reviewCount: 2405,
    competitors: [
      comp("ex1", "WordDash", 4.8, 210000, "Free", 500),
      comp("ex2", "VocabNest", 4.6, 54000, "Free", 500),
      comp("ex3", "FlashMaster", 4.5, 38000, "Free", 500),
      comp("ex4", "Eigo Pocket", 4.3, 15000, "$3.99", 500),
      comp("ex5", "Daily 10 Words", 4.4, 7200, "Free", 405),
    ],
    result: {
      verdict: {
        score: 41,
        label: "RISKY",
        headline: "超激戦区。明確な対象ユーザーがなければ埋もれる",
        summary:
          "大手が圧倒的なレビュー数を持ち、満足度も高い市場です。不満点（広告、難易度調整）はありますが、大手もすでに対応を進めています。特定の試験や職種に絞るなど、尖ったポジショニングが必須です。",
      },
      marketOverview: "上位アプリはゲーミフィケーションと音声に投資しており、機能面での差別化余地は小さいです。",
      whatUsersLove: [
        i("ゲーム感覚", "ゲームのように続けられる点が最も評価されています。", 420, [q("ex1", "Feels like a game, not studying.")]),
        i("復習のタイミング", "忘れた頃に出題される仕組みが好評。", 180, [q("ex2", "Spaced repetition actually works.")]),
      ],
      whatToAvoid: [
        i("簡単すぎる・難しすぎる", "レベルが合わないという不満。", 150, [q("ex5", "Way too easy even on hard mode.")]),
        i("オフラインで使えない", "通勤中の電波が悪い場所で使えない。", 88, [q("ex2", "Doesn't work on the subway.")]),
      ],
      willingnessToPay: {
        summary: "課金ユーザーは多いものの、すでに大手に払っているため乗り換え動機が必要です。",
        signals: [i("試験対策なら払う", "特定の試験向けなら追加で払うという声。", 70, [q("ex4", "Would pay for a TOEIC-focused deck.")])],
        suggestedPricing: "試験別の単語帳を$4.99ずつの買い切りで販売。",
      },
      featureRequests: [
        i("オフライン対応", "通勤中に使いたい。", 88, [q("ex2", "Offline mode please.")]),
        i("自分で単語を追加", "仕事で使う単語を覚えたい。", 61, [q("ex3", "Let me add my own words.")]),
      ],
      opportunities: [
        { title: "ニッチな試験・職種特化", detail: "医療英語や特定試験など、大手が手薄な分野に絞る。" },
        { title: "完全オフライン", detail: "通勤ユーザーに刺さる明確な訴求点になります。" },
      ],
      competitorNotes: [
        { appId: "ex1", strengths: ["ゲーミフィケーション"], weaknesses: ["広告"] },
        { appId: "ex2", strengths: ["復習アルゴリズム"], weaknesses: ["オンライン必須"] },
        { appId: "ex3", strengths: ["自作カード"], weaknesses: ["UIが古い"] },
        { appId: "ex4", strengths: ["日本語解説"], weaknesses: ["単語数が少ない"] },
        { appId: "ex5", strengths: ["手軽さ"], weaknesses: ["レベル調整なし"] },
      ],
      mvpPlan: ["対象試験を1つに絞った単語帳", "オフライン対応", "間隔反復", "5分で終わるセッション"],
    },
  },
];
