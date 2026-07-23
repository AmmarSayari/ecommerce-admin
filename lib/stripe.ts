import Stripe from "stripe";

export function getStripe() {
  const apiKey = process.env.STRIPE_API_KEY;

  if (!apiKey) {
    throw new Error("STRIPE_API_KEY is not configured.");
  }

  return new Stripe(apiKey, {
    typescript: true,
  });
}

