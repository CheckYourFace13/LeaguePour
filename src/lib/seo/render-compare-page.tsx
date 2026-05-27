import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallongeComparisonVisual } from "@/components/marketing/ChallongeComparisonVisual";
import { LeaguePourProductMockup } from "@/components/marketing/LeaguePourProductMockup";
import { LeaguePourDiscoveryLanding } from "@/components/seo/LeaguePourDiscoveryLanding";
import { getComparePage } from "@/lib/seo/compare-pages";
import { marketingImages } from "@/lib/marketing-images";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/json-ld-builders";
import {
  BRACKET_ROADMAP_SECTION,
  BRING_PLAYERS_BACK_PROMO,
  DEFAULT_FORMAT_SECTION,
  ENTRY_FEE_REVENUE_PROMO,
  FEATURE_SPONSOR_PROMO,
  PROMOTE_LEAGUE_PROMO,
  UPGRADE_PROMO,
} from "@/lib/seo/discovery-shared";

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

  const isChallonge = slug === "challonge";

  return (
    <LeaguePourDiscoveryLanding
      kicker="Compare"
      heroTitle={page.heroTitle}
      heroIntro={page.heroIntro}
      primaryCta={{ href: "/signup/venue", label: "Start hosting events" }}
      secondaryCta={{ href: "/features/tournaments", label: "Tournament features" }}
      venues={[]}
      competitions={[]}
      whyLeaguePour={{
        title: "Why bars choose LeaguePour",
        items: [
          page.leaguePourFocus,
          "Challonge-style tools organize brackets. LeaguePour helps venues fill the room.",
          "Live today: paid signups, QR codes, venue hubs, waitlists, staff score entry, and campaigns.",
          "Auto-generated bracket trees, pool play, and Swiss are on the roadmap - see format guide.",
        ],
      }}
      formatSection={DEFAULT_FORMAT_SECTION}
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
      sponsorPromo={FEATURE_SPONSOR_PROMO}
      revenuePromo={ENTRY_FEE_REVENUE_PROMO}
      leagueNightPromo={PROMOTE_LEAGUE_PROMO}
      reactivationPromo={BRING_PLAYERS_BACK_PROMO}
      upgradePromo={UPGRADE_PROMO}
      roadmap={BRACKET_ROADMAP_SECTION}
      heroImage={isChallonge ? marketingImages.realVenueNights : undefined}
      afterHero={isChallonge ? <LeaguePourProductMockup compact className="mt-12 max-w-3xl" /> : undefined}
      fullWidthAfterHero={isChallonge ? <ChallongeComparisonVisual /> : undefined}
      jsonLdGraphs={jsonLd}
    />
  );
}
