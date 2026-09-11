import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: { absolute: "Bar League Standings Software | Live Scoreboards | LeaguePour" },
  description:
    "Keep bar league standings live and public. LeaguePour updates standings automatically as scores come in and displays them on a shareable page or a TV behind the bar.",
  alternates: { canonical: "/bar-league-standings" },
  keywords: [
    "bar league standings",
    "league standings software",
    "bar scoreboard software",
    "live standings for bar leagues",
    "TV scoreboard for bars",
    "bar league management software",
  ],
  openGraph: {
    title: "Bar League Standings Software | LeaguePour",
    description:
      "Live, automatically-updating standings for any bar league - darts, pool, cornhole, trivia, and more. Shareable page or TV scoreboard.",
    url: "/bar-league-standings",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour - Bar League Standings",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${getPublicSiteUrl()}/bar-league-standings`,
      description:
        "Live standings and TV scoreboard software for bar leagues. Standings update automatically as staff enter scores, with a public page players can check from their phone.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "bar league standings, league standings software, bar scoreboard",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do bar league standings update on LeaguePour?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Staff enter match results after each round, and standings recalculate immediately - no manual math or spreadsheet formulas.",
          },
        },
        {
          "@type": "Question",
          name: "Can I display standings on a TV behind the bar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Every competition has a scoreboard view built to display on a TV, refreshing automatically as scores come in.",
          },
        },
        {
          "@type": "Question",
          name: "Do players need an account to check standings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Standings are on a public page anyone can view from a link or QR code - no login required to check them.",
          },
        },
      ],
    },
  ],
};

const features = [
  { title: "Automatic standings", body: "Enter scores after each match. Rankings, wins, losses, and points recalculate instantly - no spreadsheet formulas." },
  { title: "TV scoreboard mode", body: "A dedicated scoreboard view built to display on a TV behind the bar, refreshing automatically." },
  { title: "Public standings page", body: "Every competition gets a shareable link and QR code. Players check standings from their phone - no login required." },
  { title: "Works for any format", body: "Single elimination, round-robin, or ongoing leagues - standings track whichever format you're running." },
  { title: "Results history", body: "Past match results stay attached to the competition, so players can see how the standings came together." },
  { title: "Any game", body: "Darts, pool, cornhole, trivia, shuffleboard, euchre, poker - standings work the same way for every game type." },
];

export default function BarLeagueStandingsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Bar league standings</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Standings that update themselves.<br />
          <span className="text-lp-accent">On your TV or their phone.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour keeps league standings live and public - automatically recalculated after
          every round, viewable on a TV behind the bar or from any player&apos;s phone.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/demo">See a live example</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Everything you need for live standings</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
                <h3 className="font-semibold text-lp-text">{f.title}</h3>
                <p className="mt-2 text-sm text-lp-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {[
              { q: "How do bar league standings update on LeaguePour?", a: "Staff enter match results after each round, and standings recalculate immediately - no manual math or spreadsheet formulas." },
              { q: "Can I display standings on a TV behind the bar?", a: "Yes. Every competition has a scoreboard view built to display on a TV, refreshing automatically as scores come in." },
              { q: "Do players need an account to check standings?", a: "No. Standings are on a public page anyone can view from a link or QR code - no login required to check them." },
            ].map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">{f.q}</summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run your league?</h2>
          <p className="mt-2 text-lp-muted">Set up in minutes. Free to start, no credit card required.</p>
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
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/pool-league-management" className="font-semibold text-lp-accent hover:underline">Pool league management →</Link>
          <Link href="/guides" className="font-semibold text-lp-accent hover:underline">More guides →</Link>
        </div>
      </div>
    </>
  );
}
