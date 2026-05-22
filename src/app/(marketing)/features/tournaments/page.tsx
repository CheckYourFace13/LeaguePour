import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPublicSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title:
    "Tournament & League Management for Bars & Breweries | LeaguePour",
  description:
    "Bar tournament software and league management for dart leagues, cornhole tournaments, trivia nights, pool brackets, and brewery events. Signups, Stripe payments, brackets, and venue-first operations.",
  alternates: { canonical: "/features/tournaments" },
  keywords: [
    "bar tournament software",
    "dart league software",
    "cornhole tournament software",
    "bar league management software",
    "trivia night signup software",
    "brewery event management software",
    "pool tournament bracket software",
    "euchre tournament software",
    "venue tournament registration",
    "sports bar event software",
  ],
  openGraph: {
    title: "Tournament & League Management Built for Bars & Breweries",
    description:
      "Run bar competitions with signups, payments, brackets, and repeat-player marketing — built for venues, not hobby brackets.",
    url: "/features/tournaments",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "LeaguePour — Tournament & League Management",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: `${getPublicSiteUrl()}/features/tournaments`,
      description:
        "Venue-first tournament and league management for bars, breweries, and local event spaces. Signups, Stripe entry fees, brackets, standings, and player marketing.",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: "29",
        highPrice: "299",
        priceCurrency: "USD",
        offerCount: "4",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is LeaguePour only for one-night tournaments?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. LeaguePour supports one-off tournaments and recurring weekly leagues. You set signup windows, caps, and bracket style when you create the event.",
          },
        },
        {
          "@type": "Question",
          name: "Can players sign up from their phone without downloading an app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Each competition has a mobile-friendly public page. Players register and pay online; venues can share a link or QR code.",
          },
        },
        {
          "@type": "Question",
          name: "How is LeaguePour different from generic bracket generators?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Generic bracket tools focus on drawing matchups. LeaguePour is built for venue operations: paid signups to your Stripe account, public venue hubs, waitlists, staff score entry, email campaigns to past players, and SEO-friendly event pages.",
          },
        },
      ],
    },
  ],
};

const competitionTypes = [
  {
    title: "Dart leagues",
    href: "/dart-league-software",
    body: "Weekly 501 nights, doubles leagues, and bar championships with standings that update each round.",
  },
  {
    title: "Cornhole & bag toss",
    href: "/cornhole-tournament-software",
    body: "Doubles tournaments, patio caps, and seasonal leagues without spreadsheet brackets.",
  },
  {
    title: "Trivia nights",
    href: "/bar-trivia-software",
    body: "Team caps, signup deadlines, and a confirmed headcount before doors open.",
  },
  {
    title: "Pool & billiards",
    href: "/pool-league-management",
    body: "League nights, season points, and playoff brackets seeded from regular-season results.",
  },
  {
    title: "Euchre & card nights",
    href: "/euchre-tournament-software",
    body: "Partner formats, table limits, and recurring league signup windows.",
  },
  {
    title: "Poker & specialty nights",
    href: "/poker-tournament-software",
    body: "Registration lists and structured nights — check local rules before collecting buy-ins.",
  },
];

const venueOps = [
  "Staff roles so owners, managers, and coordinators can share the workload",
  "Registration list doubles as your night-of check-in sheet",
  "Match score entry from the venue dashboard — bracket cards update on Standings",
  "Public scoreboard view for bar TVs and projector displays",
  "Waivers and rules published on the signup page before players pay",
  "Duplicate or reopen signup for the next season without rebuilding from scratch",
];

const signupPayment = [
  "Solo, captain-led team, or full roster team registration",
  "Free events or paid entry fees collected through Stripe Checkout",
  "Entry fees deposit to your venue Stripe account — LeaguePour does not hold your funds",
  "Participant caps with automatic waitlist when spots fill",
  "Downloadable QR codes for tables, windows, and social posts",
  "Payment records tied to registrations; refunds processed through Stripe when you issue them",
];

const growth = [
  "Public venue hub listing every open competition",
  "SEO-friendly competition pages players can find and share",
  "City and regional discovery pages for bar leagues in your market",
  "Email campaign drafts to past registrants and opted-in followers",
  "Prize and rules sections on each event so sponsors and house promos stay visible",
  "Highlight food, drink, and sponsor messaging in descriptions and player emails",
];

