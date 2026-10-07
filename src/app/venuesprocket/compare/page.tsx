import type { Metadata } from "next";
import Link from "next/link";
import { safeJsonLd } from "@/lib/seo/json-ld-builders";
import { VS_COMPARE_DATA } from "@/lib/seo/vs-compare-data";

const URL = "https://venuesprocket.com/compare";

export const metadata: Metadata = {
  title: { absolute: "Compare VenueSprocket to Other Private Event Software | VenueSprocket" },
  description:
    "Honest side-by-side comparisons of VenueSprocket with Tripleseat, Perfect Venue, Planning Pod, Caterease, Event Temple, HoneyBook, and spreadsheet-and-email planning - including where another tool is the better fit.",
  alternates: { canonical: URL },
  openGraph: {
    siteName: "VenueSprocket",
    title: "Compare VenueSprocket to other private event software",
    description: "Side-by-side comparisons, including where another tool is the better fit.",
    url: URL,
  },
};

const entries = Object.values(VS_COMPARE_DATA);
const software = entries.filter((e) => !["google-forms", "email-pdf"].includes(e.slug));
const manual = entries.filter((e) => ["google-forms", "email-pdf"].includes(e.slug));

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "VenueSprocket", item: "https://venuesprocket.com" },
        { "@type": "ListItem", position: 2, name: "Compare", item: URL },
      ],
    },
    {
      "@type": "ItemList",
      name: "VenueSprocket comparisons",
      itemListElement: entries.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `VenueSprocket vs ${e.competitorName}`,
        url: `${URL}/${e.slug}`,
      })),
    },
  ],
};

function Card({ slug, name, category, bestFor }: { slug: string; name: string; category: string; bestFor: string }) {
  return (
    <Link
      href={`/compare/${slug}`}
      className="group flex flex-col rounded-2xl border border-vs-border bg-vs-surface p-6 transition-colors hover:border-vs-accent"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-vs-muted">{category}</p>
      <h3 className="mt-2 font-display text-xl font-bold text-vs-text group-hover:text-vs-accent">
        VenueSprocket vs {name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-vs-text-soft">
        <span className="font-semibold text-vs-text">{name} tends to fit: </span>
        {bestFor}
      </p>
      <span className="mt-4 text-sm font-semibold text-vs-accent">Read the comparison →</span>
    </Link>
  );
}

export default function VsCompareHubPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="vs-section px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="vs-kicker mb-3">Compare</p>
            <h1 className="vs-page-title text-4xl md:text-5xl mb-5">
              How VenueSprocket compares
            </h1>
            <p className="text-vs-text-soft text-lg leading-relaxed">
              VenueSprocket is deliberately narrow: inquiry, proposal, contract, deposit, and BEO for
              independent restaurants, bars, breweries, and event spaces. These comparisons say where
              that&apos;s a good fit - and where a bigger or different tool will serve you better.
              Competitor details come from their public information and can change; check each
              vendor&apos;s current plans before you decide.
            </p>
          </div>

          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-5">Event management software</h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {software.map((e) => (
                <Card key={e.slug} slug={e.slug} name={e.competitorName} category={e.competitorCategory} bestFor={e.competitorBestFor} />
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-5">Doing it by hand</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {manual.map((e) => (
                <Card key={e.slug} slug={e.slug} name={e.competitorName} category={e.competitorCategory} bestFor={e.competitorBestFor} />
              ))}
            </div>
          </section>

          <section className="mb-14 rounded-2xl border border-vs-border bg-vs-surface-2 p-8">
            <h2 className="font-display text-2xl font-bold text-vs-text mb-4">Questions to ask any tool you&apos;re considering</h2>
            <ul className="grid gap-3 text-sm text-vs-text-soft md:grid-cols-2">
              {[
                "Can a customer go from inquiry to signed contract and paid deposit without creating an account?",
                "Where does deposit money land - your own Stripe or merchant account, or the vendor's?",
                "Does the vendor take a percentage of deposits or event revenue on top of the subscription?",
                "Can you start without a sales call, onboarding fee, or annual contract?",
                "Do you need room-by-room calendars, seating charts, or catering production sheets? (VenueSprocket doesn't have these.)",
                "Does your team need separate staff logins and permissions, or will one venue login do?",
              ].map((q) => (
                <li key={q} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 font-bold text-vs-accent">?</span>
                  {q}
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col items-start gap-3 sm:flex-row">
            <Link href="/demo" className="rounded-xl bg-vs-accent px-6 py-3 font-bold text-white hover:bg-vs-accent-hover transition-colors">
              See the sample workflow
            </Link>
            <Link href="/pricing" className="rounded-xl border border-vs-border-strong bg-vs-bg px-6 py-3 font-bold text-vs-text hover:border-vs-accent transition-colors">
              View pricing
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
