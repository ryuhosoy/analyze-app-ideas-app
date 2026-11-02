import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { APP_NAME } from "./config";

type Attachment = { filename: string; content: string | Buffer; contentType?: string };

let resend: Resend | null = null;
let transporter: Transporter | null = null;

function emailFrom(): string {
  const from = process.env.EMAIL_FROM?.trim();
  return from || `${APP_NAME} <onboarding@resend.dev>`;
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  resend ??= new Resend(key);
  return resend;
}

function getTransporter(): Transporter | null {
  if (!process.env.SMTP_HOST?.trim()) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

function logDevEmail(opts: {
  to: string;
  subject: string;
  text: string;
  attachments?: Attachment[];
}): void {
  console.log(
    `\n🐷 [email:dev] to=${opts.to}\n   subject=${opts.subject}\n   ${opts.text.replace(/\n/g, "\n   ")}` +
      (opts.attachments?.length ? `\n   attachments=${opts.attachments.map((a) => a.filename).join(", ")}` : "") +
      "\n",
  );
}

async function sendViaResend(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Attachment[];
  replyTo?: string;
}): Promise<void> {
  const client = getResend();
  if (!client) return;

  const { error } = await client.emails.send({
    from: emailFrom(),
    to: [opts.to],
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
    attachments: opts.attachments?.map((a) => ({
      filename: a.filename,
      content: typeof a.content === "string" ? Buffer.from(a.content, "utf-8") : a.content,
      contentType: a.contentType,
    })),
  });
  if (error) throw new Error(error.message);
}

async function sendViaSmtp(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Attachment[];
  replyTo?: string;
}): Promise<void> {
  const t = getTransporter();
  if (!t) return;
  await t.sendMail({
    from: emailFrom(),
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    attachments: opts.attachments,
  });
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Attachment[];
  replyTo?: string;
}): Promise<void> {
  if (getResend()) {
    await sendViaResend(opts);
    return;
  }
  if (getTransporter()) {
    await sendViaSmtp(opts);
    return;
  }
  logDevEmail(opts);
}
