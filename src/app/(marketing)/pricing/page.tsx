import type { Metadata } from "next";
import { applyManagedMetadata } from "@/lib/gravyblock-managed";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatUsdCents, PLAN_DEFINITIONS } from "@/lib/pricing";
import { TrackView } from "@/components/analytics/track-view";
import { PlanSelectLink } from "@/components/analytics/plan-select-link";
import { ACTIVE_COMPETITION_LIMITS_BY_PLAN } from "@/lib/pricing";
import { PLATFORM_FEE_BPS, PLAYER_SERVICE_FEE_CENTS } from "@/lib/stripe/connect-fees";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";

// Every row here is a real, verified feature: either available to every plan today (no
// BillingPlan-based gate exists in code for it) or the one row that IS actually plan-limited
// (active competition count, enforced by ACTIVE_COMPETITION_LIMITS_BY_PLAN). Do not add SMS or
// multi-location here - SMS campaign sending is not functional (campaign-send.ts hard-errors on
// any non-EMAIL channel) and multi-location is a schema-only stub (Venue.parentVenueId has no
// functional code anywhere) - neither is a real, usable feature on any plan.
const FEATURE_ROWS: { label: string; values: string[] }[] = [
  {
    label: "Competitions running at once",
    values: PLAN_DEFINITIONS.map((t) => {
      const limit = ACTIVE_COMPETITION_LIMITS_BY_PLAN[t.plan];
      return Number.isFinite(limit) ? `Up to ${limit}` : "Unlimited";
    }),
  },
  { label: "Drafts and finished competitions", values: ["Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "Stripe Connect entry fees", values: ["✓", "✓", "✓", "✓"] },
  { label: "QR code registration", values: ["✓", "✓", "✓", "✓"] },
  { label: "Live standings & TV scoreboard", values: ["✓", "✓", "✓", "✓"] },
  { label: "Website embed widget", values: ["✓", "✓", "✓", "✓"] },
  { label: "Email campaigns & audience", values: ["✓", "✓", "✓", "✓"] },
  { label: "Bracket & round-robin generation", values: ["✓", "✓", "✓", "✓"] },
  { label: "Unlimited staff accounts", values: ["✓", "✓", "✓", "✓"] },
];

export async function generateMetadata(): Promise<Metadata> {
  return applyManagedMetadata("/pricing", {
  title: { absolute: "LeaguePour Pricing | Bar Event Registration Software Plans" },
  description:
    "LeaguePour pricing: four plans that differ only by how many competitions you run at once, 2 months free on annual billing, and a clear breakdown of fees on paid registrations.",
  alternates: { canonical: "/pricing" },
  openGraph: { siteName: "LeaguePour", images: [{ url: "/opengraph-image", alt: "LeaguePour - venue competition software for bars" }],
    title: "LeaguePour Pricing | Bar Event Registration Software",
    description: "Monthly and annual plans for bar tournament platform workflows and player registration.",
    url: "/pricing",
  },
  twitter: {
    title: "LeaguePour Pricing",
    description: "Venue competition software plans for bars and recurring tournament signup.",
  },
});
}

// Fee figures come straight from the constants the checkout uses, so this page can't drift from
// what players and venues are actually charged.
const PLATFORM_FEE_PCT = PLATFORM_FEE_BPS / 100;
const SERVICE_FEE = formatUsdCents(PLAYER_SERVICE_FEE_CENTS);
const EXAMPLE_ENTRY_CENTS = 1000;
const EXAMPLE_PLAYER_PAYS = formatUsdCents(EXAMPLE_ENTRY_CENTS + PLAYER_SERVICE_FEE_CENTS);
const EXAMPLE_VENUE_GETS = formatUsdCents(EXAMPLE_ENTRY_CENTS - Math.floor((EXAMPLE_ENTRY_CENTS * PLATFORM_FEE_BPS) / 10_000));

const faqs: { q: string; a: string }[] = [
  {
    q: "What is the difference between the plans?",
    a: "Only how many competitions you can have running at the same time: up to 2 on Starter, 9 on Growth, 19 on Pro, and unlimited on Elite. Every feature - entry fees, QR signup, brackets, standings, email campaigns, staff accounts - is on every plan.",
  },
  {
    q: "What counts as a competition running at once?",
    a: "One that is published, open for signup, closed but not finished, or in progress. Drafts and completed competitions never count, so a finished league frees up its slot.",
  },
  {
    q: "What does a paid registration cost?",
    a: `The venue keeps the entry fee minus a ${PLATFORM_FEE_PCT}% platform fee, and the player pays a ${SERVICE_FEE} service fee on top of the entry price at checkout. On a ${formatUsdCents(EXAMPLE_ENTRY_CENTS)} entry, the player pays ${EXAMPLE_PLAYER_PAYS} and the venue receives ${EXAMPLE_VENUE_GETS}.`,
  },
  {
    q: "Are free events charged anything?",
    a: "No. A $0 competition has no platform fee and no player service fee - players just register.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual plans cost ten times the monthly price, so you get two months free (about 17% off). You can choose monthly or annual when you subscribe.",
  },
  {
    q: "Which tournament formats are included?",
    a: "Single elimination and round robin are generated automatically, and Custom lets you run any other format by hand. Double elimination, Swiss, pool play, and ladder formats are not automated yet.",
  },
  {
    q: "Is VenueSprocket included?",
    a: "No. VenueSprocket is a separate product, with its own subscription, for private event bookings. If your venue has an active subscription to either product, the other one is 50% off.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function PricingPage() {
  return (
    <div className="lp-section mx-auto max-w-6xl px-4 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <TrackView event="pricing_view" params={{ product: "lp" }} />
      <h1 className="lp-page-title text-5xl md:text-6xl">Pricing</h1>
      <p className="lp-page-sub mt-5 max-w-xl text-xl text-lp-text-soft">
        Every plan has every feature. You pay for how many competitions you run at once - and
        get 2 months free (~17% off) on annual billing.
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
            <p className="mt-2 font-display text-[1.85rem] font-extrabold tracking-tight text-lp-text">{t.name}</p>
            <p className="mt-5 font-display text-4xl font-extrabold tracking-tight text-lp-text md:text-[2.75rem]">
              {formatUsdCents(t.monthlyCents)}
              <span className="text-[1.02rem] font-bold text-lp-text-soft"> /mo</span>
            </p>
            <p className="mt-1.5 text-base text-lp-text-soft">
              {formatUsdCents(t.annualCents)} /yr <span className="font-semibold text-lp-accent">2 months free</span>
            </p>
            <ul className="mt-8 space-y-2.5 text-[1.02rem] leading-snug text-lp-text-soft">
              <li className="flex gap-2">
                <span className="text-lp-accent">|</span>
                <span>
                  {Number.isFinite(ACTIVE_COMPETITION_LIMITS_BY_PLAN[t.plan])
                    ? `Up to ${ACTIVE_COMPETITION_LIMITS_BY_PLAN[t.plan]} competitions at once`
                    : "Unlimited competitions at once"}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-lp-accent">|</span>
                <span>Stripe Connect entry fees</span>
              </li>
              <li className="flex gap-2">
                <span className="text-lp-accent">|</span>
                <span>Campaigns & audience</span>
              </li>
            </ul>
            <Button className="mt-10 w-full text-[1.05rem]" variant={t.featured ? "primary" : "secondary"} asChild>
              <PlanSelectLink
                href={`/signup/venue?plan=${t.plan.toLowerCase()}`}
                plan={t.plan.toLowerCase()}
                product="lp"
              >
                Choose {t.name}
              </PlanSelectLink>
            </Button>
          </Card>
        ))}
      </div>
      {/* Full feature comparison */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold text-lp-text text-center">Compare plans</h2>
        <p className="mt-2 text-center text-sm text-lp-text-soft">
          The only difference between plans is how many active competitions you can run at once.
          Every other feature is included on every plan.
        </p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-lp-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-lp-border bg-lp-surface/60">
                <th className="px-5 py-4 font-semibold text-lp-text-soft">Feature</th>
                {PLAN_DEFINITIONS.map((t) => (
                  <th key={t.plan} className="px-5 py-4 text-center font-display font-bold text-lp-text">
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, i) => (
                <tr key={row.label} className={i % 2 === 1 ? "bg-lp-surface/30" : ""}>
                  <td className="px-5 py-3.5 font-medium text-lp-text">{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} className="px-5 py-3.5 text-center text-lp-text-soft">
                      {v === "✓" ? (
                        <Check className="mx-auto size-4 text-lp-accent" aria-label="Included" />
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paid-registration economics */}
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-lp-border bg-lp-surface/50 p-7">
          <h2 className="font-display text-2xl font-bold text-lp-text">What a paid registration costs</h2>
          <p className="mt-3 text-sm leading-relaxed text-lp-text-soft">
            On top of your plan, paid entries have two fees. Free ($0) events have neither.
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-lp-text-soft">
            <li>• <strong className="text-lp-text">{PLATFORM_FEE_PCT}% platform fee</strong> - taken from the entry fee before it reaches your bank account.</li>
            <li>• <strong className="text-lp-text">{SERVICE_FEE} service fee</strong> - paid by the player, added to the entry price at checkout.</li>
          </ul>
          <div className="mt-5 rounded-xl border border-lp-border bg-lp-bg px-4 py-3 font-mono text-sm text-lp-text-soft">
            <p>{formatUsdCents(EXAMPLE_ENTRY_CENTS)} entry fee</p>
            <p>Player pays: {EXAMPLE_PLAYER_PAYS}</p>
            <p>Venue receives: {EXAMPLE_VENUE_GETS}</p>
          </div>
          <p className="mt-3 text-xs text-lp-muted">
            Entry fees are collected with Stripe Checkout and paid out to your own bank account through Stripe Connect.
          </p>
        </div>
        <div className="rounded-2xl border border-lp-border bg-lp-surface/50 p-7">
          <h2 className="font-display text-2xl font-bold text-lp-text">Formats on every plan</h2>
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-lp-text-soft">
            <li>• <strong className="text-lp-text">Single elimination</strong> - bracket generated automatically, byes handled.</li>
            <li>• <strong className="text-lp-text">Round robin</strong> - full schedule generated automatically, standings from scores.</li>
            <li>• <strong className="text-lp-text">Custom</strong> - run any other format by hand.</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-lp-text-soft">
            Double elimination, Swiss, pool play, and ladder formats aren&apos;t automated yet.{" "}
            <Link href="/features/tournaments" className="font-semibold text-lp-accent hover:underline">See what&apos;s live and what&apos;s planned</Link>.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-lp-text-soft">
            Want to try the logic first? The free{" "}
            <Link href="/tools" className="font-semibold text-lp-accent hover:underline">bracket and round robin generators</Link>{" "}
            use the same rules, no signup needed.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 mx-auto max-w-3xl">
        <h2 className="font-display text-2xl font-bold text-lp-text text-center">Pricing questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4">
              <summary className="cursor-pointer list-none font-semibold text-lp-text [&::-webkit-details-marker]:hidden">{f.q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-lp-text-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-base">
        <Link href="/features" className="font-semibold text-lp-accent hover:underline">
          See competition management features
        </Link>
        <Link href="/for-venues" className="font-semibold text-lp-accent hover:underline">
          Compare venue use cases
        </Link>
        <Link href="/demo" className="font-semibold text-lp-accent hover:underline">
          See a live demo
        </Link>
      </div>

      {/* Bundle discount */}
      <div className="mt-16 rounded-2xl border-2 border-lp-accent/30 bg-lp-surface/60 p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-lp-accent mb-2">Bundle & save 50%</p>
          <p className="font-display text-xl font-bold text-lp-text">
            Already have VenueSprocket?
          </p>
          <p className="mt-2 text-sm text-lp-muted leading-relaxed">
            <strong className="text-lp-text">VenueSprocket</strong> is our separate product for private events. Venues with an
            active VenueSprocket subscription automatically get 50% off LeaguePour — no code needed; it applies at checkout.
          </p>
          <p className="mt-2 text-sm text-lp-muted">
            The reverse works too — LeaguePour subscribers get 50% off VenueSprocket.
          </p>
        </div>
        <div className="shrink-0 text-center">
          <p className="text-4xl font-extrabold text-lp-accent font-display">50%</p>
          <p className="text-sm font-semibold text-lp-text-soft mt-1">off your second<br/>subscription</p>
          <a
            href="https://venuesprocket.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-lg border border-lp-border-strong px-5 py-2.5 text-sm font-bold text-lp-text hover:bg-lp-surface transition-colors"
          >
            See VenueSprocket →
          </a>
        </div>
      </div>
    </div>
  );
}
