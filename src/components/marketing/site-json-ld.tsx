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
        offers: {
          "@type": "Offer",
          price: "9.99",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
  );
}
