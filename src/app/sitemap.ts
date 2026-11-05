import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import { exampleSlugs } from "@/lib/examples";
import { absoluteUrl } from "@/lib/seo";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/credits", "/support", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of PUBLIC_PATHS) {
      entries.push({
        url: absoluteUrl(localePath(locale, path)),
        lastModified: now,
        changeFrequency: path === "/" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : 0.6,
      });
    }
    for (const slug of exampleSlugs()) {
      entries.push({
        url: absoluteUrl(localePath(locale, `/examples/${slug}`)),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
