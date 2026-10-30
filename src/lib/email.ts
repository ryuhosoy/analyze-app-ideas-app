import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { APP_NAME } from "./config";

type Attachment = { filename: string; content: string | Buffer; contentType?: string };

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: Attachment[];
  replyTo?: string;
}): Promise<void> {
  const t = getTransporter();
  if (!t) {
    // SMTP未設定時（開発用）はコンソールに出力する
    console.log(
      `\n🐷 [email:dev] to=${opts.to}\n   subject=${opts.subject}\n   ${opts.text.replace(/\n/g, "\n   ")}` +
        (opts.attachments?.length ? `\n   attachments=${opts.attachments.map((a) => a.filename).join(", ")}` : "") +
        "\n",
    );
    return;
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM ?? `${APP_NAME} <no-reply@example.com>`,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    attachments: opts.attachments,
  });
}
