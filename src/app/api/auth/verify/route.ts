import { NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth";
import { appUrl } from "@/lib/config";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const user = await consumeMagicLink(url.searchParams.get("token") ?? "");
  if (!user) return NextResponse.redirect(`${appUrl()}/login?error=expired`);
  const next = url.searchParams.get("next");
  return NextResponse.redirect(`${appUrl()}${next?.startsWith("/") && !next.startsWith("//") ? next : "/"}`);
}
