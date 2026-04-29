import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatUsdCents, PLAN_DEFINITIONS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "LeaguePour Pricing | Bar Event Registration Software Plans",
  description:
    "Pricing for LeaguePour venue competition software. Plans for trivia signup software, dart league software, and cornhole tournament software.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "LeaguePour Pricing | Bar Event Registration Software",
    description: "Monthly and annual plans for bar tournament platform workflows and player registration.",
    url: "/pricing",
  },
  twitter: {
    title: "LeaguePour Pricing",
    description: "Venue competition software plans for bars and recurring tournament signup.",
  },
};

export default function PricingPage() {
  return (
    <div className="lp-section mx-auto max-w-6xl px-4 md:px-6">
      <h1 className="lp-page-title text-4xl md:text-5xl">Pricing</h1>
      <p className="lp-page-sub mt-5 max-w-xl text-lg text-lp-muted">
        Simple tiers. Annual saves 10%.
      </p>
      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
        {PLAN_DEFINITIONS.map((t) => (
          <Card
            key={t.name}
            className={`lp-pricing-card ${
              t.featured ? "lp-feature-ring border-lp-accent/40 md:-translate-y-1" : ""
            }`}
          >
            {t.featured ? <p className="lp-kicker text-lp-accent">Most popular</p> : <p className="lp-kicker">Plan</p>}
            <p className="mt-2 font-display text-2xl font-bold tracking-tight text-lp-text">{t.name}</p>
            <p className="mt-5 font-display text-4xl font-extrabold tracking-tight text-lp-text md:text-[2.75rem]">
              {formatUsdCents(t.monthlyCents)}
              <span className="text-base font-semibold text-lp-muted"> /mo</span>
            </p>
            <p className="mt-1.5 text-sm text-lp-muted">
              {formatUsdCents(t.annualCents)} /yr <span className="font-semibold text-lp-accent">−10%</span>
            </p>
            <ul className="mt-8 space-y-2.5 text-sm leading-snug text-lp-text-soft">
              <li className="flex gap-2">
                <span className="text-lp-accent">·</span>
                <span>{t.eventLimitLabel} / mo</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lp-accent">·</span>
                <span>Stripe Connect entry fees</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lp-accent">·</span>
                <span>Campaigns & audience</span>
              </li>
            </ul>
            <Button className="mt-10 w-full min-h-12 text-base" variant={t.featured ? "primary" : "secondary"} asChild>
              <Link href={`/signup/venue?plan=${t.plan.toLowerCase()}`}>Choose {t.name}</Link>
            </Button>
          </Card>
        ))}
      </div>
      <p className="mt-10 text-center text-xs text-lp-muted">
        Platform fee on paid registrations — set in Venue profile.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link href="/features" className="font-semibold text-lp-accent hover:underline">
          See competition management features
        </Link>
        <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">
          Compare venue use cases
        </Link>
      </div>
    </div>
  );
}
