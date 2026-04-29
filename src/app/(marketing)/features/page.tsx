import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { cta } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "LeaguePour Features | Competition Management Platform for Venues",
  description:
    "LeaguePour features for venue competition software: tournament signup, bar event registration, league management, standings, and Stripe Connect entry fees.",
  alternates: { canonical: "/features" },
  openGraph: {
    title: "LeaguePour Features | Competition Management for Bars",
    description: "Tools for trivia signup software, dart league software, and cornhole tournament operations.",
    url: "/features",
  },
};

const groups = [
  {
    title: "Builder",
    items: [
      "Format templates",
      "Signup windows & run dates",
      "Fees, caps, waitlists",
      "Solo, captain, or team signup",
      "Rules, prizes, waivers",
      "One-off or recurring",
    ],
  },
  {
    title: "Night-of",
    items: ["Registrations & check-in", "Teams & rosters", "Brackets & standings", "Scores → public page"],
  },
  {
    title: "Growth",
    items: ["Consent-first email & SMS hooks", "Audience segments", "Campaign drafts", "Player prefs", "Open signup discovery"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">Features</h1>
      <p className="mt-4 max-w-xl text-lg text-lp-muted">What you get on night one.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/signup/venue">{cta.startVenue}</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/pricing">See pricing</Link>
        </Button>
      </div>
      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title} className="rounded-2xl border border-lp-border bg-lp-surface/40 p-6">
            <h2 className="font-display text-lg font-bold">{g.title}</h2>
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
      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">
          For venues
        </Link>
        <Link href="/how-it-works" className="font-semibold text-lp-accent hover:underline">
          How LeaguePour works
        </Link>
      </div>
    </div>
  );
}
