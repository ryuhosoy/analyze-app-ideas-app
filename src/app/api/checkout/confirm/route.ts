import { NextResponse } from "next/server";
import { appUrl } from "@/lib/config";
import { fulfillCheckout, getStripe } from "@/lib/payments";

/** Stripe Checkoutからの戻り先。Webhookが遅れても確実に反映する */
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(`${appUrl()}/`);
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const result = await fulfillCheckout(session);
  if (result?.kind === "credits") return NextResponse.redirect(`${appUrl()}/credits?purchased=${result.quantity}`);
  if (result?.kind === "spreadsheet") return NextResponse.redirect(`${appUrl()}/reviews/thanks`);
  return NextResponse.redirect(`${appUrl()}/credits?canceled=1`);
}
