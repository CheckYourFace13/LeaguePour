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

// Events fired before gtag exists used to be dropped silently. Mount-time events (TrackView,
// signup_started) run in the page's effects, which React runs BEFORE the layout's tag effect (VS)
// and before next/script's afterInteractive tag (LP) - so they were lost on every first load.
// Hold them briefly and send once gtag is defined; give up after ~10s (analytics blocked).
const pending: Array<[string, AnalyticsParams | undefined]> = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function send(name: string, params?: AnalyticsParams): void {
  try {
    window.gtag?.("event", name, params ?? {});
  } catch {
    // Analytics must never break the product.
  }
}

export function trackEvent(name: string, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function" && pending.length === 0) {
    send(name, params);
    return;
  }
  pending.push([name, params]);
  if (flushTimer) return;
  let tries = 0;
  flushTimer = setInterval(() => {
    tries += 1;
    if (typeof window.gtag === "function") {
      while (pending.length) {
        const [n, p] = pending.shift()!;
        send(n, p);
      }
    }
    if (pending.length === 0 || tries >= 40) {
      pending.length = 0;
      if (flushTimer) clearInterval(flushTimer);
      flushTimer = null;
    }
  }, 250);
}
