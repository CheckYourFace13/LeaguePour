import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl } from "@/lib/site-url";
import { LeaguePourRealVisual } from "@/components/marketing/LeaguePourRealVisual";

export async function generateMetadata(): Promise<Metadata> {
  return applyManagedMetadata("/pool-league-management", {
  title: { absolute: "Pool League Software for Bars | LeaguePour" },
  description:
    "Run 8-ball and 9-ball pool leagues at your bar: team signup by link or QR code, Stripe dues, an automatic round-robin season, standings, playoffs, and a worked 8-team example.",
  alternates: { canonical: "/pool-league-management" },
  keywords: [
    "pool league management",
    "bar pool league software",
    "billiards league management",
    "8-ball league software",
    "pool tournament registration",
    "billiards tournament app",
    "bar pool tournament management",
  ],
  openGraph: { siteName: "LeaguePour", images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
    title: "Pool League Software for Bars | LeaguePour",
    description:
      "Manage bar pool leagues - online signup, entry fees, standings, and player messaging. Built for bars.",
    url: "/pool-league-management",
  },
});
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour - Pool League Management",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${getPublicSiteUrl()}/pool-league-management`,
      description:
        "Pool and billiards league management for bars. Handle player registration, entry fees, standings, and scheduling for 8-ball, 9-ball, and other pool formats.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "0",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "5",
      },
      keywords: "pool league management, billiards tournament software, bar pool league",
    },
  ],
};

// Matches what the app does today (src/lib/content-engine/facts.ts): round-robin schedules and
// single-elimination brackets are generated; seeding is registration order; no per-player stats.
const features = [
  { title: "Solo or team signup", body: "Individual 8-ball brackets or captain-led team leagues - players register from their phone, by link or QR code." },
  { title: "League dues online", body: "Collect dues by card when teams register, charged on your own connected Stripe account and paid out on your Stripe schedule." },
  { title: "Season schedule", body: "Round robin generates every matchup for the season from your registered teams, with a rotating bye when the count is odd." },
  { title: "Standings", body: "Enter each match result and wins, losses and points recalculate on your public standings page." },
  { title: "Player email", body: "Email opted-in players about schedule changes, standings and the next season's signup." },
  { title: "Playoff brackets", body: "Run playoffs as a single-elimination competition. Seeding follows registration order, so register qualifiers in standings order." },
];

export default function PoolLeagueManagementPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Pool & billiards league software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Pool leagues,<br />
          <span className="text-lp-accent">run without the paperwork.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles pool league signup, dues, the season schedule, standings and playoffs - so
          league night is about the games, not the clipboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start your pool league</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Pool league management tools</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
                <h3 className="font-semibold text-lp-text">{f.title}</h3>
                <p className="mt-2 text-sm text-lp-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid items-start gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">Worked example: an 8-team, 8-ball season</h2>
            <ul className="mt-4 space-y-2 text-sm text-lp-muted leading-relaxed">
              <li><strong className="text-lp-text">8 teams, round robin:</strong> 28 matches, every team plays every other team once.</li>
              <li><strong className="text-lp-text">2 tables, 4 matches a night:</strong> the season runs 7 weeks.</li>
              <li><strong className="text-lp-text">$60 season dues per team:</strong> the venue receives $57.00 per team (dues minus the 5% platform fee), before Stripe processing; the team pays $61.50 at checkout.</li>
              <li><strong className="text-lp-text">Week 8 playoffs:</strong> a 4-team single-elimination bracket - 3 matches - registered in standings order.</li>
            </ul>
            <p className="mt-4 text-sm text-lp-muted">
              Numbers are an example; set your own dues and table count.{" "}
              <Link href="/tools/round-robin-schedule-generator" className="font-semibold text-lp-accent hover:underline">
                Preview your schedule with the free round robin generator
              </Link>
              .
            </p>
          </div>
          <LeaguePourRealVisual variant="standings" />
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run a pool league?</h2>
          <p className="mt-2 text-lp-muted">Your first league runs free - no card needed.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/guides/how-to-start-a-pool-league" className="font-semibold text-lp-accent hover:underline">Guide: How to start a pool league →</Link>
          <Link href="/guides/how-standings-and-points-work" className="font-semibold text-lp-accent hover:underline">How standings and points work →</Link>
          <Link href="/demo" className="font-semibold text-lp-accent hover:underline">See the demo pool league →</Link>
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/cornhole-tournament-software" className="font-semibold text-lp-accent hover:underline">Cornhole tournament software →</Link>
          <Link href="/bar-trivia-software" className="font-semibold text-lp-accent hover:underline">Bar trivia software →</Link>
        </div>
      </div>
    </>
  );
}
