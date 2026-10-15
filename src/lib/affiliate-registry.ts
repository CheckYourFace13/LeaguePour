/**
 * Config-driven advertiser registry for editorial pages.
 * A row stays dark until approval, this website, and a real network tracking URL are all set.
 * Nothing here is a commission, a rank, or a review.
 */

export type RegistryNetwork = "cj" | "impact";

export type ApprovalStatus = "unverified" | "approved" | "declined";

export type AdvertiserRecord = {
  id: string;
  network: RegistryNetwork;
  /** Network advertiser id. Null until the publisher supplies one. */
  advertiserId: string | null;
  name: string;
  approvalStatus: ApprovalStatus;
  /** Website keys allowed to show this advertiser. Empty until supplied. */
  permittedWebsites: string[];
  /** Article categories where the advertiser is relevant. */
  categories: string[];
  /** Phrases matched against the slug and named products. Short generic words are omitted. */
  keywords: string[];
  /**
   * Publisher-supplied tracking URL. Null until supplied. Legacy single-link field: for CJ it only
   * renders on the site whose website PID it carries (see siteTrackedDestinations).
   */
  trackedDestination: string | null;
  /**
   * Per-site tracking URLs, each generated in CJ for that site's own website PID. A link generated
   * for one property never renders on the other.
   */
  siteTrackedDestinations?: Partial<Record<string, string>>;
  disclosure: string;
  enabled: boolean;
};

/**
 * CJ publisher account (CID), kept for reference only. It is NOT a website PID and never appears
 * in a tracking link; links carry the per-website PID below.
 */
export const CJ_ACCOUNT_CID = "7990498";

/**
 * CJ website PIDs per property, from Chris's CJ account (Account > Websites, confirmed
 * 2026-10-14). The env vars CJ_WEBSITE_PID_LEAGUEPOUR / CJ_WEBSITE_PID_VENUESPROCKET override
 * them. A PID alone activates nothing: each merchant still needs its own CJ-generated link.
 */
export const CJ_WEBSITE_PIDS: Record<string, string | null> = {
  leaguepour: "101904040",
  venuesprocket: "101904044",
};

export function cjWebsitePid(website: string): string | null {
  const key = website.trim().toLowerCase();
  const fromEnv = process.env[`CJ_WEBSITE_PID_${key.toUpperCase()}`]?.trim();
  const pid = fromEnv || CJ_WEBSITE_PIDS[key] || null;
  return pid && /^\d{5,10}$/.test(pid) && pid !== CJ_ACCOUNT_CID ? pid : null;
}

