import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "About LeaguePour | Bar League & Tournament Management Platform" },
  description:
    "LeaguePour helps bars and venues run dart leagues, cornhole tournaments, trivia nights, and pool leagues — with online signup, Stripe payments, standings, and player marketing built in.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About LeaguePour",
    description:
      "LeaguePour helps bars run organized leagues and tournaments — online signup, Stripe entry fees, live standings, and player marketing in one platform.",
    url: "https://leaguepour.com/about",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">

      {/* Hero */}
      <p className="lp-kicker text-lp-accent">About</p>
      <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
        The bar league platform built<br />
        <span className="text-lp-accent">for neighborhood venues</span>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-lp-muted leading-relaxed">
        LeaguePour is a competition management platform that helps bars, taverns, breweries,
        and entertainment venues run organized leagues and tournaments — and fill their floors
        with returning customers on a regular schedule.
      </p>

      {/* Mission */}
      <div className="mt-16 space-y-5 text-lp-muted leading-relaxed">
        <h2 className="font-display text-2xl font-bold text-lp-text">Why we built this</h2>
        <p>
          Bar leagues — dart leagues, cornhole tournaments, trivia nights, pool ladders — have
          been a staple of neighborhood bar culture for decades. The problem is that most bars
          still run them on paper. Signup sheets. Cash jars. Group texts. Manual standings
          tracked in a notebook behind the bar.
        </p>
        <p>
          That friction means fewer leagues get started, fewer players participate, and bars
          leave consistent weekly revenue on the table. LeaguePour replaces the paperwork with
          a simple platform that handles everything: online player signup, entry fee collection
          through Stripe, automated standings, player email reminders, and a public competition
          page with a QR code you can post behind the bar.
        </p>
        <p>
          The result is more players, more consistent attendance, and less admin work for the
          bar owner or bartender running the night.
        </p>
      </div>

      {/* What we do */}
      <div className="mt-16 space-y-5 text-lp-muted leading-relaxed">
        <h2 className="font-display text-2xl font-bold text-lp-text">What LeaguePour does</h2>
        <ul className="space-y-3 pl-1">
          {[
            { title: "Online player signup", body: "Every competition gets a shareable URL and QR code. Players register from their phone — no app required." },
            { title: "Entry fee collection", body: "Bars set the entry fee. Players pay securely through Stripe Checkout at signup. No cash at the door, no chasing payments." },
            { title: "Live standings and scoreboards", body: "Standings update as results are recorded. A dedicated scoreboard page can be displayed on a bar TV in fullscreen TV mode." },
            { title: "Player marketing tools", body: "Every player who registers opts into email communications from the venue. Send reminders, announce new competitions, and bring regulars back." },
            { title: "Embed widget", body: "Venues can embed their upcoming competition schedule directly on their own website or Facebook page with a simple iframe snippet." },
            { title: "All game types", body: "Darts, cornhole, trivia, pool, shuffleboard, poker, music bingo, euchre, and any other competition format a venue wants to run." },
          ].map((item) => (
            <li key={item.title} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
              <p className="font-semibold text-lp-text">{item.title}</p>
              <p className="mt-1 text-sm">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Who it's for */}
      <div className="mt-16 space-y-4 text-lp-muted leading-relaxed">
        <h2 className="font-display text-2xl font-bold text-lp-text">Who uses LeaguePour</h2>
        <p>
          <strong className="text-lp-text">Bars and taverns</strong> — neighborhood bars that want
          to build a consistent weekly crowd with dart leagues, cornhole nights, or trivia.
          LeaguePour turns a slow Tuesday into a full house on a schedule.
        </p>
        <p>
          <strong className="text-lp-text">Craft breweries and taprooms</strong> — newer venues
          that want to add regular programming beyond pints. A weekly trivia night or cornhole
          tournament gives regulars a reason to make a specific night part of their routine.
        </p>
        <p>
          <strong className="text-lp-text">Sports bars and entertainment venues</strong> — bars
          with existing sports audiences that want to extend engagement through organized
          in-house competition between games.
        </p>
        <p>
          <strong className="text-lp-text">Players</strong> — anyone looking for a dart league,
          cornhole tournament, or trivia night near them. LeaguePour&apos;s city pages list active
          competitions across more than 130 cities in the US and Canada.
        </p>
      </div>

      {/* How we operate */}
      <div className="mt-16 space-y-4 text-lp-muted leading-relaxed">
        <h2 className="font-display text-2xl font-bold text-lp-text">How we operate</h2>
        <p>
          LeaguePour is a bootstrapped, independently operated platform. We don&apos;t take a cut
          of entry fees — venues keep everything they collect through Stripe, minus standard
          Stripe processing fees. Our revenue comes from venue subscriptions for advanced
          features.
        </p>
        <p>
          We focus on one thing: making it as easy as possible for a bar owner to run a great
          organized competition that players want to come back to. No bloat, no enterprise
          complexity — just the tools a neighborhood bar actually needs.
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-16 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/signup/venue">Run leagues at your bar</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/for-venues">See how it works</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/contact">Get in touch</Link>
        </Button>
      </div>

      {/* Links */}
      <div className="mt-12 flex flex-wrap gap-4 text-sm border-t border-lp-border pt-8">
        <Link href="/features" className="font-semibold text-lp-accent hover:underline">Platform features</Link>
        <Link href="/pricing" className="font-semibold text-lp-accent hover:underline">Pricing</Link>
        <Link href="/for-players" className="font-semibold text-lp-accent hover:underline">For players</Link>
        <Link href="/bar-leagues/chicago" className="font-semibold text-lp-accent hover:underline">Bar leagues by city</Link>
        <Link href="/contact" className="font-semibold text-lp-accent hover:underline">Contact</Link>
      </div>

    </div>
  );
}
