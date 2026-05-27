import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Official Rules for Bar Games | LeaguePour Resource Guide",
  description:
    "Direct links to official rules from the governing bodies and associations that maintain them — darts, cornhole, pool, shuffleboard, poker, trivia, and more. No paraphrasing, just the real sources.",
  alternates: { canonical: "/rules" },
  keywords: [
    "official bar game rules",
    "darts rules",
    "cornhole rules",
    "pool rules",
    "shuffleboard rules",
    "pub trivia rules",
    "bar game official rules",
  ],
  openGraph: {
    title: "Official Rules for Bar Games | LeaguePour Resource Guide",
    description:
      "Links to official rules from the governing bodies — WDF, ACA, WPA, BCA, NSA, TDA, and more. We link to the source; we don't rewrite it.",
    url: "/rules",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Official Rules for Bar Games | LeaguePour",
  description:
    "A curated resource linking directly to official rules from the governing bodies and associations for popular bar and pub games.",
  url: "https://leaguepour.com/rules",
  publisher: {
    "@type": "Organization",
    name: "LeaguePour",
    url: "https://leaguepour.com",
  },
};

type RuleSource = {
  body: string;
  description: string;
  url: string;
};

type GameSection = {
  game: string;
  slug: string;
  sources: RuleSource[];
};

const games: GameSection[] = [
  {
    game: "Darts",
    slug: "darts",
    sources: [
      {
        body: "World Darts Federation (WDF)",
        description:
          "The international governing body for darts. Their rules page covers WDF-standard match play, equipment specifications, and throwing protocol.",
        url: "https://www.dartswdf.com/rules/",
      },
      {
        body: "Professional Darts Corporation (PDC)",
        description:
          "The PDC governs professional darts competition globally. Their rules cover PDC-sanctioned match formats including 501 and 301.",
        url: "https://www.pdc.tv/rules",
      },
      {
        body: "British Darts Organisation (BDO) / WDF",
        description:
          "The BDO's competitive rules were folded into the WDF structure. For amateur and recreational league standards, the WDF rulebook is the reference.",
        url: "https://www.dartswdf.com/rules/",
      },
    ],
  },
  {
    game: "Cornhole",
    slug: "cornhole",
    sources: [
      {
        body: "American Cornhole Association (ACA)",
        description:
          "The ACA is the primary governing body for competitive cornhole in the United States. Their official rulebook covers board dimensions, bag specs, scoring, and cancellation scoring rules.",
        url: "https://americancornhole.com/aca-cornhole-rules/",
      },
    ],
  },
  {
    game: "Pool & Billiards",
    slug: "billiards",
    sources: [
      {
        body: "World Pool-Billiard Association (WPA)",
        description:
          "The WPA sets international rules for pool cue sports including 8-ball, 9-ball, 10-ball, and straight pool. Their general rules of pocket billiards are the international standard.",
        url: "https://www.wpa-pool.com/index.asp?content=rules",
      },
      {
        body: "Billiard Congress of America (BCA)",
        description:
          "The BCA is the national governing body for billiards in the US. Their rulebook covers equipment standards and rules for all major pool formats.",
        url: "https://www.bca-pool.com/page/rules",
      },
      {
        body: "American Poolplayers Association (APA)",
        description:
          "The APA runs the largest amateur pool league in the world. Their rules incorporate a handicap system designed for recreational league play.",
        url: "https://poolplayers.com/8-ball-rules/",
      },
    ],
  },
  {
    game: "Shuffleboard",
    slug: "shuffleboard",
    sources: [
      {
        body: "National Shuffleboard Association (NSA)",
        description:
          "The NSA governs competitive shuffleboard in the United States. Their rules cover both floor shuffleboard and provide a reference point for table shuffleboard formats.",
        url: "https://www.nationalshuffleboardassociation.com",
      },
    ],
  },
  {
    game: "Poker",
    slug: "poker",
    sources: [
      {
        body: "Tournament Directors Association (TDA)",
        description:
          "The TDA sets the most widely adopted rules for no-limit Texas Hold'em tournament play. If your bar runs poker tournaments, the TDA rules are the reference most players and operators recognize.",
        url: "https://www.pokertda.com/poker-tda-rules/",
      },
    ],
  },
  {
    game: "Euchre",
    slug: "euchre",
    sources: [
      {
        body: "American Euchre Online",
        description:
          "Euchre doesn't have a single international governing body — rules vary significantly by region, particularly between Midwest US variants and Canadian variants. The American Euchre Online rules represent one widely used standard for bar league play.",
        url: "https://www.euchre.com/rules",
      },
    ],
  },
  {
    game: "Cribbage",
    slug: "cribbage",
    sources: [
      {
        body: "American Cribbage Congress (ACC)",
        description:
          "The ACC is the governing body for competitive cribbage in North America. Their rules are the standard for sanctioned tournament and club play in the US.",
        url: "https://www.cribbage.org/NewSite/rules/rule1.asp",
      },
    ],
  },
  {
    game: "Table Tennis",
    slug: "table-tennis",
    sources: [
      {
        body: "International Table Tennis Federation (ITTF)",
        description:
          "The ITTF governs international table tennis competition and publishes the official rules covering service, scoring, equipment, and match format.",
        url: "https://www.ittf.com/rules/",
      },
    ],
  },
  {
    game: "Bocce",
    slug: "bocce",
    sources: [
      {
        body: "World Bocce Federation (WBF)",
        description:
          "The WBF oversees international bocce competition and publishes official match rules. For bar and recreational play, the WBF rules serve as the standard reference.",
        url: "https://www.worldboccefederation.org/rules",
      },
    ],
  },
  {
    game: "Pickleball",
    slug: "pickleball",
    sources: [
      {
        body: "USA Pickleball",
        description:
          "USA Pickleball is the national governing body for pickleball in the United States and publishes the official rulebook used in sanctioned recreational and competitive play.",
        url: "https://usapickleball.org/what-is-pickleball/official-rules/",
      },
    ],
  },
];

