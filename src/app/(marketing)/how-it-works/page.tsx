import type { Metadata } from "next";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeaguePourRealVisual } from "@/components/marketing/LeaguePourRealVisual";

export async function generateMetadata(): Promise<Metadata> {
  return applyManagedMetadata("/how-it-works", {
  title: { absolute: "How LeaguePour Works: Signup to Standings" },
  description:
    "How a bar runs a league or tournament on LeaguePour: create the competition, share a signup page and QR code, take entry fees, generate brackets, post standings, and fill the next night.",
  alternates: { canonical: "/how-it-works" },
  openGraph: { siteName: "LeaguePour", images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
    title: "How LeaguePour Works: Signup to Standings",
    description: "From signup page to brackets, standings and the next league night.",
    url: "/how-it-works",
  },
});
}

// Every step describes what the venue app does today - check src/lib/content-engine/facts.ts
// before adding to it (no waitlists, no check-in, no SMS sending).
const steps: { title: string; body: string; detail: string[]; link?: { href: string; label: string } }[] = [
  {
    title: "Create your venue",
    body: "Sign up with your name, email and venue name. A new venue can run one competition at a time free, with every feature.",
    detail: [
      "Connect Stripe only if you want to charge entry fees - free ($0) events need nothing else.",
      "Add staff accounts so managers can publish and score without sharing a login.",
    ],
    link: { href: "/pricing", label: "Plans and fees" },
  },
  {
    title: "Build the competition",
    body: "Pick the game (darts, cornhole, trivia, pool, euchre, poker, shuffleboard or custom) and the format.",
    detail: [
      "Single elimination and round robin generate the bracket or schedule for you; Custom lets you run any other format by hand.",
      "Choose solo, captain-led team, or full-roster signup, a participant cap, signup dates, rules, prizes and an optional waiver.",
      "Save it as a draft as long as you like - drafts never count toward your plan.",
    ],
    link: { href: "/guides/round-robin-vs-single-elimination", label: "Round robin vs. single elimination" },
  },
  {
    title: "Publish and share signup",
    body: "Publishing gives the competition its own public page and a QR code to put on table tents or the bar TV.",
    detail: [
      "Players register from their phone - no app download. Paid entries go through Stripe Checkout on your own Stripe account.",
      "Signup closes automatically at your cap. Your venue page lists everything you have running, and a one-line embed puts upcoming events on your website.",
    ],
    link: { href: "/guides/how-to-price-entry-fees-for-a-bar-league-or-tournament", label: "How to price entry fees" },
  },
  {
    title: "Run the night",
    body: "Close signup and press Start Tournament: round one (or the full round-robin schedule) is generated from the registrations, with byes handled for odd fields.",
    detail: [
      "Enter each match score from the venue dashboard; standings recalculate and single-elimination rounds advance from the winners.",
      "Open the live scoreboard on a TV behind the bar so players follow along.",
    ],
    link: { href: "/demo", label: "See a demo league" },
  },
  {
    title: "Fill the next one",
    body: "Everyone who registered or follows your venue is in your audience.",
    detail: [
      "Email campaigns start from a goal - signup closing, starts tomorrow, join the next one, or a winner recap - and only reach players who opted in.",
      "Duplicate a finished competition to reopen signup for next season without rebuilding it.",
    ],
    link: { href: "/guides/managing-no-shows-and-forfeits", label: "Managing no-shows and forfeits" },
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">How it works</p>
      <h1 className="mt-2 font-display text-4xl font-bold">From signup page to standings</h1>
      <p className="mt-4 max-w-2xl text-lg text-lp-muted leading-relaxed">
        LeaguePour runs the parts of a bar league or tournament that eat your time: taking signups, collecting entry
        fees, building the bracket, keeping standings, and getting players back next week. Here is the whole flow.
      </p>

      <ol className="mt-12 space-y-10">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lp-accent/20 text-sm font-bold text-lp-accent">
              {i + 1}
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-lp-text-soft leading-relaxed">{s.body}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-lp-muted leading-relaxed">
                {s.detail.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              {s.link ? (
                <Link href={s.link.href} className="mt-3 inline-block text-sm font-semibold text-lp-accent hover:underline">
                  {s.link.label} →
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-14">
        <h2 className="font-display text-2xl font-bold">What players see</h2>
        <p className="mt-2 text-lp-muted leading-relaxed">
          The public standings page and signup QR code from the demo league - the same screens your players get.
        </p>
        <LeaguePourRealVisual variant="standings" className="mt-6" />
      </div>

      <div className="mt-14 rounded-xl border border-lp-border bg-lp-surface/40 p-5 text-sm text-lp-muted">
        <p className="font-semibold text-lp-text">Signing up to play instead?</p>
        <p className="mt-2">
          Players don&apos;t need anything from you: they find the event page or scan the QR code and register.{" "}
          <Link href="/for-players" className="text-lp-accent hover:underline">
            How it works for players
          </Link>
          {" · "}
          <Link href="/find" className="text-lp-accent hover:underline">
            Find a game night
          </Link>
        </p>
      </div>

      <div className="mt-14 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/signup/venue">Start hosting events - free</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/demo">See the demo</Link>
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/features" className="font-semibold text-lp-accent hover:underline">
          All features
        </Link>
        <Link href="/features/tournaments" className="font-semibold text-lp-accent hover:underline">
          Tournament formats
        </Link>
        <Link href="/tools" className="font-semibold text-lp-accent hover:underline">
          Free bracket tools
        </Link>
        <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">
          For venues
        </Link>
      </div>
    </div>
  );
}
