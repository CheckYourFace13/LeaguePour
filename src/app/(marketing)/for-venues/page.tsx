import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "For Venues | LeaguePour Bar Competition Software",
  description:
    "LeaguePour for bars and taprooms: venue competition software, tournament signup software for bars, and player registration with Stripe entry fees.",
  alternates: { canonical: "/for-venues" },
  openGraph: {
    title: "LeaguePour for Venues",
    description: "Bar event registration software for trivia, darts, cornhole, and league nights.",
    url: "/for-venues",
  },
};

export default function ForVenuesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <h1 className="font-display text-4xl font-bold">For venues</h1>
      <p className="mt-4 text-lg text-lp-muted">Leagues, brackets, buy-ins — less spreadsheet chaos.</p>
      <p className="mt-3 text-sm text-lp-muted">
        Built for bar tournament platform workflows: publish signup pages, manage team registration, and run weekly
        competition nights.
      </p>
      <ul className="mt-10 space-y-3 text-lp-muted">
        <li>· Public signup pages</li>
        <li>· Entry fees (Stripe Connect)</li>
        <li>· Standings & results</li>
        <li>· Re-engage opted-in players</li>
      </ul>
      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/signup/venue">Create venue</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/pricing">See pricing</Link>
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/features" className="font-semibold text-lp-accent hover:underline">
          Explore features
        </Link>
        <Link href="/how-it-works" className="font-semibold text-lp-accent hover:underline">
          See setup flow
        </Link>
      </div>
    </div>
  );
}
