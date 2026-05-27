import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Dart League Software for Bars | LeaguePour",
  description:
    "Run dart leagues at your bar with LeaguePour. Online signup, team registration, entry fees via Stripe, standings, and bracket management — no spreadsheets needed.",
  alternates: { canonical: "/dart-league-software" },
  keywords: [
    "dart league software",
    "bar dart league management",
    "dart tournament registration",
    "dart league signup app",
    "dart tournament software",
    "bar dart tournament management",
    "darts league platform",
  ],
  openGraph: {
    title: "Dart League Software for Bars | LeaguePour",
    description:
      "Run dart leagues at your bar — online signup, entry fees, standings, and brackets. No spreadsheets.",
    url: "/dart-league-software",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour — Dart League Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${getPublicSiteUrl()}/dart-league-software`,
      description:
        "Dart league management software for bars. Run weekly dart leagues with team signup, entry fees, standings, and automatic bracket generation.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "dart league software, bar dart tournament, darts league management",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can LeaguePour handle weekly dart leagues?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Create a recurring dart league with set signup windows, team format (doubles, singles, or captain-led), entry fees collected automatically via Stripe, and standings updated each week.",
          },
        },
        {
          "@type": "Question",
          name: "How do players sign up for dart leagues on LeaguePour?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Players visit your venue's public page, choose the dart league, pay the entry fee (if any) via Stripe Checkout, and get a confirmation email. No app download required.",
          },
        },
        {
          "@type": "Question",
          name: "Does LeaguePour support team dart formats?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — you can run solo dart tournaments, doubles with captain-led team signup, or full roster invites for larger team formats.",
          },
        },
      ],
    },
  ],
};

const features = [
  { title: "Online team signup", body: "Solo, doubles, or captain-led teams — players register from their phone before they walk in." },
  { title: "Entry fees via Stripe", body: "Collect league buy-ins automatically. Funds go directly to your venue's bank account." },
  { title: "Standings & scoring", body: "Update scores after each round. Standings refresh automatically and display on your public page." },
  { title: "Bracket management", body: "Single elimination, round-robin, or Swiss format — set it once when you create the league." },
  { title: "Email & SMS alerts", body: "Notify registered players about schedule changes, results, and the next league night." },
  { title: "Waitlists", body: "Cap the league at your table count. Overflow goes to a waitlist and gets notified when spots open." },
];

export default function DartLeagueSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Dart league software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Run dart leagues at your bar.<br />
          <span className="text-lp-accent">No spreadsheets.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles dart league signup, team registration, entry fees, standings, and player
          communications — all in one platform built for bars.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start your dart league</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Everything you need to run a dart league</h2>
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
          <h2 className="font-display text-2xl font-bold">How it works for dart leagues</h2>
          <ol className="mt-6 space-y-5">
            {[
              { n: 1, title: "Create your dart league", body: "Pick darts as your format, set team size, entry fee, max teams, and signup deadline." },
              { n: 2, title: "Share the signup link", body: "Post it on social, your bar TV, or print a QR code. Players register and pay online before league night." },
              { n: 3, title: "Run the league", body: "Check in teams, enter scores each round, and let standings auto-update for all to see." },
              { n: 4, title: "Fill the next season", body: "Email or text registered players about the next league — one click to re-open signup." },
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

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            {[
              { q: "Can LeaguePour handle weekly dart leagues?", a: "Yes. Create a recurring dart league with set signup windows, team formats, and entry fees collected via Stripe — standings update each week." },
              { q: "How do players sign up?", a: "Players visit your public page, select the league, pay the entry fee, and get a confirmation email. No app download required." },
              { q: "Does it support doubles and team dart?", a: "Yes — solo, doubles with captain-led signup, or full roster invites for larger formats." },
              { q: "What entry fees can I charge?", a: "Any amount. Stripe deposits funds directly to your venue's bank account. LeaguePour takes 5% of the entry fee plus $1.50 per player service fee." },
            ].map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">{f.q}</summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to launch your dart league?</h2>
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
          <Link href="/cornhole-tournament-software" className="font-semibold text-lp-accent hover:underline">Cornhole tournament software →</Link>
          <Link href="/bar-trivia-software" className="font-semibold text-lp-accent hover:underline">Bar trivia software →</Link>
          <Link href="/pool-league-management" className="font-semibold text-lp-accent hover:underline">Pool league management →</Link>
        </div>
      </div>
    </>
  );
}