export default function RulesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Rules resource</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Official rules for bar games
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          We link to official rules only — from the governing bodies and associations that maintain them.
          We don't rewrite or paraphrase rules; go straight to the source.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-lp-muted">
          Some games have multiple governing bodies with slightly different rules. We've noted where
          significant variations exist so you can choose the right reference for your context.
        </p>

        <div className="mt-14 space-y-12">
          {games.map((section) => (
            <div key={section.slug}>
              <h2 className="font-display text-2xl font-bold border-b border-lp-border pb-3">
                {section.game}
              </h2>
              <div className="mt-6 space-y-4">
                {section.sources.map((source) => (
                  <div
                    key={source.url}
                    className="rounded-xl border border-lp-border bg-lp-surface/40 p-5"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <p className="font-semibold text-lp-text">{source.body}</p>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-sm font-semibold text-lp-accent hover:underline"
                      >
                        Official rules →
                      </a>
                    </div>
                    <p className="mt-2 text-sm text-lp-muted leading-relaxed">
                      {source.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8">
          <h2 className="font-display text-xl font-bold">Run any of these at your bar?</h2>
          <p className="mt-2 text-lp-muted">
            LeaguePour handles the signup, entry fees, and standings — for any game format.
            Set up your venue in minutes, free to start.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-sm font-semibold text-lp-text">Explore game history</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <Link href="/history/darts" className="text-lp-accent hover:underline">
              History of darts →
            </Link>
            <Link href="/history/cornhole" className="text-lp-accent hover:underline">
              History of cornhole →
            </Link>
            <Link href="/history/billiards" className="text-lp-accent hover:underline">
              History of billiards & pool →
            </Link>
            <Link href="/history/trivia" className="text-lp-accent hover:underline">
              History of pub trivia →
            </Link>
            <Link href="/history/shuffleboard" className="text-lp-accent hover:underline">
              History of shuffleboard →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
