import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { getPublicSiteUrl } from "@/lib/site-url";

/** Site-wide Organization + WebSite + SoftwareApplication for search engines. */
export function SiteJsonLd() {
  const base = getPublicSiteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "LeaguePour",
        url: base,
        description: "Software for venues to run participation competitions, signups, and entry fees.",
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        name: "LeaguePour",
        url: base,
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${base}/#application`,
        name: "LeaguePour",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: base,
        description: "Venue competition software for bars. Run dart leagues, cornhole tournaments, trivia nights, pool leagues, and more - with online signup, entry fees, and player management.",
        keywords: "dart league software, cornhole tournament software, bar trivia software, pool league management, venue competition platform",
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "29",
          highPrice: "299",
          priceCurrency: "USD",
          offerCount: "4",
        },
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(graph) }} />
  );
}
