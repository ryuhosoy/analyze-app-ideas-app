import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db, id } from "./db";
import { sendEmail } from "./email";
import { APP_NAME, appUrl } from "./config";
import type { Locale } from "@/i18n/config";

const SESSION_COOKIE = "booscout_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000;

export type User = { id: string; email: string; credits: number };

const hash = (v: string) => createHash("sha256").update(v).digest("hex");

export function normalizeEmail(email: string): string | null {
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254 ? e : null;
}

export async function sendMagicLink(email: string, next?: string, locale: Locale = "jp"): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO login_tokens (token_hash, email, expires_at) VALUES (?, ?, ?)").run(
    hash(token),
    email,
    Date.now() + LOGIN_TOKEN_TTL_MS,
  );
  const url = new URL(`${appUrl()}/api/auth/verify`);
  url.searchParams.set("token", token);
  if (next?.startsWith("/")) url.searchParams.set("next", next);
  const en = locale === "en";
  await sendEmail({
    to: email,
    subject: en ? `${APP_NAME} login link 🐷` : `${APP_NAME} のログインリンク 🐷`,
    text: en
      ? `Here's your link to sign in to ${APP_NAME} (valid for 15 minutes):\n\n${url}\n\nIf you didn't request this, you can ignore this email.`
      : `ブーちゃんからのお届けものです！\n\n下のリンクをクリックして ${APP_NAME} にログインしてください（15分間有効）。\n\n${url}\n\n心当たりがない場合はこのメールを無視してください。`,
  });
}

/** トークンを消費してセッションを発行する。成功時はユーザーを返す */
export async function consumeMagicLink(token: string): Promise<User | null> {
  const row = db
    .prepare("SELECT email, expires_at, used FROM login_tokens WHERE token_hash = ?")
    .get(hash(token)) as { email: string; expires_at: number; used: number } | undefined;
  if (!row || row.used || row.expires_at < Date.now()) return null;
  db.prepare("UPDATE login_tokens SET used = 1 WHERE token_hash = ?").run(hash(token));

  db.prepare("INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)").run(id(), row.email);
  const user = db.prepare("SELECT id, email, credits FROM users WHERE email = ?").get(row.email) as User;

  const sessionId = randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO sessions (id_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
    hash(sessionId),
    user.id,
    Date.now() + SESSION_TTL_MS,
  );
  (await cookies()).set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return user;
}

export async function getUser(): Promise<User | null> {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const row = db
    .prepare(
      `SELECT u.id, u.email, u.credits, s.expires_at FROM sessions s
       JOIN users u ON u.id = s.user_id WHERE s.id_hash = ?`,
    )
    .get(hash(sessionId)) as (User & { expires_at: number }) | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, email: row.email, credits: row.credits };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (sessionId) db.prepare("DELETE FROM sessions WHERE id_hash = ?").run(hash(sessionId));
  store.delete(SESSION_COOKIE);
}
