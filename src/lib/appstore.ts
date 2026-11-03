export type AppInfo = {
  id: string;
  name: string;
  seller: string;
  rating: number;
  ratingCount: number;
  price: string;
  genre: string;
  icon: string;
  url: string;
  description: string;
};

export type Review = {
  id: string;
  appId: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  version: string;
  date: string;
  votes: number;
};

const label = (v: unknown): string =>
  v && typeof v === "object" && "label" in v ? String((v as { label: unknown }).label ?? "") : "";

type ItunesResult = {
  trackId: number;
  trackName: string;
  sellerName: string;
  averageUserRating?: number;
  userRatingCount?: number;
  formattedPrice?: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
  trackViewUrl: string;
  description?: string;
};

function toAppInfo(r: ItunesResult): AppInfo {
  return {
    id: String(r.trackId),
    name: r.trackName,
    seller: r.sellerName,
    rating: Math.round((r.averageUserRating ?? 0) * 10) / 10,
    ratingCount: r.userRatingCount ?? 0,
    price: r.formattedPrice ?? "",
    genre: r.primaryGenreName ?? "",
    icon: r.artworkUrl100 ?? "",
    url: r.trackViewUrl.replace(/\?.*$/, ""),
    description: (r.description ?? "").slice(0, 600),
  };
}

export async function searchApps(term: string, country: string, limit = 15): Promise<AppInfo[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("entity", "software");
  url.searchParams.set("country", country);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`App Store検索に失敗しました (${res.status})`);
  const data = (await res.json()) as { results: ItunesResult[] };
  return data.results.map(toAppInfo);
}

/**
 * 公開RSSから最新レビューを取得する（Appleの仕様で国ごと最大10ページ×50件）
 */
export async function fetchReviews(appId: string, country: string, maxPages = 10): Promise<Review[]> {
  const reviews: Review[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch(
      `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${appId}/sortby=mostrecent/json`,
      { cache: "no-store" },
    );
    if (!res.ok) break;
    let entries: unknown;
    try {
      entries = ((await res.json()) as { feed?: { entry?: unknown } }).feed?.entry;
    } catch {
      break;
    }
    if (!entries) break;
    const list = (Array.isArray(entries) ? entries : [entries]) as Record<string, unknown>[];
    for (const e of list) {
      if (!e["im:rating"]) continue; // 古いフィードでは先頭がアプリ情報
      reviews.push({
        id: label(e.id),
        appId,
        author: label((e.author as Record<string, unknown>)?.name),
        rating: Number(label(e["im:rating"])),
        title: label(e.title),
        content: label(e.content),
        version: label(e["im:version"]),
        date: label(e.updated),
        votes: Number(label(e["im:voteCount"]) || 0),
      });
    }
    if (list.length < 50) break;
  }
  return reviews;
}
