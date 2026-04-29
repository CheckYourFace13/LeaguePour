/**
 * Stripe-related environment validation (server-only).
 * Never import this file from client components.
 */

export function getAppBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? process.env.VERCEL_URL ?? process.env.NEXTAUTH_URL;
  if (!raw || raw.trim() === "") {
    throw new Error(
      "Missing app base URL: set NEXT_PUBLIC_APP_URL (recommended) or AUTH_URL / NEXTAUTH_URL / VERCEL_URL for Stripe return URLs.",
    );
  }
  const trimmed = raw.trim().replace(/\/$/, "");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

export function getStripeSecretKey(): string {
  const k = process.env.STRIPE_SECRET_KEY?.trim();
  if (!k) throw new Error("STRIPE_SECRET_KEY is required for Stripe payments.");
  return k;
}

export function getStripeWebhookSecret(): string {
  const k = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!k) throw new Error("STRIPE_WEBHOOK_SECRET is required for Stripe webhooks.");
  return k;
}

export function isStripePaymentsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
