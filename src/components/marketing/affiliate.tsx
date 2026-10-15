import { activeAdvertiserFor } from "@/lib/affiliate-registry";

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

/**
 * Awin-generated Viski (barware) link supplied by Chris on 2026-10-12. NOT PLACED ANYWHERE: no
 * existing LeaguePour or VenueSprocket guide is about cocktail tools or barware. Keep the URL
 * exactly as generated. Rules if a genuinely relevant guide exists later: at most one contextual
 * text link per guide, two pages total across both brands, a visible commission disclosure before
 * the link, rel="sponsored nofollow noopener", never in the darts/cornhole equipment sections.
 * Still unresolved: whether Viski's Awin program terms permit leaguepour.com / venuesprocket.com
 * specifically (approval was shown for the account, not per domain).
 */
export const VISKI_AWIN_URL =
  "https://www.awin1.com/cread.php?awinmid=77462&awinaffid=3112962&ued=https%3A%2F%2Fviski.com%2Fcollections%2Fbarware-bar-tools";

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

/**
 * Disclosure for an equipment section. Pass `cj` when the section also has one CJ merchant link:
 * the merchant is named only if that link is actually live on this site, so the wording always
 * matches what the reader can see.
 */
export function AffiliateDisclosure({ cj }: { cj?: { advertiserId: string; merchant: string } } = {}) {
  const cjLive = cj ? activeAdvertiserFor(cj.advertiserId, "leaguepour") !== null : false;
  return (
    <p className="mt-4 rounded-lg border border-lp-border bg-lp-surface/50 px-4 py-3 text-sm text-lp-muted">
      <strong className="text-lp-text">Disclosure:</strong>{" "}
      {cjLive ? (
        <>
          the Amazon and {cj!.merchant} links in this section are affiliate links (the {cj!.merchant} link
          is through CJ) - if you buy through them, LeaguePour may earn a commission at no extra cost
          to you. The Amazon links go to search results; none of these are products we&apos;ve tested.
        </>
      ) : (
        <>
          the Amazon links in this section are affiliate links - if you buy through them, LeaguePour
          may earn a commission at no extra cost to you. They go to search results, not products
          we&apos;ve tested.
        </>
      )}{" "}
      {AMAZON_ASSOCIATE_STATEMENT}
    </p>
  );
}

/** A single CJ link inside an existing equipment list. Renders nothing unless live on LeaguePour. */
export function CjInlineLink({ advertiserId, children }: { advertiserId: string; children: React.ReactNode }) {
  const row = activeAdvertiserFor(advertiserId, "leaguepour");
  if (!row) return null;
  return (
    <a
      href={row.href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className="font-semibold text-lp-accent underline underline-offset-2 hover:no-underline"
    >
      {children}
    </a>
  );
}

const SITE_BRAND = { leaguepour: "LeaguePour", venuesprocket: "VenueSprocket" } as const;

/**
 * One hand-placed CJ recommendation. Renders nothing - not even the explanation - unless the
 * registry row is enabled, approved, permitted on THIS site, and has a tracking link carrying
 * this site's own CJ website PID (see trackedDestinationFor in affiliate-registry.ts). The
 * disclosure sits directly before the link and names CJ, never the Amazon wording.
 */
export function CjRecommendation({
  advertiserId,
  website,
  anchor,
  children,
}: {
  advertiserId: string;
  website: keyof typeof SITE_BRAND;
  /** Descriptive link text, e.g. "Heil Sound's dynamic microphones". */
  anchor: string;
  /** Why this helps the reader's task. No prices, ratings, discounts, or testing claims. */
  children: React.ReactNode;
}) {
  const row = activeAdvertiserFor(advertiserId, website);
  if (!row) return null;
  const vs = website === "venuesprocket";
  return (
    <aside
      className={
        vs
          ? "mt-4 rounded-lg border border-vs-border bg-vs-surface-2 px-4 py-3 text-sm text-vs-text-soft"
          : "mt-4 rounded-lg border border-lp-border bg-lp-surface/50 px-4 py-3 text-sm text-lp-muted"
      }
      aria-label="Affiliate recommendation"
    >
      <p>
        <strong className={vs ? "text-vs-text" : "text-lp-text"}>Disclosure:</strong> the link below is
        an affiliate link through CJ - if you buy through it, {SITE_BRAND[website]} may earn a commission
        at no extra cost to you. We haven&apos;t tested this product.
      </p>
      <p className="mt-2">
        {children}{" "}
        <a
          href={row.href}
          target="_blank"
          rel="sponsored nofollow noopener"
          className={
            vs
              ? "font-semibold text-vs-accent underline underline-offset-2 hover:no-underline"
              : "font-semibold text-lp-accent underline underline-offset-2 hover:no-underline"
          }
        >
          {anchor}
        </a>
      </p>
    </aside>
  );
}
