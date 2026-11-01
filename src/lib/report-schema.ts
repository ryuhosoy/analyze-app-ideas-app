import { z } from "zod";

const InsightQuote = z.object({
  appId: z.string().describe("引用元アプリの id（入力 corpus の app id）"),
  text: z.string().describe("レビューからの短い原文引用（原文のまま）"),
});

const Insight = z.object({
  title: z.string().describe("短い見出し"),
  detail: z.string().describe("2〜3文の説明"),
  mentions: z.number().int().describe("このテーマに該当するおおよそのレビュー数"),
  quotes: z.array(InsightQuote).describe("レビューからの短い原文引用（最大3件、各引用に必ず appId を付ける）"),
});

export const ReportSchema = z.object({
  verdict: z.object({
    score: z.number().int().describe("0〜100のアイデア有望度スコア"),
    label: z.enum(["GO", "MAYBE", "RISKY"]),
    headline: z.string().describe("一言での結論"),
    summary: z.string().describe("3〜5文の総評"),
  }),
  marketOverview: z.string().describe("競合市場の概観（2〜4文）"),
  whatUsersLove: z.array(Insight).describe("ユーザーが気に入っている点（4〜6件）"),
  whatToAvoid: z.array(Insight).describe("不満・避けるべき点（4〜6件）"),
  willingnessToPay: z.object({
    summary: z.string(),
    signals: z.array(Insight).describe("課金・価格に関するシグナル（2〜4件）"),
    suggestedPricing: z.string().describe("推奨する価格戦略"),
  }),
  featureRequests: z.array(Insight).describe("要望の多い機能（3〜6件）"),
  opportunities: z
    .array(z.object({ title: z.string(), detail: z.string() }))
    .describe("参入チャンス・差別化ポイント（3〜5件）"),
  competitorNotes: z
    .array(
      z.object({
        appId: z.string(),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
      }),
    )
    .describe("競合ごとの強み・弱み"),
  mvpPlan: z.array(z.string()).describe("最初に作るべきMVP機能（優先度順に4〜6件）"),
});

export type ReportResult = z.infer<typeof ReportSchema>;

export type CompetitorSummary = {
  id: string;
  name: string;
  seller: string;
  rating: number;
  ratingCount: number;
  price: string;
  icon: string;
  url: string;
  reviewsAnalyzed: number;
};
