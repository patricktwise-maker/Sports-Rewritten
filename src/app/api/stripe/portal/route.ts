import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe-server";

const SITE_URL = "https://sports-rewritten.vercel.app";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

    const supabase = createServerSupabaseClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData.user;
    if (userError || !user) return NextResponse.json({ error: "Your session is no longer valid." }, { status: 401 });

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("provider_customer_id")
      .eq("user_id", user.id)
      .not("provider_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.provider_customer_id) {
      return NextResponse.json({ error: "No Stripe customer is linked to this account yet." }, { status: 400 });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.provider_customer_id,
      return_url: `${SITE_URL}/membership`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe portal error", error);
    return NextResponse.json({ error: "Unable to open billing management." }, { status: 500 });
  }
}
