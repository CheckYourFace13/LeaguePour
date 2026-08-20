import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: { absolute: "Pool League Management Software for Bars | LeaguePour" },
  description:
    "Manage 8-ball and 9-ball pool leagues at your bar with LeaguePour. Online signup, entry fees via Stripe, standings, and player communication - no paper brackets.",
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
  openGraph: {
    title: "Pool League Management Software for Bars | LeaguePour",
    description:
      "Manage bar pool leagues - online signup, entry fees, standings, and player messaging. Built for bars.",
    url: "/pool-league-management",
  },
};

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
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "pool league management, billiards tournament software, bar pool league",
    },
  ],
};

const features = [
  { title: "Solo & team formats", body: "Run individual 8-ball brackets or team-based pool leagues - set your format when you create the event." },
  { title: "Entry fee collection", body: "Collect league dues online before pool night. Stripe deposits directly to your bar's account." },
  { title: "Season scheduling", body: "Set match schedules for weekly or bi-weekly league nights. Players see their schedule on your public page." },
  { title: "Standings & stats", body: "Track wins, losses, and standings throughout the season. Updated automatically after you enter results." },
  { title: "Player messaging", body: "Email your league players about schedule changes, standings updates, and playoff announcements." },
  { title: "Playoff brackets", body: "End-of-season bracket playoffs - auto-seeded from regular season standings." },
];

export default function PoolLeagueManagementPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Pool & billiards league software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Pool leagues,<br />
          <span className="text-lp-accent">run without the paperwork.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles pool and billiards league registration, entry fees, standings, and player
          communication - all online, all automatic.
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

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run a pool league?</h2>
          <p className="mt-2 text-lp-muted">Set up in minutes. Free to start.</p>
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
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/cornhole-tournament-software" className="font-semibold text-lp-accent hover:underline">Cornhole tournament software →</Link>
          <Link href="/bar-trivia-software" className="font-semibold text-lp-accent hover:underline">Bar trivia software →</Link>
        </div>
      </div>
    </>
  );
}