const featureCards: { title: string; body: string }[] = [
  { title: "Single elimination tournaments", body: "Run fast one-night brackets when you need a clear winner by closing time." },
  { title: "Double elimination tournaments", body: "Give teams a losers bracket — a familiar format for cornhole, darts, and pool nights." },
  { title: "Round robin leagues", body: "Everyone plays multiple rounds; standings tables track points across the season." },
  {
    title: "Pool play into playoffs",
    body: "Use season-style standings for group play, then seed playoff brackets from regular-season results.",
  },
  { title: "Weekly recurring leagues", body: "Set recurring rules and signup windows so the same night runs week after week." },
  { title: "Team-based signups", body: "Register full teams with caps sized to your boards, tables, or lanes." },
  { title: "Captain-managed teams", body: "One captain registers and invites partners — common for doubles and euchre." },
  { title: "Free events or paid entry fees", body: "Set entry to $0 for free nights or collect buy-ins before players arrive." },
  { title: "QR code signup", body: "Download a PNG QR from the venue or competition page — scan to open signup." },
  { title: "Mobile-friendly public event page", body: "Players register from any phone browser; no app install required." },
  { title: "Staff/admin score entry", body: "Venue staff enter match scores; bracket and standings views refresh from those rows." },
  {
    title: "Participant self-reporting",
    body: "Built to support player-submitted scores where you want lighter staff load — today, venues enter scores in the dashboard.",
  },
  {
    title: "Station/table/board assignment",
    body: "Use match labels and your registration list to assign boards; dedicated auto-assignment is on the roadmap.",
  },
  { title: "Check-in list", body: "Confirmed and waitlisted registrations in one place for door and table staff." },
  {
    title: "Printable bracket",
    body: "Bracket cards on the Standings page — screenshot or print from the browser for wall brackets.",
  },
  { title: "Public standings", body: "Leaderboards on your public venue and competition pages for in-bar displays." },
  { title: "Stripe payments", body: "Card payments through Stripe Connect; payouts follow your Stripe schedule." },
  { title: "Team entry fees", body: "Charge per team for doubles, euchre pairs, or squad formats." },
  { title: "Individual entry fees", body: "Per-player fees for solo brackets, poker nights, or singles leagues." },
  {
    title: "Custom registration questions",
    body: "Capture extra details in rules and waiver text today; structured custom fields are planned.",
  },
  { title: "Waitlists", body: "When caps fill, additional signups land on the waitlist automatically." },
  {
    title: "Promo codes",
    body: "Platform promo codes are managed in admin today; checkout promo flows are expanding.",
  },
  {
    title: "Refund tracking",
    body: "Refunds sync from Stripe webhooks so payment status stays aligned with registrations.",
  },
  {
    title: "Payout reporting",
    body: "Track Stripe Connect payout status from your venue profile and Stripe Dashboard.",
  },
  { title: "SEO-friendly event pages", body: "Each published competition gets a crawlable public URL with metadata." },
  { title: "Venue event hub", body: "Your /v/slug page lists open signups, QR codes, and venue details in one place." },
  {
    title: "City/category discovery pages",
    body: "Regional bar-league landing pages help players find venues in your city.",
  },
  { title: "Email reminders", body: "Campaign drafts to remind registrants about deadlines, results, and the next event." },
  {
    title: "Player reactivation",
    body: "Message past participants and followers who opted in — fill the next league from people who already know your bar.",
  },
  {
    title: "Sponsor and prize promotion",
    body: "Prize structure and rules on each event keep house tabs, gift cards, and sponsor shout-outs visible.",
  },
  {
    title: "Food and drink specials",
    body: "Promote specials in event copy and player emails — tie the bracket to tonight's menu.",
  },
  {
    title: "Shareable flyers and QR codes",
    body: "Share links and downloadable QR assets; pair with your own flyer design for posters and social.",
  },
];

