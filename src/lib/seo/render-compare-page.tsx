import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeaguePourDiscoveryLanding } from "@/components/seo/LeaguePourDiscoveryLanding";
import { getComparePage } from "@/lib/seo/compare-pages";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/json-ld-builders";
import { REVENUE_PROMO, SPONSOR_PROMO, UPGRADE_PROMO } from "@/lib/seo/discovery-shared";

export async function buildCompareMetadata(slug: string): Promise<Metadata> {
  const page = getComparePage(slug);
  if (!page) return {};
  const path = `/compare/${slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { title: page.title, description: page.description, url: path },
    robots: { index: true, follow: true },
  };
}

export function CompareDiscoveryPage({ slug }: { slug: string }) {
  const page = getComparePage(slug);
  if (!page) notFound();

  const path = `/compare/${slug}`;
  const faqs = [
    ...page.faqs,
    {
      q: `What is ${page.slug === "challonge" ? "Challonge" : "the alternative"} good at?`,
      a: page.theirStrength,
    },
    {
      q: "Where does LeaguePour focus?",
      a: page.leaguePourFocus,
    },
  ];

  const jsonLd = [
    buildWebPageJsonLd({ name: page.heroTitle, description: page.description, path }),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Compare", path: "/compare/challonge" },
      { name: page.heroTitle, path },
    ]),
    buildFaqPageJsonLd(faqs),
  ];

  return (
    <LeaguePourDiscoveryLanding
      kicker="Compare"
      heroTitle={page.heroTitle}
      heroIntro={page.heroIntro}
      primaryCta={{ href: "/signup/venue", label: "Create your venue" }}
      secondaryCta={{ href: "/features/tournaments", label: "Tournament features" }}
      venues={[]}
      competitions={[]}
      whyLeaguePour={{
        title: "Why bars choose LeaguePour",
        items: [
          page.leaguePourFocus,
          "Generic bracket tools organize matchups. LeaguePour helps venues fill the room.",
          "Live today: paid signups, QR codes, venue hubs, waitlists, staff scoring, and campaigns.",
          "Roadmap: bulk import, station queues, embeddable brackets, and merch add-ons.",
        ],
      }}
      comparison={{
        title: "Feature comparison",
        intro: page.theirStrength,
        rows: page.rows,
      }}
      faqs={faqs}
      relatedLinks={[
        { href: "/features/tournaments", label: "Tournament & league features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/for-venues", label: "For venues" },
        { href: "/compare/challonge", label: "vs Challonge" },
        { href: "/compare/generic-bracket-generators", label: "vs bracket generators" },
      ]}
      sponsorPromo={SPONSOR_PROMO}
      revenuePromo={REVENUE_PROMO}
      upgradePromo={UPGRADE_PROMO}
      jsonLdGraphs={jsonLd}
    />
  );
}
