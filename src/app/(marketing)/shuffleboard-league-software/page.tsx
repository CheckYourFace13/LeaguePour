import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shuffleboard League Software for Bars | LeaguePour",
  description:
    "Run shuffleboard leagues and tournaments at your bar with LeaguePour. Online signup, entry fees via Stripe, standings, and bracket management - no spreadsheets needed.",
  alternates: { canonical: "/shuffleboard-league-software" },
  keywords: [
    "shuffleboard league software",
    "bar shuffleboard tournament",
    "shuffleboard league management",
    "shuffleboard tournament software",
    "bar shuffleboard league app",
    "shuffleboard competition management",
  ],
  openGraph: {
    title: "Shuffleboard League Software for Bars | LeaguePour",
    description:
      "Run shuffleboard leagues and tournaments at your bar - online signup, entry fees, standings, and brackets. No spreadsheets.",
    url: "/shuffleboard-league-software",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour - Shuffleboard League Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://leaguepour.com/shuffleboard-league-software",
      description:
        "Shuffleboard league management software for bars. Run weekly shuffleboard leagues with team signup, entry fees, standings, and automatic bracket generation.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "shuffleboard league software, bar shuffleboard tournament, shuffleboard league management",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can LeaguePour run a weekly shuffleboard league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Create a shuffleboard league with a set number of teams, signup deadline, entry fee, and weekly match schedule. Standings update automatically after each round, and registered players receive email notifications about results and upcoming matches.",
          },
        },
        {
          "@type": "Question",
          name: "How do players sign up for a shuffleboard league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Players visit your venue's public page on LeaguePour, select the shuffleboard league, choose their team format (singles or doubles), pay the entry fee via Stripe Checkout, and receive a confirmation email. No app download required.",
          },
        },
        {
          "@type": "Question",
          name: "What shuffleboard formats does LeaguePour support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "LeaguePour supports singles, doubles, and captain-led team formats. You set the team size and max participants when you create the league. Round-robin, single elimination, and double elimination bracket types are all available.",
          },
        },
        {
          "@type": "Question",
          name: "What entry fees can I charge for a shuffleboard league?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can set any entry fee amount. Stripe deposits the money directly to your venue's bank account. LeaguePour charges a 5% platform fee plus $1.50 per player service fee, which can be passed to players or absorbed by the venue.",
          },
        },
      ],
    },
  ],
};

const features = [
  {
    title: "Online team signup",
    body: "Singles or doubles - players register from their phone before they walk in the door. No paper forms, no cash envelopes.",
  },
  {
    title: "Entry fees via Stripe",
    body: "Collect league buy-ins automatically. Funds go directly to your venue's bank account within 2 business days.",
  },
  {
    title: "Standings & scoring",
    body: "Update scores after each round. Standings refresh automatically and display on your venue's public page.",
  },
  {
    title: "Bracket management",
    body: "Round-robin, single elimination, or double elimination - set it once when you create the league.",
  },
  {
    title: "Player notifications",
    body: "Email registered players about schedule changes, match results, and upcoming league nights - from your dashboard.",
  },
  {
    title: "Waitlists",
    body: "Cap the league at your table count. Overflow goes to a waitlist and gets notified automatically when spots open.",
  },
];

export default function ShuffleboardLeagueSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Shuffleboard league software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Run shuffleboard leagues at your bar.<br />
          <span className="text-lp-accent">No spreadsheets.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles shuffleboard league signup, team registration, entry fees, standings, and
          player communications - all in one platform built for bars with tables that deserve more
          than a sign-up sheet on the bar.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start your shuffleboard league</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Everything you need to run a shuffleboard league</h2>
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
          <h2 className="font-display text-2xl font-bold">How it works for shuffleboard leagues</h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                n: 1,
                title: "Create your shuffleboard league",
                body: "Pick shuffleboard as your format, set team size (singles or doubles), entry fee, max teams, and the signup deadline.",
              },
              {
                n: 2,
                title: "Share the signup link",
                body: "Post it on social media, display it on your bar TV, or print a QR code. Players register and pay online before league night - no cash collection on the night.",
              },
              {
                n: 3,
                title: "Run the league",
                body: "Check in teams on league night, enter scores round by round, and let standings auto-update for all players to see in real time.",
              },
              {
                n: 4,
                title: "Fill the next season",
                body: "Email or text all registered players about the upcoming season - one click to re-open signup and lock in your returning teams.",
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
          <h2 className="font-display text-2xl font-bold">Why shuffleboard leagues work for bars</h2>
          <div className="mt-5 space-y-4 text-lp-text leading-relaxed">
            <p>
              Shuffleboard is one of the most underused recurring event formats in hospitality. Bars
              that have tables often use them for casual play but rarely formalize the competition -
              which is a missed opportunity. A weekly shuffleboard league turns occasional players into
              committed weekly regulars who bring teammates and spectators.
            </p>
            <p>
              The game's relatively long match time works in the bar's favor. A singles match can run
              25–40 minutes. A doubles match even longer. Compare that to darts, where a quick leg of
              501 ends in 10 minutes. Shuffleboard players consume more per visit simply because they're
              there longer.
            </p>
            <p>
              The audience for shuffleboard skews slightly older than darts or cornhole, which often
              means higher per-visit spend and stronger brand loyalty. If you're trying to build a loyal
              regular base in the 35–55 demographic, a shuffleboard league is worth experimenting with
              even if you're uncertain about initial turnout.
            </p>
            <p>
              Start with a small season - 6 teams, 6 weeks - to test the format before investing in
              promotion. If those 6 teams come every week, you have proof of concept. Most bars that
              try this discover demand they didn't know existed.
            </p>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                q: "Can LeaguePour run a weekly shuffleboard league?",
                a: "Yes. Create a shuffleboard league with a set number of teams, entry fee, and weekly match schedule. Standings update automatically after each round.",
              },
              {
                q: "How do players sign up for a shuffleboard league?",
                a: "Players visit your venue's public page, select the league, pay the entry fee via Stripe, and get a confirmation email. No app download required.",
              },
              {
                q: "What shuffleboard formats does LeaguePour support?",
                a: "Singles, doubles, and captain-led team formats. Round-robin, single elimination, and double elimination bracket types are all available.",
              },
              {
                q: "What entry fees can I charge?",
                a: "Any amount. Stripe deposits funds directly to your venue's bank account. LeaguePour takes a 5% platform fee plus $1.50 per player service fee.",
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
          <h2 className="font-display text-2xl font-bold">Ready to launch your shuffleboard league?</h2>
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
          <Link href="/pool-league-management" className="font-semibold text-lp-accent hover:underline">Pool league management →</Link>
          <Link href="/cornhole-tournament-software" className="font-semibold text-lp-accent hover:underline">Cornhole tournament software →</Link>
        </div>
      </div>
    </>
  );
}
