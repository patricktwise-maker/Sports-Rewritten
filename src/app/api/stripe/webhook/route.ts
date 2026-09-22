import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

async function syncSubscription(subscription: Stripe.Subscription) {
  const metadata = subscription.metadata || {};
  const userId = metadata.user_id;
  const planCode = metadata.plan_code;
  if (!userId || !planCode) return;

  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const legacyPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;
  const itemPeriodEnds = subscription.items?.data
    ?.map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number") ?? [];
  const periodEnd = legacyPeriodEnd ?? (itemPeriodEnds.length ? Math.max(...itemPeriodEnds) : undefined);
  const supabase = createServerSupabaseClient();

  const payload = {
    user_id: userId,
    provider: "stripe",
    provider_customer_id: customerId,
    provider_subscription_id: subscription.id,
    plan_code: planCode,
    status: subscription.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("subscriptions")
    .upsert(payload, { onConflict: "provider_subscription_id" });
  if (error) throw error;

  if (planCode === "founding" && ["active","trialing"].includes(subscription.status)) {
    const { error: claimError } = await supabase.rpc("claim_founding_slot", { target_user_id: userId });
    if (claimError) throw claimError;
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });

  try {
    const body = await request.text();
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (typeof session.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await syncSubscription(subscription);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Invalid webhook request." }, { status: 400 });
  }
}