/** Website PID embedded in a CJ link: /click-<PID>-<AID> or /links/<PID>/... */
export function cjPidFromUrl(raw: string): string | null {
  try {
    const path = new URL(raw).pathname;
    return path.match(/^\/click-(\d+)-\d+/)?.[1] ?? path.match(/^\/links\/(\d+)\//)?.[1] ?? null;
  } catch {
    return null;
  }
}

/** Gambling and other excluded promotions. These ids cannot be activated. */
export const EXCLUDED_ADVERTISER_IDS = ["legendz"] as const;

const CJ_TRACKING_HOSTS = new Set([
  "anrdoezrs.net",
  "dpbolvw.net",
  "jdoqocy.com",
  "tkqlhce.com",
  "kqzyfj.com",
  "emjcd.com",
  "qksrv.net",
  "afcyhf.com",
  "ftjcfx.com",
  "lduhtrp.net",
  "tqlkg.com",
  "awltovhc.com",
]);

/**
 * Staged advertisers. Approval, website permission, and the tracking URL stay empty
 * until a person copies them from the network. Env vars with the same id can fill them
 * without a code change to the matcher.
 */
export const ADVERTISER_REGISTRY: AdvertiserRecord[] = [
  {
    id: "aliexpress",
    network: "cj",
    advertiserId: "7711902",
    name: "AliExpress",
    approvalStatus: "approved",
    permittedWebsites: [],
    categories: ["moving", "home-upgrades", "home-furniture", "office-school", "city-living", "kitchen-tools"],
    keywords: ["moving boxes", "furniture", "desk chair", "storage bins"],
    trackedDestination: null,
    disclosure: "Optional retailer. Paid CJ link. Not a product review or a price.",
    enabled: false,
  },
  {
    id: "dailysteals",
    network: "cj",
    advertiserId: "6616496",
    name: "DailySteals",
    approvalStatus: "approved",
    permittedWebsites: [],
    categories: ["moving", "home-upgrades", "home-furniture", "office-school", "kitchen-tools"],
    keywords: ["moving boxes", "furniture", "home office"],
    trackedDestination: null,
    disclosure: "Optional retailer. Paid CJ link. Not a product review or a price.",
    enabled: false,
  },
  {
    id: "lawdepot",
    network: "cj",
    advertiserId: "4544498",
    name: "LawDepot",
    approvalStatus: "approved",
    // Inactive (2026-10-15): Chris moved LP affiliate focus to players, not legal documents. The
    // Activity Waiver link stays configured below so it can be re-enabled without another lookup.
    permittedWebsites: ["leaguepour"],
    // Hand-placed only: no auto-match terms now that the row is active.
    categories: [],
    keywords: [],
    trackedDestination: null,
    // CJ Link Search API, 2026-10-15: link 16995856 "Activity Waiver Form", destination
    // https://www.lawdepot.com/contracts/activity-waiver/?loc=US, website PID 101904040.
    siteTrackedDestinations: {
      leaguepour: "https://www.jdoqocy.com/click-101904040-16995856-1734590589000",
    },
    disclosure: "Optional document service. Paid CJ link. It does not replace this site's own documents or software.",
    enabled: false,
  },
  {
    id: "chefs-deal",
    network: "cj",
    advertiserId: "7081268",
    name: "Chef's Deal",
    approvalStatus: "approved",
    permittedWebsites: [],
    categories: ["commercial-kitchen", "venue-equipment", "hospitality-equipment"],
    keywords: ["commercial kitchen", "restaurant equipment"],
    trackedDestination: null,
    disclosure: "Optional restaurant-supply retailer. Paid CJ link. Not a product review.",
    enabled: false,
  },
  {
    id: "peets-coffee",
    network: "cj",
    advertiserId: "2346375",
    name: "Peet's Coffee",
    approvalStatus: "approved",
    permittedWebsites: [],
    categories: ["coffee", "brewing"],
    keywords: ["coffee maker", "espresso", "pour over", "coffee beans"],
    trackedDestination: null,
    disclosure: "Optional coffee retailer. Paid CJ link. Not a tasting note or a rank.",
    enabled: false,
  },
  {
    id: "visumpoint",
    network: "cj",
    advertiserId: "7892835",
    name: "visumPOINT",
    approvalStatus: "approved",
    permittedWebsites: [],
    categories: ["international-travel", "visas"],
    keywords: ["visa application", "travel visa"],
    trackedDestination: null,
    disclosure: "Optional visa-service link. Paid CJ link. Not immigration advice.",
    enabled: false,
  },
  {
    id: "aurzen",
    network: "cj",
    advertiserId: "7895424",
    name: "Aurzen",
    approvalStatus: "approved",
    permittedWebsites: [],
    categories: ["home-entertainment"],
    keywords: ["projector", "home theater"],
    trackedDestination: null,
    disclosure: "Optional projector retailer. Paid CJ link. Not a product review.",
    enabled: false,
  },
  {
    id: "click-and-grow",
    network: "cj",
    advertiserId: "4297609",
    name: "Click & Grow",
    approvalStatus: "approved",
    permittedWebsites: [],
    categories: ["indoor-gardening"],
    keywords: ["indoor herb", "smart garden"],
    trackedDestination: null,
    disclosure: "Optional indoor-garden retailer. Paid CJ link. Not a grow test.",
    enabled: false,
  },
  {
    id: "magnifique",
    network: "cj",
    advertiserId: "7461262",
    name: "Magnifique",
    approvalStatus: "approved",
    permittedWebsites: [],
    // Active in CJ, but no current guide has a natural fit; no auto-match terms.
    categories: [],
    keywords: [],
    trackedDestination: null,
    disclosure: "Optional kitchen retailer. Paid CJ link. Not a product review.",
    enabled: false,
  },
  {
    id: "adagio",
    network: "cj",
    advertiserId: "304810",
    name: "Adagio + Lardera + Selefina",
    approvalStatus: "approved",
    permittedWebsites: [],
    // Active in CJ, but no current guide has a natural fit; no auto-match terms.
    categories: [],
    keywords: [],
    trackedDestination: null,
    disclosure: "Optional gourmet retailer. Paid CJ link. Not a tasting note or a rank.",
    enabled: false,
  },
  {
    id: "dailysteals-cornhole-set",
    network: "cj",
    advertiserId: "6616496",
    name: "DailySteals",
    approvalStatus: "approved",
    permittedWebsites: ["leaguepour"],
    // Hand-placed in the cornhole guide's equipment list only.
    categories: [],
    keywords: [],
    trackedDestination: null,
    // CJ Product Feed API: SKU13099598, "Distressed Wood Cornhole Boards - Regulation Size -
    // 24 x 48 (RESIN Bags)", in stock when checked. Deal-site listing: re-check it periodically.
    siteTrackedDestinations: {
      leaguepour:
        "https://www.kqzyfj.com/click-101904040-15580948?url=https%3A%2F%2Fdailysteals.com%2Fproducts%2Fdistressed-wood-cornhole-boards-with-or-without-bags.html%3Fsku%3DSKU13099598&cjsku=SKU13099598",
    },
    disclosure: "Deal retailer. Paid CJ link. Not a product test; price and stock change.",
    enabled: true,
  },
  {
    id: "adrenaline-gift-certificate",
    network: "cj",
    advertiserId: "4851771",
    name: "Adrenaline",
    approvalStatus: "approved",
    permittedWebsites: ["leaguepour"],
    // Hand-placed in the season-celebration guide only.
    categories: [],
    keywords: [],
    trackedDestination: null,
    // CJ Product Feed API: product "Flexi" (Adrenaline Gift Certificate, catalog 10146),
    // destination https://www.adrenaline365.com/gift-certificates/.
    siteTrackedDestinations: {
      leaguepour:
        "https://www.tkqlhce.com/click-101904040-17363168?url=https%3A%2F%2Fwww.adrenaline365.com%2Fgift-certificates%2F&cjsku=Flexi",
    },
    disclosure: "Experience gift retailer. Paid CJ link. Availability depends on location.",
    enabled: true,
  },
  {
    id: "heil-sound",
    network: "cj",
    advertiserId: "7036312",
    name: "Heil Sound",
    approvalStatus: "unverified", // pending in CJ as of 2026-10-14
    permittedWebsites: [],
    // Hand-placed on one guide only; empty so the matcher can never insert it anywhere else.
    categories: [],
    keywords: [],
    trackedDestination: null,
    disclosure: "Microphone maker. Paid CJ link. Not a product test or a rank.",
    enabled: false,
  },
  {
    id: "tuft-and-needle",
    network: "impact",
    advertiserId: null,
    name: "Tuft & Needle",
    approvalStatus: "unverified",
    permittedWebsites: [],
    categories: ["home-furniture"],
    keywords: ["mattress"],
    trackedDestination: null,
    disclosure: "Optional mattress retailer. Paid Impact link. Not a sleep test.",
    enabled: false,
  },
  {
    id: "hp-store",
    network: "cj",
    advertiserId: null,
    name: "HP Store",
    approvalStatus: "unverified",
    permittedWebsites: [],
    categories: ["technology", "office-school"],
    keywords: ["home printer", "laser printer"],
    trackedDestination: null,
    disclosure: "Optional printer retailer. Paid CJ link. Certification is not print quality.",
    enabled: false,
  },
];

function envKey(network: RegistryNetwork, id: string, field: string): string {
  return `${network.toUpperCase()}_${id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_${field}`;
}

function envFlag(name: string): boolean | null {
  const raw = process.env[name];
  if (raw == null || raw.trim() === "") return null;
  return raw === "1" || raw.toLowerCase() === "true" || raw.toLowerCase() === "yes";
}

export function isExcludedAdvertiser(id: string, name = ""): boolean {
  const haystack = `${id} ${name}`.toLowerCase();
  if ((EXCLUDED_ADVERTISER_IDS as readonly string[]).includes(id.toLowerCase())) return true;
  return /legendz|casino|sportsbook|sports-bet|gambling|poker room/.test(haystack);
}

export function isValidTrackedDestination(network: RegistryNetwork, raw: string | null | undefined): boolean {
  const value = raw?.trim() ?? "";
  if (!value.startsWith("https://")) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (network === "cj") {
    return CJ_TRACKING_HOSTS.has(host) && /\/click-|\/links\//.test(url.pathname);
  }
  return host === "pxf.io" || host.endsWith(".pxf.io") || host === "sjv.io" || host.endsWith(".sjv.io");
}

function approvalFromEnv(raw: string | undefined, fallback: ApprovalStatus): ApprovalStatus {
  const value = raw?.trim().toLowerCase();
  if (value === "approved" || value === "declined" || value === "unverified") return value;
  return fallback;
}

/** Registry plus optional env overlay. Missing env leaves the staged row unchanged. */
export function resolveAdvertisers(): AdvertiserRecord[] {
  return ADVERTISER_REGISTRY.filter((row) => !isExcludedAdvertiser(row.id, row.name)).map((row) => {
    const enabled = envFlag(envKey(row.network, row.id, "ENABLED"));
    const websites = process.env[envKey(row.network, row.id, "WEBSITES")]?.trim();
    const destination = process.env[envKey(row.network, row.id, "TRACKING_URL")]?.trim();
    const advertiserId = process.env[envKey(row.network, row.id, "ADVERTISER_ID")]?.trim();
    const siteTrackedDestinations = { ...row.siteTrackedDestinations };
    for (const site of ["leaguepour", "venuesprocket"]) {
      const url = process.env[envKey(row.network, row.id, `TRACKING_URL_${site.toUpperCase()}`)]?.trim();
      if (url) siteTrackedDestinations[site] = url;
    }
    return {
      ...row,
      enabled: enabled == null ? row.enabled : enabled,
      approvalStatus: approvalFromEnv(process.env[envKey(row.network, row.id, "APPROVAL")], row.approvalStatus),
      permittedWebsites: websites
        ? websites.split(",").map((site) => site.trim().toLowerCase()).filter(Boolean)
        : row.permittedWebsites,
      trackedDestination: destination || row.trackedDestination,
      siteTrackedDestinations,
      advertiserId: advertiserId || row.advertiserId,
    };
  });
}

/**
 * The tracking URL for this row on this site, or null. CJ: the per-site link, else the legacy
 * single link - either way it must carry this site's own website PID, so a LeaguePour link can
 * never be served on VenueSprocket (or the reverse). Impact keeps its single-link behavior.
 */
export function trackedDestinationFor(row: AdvertiserRecord, website: string): string | null {
  const site = website.trim().toLowerCase();
  const url = row.siteTrackedDestinations?.[site] ?? row.trackedDestination;
  if (!url || !isValidTrackedDestination(row.network, url)) return null;
  if (row.network === "cj") {
    const pid = cjWebsitePid(site);
    if (!pid || cjPidFromUrl(url) !== pid) return null;
  }
  return url;
}

export function isAdvertiserActive(row: AdvertiserRecord, website: string): boolean {
  if (isExcludedAdvertiser(row.id, row.name)) return false;
  if (!row.enabled || row.approvalStatus !== "approved") return false;
  if (!row.permittedWebsites.includes(website.trim().toLowerCase())) return false;
  return trackedDestinationFor(row, website) !== null;
}

/** One named advertiser for a hand-placed recommendation; null unless fully active on this site. */
export function activeAdvertiserFor(id: string, website: string): (AdvertiserRecord & { href: string }) | null {
  const row = resolveAdvertisers().find((r) => r.id === id);
  if (!row || !isAdvertiserActive(row, website)) return null;
  const href = trackedDestinationFor(row, website);
  return href ? { ...row, href } : null;
}

export function hasActiveAdvertiser(website: string): boolean {
  return resolveAdvertisers().some((row) => isAdvertiserActive(row, website));
}

function haystackMatches(row: AdvertiserRecord, category: string, haystack: string): boolean {
  if (category && row.categories.includes(category)) return true;
  return row.keywords.some((keyword) => keyword.length >= 4 && haystack.includes(keyword.toLowerCase()));
}

/**
 * At most one relevant, active advertiser. Commission is not a sort key;
 * registry order is the tie break, and Amazon stays outside this list.
 */
export function matchAdvertisers(opts: {
  website: string;
  category?: string;
  productNames?: string[];
  text?: string;
}): AdvertiserRecord[] {
  const category = opts.category?.trim() ?? "";
  const haystack = [opts.text ?? "", category, ...(opts.productNames ?? [])].join(" ").toLowerCase();
  const match = resolveAdvertisers().find(
    (row) => isAdvertiserActive(row, opts.website) && haystackMatches(row, category, haystack),
  );
  return match ? [match] : [];
}

/** One match across the page's categories, then its text. Used by every editorial site. */
export function matchEditorialPage(opts: {
  website: string;
  categories?: string[];
  productNames?: string[];
  text?: string;
}): AdvertiserRecord[] {
  for (const category of opts.categories ?? []) {
    const hit = matchAdvertisers({
      website: opts.website,
      category,
      productNames: opts.productNames,
      text: opts.text,
    });
    if (hit.length > 0) return hit;
  }
  return matchAdvertisers({
    website: opts.website,
    productNames: opts.productNames,
    text: opts.text,
  });
}

export function toRecommendedLinks(rows: AdvertiserRecord[], website?: string): Array<{
  program: "cj" | "impact";
  merchant: string;
  label: string;
  href: string;
  note: string;
  linkKind: "cj_merchant" | "impact_merchant";
}> {
  return rows.flatMap((row) => {
    // With a website, that site's own link (CJ: must carry its PID); without one, legacy behavior.
    const href = website ? trackedDestinationFor(row, website) : row.trackedDestination;
    if (!href) return [];
    const merchant = row.id.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 80);
    if (!merchant) return [];
    return [
      {
        program: row.network,
        merchant,
        label: row.name,
        href,
        note: row.disclosure,
        linkKind: row.network === "impact" ? ("impact_merchant" as const) : ("cj_merchant" as const),
      },
    ];
  });
}
