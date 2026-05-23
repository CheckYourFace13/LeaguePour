import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/utils";
import type { DiscoveryCompetitionRow, DiscoveryVenueRow } from "@/lib/seo/discovery-data";

export type DiscoveryComparisonRow = {
  feature: string;
  generic: string | boolean;
  leaguepour: string | boolean;
};

export type DiscoveryPromoSlot = {
  title: string;
  copy?: string;
  bullets?: string[];
  ctaHref: string;
  ctaLabel: string;
};

export type LeaguePourDiscoveryLandingProps = {
  kicker: string;
  heroTitle: string;
  heroIntro: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  venues: DiscoveryVenueRow[];
  competitions: DiscoveryCompetitionRow[];
  whyLeaguePour: { title: string; items: string[] };
  comparison?: { title: string; intro?: string; rows: DiscoveryComparisonRow[] };
  faqs: { q: string; a: string }[];
  relatedLinks: { href: string; label: string }[];
  gameLinks?: { href: string; label: string }[];
  emptyState?: { title: string; body: string; ctaHref: string; ctaLabel: string };
  sponsorPromo?: DiscoveryPromoSlot;
  revenuePromo?: DiscoveryPromoSlot;
  upgradePromo?: DiscoveryPromoSlot;
  roadmap?: { title: string; items: string[] };
  jsonLdGraphs: Record<string, unknown>[];
};

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-5 text-lp-success" aria-label="Yes" />;
  if (value === false) return <Minus className="mx-auto size-5 text-lp-text-soft" aria-label="No" />;
  return <span className="text-xs font-medium text-lp-muted">{value}</span>;
}

