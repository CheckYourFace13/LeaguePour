/**
 * LeaguePour Amazon affiliate links - deliberately narrow. Used only inside equipment sections of
 * editorial guides (never pricing, auth, tools, or the app). Every paid link goes through
 * <AmazonSearchLink> so it always carries rel="sponsored nofollow" and LeaguePour's own tracking
 * ID, and every section that uses one must render <AffiliateDisclosure /> above the first link.
 *
 * Links go to Amazon search results for a spec the guide explains, not to individual listings:
 * we haven't tested specific products, and prices, stock, and ratings change.
 */
const AMAZON_TAG = "leaguepour-20";

export const AMAZON_ASSOCIATE_STATEMENT = "As an Amazon Associate I earn from qualifying purchases.";

export function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query).replace(/%20/g, "+")}&tag=${AMAZON_TAG}`;
}

export function AmazonSearchLink({ query, children }: { query: string; children: React.ReactNode }) {
  return (
    <a
      href={amazonSearchUrl(query)}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="font-semibold text-lp-accent underline underline-offset-2 hover:no-underline"
    >
      {children}
    </a>
  );
}

export function AffiliateDisclosure() {
  return (
    <p className="mt-4 rounded-lg border border-lp-border bg-lp-surface/50 px-4 py-3 text-sm text-lp-muted">
      <strong className="text-lp-text">Disclosure:</strong> the Amazon links in this section are
      affiliate links - if you buy through them, LeaguePour may earn a commission at no extra cost
      to you. They go to search results, not products we&apos;ve tested. {AMAZON_ASSOCIATE_STATEMENT}
    </p>
  );
}
