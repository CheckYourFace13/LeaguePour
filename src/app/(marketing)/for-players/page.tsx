import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: { absolute: "For Players | Join Bar Leagues & Tournaments | LeaguePour" },
  description:
    "Find and join bar competitions near you on LeaguePour. Sign up for trivia nights, dart leagues, cornhole tournaments, pool leagues, and more - one account, secure payments.",
  alternates: { canonical: "/for-players" },
  openGraph: {
    title: "LeaguePour for Players | Join Bar Leagues & Tournaments",
    description: "One account to find and join venue competitions - trivia, darts, cornhole, pool, and more.",
    url: "/for-players",
  },
};

const benefits = [
  {
    title: "One login, every venue",
    body: "Your LeaguePour profile works at any participating bar or taproom. Register for events across multiple venues without creating new accounts.",
  },
  {
    title: "Secure entry fee payments",
    body: "Pay entry fees safely via Stripe Checkout. Your card is never stored by the venue - all payments are processed securely and you get an instant confirmation email.",
  },
  {
    title: "Follow venues you love",
    body: "Follow your local bar and get notified when they open signup for new leagues and tournaments - trivia nights, dart leagues, cornhole, pool, and more.",
  },
  {
    title: "Manage all your registrations",
    body: "See your upcoming competitions, payment history, and team memberships in one dashboard. Cancel or check status anytime.",
  },
  {
    title: "Control your alerts",
    body: "Choose email or SMS (or both) for each venue you follow. Never miss a league night - and never get spam you didn't ask for.",
  },
  {
    title: "Team-based or solo",
    body: "Register solo, join as a team captain, or accept a teammate invite. LeaguePour handles all three formats depending on what the venue sets up.",
  },
];

const sports = [
  { name: "Trivia nights", href: "/bar-trivia-software" },
  { name: "Dart leagues", href: "/dart-league-software" },
  { name: "Cornhole tournaments", href: "/cornhole-tournament-software" },
  { name: "Pool leagues", href: "/pool-league-management" },
  { name: "Shuffleboard", href: "/for-venues" },
  { name: "Poker & cards", href: "/for-venues" },
  { name: "Music bingo", href: "/for-venues" },
  { name: "Euchre & more", href: "/for-venues" },
];

export default function ForPlayersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
      <p className="lp-kicker text-lp-accent">For players</p>
      <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
        Find bar leagues near you.<br />
        <span className="text-lp-accent">Register in minutes.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-lp-muted">
        LeaguePour connects players to local bar competitions - trivia, dart leagues, cornhole, pool, and
        more. One free account. Secure payments. You control your alerts.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/signup/player">Create free account</Link>
        </Button>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/how-it-works">How it works</Link>
        </Button>
      </div>

      <div className="mt-20">
        <h2 className="font-display text-2xl font-bold">What you get as a player</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
              <h3 className="font-semibold text-lp-text">{b.title}</h3>
              <p className="mt-2 text-sm text-lp-muted leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20">
        <h2 className="font-display text-2xl font-bold">Bar competitions you can join</h2>
        <p className="mt-2 text-lp-muted">LeaguePour venues run all kinds of events - find one near you.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {sports.map((s) => (
            <Link
              key={s.name}
              href={s.href}
              className="rounded-full border border-lp-border bg-lp-surface/40 px-4 py-2 text-sm font-semibold text-lp-text hover:border-lp-accent hover:text-lp-accent transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-20 rounded-2xl bg-lp-surface/40 border border-lp-border p-8">
        <h2 className="font-display text-2xl font-bold">How player signup works</h2>
        <ol className="mt-6 space-y-5">
          {[
            { n: 1, title: "Create a free account", body: "Sign up at leaguepour.com with your email. No credit card required to join." },
            { n: 2, title: "Find a competition", body: "Follow a venue or visit their competition page directly. Your bar or taproom may have shared a link or QR code." },
            { n: 3, title: "Register & pay", body: "Select your spot, fill in your team name (if applicable), and pay the entry fee securely via Stripe. Free events skip payment entirely." },
            { n: 4, title: "Show up and compete", body: "You'll get a confirmation email with event details. Show up, check in, and have fun." },
          ].map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lp-accent/20 text-sm font-bold text-lp-accent">{s.n}</span>
              <div>
                <p className="font-semibold text-lp-text">{s.title}</p>
                <p className="mt-1 text-sm text-lp-muted leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-16 text-center">
        <h2 className="font-display text-2xl font-bold">Ready to play?</h2>
        <p className="mt-2 text-lp-muted">Create your free player account and find competitions near you.</p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/signup/player">Join as player</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/for-venues">Are you a venue?</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
