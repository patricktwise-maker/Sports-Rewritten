import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getStripe, stripePlans, type StripePlanCode } from "@/lib/stripe-server";

const SITE_URL = "https://sports-rewritten.vercel.app";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Sign in before subscribing." }, { status: 401 });

    const supabase = createServerSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (userError || !user) return NextResponse.json({ error: "Your session is no longer valid." }, { status: 401 });

    const { plan } = await request.json() as { plan?: StripePlanCode };
    if (!plan || !(plan in stripePlans)) return NextResponse.json({ error: "Unknown membership plan." }, { status: 400 });

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("provider_customer_id,status,current_period_end")
      .eq("user_id", user.id)
      .not("provider_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const stripe = getStripe();
    const customerId = existing?.provider_customer_id || undefined;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : user.email || undefined,
      client_reference_id: user.id,
      line_items: [{ price: stripePlans[plan].priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/membership?checkout=success`,
      cancel_url: `${SITE_URL}/membership?checkout=canceled`,
      metadata: { user_id: user.id, plan_code: plan },
      subscription_data: { metadata: { user_id: user.id, plan_code: plan } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 });
  }
}
