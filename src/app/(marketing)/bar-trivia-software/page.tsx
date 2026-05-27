import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Bar Trivia Software & Signup Management | LeaguePour",
  description:
    "Run trivia nights at your bar with LeaguePour. Online team registration, entry fees, standings, and repeat player alerts — trivia night management made simple.",
  alternates: { canonical: "/bar-trivia-software" },
  keywords: [
    "bar trivia software",
    "trivia night management",
    "bar trivia registration",
    "trivia league signup",
    "pub quiz software",
    "trivia night app for bars",
    "trivia tournament management",
  ],
  openGraph: {
    title: "Bar Trivia Software & Signup Management | LeaguePour",
    description:
      "Online trivia night registration, entry fees, team signup, and standings for bars. No spreadsheets.",
    url: "/bar-trivia-software",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour — Bar Trivia Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${getPublicSiteUrl()}/bar-trivia-software`,
      description:
        "Bar trivia night management software. Handle team registration, entry fees, standings, and repeat player marketing in one platform.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
      keywords: "bar trivia software, trivia night management, pub quiz signup",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Can LeaguePour handle weekly trivia nights?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Set up a recurring trivia night with weekly signup windows, team caps, optional entry fees, and automated player reminders each week.",
          },
        },
        {
          "@type": "Question",
          name: "Does LeaguePour support trivia team registration?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — teams register with a captain who names the team. You can set max team size and cap the total number of teams per night.",
          },
        },
        {
          "@type": "Question",
          name: "Can I run free trivia nights and paid trivia nights on the same platform?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Set the entry fee to $0 for free events or any amount for paid events. Stripe handles collection automatically.",
          },
        },
      ],
    },
  ],
};

const features = [
  { title: "Team & solo signup", body: "Teams register online with a name and captain. Cap the night at your table limit automatically." },
  { title: "Free or paid entry", body: "Run free trivia nights or collect buy-ins — set the entry fee to any amount, including $0." },
  { title: "Weekly recurring events", body: "Set up your Thursday trivia once. Reopen signup each week with one click." },
  { title: "Live standings", body: "Update scores between rounds. Standings display on your public page in real time." },
  { title: "Repeat player marketing", body: "Email or text your regulars about next week's theme, prizes, or special nights." },
  { title: "Waitlists", body: "When you're at capacity, overflow teams join a waitlist and get notified when spots open." },
];

export default function BarTriviaSoftwarePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">Bar trivia software</p>
        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Trivia night, managed.<br />
          <span className="text-lp-accent">Players handled.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-lp-muted">
          LeaguePour handles trivia night team registration, entry fees, standings, and player communication
          — so you focus on the questions, not the clipboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Start your trivia night</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold">Everything bars need for trivia night</h2>
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
          <h2 className="font-display text-2xl font-bold">How trivia nights work on LeaguePour</h2>
          <ol className="mt-6 space-y-5">
            {[
              { n: 1, title: "Create your trivia night", body: "Set your format (teams, solo), entry fee, table cap, and signup window. Name the night and add your rules." },
              { n: 2, title: "Players register before they arrive", body: "Share a link or QR. Teams sign up and pay online — no more walk-up chaos or overfilling the room." },
              { n: 3, title: "Run the night", body: "Check in teams, post scores after each round, and show a live leaderboard on your venue page." },
              { n: 4, title: "Bring them back next week", body: "Email or text all registered players from last night with one message — announce next week's theme and open signup." },
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
              { q: "Can LeaguePour handle weekly trivia nights?", a: "Yes. Set up a recurring trivia night with weekly signup windows, team caps, entry fees, and automated player reminders." },
              { q: "How does team registration work?", a: "One player registers as captain and names the team. You set the max team size. Captains can invite teammates or they register separately." },
              { q: "Can I run free and paid trivia on the same account?", a: "Yes. Each event has its own entry fee — set it to $0 for free nights or any amount for paid buy-ins." },
              { q: "How do I notify players about next week's trivia?", a: "Use the built-in campaign tool — send an email to all players who registered for your last trivia night in seconds." },
            ].map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">{f.q}</summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-lp-accent/10 border border-lp-accent/20 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run a better trivia night?</h2>
          <p className="mt-2 text-lp-muted">Set up in minutes. Free to start.</p>
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
          <Link href="/cornhole-tournament-software" className="font-semibold text-lp-accent hover:underline">Cornhole tournament software →</Link>
          <Link href="/pool-league-management" className="font-semibold text-lp-accent hover:underline">Pool league management →</Link>
        </div>
      </div>
    </>
  );
}
