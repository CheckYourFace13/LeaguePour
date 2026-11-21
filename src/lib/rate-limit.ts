/**
 * Small in-memory fixed-window rate limiter for cost-bearing public endpoints (Google Places
 * lookups). Per Node process: Hostinger may run several, so the effective limit is a small
 * multiple of these numbers - still a hard ceiling on runaway or scripted usage. Not a security
 * boundary on its own.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfterSec: number } {
  if (buckets.size > 20_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  b.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

/** Best-effort client IP behind Hostinger's CDN/proxy. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Per-IP limit plus a per-process daily ceiling for one endpoint family. Returns a 429 Response
 * when over either limit, else null.
 */
export function placesLimit(req: Request, kind: "autocomplete" | "details" | "search"): Response | null {
  const perIp = { autocomplete: [120, 10 * 60_000], details: [30, 10 * 60_000], search: [30, 10 * 60_000] } as const;
  const daily = { autocomplete: 4000, details: 800, search: 800 } as const;
  const [limit, win] = perIp[kind];
  const ip = rateLimit(`places:${kind}:${clientIp(req)}`, limit, win);
  const day = rateLimit(`places:${kind}:daily`, daily[kind], 24 * 60 * 60_000);
  if (ip.ok && day.ok) return null;
  return new Response(JSON.stringify({ error: "rate_limited", message: "Too many lookups. Type your venue details instead." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(Math.max(ip.retryAfterSec, day.retryAfterSec)) },
  });
}