const comparisonRows: {
  feature: string;
  generic: string | boolean;
  leaguepour: string | boolean;
}[] = [
  { feature: "Brackets", generic: true, leaguepour: true },
  { feature: "League standings", generic: "Sometimes", leaguepour: true },
  { feature: "Paid team signup", generic: "Sometimes", leaguepour: true },
  { feature: "QR code signup", generic: "Limited", leaguepour: true },
  { feature: "Venue event hub", generic: false, leaguepour: true },
  { feature: "Bar-game templates", generic: false, leaguepour: true },
  { feature: "Food/drink promo areas", generic: false, leaguepour: true },
  { feature: "Sponsor promotion", generic: "Limited", leaguepour: true },
  { feature: "Local SEO event pages", generic: false, leaguepour: true },
  { feature: "City/category discovery", generic: false, leaguepour: true },
  { feature: "Repeat-player marketing", generic: false, leaguepour: true },
  { feature: "Built for bars and breweries", generic: false, leaguepour: true },
];

const faqs = [
  {
    q: "What bracket formats does LeaguePour support today?",
    a: "Single elimination, double elimination, round robin, ladder, season, and points-style competitions. Pick the bracket kind when you create the event — match rows drive bracket cards on Standings.",
  },
  {
    q: "Do entry fees go to LeaguePour or my venue?",
    a: "Players pay through Stripe Checkout. Funds settle to your connected Stripe account. LeaguePour charges a platform fee on paid entry (see Pricing for current rates).",
  },
  {
    q: "Can I run a free tournament with no payment?",
    a: "Yes. Set the entry fee to $0. Players still register through your public page so you have a headcount and contact list for the night.",
  },
  {
    q: "How do players find my events?",
    a: "Share your venue hub link, competition URL, or QR code. Published events are indexed for search, and regional bar-league pages help discovery in your city.",
  },
  {
    q: "Is this replacing my POS or reservation system?",
    a: "No. LeaguePour handles competition signup, payments for entry fees, brackets, and player communication — not table reservations or kitchen tickets.",
  },
  {
    q: "What do I need to get started?",
    a: "Create a venue, connect Stripe if you charge entry fees, publish your first competition, and share the signup link. Most venues are live in under ten minutes.",
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="mx-auto size-5 text-lp-success" aria-label="Yes" />;
  }
  if (value === false) {
    return <Minus className="mx-auto size-5 text-lp-text-soft" aria-label="No" />;
  }
  return <span className="text-sm text-lp-muted">{value}</span>;
}

