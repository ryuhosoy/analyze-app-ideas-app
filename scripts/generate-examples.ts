/**
 * サンプルレポートを本番と同じパイプラインで生成し JSON に保存する。
 * 用法: npx tsx --env-file=.env.local scripts/generate-examples.ts
 * 再生成: ... -- --force
 */
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { EXAMPLE_SPECS } from "../src/lib/examples/manifest";
import type { Locale } from "../src/i18n/config";

const dataDir = join(process.cwd(), "src/lib/examples/data");
const force = process.argv.includes("--force");

async function main() {
  mkdirSync(dataDir, { recursive: true });
  const { runAnalysis } = await import(pathToFileURL(join(process.cwd(), "src/lib/run-analysis.ts")).href);

  for (const spec of EXAMPLE_SPECS) {
    for (const locale of ["jp", "en"] as Locale[]) {
      const outPath = join(dataDir, `${spec.slug}.${locale}.json`);
      if (existsSync(outPath) && !force) {
        console.log(`skip (exists): ${outPath}`);
        continue;
      }
      const meta = locale === "en" ? spec.en : spec.jp;
      console.log(`\n=== ${spec.slug} (${locale}) ===`);
      console.log(meta.idea);

      const { competitors, reviewCount, result } = await runAnalysis(meta.idea, spec.country, locale, (msg: string) =>
        console.log(`  … ${msg}`),
      );

      const top = [...competitors].sort((a, b) => b.ratingCount - a.ratingCount)[0];
      const payload = {
        slug: spec.slug,
        title: meta.title,
        idea: meta.idea,
        topCompetitor: top?.name ?? competitors[0]?.name ?? "",
        reviewCount,
        competitors,
        result,
      };
      writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
      console.log(`wrote ${outPath} (${reviewCount} reviews, ${competitors.length} apps)`);
    }
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
