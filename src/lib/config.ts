export const APP_NAME = "BooScout";
export const MASCOT_NAME = "ブーちゃん";
export const REPORT_PRICE_CENTS = 126;
export const SUPPORT_MESSAGE_MAX = 240;

export function appUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** Stripe未設定時は決済をスキップして即付与する開発用モード */
export function isDemoPayments(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
