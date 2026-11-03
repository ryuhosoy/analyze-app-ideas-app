import type { Locale } from "@/i18n/config";
import { EXAMPLES as EXAMPLES_JP, type ExampleReport } from "./jp";
import { EXAMPLES_EN } from "./en";

export type { ExampleReport } from "./jp";

export function getExamples(locale: Locale): ExampleReport[] {
  return locale === "en" ? EXAMPLES_EN : EXAMPLES_JP;
}

export function getExample(slug: string, locale: Locale): ExampleReport | undefined {
  return getExamples(locale).find((e) => e.slug === slug);
}

export function exampleSlugs(): string[] {
  return EXAMPLES_JP.map((e) => e.slug);
}
