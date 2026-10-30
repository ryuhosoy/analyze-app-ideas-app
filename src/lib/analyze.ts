import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { db } from "./db";
import { fetchReviews, searchApps, type AppInfo, type Review } from "./appstore";
import { ReportSchema, type CompetitorSummary, type ReportResult } from "./report-schema";

const MODEL = "claude-opus-5-5";
const MAX_COMPETITORS = 5;

const client = new Anthropic();

/** ユーザーにそのまま見せてよいエラー */
class UserFacingError extends Error {}

/** 構造化出力＋拒否時のサーバー側フォールバックつきで呼び出す */
async function ask<T extends z.ZodType>(opts: {
  system: string;
  prompt: string;
  schema: T;
  effort: "low" | "medium" | "high";
  maxTokens: number;
}): Promise<z.infer<T>> {
  const message = await client.beta.messages
    .stream({
      model: MODEL,
      max_tokens: opts.maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: opts.effort, format: betaZodOutputFormat(opts.schema) },
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    })
    .finalMessage();

  if (message.stop_reason === "refusal") throw new UserFacingError("AIがこのリクエストの処理を辞退しました");
  if (message.stop_reason === "max_tokens") throw new UserFacingError("AIの出力が長すぎて途中で切れました");
  if (!message.parsed_output) throw new UserFacingError("AIの出力を解析できませんでした");
  return message.parsed_output as z.infer<T>;
}

function setProgress(reportId: string, progress: string) {
  db.prepare("UPDATE reports SET progress = ? WHERE id = ?").run(progress, reportId);
}

async function findCompetitors(idea: string, country: string, reportId: string): Promise<AppInfo[]> {
  setProgress(reportId, "ブーちゃんが検索キーワードを考えています…");
  const { keywords } = await ask({
    system: "You are an App Store market researcher.",
    prompt: `次のアプリのアイデアについて、App Store（国コード: ${country}）で直接の競合アプリを見つけるための検索キーワードを3〜5個考えてください。そのストアの主要言語で、ユーザーが実際に検索しそうな短い語句にしてください。\n\nアイデア: ${idea}`,
    schema: z.object({ keywords: z.array(z.string()) }),
    effort: "low",
    maxTokens: 4000,
  });

  setProgress(reportId, "App Storeで競合アプリを探しています…");
  const found = new Map<string, AppInfo>();
  for (const kw of keywords.slice(0, 5)) {
    for (const app of await searchApps(kw, country, 12)) found.set(app.id, app);
  }
  if (found.size === 0) throw new UserFacingError("App Storeで競合アプリが見つかりませんでした。アイデアの表現を変えてお試しください。");

  setProgress(reportId, "本当に競合といえるアプリを選んでいます…");
  const candidates = [...found.values()].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 30);
  const { appIds } = await ask({
    system: "You are an App Store market researcher.",
    prompt: `アプリのアイデア: ${idea}\n\n以下の候補から、このアイデアと同じ課題を解決する直接の競合アプリを最大${MAX_COMPETITORS}個、重要度の高い順に選んでください（レビュー数が多く、機能が近いものを優先）。該当がなければ最も近いものを選んでください。\n\n${candidates
      .map((a) => `- id=${a.id} | ${a.name} | ${a.genre} | ★${a.rating} (${a.ratingCount}件) | ${a.description.replace(/\s+/g, " ").slice(0, 200)}`)
      .join("\n")}`,
    schema: z.object({ appIds: z.array(z.string()) }),
    effort: "low",
    maxTokens: 4000,
  });
  const picked = appIds.map((id) => found.get(id)).filter((a): a is AppInfo => !!a);
  return (picked.length ? picked : candidates).slice(0, MAX_COMPETITORS);
}

async function analyzeReviews(idea: string, apps: AppInfo[], reviewsByApp: Map<string, Review[]>): Promise<ReportResult> {
  const corpus = apps
    .map((app) => {
      const reviews = reviewsByApp.get(app.id) ?? [];
      const lines = reviews.map((r) => `[${r.rating}★] ${r.title} — ${r.content.replace(/\s+/g, " ")}`);
      return `<app id="${app.id}" name="${app.name}" rating="${app.rating}" ratings="${app.ratingCount}" price="${app.price}">\n${lines.join("\n")}\n</app>`;
    })
    .join("\n\n");

  return ask({
    system:
      "あなたはモバイルアプリのプロダクトリサーチャーです。競合アプリの実際のApp Storeレビューを分析し、個人開発者が「このアプリを作るべきか」を判断できるレポートを日本語で作成します。主張は必ずレビューの内容に基づかせ、引用はレビュー原文からそのまま抜き出してください（翻訳しない）。mentionsはおおよその件数で構いません。",
    prompt: `作ろうとしているアプリのアイデア:\n${idea}\n\n以下は競合アプリの最新レビューです。\n\n${corpus}\n\nこれらのレビューをテーマごとにクラスタリングし、ユーザーが気に入っている点、避けるべき点、お金を払ってもよいと考えている点、要望の多い機能、参入のチャンスをまとめてください。competitorNotesのappIdには上記のidを使ってください。`,
    schema: ReportSchema,
    effort: "high",
    maxTokens: 64000,
  });
}

/** レポート生成ジョブ（バックグラウンドで実行される） */
export async function generateReport(reportId: string): Promise<void> {
  const report = db.prepare("SELECT idea, country, user_id FROM reports WHERE id = ?").get(reportId) as
    | { idea: string; country: string; user_id: string }
    | undefined;
  if (!report) return;
  db.prepare("UPDATE reports SET status = 'running' WHERE id = ?").run(reportId);

  try {
    const apps = await findCompetitors(report.idea, report.country, reportId);

    const reviewsByApp = new Map<string, Review[]>();
    for (const [i, app] of apps.entries()) {
      setProgress(reportId, `「${app.name}」のレビューを読んでいます…（${i + 1}/${apps.length}）`);
      reviewsByApp.set(app.id, await fetchReviews(app.id, report.country));
    }
    const total = [...reviewsByApp.values()].reduce((n, r) => n + r.length, 0);
    if (total === 0) throw new UserFacingError("競合アプリのレビューを取得できませんでした。");

    const competitors: CompetitorSummary[] = apps.map((a) => ({
      id: a.id,
      name: a.name,
      seller: a.seller,
      rating: a.rating,
      ratingCount: a.ratingCount,
      price: a.price,
      icon: a.icon,
      url: a.url,
      reviewsAnalyzed: reviewsByApp.get(a.id)?.length ?? 0,
    }));
    db.prepare("UPDATE reports SET competitors = ?, review_count = ? WHERE id = ?").run(
      JSON.stringify(competitors),
      total,
      reportId,
    );

    setProgress(reportId, `${total.toLocaleString()}件のレビューをテーマ別に分析しています…（数分かかります）`);
    const result = await analyzeReviews(report.idea, apps, reviewsByApp);

    db.prepare("UPDATE reports SET status = 'done', result = ?, progress = NULL WHERE id = ?").run(
      JSON.stringify(result),
      reportId,
    );
  } catch (err) {
    console.error(`[report ${reportId}]`, err);
    const message = err instanceof UserFacingError ? err.message : "分析中にエラーが発生しました。時間をおいて再度お試しください。";
    // 失敗時はクレジットを返却する
    db.prepare("UPDATE reports SET status = 'failed', error = ?, progress = NULL WHERE id = ?").run(message, reportId);
    db.prepare("UPDATE users SET credits = credits + 1 WHERE id = ?").run(report.user_id);
  }
}
