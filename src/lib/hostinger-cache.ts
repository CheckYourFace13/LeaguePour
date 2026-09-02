/**
 * Hostinger CDN/server cache purge, via Hostinger's own REST API - see
 * https://developers.hostinger.com (HostingCacheApi, DELETE
 * /api/hosting/v1/accounts/{username}/websites/{domain}/cache/clear).
 *
 * Exists because this project's Hostinger CDN has repeatedly served stale HTML referencing
 * deleted build-hash JS chunk files after a deploy (observed live via real browser testing:
 * the homepage 404'd on its own script chunks and failed to render at all) - Next prerendered
 * pages ship a very long default Cache-Control, and there was previously no way to purge the
 * edge cache except a manual hPanel button click after every single deploy. Requires
 * HOSTINGER_API_TOKEN (generate at hPanel -> Profile -> API) and HOSTINGER_USERNAME
 * (the Hostinger account username, not an email) - both optional; if either is unset this
 * silently no-ops rather than failing a deploy over a cache purge.
 */
const HOSTINGER_API_BASE = "https://developers.hostinger.com/api/hosting/v1";

// Both brands are served from this one Hostinger website (Host-header rewrites - see
// next.config.ts), but the CDN cache may be tracked per-domain, so purge both explicitly.
const DOMAINS = ["leaguepour.com", "venuesprocket.com"];

export type PurgeResult = { domain: string; ok: boolean; status: number; error?: string };

export async function purgeHostingerCache(): Promise<{ configured: boolean; results: PurgeResult[] }> {
  const token = process.env.HOSTINGER_API_TOKEN?.trim();
  const username = process.env.HOSTINGER_USERNAME?.trim();
  if (!token || !username) {
    return { configured: false, results: [] };
  }

  const results: PurgeResult[] = [];
  for (const domain of DOMAINS) {
    try {
      const res = await fetch(
        `${HOSTINGER_API_BASE}/accounts/${encodeURIComponent(username)}/websites/${encodeURIComponent(domain)}/cache/clear`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        results.push({ domain, ok: true, status: res.status });
      } else {
        const text = await res.text().catch(() => "");
        results.push({ domain, ok: false, status: res.status, error: text.slice(0, 300) });
      }
    } catch (err) {
      results.push({ domain, ok: false, status: 0, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return { configured: true, results };
}
