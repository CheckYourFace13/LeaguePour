import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VS_COMPARE_DATA, type FeatureRow } from "@/lib/seo/vs-compare-data";

export async function generateStaticParams() {
  return Object.keys(VS_COMPARE_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = VS_COMPARE_DATA[slug];
  if (!data) return {};
  return {
    title: { absolute: `VenueSprocket vs ${data.competitorName} — Private Event Software Comparison | VenueSprocket` },
    description: `How VenueSprocket compares to ${data.competitorName} for private event booking, BEOs, contracts, and deposits. Built for restaurants, bars, breweries, and taprooms.`,
    alternates: { canonical: `https://venuesprocket.com/compare/${slug}` },
    openGraph: {
      title: `VenueSprocket vs ${data.competitorName}`,
      description: data.summary,
      url: `https://venuesprocket.com/compare/${slug}`,
    },
  };
}

function FeatureCell({ value }: { value: FeatureRow["vs"] }) {
  if (value === "yes") return <span className="text-vs-accent font-bold text-lg">✓</span>;
  if (value === "no") return <span className="text-vs-muted text-lg">—</span>;
  if (value === "partial") return <span className="text-vs-warning font-semibold text-sm">Partial</span>;
  return <span className="text-xs text-vs-muted">{value}</span>;
}

export default async function VsComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = VS_COMPARE_DATA[slug];
  if (!data) notFound();

  const otherComparisons = Object.values(VS_COMPARE_DATA)
    .filter((d) => d.slug !== slug)
    .slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `VenueSprocket vs ${data.competitorName}`,
    description: data.summary,
    url: `https://venuesprocket.com/compare/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-4xl">

          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-vs-muted">
            <Link href="/" className="hover:text-vs-accent">VenueSprocket</Link>
            {" / "}
            <span>Compare</span>
            {" / "}
            <span className="text-vs-text-soft font-medium">vs {data.competitorName}</span>
          </nav>

          {/* Hero */}
          <p className="vs-kicker mb-3">Software comparison</p>
          <h1 className="vs-page-title text-4xl md:text-5xl mb-6">
            VenueSprocket vs {data.competitorName}
          </h1>
          <p className="text-vs-text-soft text-lg leading-relaxed mb-10 max-w-3xl">
            {data.summary}
          </p>

          {/* Summary cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-16">
            <div className="rounded-2xl border border-vs-border bg-vs-surface p-6">
              <p className="vs-kicker mb-3">About {data.competitorName}</p>
              <p className="text-sm text-vs-text-soft leading-relaxed">{data.competitorSummary}</p>
              <div className="mt-4">
                <p className="text-xs font-bold text-vs-muted uppercase tracking-wide mb-2">
                  Best for
                </p>
                <p className="text-sm text-vs-text-soft">{data.competitorBestFor}</p>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-vs-accent/30 bg-vs-surface-2 p-6">
              <p className="vs-kicker mb-3">About VenueSprocket</p>
              <p className="text-sm text-vs-text-soft leading-relaxed">{data.vsSummary}</p>
            </div>
          </div>

          {/* Feature comparison table */}
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-6">
              Feature comparison
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-vs-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-vs-border bg-vs-surface-2">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-vs-muted">
                      Feature
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-widest text-vs-accent">
                      VenueSprocket
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-widest text-vs-muted">
                      {data.competitorName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.featureRows.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={[
                        "border-b border-vs-border/50 last:border-0",
                        i % 2 === 0 ? "bg-vs-surface" : "bg-vs-bg",
                      ].join(" ")}
                    >
                      <td className="px-5 py-3 text-vs-text-soft">{row.feature}</td>
                      <td className="px-5 py-3 text-center">
                        <FeatureCell value={row.vs} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <FeatureCell value={row.competitor} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-vs-muted">
              Feature availability subject to plan. Competitor features based on publicly available
              information and may change. Verify with each vendor before making a purchasing decision.
            </p>
          </div>

          {/* Best for */}
          <div className="mb-16 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-bold text-vs-text mb-4">
                VenueSprocket is best for
              </h2>
              <ul className="space-y-2">
                {data.vsBestFor.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-vs-text-soft">
                    <span className="mt-0.5 text-vs-accent font-bold shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-vs-text mb-4">
                {data.competitorName} may be better for
              </h2>
              <ul className="space-y-2">
                {data.competitorBestFor2.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-vs-text-soft">
                    <span className="mt-0.5 text-vs-muted shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* LeaguePour advantage */}
          <div className="mb-16 rounded-2xl border border-vs-border-strong bg-vs-surface-2 p-8">
            <p className="vs-kicker mb-2">Unique to VenueSprocket</p>
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">
              LeaguePour for public events
            </h2>
            <p className="text-vs-text-soft leading-relaxed mb-4">
              VenueSprocket includes access to LeaguePour — the platform for running dart leagues,
              cornhole tournaments, trivia nights, pool leagues, and bar game competitions. Private
              events bring bigger single bookings. LeaguePour brings repeat weekly traffic.
              Together, they help venues make more money from the same space.
            </p>
            <Link
              href="/leaguepour"
              className="text-sm font-semibold text-vs-accent hover:underline"
            >
              Learn about LeaguePour by VenueSprocket →
            </Link>
          </div>

          {/* CTA */}
          <div className="mb-16 text-center rounded-2xl border border-vs-border bg-vs-surface p-10">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-3">
              Ready to try VenueSprocket?
            </h2>
            <p className="text-vs-text-soft mb-6 max-w-xl mx-auto">
              Start free — your inquiry form can be live in under ten minutes. No credit card required.
              Upgrade when you need contracts, deposits, and BEOs.
            </p>
            <Link
              href="/start"
              className="inline-flex rounded-xl bg-vs-accent px-8 py-4 text-lg font-bold text-white hover:bg-vs-accent-hover transition-colors"
            >
              {data.cta}
            </Link>
          </div>

          {/* More comparisons */}
          {otherComparisons.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-vs-text mb-4">
                More comparisons
              </h2>
              <div className="flex flex-wrap gap-3">
                {otherComparisons.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/compare/${c.slug}`}
                    className="rounded-lg border border-vs-border bg-vs-surface px-4 py-2 text-sm font-semibold text-vs-text-soft hover:border-vs-accent hover:text-vs-accent transition-colors"
                  >
                    vs {c.competitorName}
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
