import Stripe from "stripe";

let client: Stripe | null = null;
let clientKey: string | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");
  if (!client || clientKey !== secretKey) {
    client = new Stripe(secretKey);
    clientKey = secretKey;
  }
  return client;
}

export const stripeMode = process.env.STRIPE_MODE === "test" ? "test" : "live";

const livePrices = {
  founding: "price_1UGjfVPjBHiX9Gbpch90aoj4",
  all_access: "price_1UGjfePjBHiX9Gbp8RN1HyUN",
  annual: "price_1UGjfjPjBHiX9Gbpx5FIATsQ",
} as const;

const testPrices = {
  founding: "price_1UGkbhB6GP4ISgRYwAtTrcGv",
  all_access: "price_1UGkc8B6GP4ISgRYhj902vKJ",
  annual: "price_1UGkcJB6GP4ISgRYlIZh8JHW",
} as const;

const selectedPrices = stripeMode === "test" ? testPrices : livePrices;

export const stripePlans = {
  founding: {
    name: "Founding Member",
    priceId: selectedPrices.founding,
  },
  all_access: {
    name: "All Access",
    priceId: selectedPrices.all_access,
  },
  annual: {
    name: "Annual",
    priceId: selectedPrices.annual,
  },
} as const;

export type StripePlanCode = keyof typeof stripePlans;
