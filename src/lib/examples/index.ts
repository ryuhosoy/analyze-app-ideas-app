import type { Locale } from "@/i18n/config";
import { EXAMPLES as EXAMPLES_JP } from "./jp";
import { EXAMPLES_EN } from "./en";
import type { ExampleReport } from "./types";

export type { ExampleReport } from "./types";

export function getExamples(locale: Locale): ExampleReport[] {
  return locale === "en" ? EXAMPLES_EN : EXAMPLES_JP;
}

export function getExample(slug: string, locale: Locale): ExampleReport | undefined {
  return getExamples(locale).find((e) => e.slug === slug);
}

export function exampleSlugs(): string[] {
  return EXAMPLES_JP.map((e) => e.slug);
}
