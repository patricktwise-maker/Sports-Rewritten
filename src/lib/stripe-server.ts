import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");
  if (!client) client = new Stripe(secretKey);
  return client;
}

export const stripePlans = {
  founding: {
    name: "Founding Member",
    priceId: "price_1UGjfVPjBHiX9Gbpch90aoj4",
  },
  all_access: {
    name: "All Access",
    priceId: "price_1UGjfePjBHiX9Gbp8RN1HyUN",
  },
  annual: {
    name: "Annual",
    priceId: "price_1UGjfjPjBHiX9Gbpx5FIATsQ",
  },
} as const;

export type StripePlanCode = keyof typeof stripePlans;
