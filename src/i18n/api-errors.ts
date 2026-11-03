import type { Dictionary } from "./get-dictionary";
import type { Locale } from "./config";
import { getDictionary } from "./get-dictionary";

export type ApiErrorKey = keyof Dictionary["errors"];

export function apiError(locale: Locale, key: ApiErrorKey, ...args: [number] | []): string {
  const d = getDictionary(locale).errors;
  const val = d[key];
  if (typeof val === "function") return (val as (n: number) => string)(args[0] as number);
  return val;
}
