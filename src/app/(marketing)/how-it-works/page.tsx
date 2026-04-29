import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How LeaguePour Works | Tournament Signup Software for Bars",
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
    body: "Trivia, darts, bags, cards, pool, shuffleboard, or custom — smart defaults for fees, teams, and signup windows.",
  },
  {
    title: "Publish signup",
    body: "Share your public page. Solo, captain, or team paths — waivers and spots stay visible.",
  },
  {
    title: "Run it",
    body: "Check-in, brackets, standings, manual scores when you need them.",
  },
  {
    title: "Fill the next one",
    body: "Reach opted-in followers and registrants — drafts for closing soon and next season.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <p className="text-xs font-bold uppercase tracking-wider text-lp-muted">Flow</p>
      <h1 className="mt-2 font-display text-4xl font-bold">How LeaguePour works</h1>
      <p className="mt-4 text-lg text-lp-muted">Four steps. Self-serve.</p>
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
          <Link href="/signup/venue">Create venue</Link>
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
