import { getPublicSiteUrl } from "@/lib/site-url";

/**
 * getPublicSiteUrl() always resolves to leaguepour.com - pass baseUrl
 * explicitly (e.g. "https://venuesprocket.com") when building JSON-LD for
 * the VenueSprocket segment, or these URLs point at the wrong domain.
 */
export function absoluteUrl(path: string, baseUrl?: string): string {
  const base = baseUrl ?? getPublicSiteUrl();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Use in place of a bare `JSON.stringify(x)` wherever the result goes into
 * `dangerouslySetInnerHTML` for a `<script type="application/ld+json">` block.
 * `JSON.stringify` does not escape "</", so a string field containing
 * "</script><script>...` breaks out of the JSON-LD block and executes as real script on the
 * page. Most JSON-LD on this site is static/hardcoded, but several pages embed venue- or
 * competition-controlled fields (name, description) that a compromised/malicious venue account
 * could set - found via security audit. < is the standard mitigation and is valid inside a
 * JSON string, so this doesn't change what any JSON-LD consumer/crawler sees.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildItemListJsonLd(input: {
  name: string;
  description: string;
  path: string;
  items?: { name: string; url: string }[];
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(input.items?.length
      ? {
          itemListElement: input.items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            url: absoluteUrl(item.url),
          })),
        }
      : {}),
  };
}

export function buildFaqPageJsonLd(faqs: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function buildSoftwareApplicationJsonLd(input: {
  name: string;
  description: string;
  path: string;
  keywords?: string;
  baseUrl?: string;
  priceRange?: { low: string; high: string; offerCount: string };
}): Record<string, unknown> {
  const price = input.priceRange ?? { low: "29", high: "299", offerCount: "4" };
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: absoluteUrl(input.path, input.baseUrl),
    description: input.description,
    ...(input.keywords ? { keywords: input.keywords } : {}),
    offers: {
      "@type": "AggregateOffer",
      lowPrice: price.low,
      highPrice: price.high,
      priceCurrency: "USD",
      offerCount: price.offerCount,
    },
  };
}

export function buildWebPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
  };
}

export function buildEventJsonLd(input: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  url: string;
  locationName: string;
  price?: number;
  currency?: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    ...(input.endDate ? { endDate: input.endDate } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: input.locationName,
    },
    url: absoluteUrl(input.url),
    ...(input.price != null && input.price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: input.price,
            priceCurrency: input.currency ?? "USD",
            url: absoluteUrl(input.url),
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export function jsonLdScript(graph: Record<string, unknown> | Record<string, unknown>[]) {
  const payload = Array.isArray(graph) ? { "@context": "https://schema.org", "@graph": graph } : graph;
  return JSON.stringify(payload);
}
