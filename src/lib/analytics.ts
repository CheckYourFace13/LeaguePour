/**
 * GA4 funnel event tracking, shared by both LeaguePour and VenueSprocket.
 * Each domain's root layout calls gtag('config', <its own measurement id>) once on load,
 * so a plain gtag('event', ...) call here is automatically scoped to whichever property
 * is active for the current page - no per-call product/measurement-id plumbing needed.
 *
 * Never pass PII (name, email, phone, address, payment details) as an event param - GA4
 * event parameters are not an appropriate place for personal data.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: string, params?: AnalyticsParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params ?? {});
  } catch {
    // Analytics must never break the product.
  }
}