function NativePromoCard({ slot }: { slot: DiscoveryPromoSlot }) {
  return (
    <aside className="rounded-2xl border border-lp-accent/25 bg-gradient-to-br from-lp-accent/10 via-lp-surface/50 to-lp-surface/30 p-6 md:p-8">
      <p className="lp-kicker text-lp-accent">For venues</p>
      <h3 className="mt-1 font-display text-xl font-bold text-lp-text md:text-2xl">{slot.title}</h3>
      {slot.copy ? <p className="mt-3 text-sm text-lp-muted leading-relaxed md:text-base">{slot.copy}</p> : null}
      {slot.bullets ? (
        <ul className="mt-4 space-y-2">
          {slot.bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-lp-muted leading-relaxed">
              <Check className="mt-0.5 size-4 shrink-0 text-lp-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5">
        <Button asChild variant="secondary">
          <Link href={slot.ctaHref}>{slot.ctaLabel}</Link>
        </Button>
      </div>
    </aside>
  );
}

export function LeaguePourDiscoveryLanding({
  kicker,
  heroTitle,
  heroIntro,
  primaryCta,
  secondaryCta,
  venues,
  competitions,
  whyLeaguePour,
  comparison,
  faqs,
  relatedLinks,
  gameLinks,
  emptyState,
  sponsorPromo,
  revenuePromo,
  upgradePromo,
  roadmap,
  jsonLdGraphs,
}: LeaguePourDiscoveryLandingProps) {
  return (
    <>
      {jsonLdGraphs.map((graph, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-20">
        <p className="lp-kicker text-lp-accent">{kicker}</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight md:text-5xl">{heroTitle}</h1>
        <p className="mt-5 max-w-3xl text-lg text-lp-muted leading-relaxed">{heroIntro}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
          </Button>
        </div>

        {venues.length > 0 ? (
          <section className="mt-16" aria-labelledby="partner-venues">
            <h2 id="partner-venues" className="font-display text-2xl font-bold md:text-3xl">
              Partner venues
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {venues.map((v) => (
                <Link
                  key={v.id}
                  href={`/v/${v.slug}`}
                  className="rounded-xl border border-lp-border bg-lp-surface/40 p-5 transition hover:border-lp-accent"
                >
                  <p className="font-semibold text-lp-text">{v.name}</p>
                  <p className="mt-1 text-sm text-lp-muted">
                    {[v.city, v.state].filter(Boolean).join(", ") || "Venue hub"}
                    {v.competitionCount > 0
                      ? ` · ${v.competitionCount} open competition${v.competitionCount !== 1 ? "s" : ""}`
                      : ""}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {competitions.length > 0 ? (
          <section className="mt-16" aria-labelledby="upcoming-events">
            <h2 id="upcoming-events" className="font-display text-2xl font-bold md:text-3xl">
              Upcoming competitions & events
            </h2>
            <div className="mt-6 space-y-3">
              {competitions.map((c) => (
                <Link
                  key={c.id}
                  href={`/c/${c.venueSlug}/${c.slug}`}
                  className="flex flex-col gap-1 rounded-xl border border-lp-border bg-lp-surface/40 px-5 py-4 transition hover:border-lp-accent sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-lp-text">{c.title}</p>
                    <p className="text-sm text-lp-muted">
                      {c.venueName}
                      {c.venueCity ? ` · ${c.venueCity}` : ""} · {formatDate(c.startAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-lp-accent">
                    {c.entryFeeCents > 0
                      ? formatMoney(c.entryFeeCents / 100, c.entryFeeCurrency)
                      : "Free signup"}
                    {" · Register →"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {venues.length === 0 && competitions.length === 0 && emptyState ? (
          <div className="mt-16 rounded-2xl border border-lp-border bg-lp-surface/40 p-8 text-center">
            <h2 className="font-display text-xl font-bold">{emptyState.title}</h2>
            <p className="mt-2 text-lp-muted leading-relaxed">{emptyState.body}</p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href={emptyState.ctaHref}>{emptyState.ctaLabel}</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {sponsorPromo ? <div className="mt-16">{<NativePromoCard slot={sponsorPromo} />}</div> : null}

        {gameLinks && gameLinks.length > 0 ? (
          <section className="mt-16" aria-labelledby="browse-by-game">
            <h2 id="browse-by-game" className="font-display text-2xl font-bold md:text-3xl">
              Browse by game
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {gameLinks.map((g) => (
                <Link
                  key={g.href}
                  href={g.href}
                  className="rounded-full border border-lp-border bg-lp-surface/40 px-4 py-2 text-sm font-semibold text-lp-text transition hover:border-lp-accent hover:text-lp-accent"
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-16 rounded-2xl border border-lp-border bg-lp-surface/40 p-8" aria-labelledby="why-lp">
          <h2 id="why-lp" className="font-display text-2xl font-bold md:text-3xl">
            {whyLeaguePour.title}
          </h2>
          <ul className="mt-6 space-y-3">
            {whyLeaguePour.items.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-lp-muted leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-lp-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {revenuePromo ? <div className="mt-16">{<NativePromoCard slot={revenuePromo} />}</div> : null}

        {comparison ? (
          <section className="mt-16" aria-labelledby="comparison">
            <h2 id="comparison" className="font-display text-2xl font-bold md:text-3xl">
              {comparison.title}
            </h2>
            {comparison.intro ? (
              <p className="mt-3 max-w-2xl text-lp-muted leading-relaxed">{comparison.intro}</p>
            ) : null}
            <div className="mt-8 overflow-x-auto rounded-xl border border-lp-border">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-lp-border bg-lp-surface/60">
                    <th className="px-4 py-3 font-semibold text-lp-text">Feature</th>
                    <th className="px-4 py-3 text-center font-semibold text-lp-muted">Generic tools</th>
                    <th className="px-4 py-3 text-center font-semibold text-lp-accent">LeaguePour</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row) => (
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
        ) : null}

        {roadmap ? (
          <section className="mt-16 rounded-2xl border border-lp-border bg-lp-surface/30 p-8" aria-labelledby="roadmap">
            <h2 id="roadmap" className="font-display text-2xl font-bold md:text-3xl">
              {roadmap.title}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {roadmap.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-lp-muted leading-relaxed">
                  <span className="font-bold text-lp-accent">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16" aria-labelledby="faqs">
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

        {upgradePromo ? <div className="mt-16">{<NativePromoCard slot={upgradePromo} />}</div> : null}

        <div className="mt-10 rounded-2xl border border-lp-accent/20 bg-lp-accent/10 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Run your next league night on LeaguePour</h2>
          <p className="mt-2 text-lp-muted">Signups, payments, brackets, and repeat players — built for venues.</p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          </div>
        </div>

        {relatedLinks.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {relatedLinks.map((l) => (
              <Link key={l.href} href={l.href} className="font-semibold text-lp-accent hover:underline">
                {l.label} →
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