export default function TournamentsFeaturePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        {/* Hero */}
        <p className="lp-kicker text-lp-accent">Tournament & league software</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight md:text-5xl">
          Tournament & League Management Built for Bars, Breweries, and Local Venues
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-lp-muted leading-relaxed">
          Run dart leagues, cornhole tournaments, trivia nights, euchre leagues, poker nights, pool tournaments, and
          recurring bar events from one simple platform. LeaguePour helps venues collect signups, take payments, build
          brackets, manage teams, share QR codes, and turn one-time events into repeat customers.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup/venue">Create Your First Event</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/pricing">See Pricing</Link>
          </Button>
        </div>

        {/* 1. Run every kind of bar competition */}
        <section className="mt-20" aria-labelledby="competition-types">
          <h2 id="competition-types" className="font-display text-2xl font-bold md:text-3xl">
            Run every kind of bar competition
          </h2>
          <p className="mt-3 max-w-2xl text-lp-muted leading-relaxed">
            LeaguePour is built around how real bars run nights — not office park esports. Pick a format template, set
            caps and fees, and publish a signup page your regulars can actually use on a phone.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {competitionTypes.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="rounded-xl border border-lp-border bg-lp-surface/40 p-5 transition hover:border-lp-accent/40 hover:bg-lp-surface/60"
              >
                <h3 className="font-semibold text-lp-text">{c.title}</h3>
                <p className="mt-2 text-sm text-lp-muted leading-relaxed">{c.body}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-lp-accent">Learn more →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 2. Built for real venue operations */}
        <section className="mt-20 rounded-2xl border border-lp-border bg-lp-surface/40 p-8" aria-labelledby="venue-ops">
          <h2 id="venue-ops" className="font-display text-2xl font-bold md:text-3xl">
            Built for real venue operations
          </h2>
          <p className="mt-3 text-lp-muted leading-relaxed">
            Brackets are only half the job. You need check-in, staff permissions, scores on the board, and a plan for
            next week — without a tournament director certification.
          </p>
          <ul className="mt-6 space-y-3">
            {venueOps.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-lp-muted leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-lp-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">
              See how venues use LeaguePour →
            </Link>
          </p>
        </section>

        {/* 3. Collect signups and payments */}
        <section className="mt-20" aria-labelledby="signups-payments">
          <h2 id="signups-payments" className="font-display text-2xl font-bold md:text-3xl">
            Collect signups and payments
          </h2>
          <p className="mt-3 max-w-2xl text-lp-muted leading-relaxed">
            Stop chasing cash at the door. Players commit before league night, and you know exactly how many teams or
            seats to expect.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {signupPayment.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-lp-border bg-lp-surface/30 px-4 py-3 text-sm text-lp-muted leading-relaxed"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-lp-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <Link href="/how-it-works" className="font-semibold text-lp-accent hover:underline">
              How setup works →
            </Link>
            {" · "}
            <Link href="/pricing" className="font-semibold text-lp-accent hover:underline">
              Pricing & fees →
            </Link>
          </p>
        </section>

        {/* 4. Grow the crowd */}
        <section className="mt-20" aria-labelledby="grow-crowd">
          <h2 id="grow-crowd" className="font-display text-2xl font-bold md:text-3xl">
            Grow the crowd, not just the bracket
          </h2>
          <p className="mt-3 max-w-2xl text-lp-muted leading-relaxed">
            A full bracket is a good night. A full bracket next month is a business. LeaguePour keeps your player list and
            public pages working between events.
          </p>
          <ul className="mt-6 space-y-3">
            {growth.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-lp-muted leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-lp-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <Link href="/bar-leagues/chicago" className="font-semibold text-lp-accent hover:underline">
              Browse city league pages →
            </Link>
          </p>
        </section>

        {/* 5. Comparison table */}
        <section className="mt-20" aria-labelledby="comparison">
          <h2 id="comparison" className="font-display text-2xl font-bold md:text-3xl">
            LeaguePour vs generic bracket tools
          </h2>
          <p className="mt-3 max-w-2xl text-lp-muted leading-relaxed">
            Free bracket sites draw matchups. LeaguePour runs the venue side: money, signups, discovery, and bringing
            players back.
          </p>
          <div className="mt-8 overflow-x-auto rounded-xl border border-lp-border">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-lp-border bg-lp-surface/60">
                  <th className="px-4 py-3 font-semibold text-lp-text">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-lp-muted">Generic Bracket Tools</th>
                  <th className="px-4 py-3 text-center font-semibold text-lp-accent">LeaguePour</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-lp-border/80 last:border-0">
                    <td className="px-4 py-3 font-medium text-lp-text">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      <CellValue value={row.generic} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CellValue value={row.leaguepour} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-20" aria-labelledby="all-features">
          <h2 id="all-features" className="font-display text-2xl font-bold md:text-3xl">
            Everything in one venue platform
          </h2>
          <p className="mt-3 text-lp-muted leading-relaxed">
            From bracket styles to payouts — what LeaguePour supports for bars, breweries, taprooms, and sports bars.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((f) => (
              <div key={f.title} className="rounded-xl border border-lp-border bg-lp-surface/40 p-5">
                <h3 className="font-semibold text-lp-text">{f.title}</h3>
                <p className="mt-2 text-sm text-lp-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQs */}
        <section className="mt-20" aria-labelledby="faqs">
          <h2 id="faqs" className="font-display text-2xl font-bold md:text-3xl">
            FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-lp-muted leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-lp-accent/20 bg-lp-accent/10 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to run your next league night?</h2>
          <p className="mt-2 text-lp-muted">Create your venue, publish a competition, and share the signup link tonight.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup/venue">Create Your First Event</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/features" className="font-semibold text-lp-accent hover:underline">
            All features →
          </Link>
          <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">
            For venues →
          </Link>
          <Link href="/signup/player" className="font-semibold text-lp-accent hover:underline">
            Player signup →
          </Link>
          <Link href="/faq" className="font-semibold text-lp-accent hover:underline">
            FAQ →
          </Link>
        </div>
      </div>
    </>
  );
}
