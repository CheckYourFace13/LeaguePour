/**
 * IndexNow protocol client - notifies participating search engines (Bing, and everything that
 * consumes the shared IndexNow index: Copilot/Bing-backed AI search, Yandex, etc.) that a URL
 * was created, changed, or removed, without waiting for the next crawl. One key serves both
 * brands: the key file at public/{INDEXNOW_KEY}.txt is a static asset, so it's served
 * identically on leaguepour.com and venuesprocket.com (see next.config.ts - the VS host
 * rewrites are an explicit allowlist of paths, so anything not listed - including this key
 * file - falls through to the normal filesystem/public lookup regardless of host).
 *
 * Google does not consume IndexNow - this has no effect on Google Search Console indexing,
 * only Bing and IndexNow-participating engines.
 */

// Fixed key supplied by the project owner - do not regenerate. Must match the contents of
// public/{INDEXNOW_KEY}.txt exactly.
const INDEXNOW_KEY = "d38fc2984e4840aaabe393fd2059fe94";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowHost = "leaguepour.com" | "venuesprocket.com";

export type IndexNowSubmitResult =
  | { ok: true; status: number; submitted: number }
  | { ok: false; status: number | null; error: string; submitted: 0 };

/**
 * Submit up to 10,000 URLs for one host in a single call. Never throws - a missed IndexNow ping
 * should never break venue/competition publishing - but DOES return the real outcome (status
 * code included) so callers that need to verify/report actual delivery can, rather than only
 * the fire-and-forget callers that don't care.
 */
export async function submitToIndexNow(host: IndexNowHost, urls: string[]): Promise<IndexNowSubmitResult> {
  if (urls.length === 0) return { ok: true, status: 0, submitted: 0 };
  // The bare homepage URL (https://host, no trailing slash) is legitimate and must not be
  // rejected by a check that only accepts "https://host/...".
  const bad = urls.find((u) => u !== `https://${host}` && !u.startsWith(`https://${host}/`));
  if (bad) {
    console.error("[indexnow] refusing to submit URL that doesn't match host", host, bad);
    return { ok: false, status: null, error: `URL doesn't match host ${host}: ${bad}`, submitted: 0 };
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    if (!res.ok && res.status !== 202) {
      const text = await res.text().catch(() => "");
      console.error("[indexnow] submission rejected", host, res.status, text.slice(0, 300));
      return { ok: false, status: res.status, error: text.slice(0, 300), submitted: 0 };
    }
    return { ok: true, status: res.status, submitted: urls.length };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[indexnow] submission failed", host, err);
    return { ok: false, status: null, error, submitted: 0 };
  }
}

/** Convenience for submitting a single URL from a server action - never awaited by the caller. */
export function pingIndexNow(url: string): void {
  let host: IndexNowHost;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "leaguepour.com" || parsed.hostname === "venuesprocket.com") {
      host = parsed.hostname;
    } else {
      return;
    }
  } catch {
    return;
  }
  void submitToIndexNow(host, [url]);
}
