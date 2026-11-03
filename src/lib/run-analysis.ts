import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { fetchReviews, searchApps, type AppInfo, type Review } from "./appstore";
import { ReportSchema, type CompetitorSummary, type ReportResult } from "./report-schema";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

const MODEL = "claude-opus-5-5";
const MAX_COMPETITORS = 5;

const client = new Anthropic();

export class UserFacingError extends Error {}

async function ask<T extends z.ZodType>(opts: {
  system: string;
  prompt: string;
  schema: T;
  effort: "low" | "medium" | "high";
  maxTokens: number;
  locale: Locale;
}): Promise<z.infer<T>> {
  const a = getDictionary(opts.locale).analyze;
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

  if (message.stop_reason === "refusal") throw new UserFacingError(a.aiRefusal);
  if (message.stop_reason === "max_tokens") throw new UserFacingError(a.aiMaxTokens);
  if (!message.parsed_output) throw new UserFacingError(a.aiParse);
  return message.parsed_output as z.infer<T>;
}

async function findCompetitors(
  idea: string,
  country: string,
  locale: Locale,
  onProgress?: (msg: string) => void,
): Promise<AppInfo[]> {
  const a = getDictionary(locale).analyze;
  onProgress?.(a.keywords);
  const { keywords } = await ask({
    locale,
    system: "You are an App Store market researcher.",
    prompt:
      locale === "en"
        ? `For this app idea, suggest 3–5 App Store search keywords (country: ${country}) in the store's primary language—short phrases users would actually search.\n\nIdea: ${idea}`
        : `次のアプリのアイデアについて、App Store（国コード: ${country}）で直接の競合アプリを見つけるための検索キーワードを3〜5個考えてください。そのストアの主要言語で、ユーザーが実際に検索しそうな短い語句にしてください。\n\nアイデア: ${idea}`,
    schema: z.object({ keywords: z.array(z.string()) }),
    effort: "low",
    maxTokens: 4000,
  });

  onProgress?.(a.searching);
  const found = new Map<string, AppInfo>();
  for (const kw of keywords.slice(0, 5)) {
    for (const app of await searchApps(kw, country, 12)) found.set(app.id, app);
  }
  if (found.size === 0) throw new UserFacingError(a.noCompetitors);

  onProgress?.(a.picking);
  const candidates = [...found.values()].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, 30);
  const { appIds } = await ask({
    locale,
    system: "You are an App Store market researcher.",
    prompt:
      locale === "en"
        ? `App idea: ${idea}\n\nPick up to ${MAX_COMPETITORS} direct competitors from the list (prefer high review count and similar functionality).\n\n${candidates
            .map((a) => `- id=${a.id} | ${a.name} | ${a.genre} | ★${a.rating} (${a.ratingCount}) | ${a.description.replace(/\s+/g, " ").slice(0, 200)}`)
            .join("\n")}`
        : `アプリのアイデア: ${idea}\n\n以下の候補から、このアイデアと同じ課題を解決する直接の競合アプリを最大${MAX_COMPETITORS}個、重要度の高い順に選んでください（レビュー数が多く、機能が近いものを優先）。該当がなければ最も近いものを選んでください。\n\n${candidates
            .map((a) => `- id=${a.id} | ${a.name} | ${a.genre} | ★${a.rating} (${a.ratingCount}件) | ${a.description.replace(/\s+/g, " ").slice(0, 200)}`)
            .join("\n")}`,
    schema: z.object({ appIds: z.array(z.string()) }),
    effort: "low",
    maxTokens: 4000,
  });
  const picked = appIds.map((id) => found.get(id)).filter((a): a is AppInfo => !!a);
  return (picked.length ? picked : candidates).slice(0, MAX_COMPETITORS);
}

async function analyzeReviews(
  idea: string,
  apps: AppInfo[],
  reviewsByApp: Map<string, Review[]>,
  locale: Locale,
): Promise<ReportResult> {
  const corpus = apps
    .map((app) => {
      const reviews = reviewsByApp.get(app.id) ?? [];
      const lines = reviews.map((r) => `[${r.rating}★] ${r.title} — ${r.content.replace(/\s+/g, " ")}`);
      return `<app id="${app.id}" name="${app.name}" rating="${app.rating}" ratings="${app.ratingCount}" price="${app.price}">\n${lines.join("\n")}\n</app>`;
    })
    .join("\n\n");

  const systemEn =
    "You are a mobile app product researcher. Analyze real App Store reviews and produce a report that helps an indie developer decide whether to build this app. Ground every claim in the reviews. Quote review text verbatim in quotes (do not translate quotes). Each insight's quotes use { appId, text } with appIds from the corpus. Approximate mention counts are fine. Write all report text in English.";
  const systemJp =
    "あなたはモバイルアプリのプロダクトリサーチャーです。競合アプリの実際のApp Storeレビューを分析し、個人開発者が「このアプリを作るべきか」を判断できるレポートを日本語で作成します。主張は必ずレビューの内容に基づかせ、引用はレビュー原文からそのまま抜き出してください（翻訳しない）。各 insight の quotes は { appId, text } の形式とし、text は必ずその appId のアプリのレビューから取り、appId は corpus の id をそのまま使ってください。mentionsはおおよその件数で構いません。";

  return ask({
    locale,
    system: locale === "en" ? systemEn : systemJp,
    prompt:
      locale === "en"
        ? `App idea to validate:\n${idea}\n\nCompetitor reviews:\n\n${corpus}\n\nCluster reviews by theme: what users love, what to avoid, willingness to pay, feature requests, and opportunities. Use the app ids above in competitorNotes and quotes.`
        : `作ろうとしているアプリのアイデア:\n${idea}\n\n以下は競合アプリの最新レビューです。\n\n${corpus}\n\nこれらのレビューをテーマごとにクラスタリングし、ユーザーが気に入っている点、避けるべき点、お金を払ってもよいと考えている点、要望の多い機能、参入のチャンスをまとめてください。competitorNotes の appId と quotes の appId には上記の id を使ってください。`,
    schema: ReportSchema,
    effort: "high",
    maxTokens: 64000,
  });
}

export type AnalysisOutput = {
  competitors: CompetitorSummary[];
  reviewCount: number;
  result: ReportResult;
};

/** App Store レビューを取得し AI レポートを生成（DB 不要） */
export async function runAnalysis(
  idea: string,
  country: string,
  locale: Locale,
  onProgress?: (msg: string) => void,
): Promise<AnalysisOutput> {
  const a = getDictionary(locale).analyze;
  const apps = await findCompetitors(idea, country, locale, onProgress);

  const reviewsByApp = new Map<string, Review[]>();
  for (const [i, app] of apps.entries()) {
    onProgress?.(a.reading(app.name, i + 1, apps.length));
    reviewsByApp.set(app.id, await fetchReviews(app.id, country));
  }
  const total = [...reviewsByApp.values()].reduce((n, r) => n + r.length, 0);
  if (total === 0) throw new UserFacingError(a.noReviews);

  const competitors: CompetitorSummary[] = apps.map((app) => ({
    id: app.id,
    name: app.name,
    seller: app.seller,
    rating: app.rating,
    ratingCount: app.ratingCount,
    price: app.price,
    icon: app.icon,
    url: app.url,
    reviewsAnalyzed: reviewsByApp.get(app.id)?.length ?? 0,
  }));

  onProgress?.(a.clustering(total.toLocaleString(locale === "en" ? "en-US" : "ja-JP")));
  const result = await analyzeReviews(idea, apps, reviewsByApp, locale);

  return { competitors, reviewCount: total, result };
}
