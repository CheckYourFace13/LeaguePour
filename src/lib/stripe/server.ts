import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe/env";

let stripeSingleton: Stripe | null = null;

/** Official Stripe server client — never use in client components. */
export function getStripe(): Stripe {
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(getStripeSecretKey(), {
      typescript: true,
    });
  }
  return stripeSingleton;
}
