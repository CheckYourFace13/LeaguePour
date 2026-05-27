import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Bar Poker Tournament Software | LeaguePour",
  description:
    "Run poker tournaments and poker nights at your bar with LeaguePour. Online registration, optional entry fees via Stripe, standings, and player notifications — no spreadsheets.",
  alternates: { canonical: "/poker-tournament-software" },
  keywords: [
    "bar poker tournament software",
    "poker night management",
    "poker tournament registration",
    "poker league software",
    "bar poker night app",
    "poker tournament management",
  ],
  openGraph: {
    title: "Bar Poker Tournament Software | LeaguePour",
    description:
      "Run poker nights and tournaments at your bar — online registration, standings, and player notifications. No spreadsheets.",
    url: "/poker-tournament-software",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour — Poker Tournament Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://leaguepour.com/poker-tournament-software",
      description:
        "Poker tournament management software for bars. Run weekly poker nights with player registration, standings, and bracket management.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "bar poker tournament software, poker night management, poker tournament registration",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can I charge real-money entry fees for poker tournaments through LeaguePour?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "LeaguePour supports Stripe entry fee collection for skill-based competitions. However, poker is regulated differently than other bar games in many US states. Many bars run poker tournaments as 'free entry' events with bar-credit prizes, or charge a minimal 'seat reservation' or 'food and beverage minimum' rather than a direct buy-in. Consult a local attorney familiar with your state's gaming laws before collecting real-money poker entry fees.",
          },
        },
        {
          "@type": "Question",
          name: "How do players register for a bar poker tournament?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Players visit your venue's public LeaguePour page, select the poker night or tournament, complete registration (with or without a fee), and receive a confirmation email with event details. No app download required. You see a real-time list of confirmed players in your dashboard.",
          },
        },
        {
          "@type": "Question",
          name: "Can LeaguePour track poker season standings?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. For a poker league format where players accumulate points across weekly sessions, you can track standings per season and display them publicly. A quarterly championship event with the top-point finishers is a popular format that keeps weekly attendance high all season.",
          },
        },
        {
          "@type": "Question",
          name: "What poker formats work best for a bar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Texas Hold'em tournament format is by far the most popular for bars — nearly everyone knows the basics, and the elimination structure keeps the event to a predictable time window. Sit-and-go formats (6–10 players per table) work well for smaller venues. Multi-table tournaments work for larger events with 30+ players.",
          },
        },
      ],
    },
  ],
};

const features = [
  {
    title: "Online player registration",
    body: "Players sign up from their phone before tournament night. Know your exact headcount — no walk-in chaos, no turning people away at the door.",
  },
  {
    title: "Optional entry fees via Stripe",
    body: "Collect seat reservation fees or food-and-beverage minimums online. Funds deposit directly to your venue's bank account.",
  },
  {
    title: "Season standings",
    body: "Track cumulative points across weekly poker nights. Publish a leaderboard that keeps players competing for the season championship.",
  },
  {
    title: "Player notifications",
    body: "Email registered players about upcoming tournaments, results, and season leaderboard updates — directly from your dashboard.",
  },
  {
    title: "Waitlists",
    body: "Cap the tournament at your seating capacity. Overflow goes to a waitlist and gets notified automatically when seats open up.",
  },
  {
    title: "Venue public page",
    body: "Your branded venue page lists all upcoming poker events with registration links. Shareable, mobile-friendly, and always up to date.",
  },
];

