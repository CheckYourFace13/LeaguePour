import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "How LeaguePour Works | Tournament Signup Software for Bars" },
  description:
    "How LeaguePour works for venue competition software: pick a format, launch bar event registration, run standings, and fill the next league night.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How LeaguePour Works",
    description: "From signup page to brackets and repeat players.",
    url: "/how-it-works",
  },
};

const steps = [
  {
    title: "Pick a format",
    body: "Trivia, darts, bags, cards, pool, shuffleboard, or custom - smart defaults for fees, teams, and signup windows.",
  },
  {
    title: "Publish signup",
    body: "Share your public page. Solo, captain, or team paths - waivers and spots stay visible.",
  },
  {
    title: "Run it",
    body: "Check-in, brackets, standings, manual scores when you need them.",
  },
  {
    title: "Fill the next one",
    body: "Reach opted-in followers and registrants - drafts for closing soon and next season.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">Flow</p>
      <h1 className="mt-2 font-display text-4xl font-bold">How LeaguePour works</h1>
      <p className="mt-4 max-w-2xl text-lg text-lp-muted leading-relaxed">
        LeaguePour connects venue operators and players for bar competitions. Venues publish events and collect fees;
        players find events and register from their phone. Four steps, self-serve.
      </p>
      <div className="mt-8 rounded-xl border border-lp-border bg-lp-surface/40 p-5 text-sm text-lp-muted">
        <p className="font-semibold text-lp-text">Venue signup</p>
        <p className="mt-2">
          Create a venue account, connect Stripe for paid events, and publish your first competition.{" "}
          <Link href="/for-venues" className="text-lp-accent hover:underline">
            See the venue guide
          </Link>
          .
        </p>
        <p className="mt-4 font-semibold text-lp-text">Player signup</p>
        <p className="mt-2">
          Create a free player account, follow venues, and register when signup opens.{" "}
          <Link href="/for-players" className="text-lp-accent hover:underline">
            See the player guide
          </Link>
          .
        </p>
      </div>
      <ol className="mt-12 space-y-10">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lp-accent/20 text-sm font-bold text-lp-accent">
              {i + 1}
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-lp-muted leading-relaxed">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-14 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/signup/venue">Start hosting events</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/pricing">See pricing</Link>
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/features" className="font-semibold text-lp-accent hover:underline">
          View features
        </Link>
        <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">
          Venue use cases
        </Link>
      </div>
    </div>
  );
}
