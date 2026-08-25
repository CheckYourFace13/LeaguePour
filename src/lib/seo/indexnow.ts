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

const INDEXNOW_KEY = "adf7eae9c2fc3ef7ff2fdfcd44400559";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowHost = "leaguepour.com" | "venuesprocket.com";

/**
 * Submit up to 10,000 URLs for one host in a single call. Fire-and-forget by design (callers
 * should not block a user-facing action on this) - failures are logged, never thrown, since a
 * missed IndexNow ping should never break venue/competition publishing.
 */
export async function submitToIndexNow(host: IndexNowHost, urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  const bad = urls.find((u) => !u.startsWith(`https://${host}/`));
  if (bad) {
    console.error("[indexnow] refusing to submit URL that doesn't match host", host, bad);
    return;
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
    }
  } catch (err) {
    console.error("[indexnow] submission failed", host, err);
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