export default function PokerTournamentSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Poker tournament software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Run poker nights at your bar.<br />
          <span className="text-lp-accent">No spreadsheets.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles poker tournament registration, season standings, player notifications,
          and optional online payment collection — all in one platform built for bars running regular
          poker nights.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start your poker tournament</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Everything you need to run a poker night</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
                <h3 className="font-semibold text-lp-text">{f.title}</h3>
                <p className="mt-2 text-sm text-lp-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-2xl bg-lp-surface/40 border border-lp-border p-8">
          <h2 className="font-display text-2xl font-bold">How it works for poker nights</h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                n: 1,
                title: "Create your poker tournament",
                body: "Set the format (weekly night, one-time tournament, or league season), max players, any registration fee, and the event date and time.",
              },
              {
                n: 2,
                title: "Share the registration link",
                body: "Post to social media, your bar's website, or display a QR code at the bar. Players register and confirm their seat before tournament night.",
              },
              {
                n: 3,
                title: "Run the tournament",
                body: "Check in registered players, start with a confirmed field, and enter finish positions after the tournament concludes. Season points update automatically.",
              },
              {
                n: 4,
                title: "Build your season",
                body: "Email all registered players the updated leaderboard after each week. Create urgency for the next event — players in contention for the championship keep coming back.",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lp-accent/20 text-sm font-bold text-lp-accent">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-lp-text">{s.title}</p>
                  <p className="mt-1 text-sm text-lp-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Why poker nights work for bars</h2>
          <div className="mt-5 space-y-4 text-lp-text leading-relaxed">
            <p>
              Poker draws one of the highest-spend demographics of any bar competition. Tournament
              players typically stay for 3–5 hours for a structured event. They're in a focused,
              social mindset that's ideal for bar spend — steady drinks, good conversation between
              hands, and a reason to be there.
            </p>
            <p>
              A weekly poker league format, where players accumulate points across multiple evenings
              toward a quarterly championship, is one of the best ways to build a loyal core of
              regulars. Once a player is in contention for the season standings, they show up every
              week. Missing a week costs them points — and the competitive drive is strong enough
              that most committed players won't risk it.
            </p>
            <p>
              Many bars run poker tournaments with no real-money entry fee — instead charging a
              small food-and-beverage minimum or running it as a free event with a bar-credit prize.
              This sidesteps gaming regulations in most states while still creating the competitive
              structure that makes poker nights compelling. LeaguePour supports both fee and
              free-entry formats.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-lp-border bg-lp-surface/40 p-6">
          <p className="text-sm text-lp-muted">
            <strong className="text-lp-text">Note on poker and gaming laws:</strong> Poker is regulated
            differently than skill-based games like darts or cornhole in many US jurisdictions. Before
            collecting real-money entry fees for poker tournaments, consult a local attorney familiar
            with your state's gaming regulations. LeaguePour supports Stripe fee collection for
            events where it is legal to do so.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                q: "Can I charge real-money entry fees for poker tournaments?",
                a: "LeaguePour supports Stripe fee collection. However, poker is regulated differently than other bar games in many states. Many bars run poker tournaments as free-entry events with bar-credit prizes, or charge a food-and-beverage minimum. Consult a local attorney before collecting real-money poker buy-ins.",
              },
              {
                q: "How do players register for a bar poker tournament?",
                a: "Players visit your venue's public LeaguePour page, select the poker event, register (with or without a fee), and receive a confirmation email. No app download required. You see a real-time confirmed player list in your dashboard.",
              },
              {
                q: "Can LeaguePour track poker season standings?",
                a: "Yes. Track cumulative points across weekly sessions and display a public leaderboard. A quarterly championship with the top-point finishers keeps weekly attendance high all season.",
              },
              {
                q: "What poker format works best for a bar?",
                a: "Texas Hold'em tournament format is the most popular — nearly everyone knows the basics, and the elimination structure keeps the event to a predictable time window. Sit-and-go formats work well for smaller venues; multi-table tournaments work for 30+ player events.",
              },
            ].map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to launch your poker night?</h2>
          <p className="mt-2 text-lp-muted">Set up in minutes. Free to start, no credit card required.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup/venue">Start hosting events</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/dart-league-software" className="font-semibold text-lp-accent hover:underline">Dart league software →</Link>
          <Link href="/euchre-tournament-software" className="font-semibold text-lp-accent hover:underline">Euchre tournament software →</Link>
          <Link href="/bar-trivia-software" className="font-semibold text-lp-accent hover:underline">Bar trivia software →</Link>
        </div>
      </div>
    </>
  );
}
