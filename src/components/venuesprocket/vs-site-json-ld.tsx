import { safeJsonLd } from "@/lib/seo/json-ld-builders";
const BASE = "https://venuesprocket.com";

/** Site-wide Organization + WebSite for search engines. */
export function VsSiteJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE}/#organization`,
        name: "VenueSprocket",
        url: BASE,
        description:
          "Private event management software for restaurants, bars, breweries, and event spaces.",
      },
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        name: "VenueSprocket",
        url: BASE,
        publisher: { "@id": `${BASE}/#organization` },
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(graph) }} />
  );
}
