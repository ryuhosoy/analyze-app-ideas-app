import type { Locale } from "./config";
import { en } from "./messages/en";
import { jp } from "./messages/jp";

export type Dictionary = typeof jp;

export function getDictionary(locale: Locale): Dictionary {
  return locale === "en" ? en : jp;
}
