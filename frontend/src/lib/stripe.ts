import { loadStripe, type Stripe } from "@stripe/stripe-js";

// Stripe is loaded once and reused. The publishable key is public and inlined
// at build time from NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
