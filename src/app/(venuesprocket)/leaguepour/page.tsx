import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LeaguePour by VenueSprocket — Fill Slow Nights with Leagues and Game Nights",
  description:
    "LeaguePour is the public event module inside VenueSprocket. Run dart leagues, cornhole tournaments, trivia nights, pool leagues, and bar game competitions with QR signups, standings, and Stripe entry fees.",
  alternates: { canonical: "https://venuesprocket.com/leaguepour" },
};

const games = [
  { name: "Dart Leagues", emoji: "🎯" },
  { name: "Cornhole / Bags", emoji: "🎳" },
  { name: "Trivia Nights", emoji: "🧠" },
  { name: "Pool Leagues", emoji: "🎱" },
  { name: "Euchre", emoji: "🃏" },
  { name: "Poker Nights", emoji: "♠️" },
  { name: "Shuffleboard", emoji: "🏒" },
  { name: "Music Bingo", emoji: "🎵" },
];

export default function VsLeaguePourPage() {
  return (
    <div className="vs-section px-4 md:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-block mb-4 rounded-xl border-2 border-vs-accent/20 bg-vs-surface-2 px-6 py-3">
            <p className="font-display text-lg font-extrabold text-vs-text">
              League<span className="text-vs-accent">Pour</span>{" "}
              <span className="text-xs font-normal text-vs-muted">by VenueSprocket</span>
            </p>
          </div>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-4">
            Fill slow nights with leagues and game nights
          </h1>
          <p className="vs-page-sub mx-auto text-center max-w-2xl">
            VenueSprocket manages your private events. LeaguePour fills the rest of your calendar
            with recurring public competitions — dart leagues, cornhole tournaments, trivia nights,
            and more — that bring the same players back every week.
          </p>
        </div>

        {/* Combined pitch */}
        <div className="mb-14 rounded-2xl border border-vs-border-strong bg-vs-surface p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-semibold text-vs-text mb-1">Private Events</p>
              <p className="text-sm text-vs-text-soft">Birthday parties, corporate events, holiday parties, rehearsal dinners — bigger bookings, bigger revenue per event.</p>
            </div>
            <div className="flex items-center justify-center text-3xl text-vs-muted">+</div>
            <div className="text-center">
              <p className="text-3xl mb-2">🎯</p>
              <p className="font-semibold text-vs-text mb-1">LeaguePour Events</p>
              <p className="text-sm text-vs-text-soft">Dart leagues, trivia, cornhole — repeat weekly traffic, player entry fees, and a reliable customer base built over seasons.</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm font-bold text-vs-accent">
              One platform to grow venue revenue from both private events and public programming.
            </p>
          </div>
        </div>

        {/* Game types */}
        <div className="mb-14">
          <h2 className="font-display text-2xl font-bold text-vs-text text-center mb-6">
            What leagues and competitions can I run?
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {games.map((g) => (
              <div
                key={g.name}
                className="flex flex-col items-center gap-2 rounded-xl border border-vs-border bg-vs-surface px-4 py-4 text-center"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-sm font-semibold text-vs-text-soft">{g.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-14">
          <h2 className="font-display text-2xl font-bold text-vs-text text-center mb-6">
            How LeaguePour works
          </h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Create a competition", body: "Set the game type, dates, entry fee, and player cap. Publish it in minutes." },
              { step: "2", title: "Players sign up online", body: "Share a link or post the QR code at the bar. Players register from their phone with no app required." },
              { step: "3", title: "Collect entry fees", body: "Entry fees are collected through Stripe at signup. No cash at the door, no chasing payments." },
              { step: "4", title: "Run the event", body: "Display live standings on the bar TV in fullscreen TV mode. Record results as the night progresses." },
              { step: "5", title: "Players come back", body: "Standings update, players follow their league progress, and the same faces show up next week." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 rounded-xl border border-vs-border bg-vs-surface p-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vs-accent text-sm font-bold text-white">
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-vs-text">{s.title}</p>
                  <p className="mt-1 text-sm text-vs-text-soft">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-promotion */}
        <div className="mb-14 rounded-2xl border border-vs-border bg-vs-surface-2 p-8">
          <h2 className="font-display text-2xl font-bold text-vs-text mb-3">
            Turns game-night players into private event leads
          </h2>
          <p className="text-vs-text-soft leading-relaxed mb-4">
            Every player who signs up for a LeaguePour dart league or trivia night is already a
            regular at your venue. LeaguePour adds them to your marketing list automatically.
            VenueSprocket can then invite them to book their next birthday party, work event,
            or holiday party with you — turning repeat public event customers into private
            event leads.
          </p>
          <ul className="space-y-2">
            {[
              "LeaguePour venue pages include a 'Book a private event here' link",
              "LeaguePour players can be invited to upcoming private event availability",
              "VenueSprocket dashboard shows public event revenue alongside private event revenue",
              "Combined player and event customer list in one CRM",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-vs-text-soft">
                <span className="text-vs-accent font-bold shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-vs-text mb-4">
            Ready to fill slow nights?
          </h2>
          <p className="text-vs-text-soft mb-8 max-w-xl mx-auto">
            Start with VenueSprocket and add LeaguePour on the Growth plan. Or try LeaguePour
            directly at leaguepour.com.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/start"
              className="rounded-xl bg-vs-accent px-8 py-4 text-lg font-bold text-white hover:bg-vs-accent-hover transition-colors"
            >
              Start with VenueSprocket
            </Link>
            <a
              href="https://leaguepour.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-vs-border-strong bg-vs-surface px-8 py-4 text-lg font-bold text-vs-text hover:border-vs-accent transition-colors"
            >
              Try LeaguePour directly
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
