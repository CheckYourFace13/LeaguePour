import type { Metadata } from "next";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import Link from "next/link";
import { Check } from "lucide-react";
import { cta } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { LeaguePourRealVisual } from "@/components/marketing/LeaguePourRealVisual";

export async function generateMetadata(): Promise<Metadata> {
  return applyManagedMetadata("/features", {
  title: { absolute: "LeaguePour Features for Bar Leagues & Tournaments" },
  description:
    "What LeaguePour does for bar competitions: phone signup and QR codes, Stripe entry fees, automatic brackets and round robins, live standings, venue pages, and player email.",
  alternates: { canonical: "/features" },
  openGraph: { siteName: "LeaguePour", images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
    title: "LeaguePour Features for Bar Leagues & Tournaments",
    description: "Signup, entry fees, brackets, standings and player follow-up for bar competitions.",
    url: "/features",
  },
});
}

// Every item is a working feature today (see src/lib/content-engine/facts.ts). Every plan,
// including the free start, has all of them - plans differ only by competitions running at once.
const groups: { title: string; intro: string; items: string[] }[] = [
  {
    title: "Signup & payments",
    intro: "Before the night: get a confirmed, paid field.",
    items: [
      "A public signup page and QR code for every competition",
      "Solo, captain-led team, or full-roster signup",
      "Participant cap - signup closes automatically when it's full",
      "Entry fees by card through Stripe, charged on your own Stripe account",
      "Free ($0) events with no fees at all",
      "Rules, prizes and an optional waiver on the signup page",
    ],
  },
  {
    title: "Brackets & scoring",
    intro: "On the night: run it from one screen.",
    items: [
      "Single-elimination brackets generated from registrations, byes handled",
      "Round-robin schedules generated automatically",
      "Custom format for anything you run by hand",
      "Score entry by owners, managers and coordinators",
      "Standings that recalculate as scores go in",
      "A live scoreboard page for the TV behind the bar",
    ],
  },
  {
    title: "Venue & follow-up",
    intro: "After the night: get them back next week.",
    items: [
      "A venue page listing everything you have running",
      "A one-line embed for upcoming events on your website",
      "Listing in LeaguePour's game-night directory while signup is open",
      "Email campaigns to opted-in players and followers",
      "Duplicate a competition to open next season's signup",
      "Unlimited staff accounts with owner, manager and coordinator roles",
    ],
  },
];

const notYet = [
  "Waitlists (signup closes at the cap)",
  "Check-in",
  "Sending text messages",
  "Automatic double elimination, Swiss or pool play",
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">Features</h1>
      <p className="mt-4 max-w-2xl text-lg text-lp-muted leading-relaxed">
        LeaguePour is software for bars, breweries and taprooms that run leagues and tournaments - darts,
        cornhole, trivia, pool, euchre, poker, shuffleboard and more. Every feature below is on every plan,
        including the free start.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/signup/venue">{cta.startVenue}</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/demo">See the demo</Link>
        </Button>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title} className="rounded-2xl border border-lp-border bg-lp-surface/40 p-6">
            <h2 className="font-display text-lg font-bold">{g.title}</h2>
            <p className="mt-2 text-xs text-lp-muted">{g.intro}</p>
            <ul className="mt-5 space-y-3">
              {g.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-lp-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-lp-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 grid items-start gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">Brackets built from your signups</h2>
          <p className="mt-3 text-lp-muted leading-relaxed">
            When signup closes, press Start Tournament. An 8-team field becomes a 3-round bracket; 12 teams get 4
            first-round byes so round two is a clean 8. Enter each score and the next round fills in from the
            winners. Round robin works the same way, with one team sitting out each round when the field is odd.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link href="/features/tournaments" className="font-semibold text-lp-accent hover:underline">
              Formats in detail →
            </Link>
            <Link href="/tools/single-elimination-bracket-generator" className="font-semibold text-lp-accent hover:underline">
              Try the free bracket generator →
            </Link>
          </div>
        </div>
        <LeaguePourRealVisual variant="bracket" />
      </div>

      <div className="mt-14 rounded-2xl border border-lp-border bg-lp-surface/40 p-6">
        <h2 className="font-display text-lg font-bold">What it costs to take entry fees</h2>
        <p className="mt-2 text-sm text-lp-muted leading-relaxed">
          On a paid entry, LeaguePour keeps 5% of the entry fee and the player pays a $1.50 service fee at checkout;
          Stripe&apos;s card-processing fee comes out of your share on your own Stripe account. Free events have no fees.{" "}
          <Link href="/pricing" className="font-semibold text-lp-accent hover:underline">
            Plans and fees
          </Link>
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-lp-border bg-lp-surface/40 p-6">
        <h2 className="font-display text-lg font-bold">Not in LeaguePour yet</h2>
        <ul className="mt-3 grid gap-2 text-sm text-lp-muted sm:grid-cols-2">
          {notYet.map((n) => (
            <li key={n}>- {n}</li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/how-it-works" className="font-semibold text-lp-accent hover:underline">
          How it works, step by step
        </Link>
        <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">
          For venues
        </Link>
        <Link href="/find" className="font-semibold text-lp-accent hover:underline">
          Find game nights
        </Link>
        <Link href="/software/bar-tournament-software" className="font-semibold text-lp-accent hover:underline">
          Bar tournament software
        </Link>
        <Link href="/compare/challonge" className="font-semibold text-lp-accent hover:underline">
          vs Challonge
        </Link>
      </div>
    </div>
  );
}
